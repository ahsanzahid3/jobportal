import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 60 seconds

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false }, global: { headers: { prefer: "count=exact" } } });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
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

  let query = supabase.from("jobs").select("*", { count: "exact" });

  // Full-text search on title + description
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Filters
  if (country) query = query.eq("country", country);
  if (region) query = query.eq("region", region);
  if (collar) query = query.eq("collar", collar);
  if (company) query = query.ilike("company", `%${company}%`);
  if (workplace) query = query.eq("workplace", workplace);
  if (seniority) query = query.eq("seniority", seniority);
  if (commitment) query = query.eq("type", commitment);
  if (industry) query = query.ilike("industry", `%${industry}%`);
  if (language) query = query.ilike("description", `%${language}%`);
  
  // Date posted filter (accept both "1", "3", "7" and "24h", "3d", "7d" formats)
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

  // Salary range
  if (salaryMin) query = query.gte("salary_min", parseFloat(salaryMin));
  if (salaryMax) query = query.lte("salary_max", parseFloat(salaryMax));

  // Only active jobs, newest first
  query = query.eq("status", "active").order("created_at", { ascending: false });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
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
  });
}
