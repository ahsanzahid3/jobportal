import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// ─── POST /api/track — log a visitor event ────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, path, job_id, visitor_id } = body;

    if (!event_type || !visitor_id) {
      return NextResponse.json({ error: "event_type and visitor_id required" }, { status: 400 });
    }

    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      "Unknown";

    const userAgent = (request.headers.get("user-agent") || "").slice(0, 500);

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const { error } = await supabase.from("visitor_events").insert({
      event_type,
      path: path || "/",
      job_id: job_id || null,
      visitor_id,
      country,
      user_agent: userAgent,
    });

    if (error) {
      // Table likely doesn't exist — return a clear error
      return NextResponse.json({
        error: error.message,
        hint: "Run the setup SQL in your Supabase SQL editor: CREATE TABLE visitor_events (id BIGSERIAL PRIMARY KEY, event_type TEXT NOT NULL, path TEXT, job_id TEXT, visitor_id TEXT NOT NULL, country TEXT DEFAULT 'Unknown', user_agent TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT now());"
      }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── GET /api/track — aggregate analytics (admin) ─────────────────
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    // Run all counts in parallel
    const [uniqueRes, totalRes, jobViewRes, jobClickRes, todayRes, countriesRes, viewedJobsRes, clickedJobsRes] = await Promise.allSettled([
      supabase.from("visitor_events").select("visitor_id", { count: "exact", head: true }),
      supabase.from("visitor_events").select("*", { count: "exact", head: true }),
      supabase.from("visitor_events").select("*", { count: "exact", head: true }).eq("event_type", "job_view"),
      supabase.from("visitor_events").select("*", { count: "exact", head: true }).eq("event_type", "job_click"),
      supabase.from("visitor_events").select("*", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      supabase.from("visitor_events").select("country"),
      supabase.from("visitor_events").select("job_id").eq("event_type", "job_view").not("job_id", "is", null),
      supabase.from("visitor_events").select("job_id").eq("event_type", "job_click").not("job_id", "is", null),
    ]);

    const uniqueVisitors = uniqueRes.status === "fulfilled" ? uniqueRes.value.count ?? 0 : 0;
    const totalViews = totalRes.status === "fulfilled" ? totalRes.value.count ?? 0 : 0;
    const jobViews = jobViewRes.status === "fulfilled" ? jobViewRes.value.count ?? 0 : 0;
    const jobClicks = jobClickRes.status === "fulfilled" ? jobClickRes.value.count ?? 0 : 0;
    const todayViews = todayRes.status === "fulfilled" ? todayRes.value.count ?? 0 : 0;

    // By country
    const countryCounts: Record<string, number> = {};
    if (countriesRes.status === "fulfilled" && countriesRes.value.data) {
      countriesRes.value.data.forEach((e: any) => {
        const c = e.country || "Unknown";
        countryCounts[c] = (countryCounts[c] || 0) + 1;
      });
    }
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([country, count]) => ({ country, count }));

    // Top viewed jobs
    const jobViewCounts: Record<string, number> = {};
    if (viewedJobsRes.status === "fulfilled" && viewedJobsRes.value.data) {
      viewedJobsRes.value.data.forEach((e: any) => {
        jobViewCounts[e.job_id] = (jobViewCounts[e.job_id] || 0) + 1;
      });
    }
    const topViewedJobs = Object.entries(jobViewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([job_id, views]) => ({ job_id, views }));

    // Top clicked jobs
    const jobClickCounts: Record<string, number> = {};
    if (clickedJobsRes.status === "fulfilled" && clickedJobsRes.value.data) {
      clickedJobsRes.value.data.forEach((e: any) => {
        jobClickCounts[e.job_id] = (jobClickCounts[e.job_id] || 0) + 1;
      });
    }
    const topClickedJobs = Object.entries(jobClickCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([job_id, clicks]) => ({ job_id, clicks }));

    return NextResponse.json({
      uniqueVisitors,
      totalViews,
      jobViews,
      jobClicks,
      todayViews,
      topCountries,
      topViewedJobs,
      topClickedJobs,
    });
  } catch {
    return NextResponse.json({
      uniqueVisitors: 0, totalViews: 0, jobViews: 0, jobClicks: 0, todayViews: 0,
      topCountries: [], topViewedJobs: [], topClickedJobs: [],
    });
  }
}
