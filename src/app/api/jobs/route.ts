import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 120; // Cache for 2 minutes

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false }, global: { headers: { prefer: "count=exact" } } });

const BATCH_SIZE = 1000;
const MAX_JOBS = 20000;

/**
 * Build the base query with all filters applied (no pagination).
 * Returns the query builder so callers can attach .range() or get a count.
 */
function buildFilteredQuery(params: URLSearchParams) {
  const search = params.get("search") || "";
  const country = params.get("country") || "";
  const region = params.get("region") || "";
  const collar = params.get("collar") || "";
  const workplace = params.get("workplace") || "";
  const seniority = params.get("seniority") || "";
  const commitment = params.get("commitment") || params.get("com") || "";
  const industry = params.get("industry") || "";
  const language = params.get("language") || "";
  const datePosted = params.get("datePosted") || params.get("dp") || "";
  const salaryMin = params.get("salaryMin") || params.get("smin") || "";
  const salaryMax = params.get("salaryMax") || params.get("smax") || "";
  const company = params.get("company") || "";

  let query = supabase.from("jobs").select("*");

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (country) query = query.eq("country", country);
  if (region) query = query.eq("region", region);
  if (collar) query = query.eq("collar", collar);
  if (company) query = query.ilike("company", `%${company}%`);
  if (workplace) query = query.eq("workplace", workplace);
  if (seniority) query = query.eq("seniority", seniority);
  if (commitment) query = query.eq("type", commitment);
  if (industry) query = query.ilike("industry", `%${industry}%`);
  if (language) query = query.ilike("description", `%${language}%`);

  if (datePosted) {
    const now = new Date();
    let days = parseInt(datePosted);
    let since: Date;
    if (!isNaN(days) && days > 0) {
      since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    } else {
      switch (datePosted) {
        case "24h": since = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
        case "3d": since = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); break;
        case "7d": since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case "14d": since = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); break;
        case "30d": since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        default: since = new Date(0); break;
      }
    }
    query = query.gte("created_at", since.toISOString());
  }

  if (salaryMin) query = query.gte("salary_min", parseFloat(salaryMin));
  if (salaryMax) query = query.lte("salary_max", parseFloat(salaryMax));

  query = query.eq("status", "active").order("created_at", { ascending: false });

  return query;
}

/**
 * Fetch all jobs matching the filters by paginating in batches.
 * Stops at MAX_JOBS (20,000).
 */
async function fetchAllJobs(params: URLSearchParams) {
  const query = buildFilteredQuery(params);
  const allJobs: any[] = [];

  for (let offset = 0; offset < MAX_JOBS; offset += BATCH_SIZE) {
    const batchQuery = query.range(offset, offset + BATCH_SIZE - 1);
    const { data, error } = await batchQuery;

    if (error) {
      return { jobs: allJobs, error };
    }

    if (data) {
      allJobs.push(...data);
    }

    // Stop if this batch returned fewer rows than the batch size (no more data)
    if (!data || data.length < BATCH_SIZE) {
      break;
    }
  }

  return { jobs: allJobs, error: null };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // ── fetch_all mode: paginate through all rows up to MAX_JOBS ──
  if (searchParams.get("fetch_all") === "true") {
    const { jobs, error } = await fetchAllJobs(searchParams);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      jobs: jobs || [],
      total: jobs.length,
      fetchedAll: true,
    });
  }

  // ── Standard paginated mode ──
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" });

  // Re-apply filters (inline to avoid double-select)
  const search = searchParams.get("search") || "";
  const country = searchParams.get("country") || "";
  const region = searchParams.get("region") || "";
  const collar = searchParams.get("collar") || "";
  const workplace = searchParams.get("workplace") || "";
  const seniority = searchParams.get("seniority") || "";
  const commitment = searchParams.get("commitment") || searchParams.get("com") || "";
  const industry = searchParams.get("industry") || "";
  const language = searchParams.get("language") || "";
  const datePosted = searchParams.get("datePosted") || searchParams.get("dp") || "";
  const salaryMin = searchParams.get("salaryMin") || searchParams.get("smin") || "";
  const salaryMax = searchParams.get("salaryMax") || searchParams.get("smax") || "";
  const company = searchParams.get("company") || "";

  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  if (country) query = query.eq("country", country);
  if (region) query = query.eq("region", region);
  if (collar) query = query.eq("collar", collar);
  if (company) query = query.ilike("company", `%${company}%`);
  if (workplace) query = query.eq("workplace", workplace);
  if (seniority) query = query.eq("seniority", seniority);
  if (commitment) query = query.eq("type", commitment);
  if (industry) query = query.ilike("industry", `%${industry}%`);
  if (language) query = query.ilike("description", `%${language}%`);
  if (datePosted) {
    const now = new Date();
    let days = parseInt(datePosted);
    let since: Date;
    if (!isNaN(days) && days > 0) {
      since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    } else {
      switch (datePosted) {
        case "24h": since = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
        case "3d": since = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); break;
        case "7d": since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case "14d": since = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); break;
        case "30d": since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        default: since = new Date(0); break;
      }
    }
    query = query.gte("created_at", since.toISOString());
  }
  if (salaryMin) query = query.gte("salary_min", parseFloat(salaryMin));
  if (salaryMax) query = query.lte("salary_max", parseFloat(salaryMax));

  query = query.eq("status", "active").order("created_at", { ascending: false });

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    jobs: data || [],
    total: count || 0,
    page,
    limit,
    hasMore: count ? from + limit < count : false,
    fetchedAll: false,
  });
}
