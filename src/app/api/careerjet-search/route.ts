import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  searchCareerjet,
  normalizeSalary,
  parseCareerjetDate,
  dedupKey,
  getLocaleForCountry,
  type CareerjetJob,
} from "@/lib/careerjet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;

// If we don't have the service key, fall back to anon with limited capabilities
const supabase = createClient(supabaseUrl, serviceKey || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
  auth: { persistSession: false },
});

// ─── Helpers ────────────────────────────────────────────────────

function detectSeniority(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes("senior") || t.includes("sr.") || t.includes("sr ") || t.includes("lead") ||
      t.includes("head of") || t.includes("director") || t.includes("vp ") ||
      t.includes("vice president") || t.includes("principal") || t.includes("chief")) return "senior";
  if (t.includes("junior") || t.includes("jr.") || t.includes("jr ") || t.includes("entry") ||
      t.includes("trainee") || t.includes("intern") || t.includes("graduate") ||
      t.includes("associate") || t.includes("fresher")) return "entry";
  if (t.includes("no experience") || t.includes("no prior")) return "no-experience";
  return "mid";
}

function detectCollar(title: string, description: string): "white" | "blue" {
  const text = `${title} ${description}`.toLowerCase();
  const blue = [
    "technician", "mechanic", "electrician", "plumber", "welder", "carpenter",
    "construction", "driver", "warehouse", "factory", "manufacturing",
    "maintenance", "custodian", "janitor", "cleaner", "assembler", "operator",
    "machinist", "painter", "roofer", "landscaper", "delivery", "courier",
    "cook", "chef", "baker", "cashier", "retail", "security", "guard",
    "truck", "forklift", "production", "laborer", "worker",
  ];
  for (const kw of blue) {
    if (text.includes(kw)) return "blue";
  }
  return "white";
}

const COMMON_SKILLS = [
  "javascript", "typescript", "python", "java", "react", "node.js", "nodejs",
  "sql", "postgresql", "mysql", "mongodb", "aws", "azure", "gcp", "docker",
  "kubernetes", "git", "agile", "scrum", "html", "css", "sass", "tailwind",
  "graphql", "rest", "linux", "excel", "word", "powerpoint", "salesforce",
  "sap", "tableau", "power bi", "tensorflow", "pytorch", "machine learning",
  "project management", "communication", "leadership", "customer service",
  "accounting", "finance", "marketing", "sales", "hr", "recruiting",
  "photoshop", "illustrator", "figma", "seo", "google analytics",
];

function extractSkills(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const found: string[] = [];
  for (const skill of COMMON_SKILLS) {
    if (text.includes(skill) && !found.includes(skill)) {
      found.push(skill);
    }
  }
  return found;
}

// ─── Location resolver ─────────────────────────────────────────

async function resolveLocation(req: NextRequest): Promise<{ city: string; state: string; country: string }> {
  // Get client IP from request headers
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "";

  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { city: "", state: "", country: "United States" };
  }

  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(4000) });
    if (geoRes.ok) {
      const geo = await geoRes.json();
      return {
        city: geo.city || "",
        state: geo.regionName || geo.region || "",
        country: geo.country || "United States",
      };
    }
  } catch {
    /* fall through */
  }

  return { city: "", state: "", country: "United States" };
}

// ─── Map Careerjet job to our schema ───────────────────────────

function mapJob(job: CareerjetJob): Record<string, any> {
  const title = (job.title || "").trim();
  const description = (job.description || "").trim();
  const company = (job.company || "").trim();
  const salary = normalizeSalary(job);
  const seniority = detectSeniority(title);
  const collar = detectCollar(title, description);
  const skills = extractSkills(title, description);
  const externalId = job.url
    ? `careerjet-${Buffer.from(job.url).toString("base64").slice(0, 32)}`
    : `careerjet-${Buffer.from(title + company).toString("base64").slice(0, 32)}`;
  const postedDate = parseCareerjetDate(job.date);

  return {
    title,
    description,
    company: company || null,
    location: (job.locations || "").slice(0, 200),
    country: null, // filled by caller
    region: null,
    salary_min: salary.min,
    salary_max: salary.max,
    currency: salary.currency,
    type: "full-time",
    workplace: "onsite",
    collar,
    seniority,
    skills,
    status: "active",
    external_id: externalId,
    external_source: "careerjet",
    external_url: job.url,
    is_urgent: false,
    is_featured: false,
    created_at: postedDate,
    updated_at: new Date().toISOString(),
    industry: null,
  };
}

// ─── GET handler ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const locationOverride = searchParams.get("location")?.trim();
  const countryParam = searchParams.get("country")?.trim();
  const cityParam = searchParams.get("city")?.trim();
  const userId = searchParams.get("userId")?.trim();

  if (!q) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  // 1. Resolve location
  let city = "";
  let state = "";
  let country = "United States";
  let hasExplicitLocation = false;

  if (countryParam) {
    // Country came from the dropdown — use it directly
    country = countryParam;
    hasExplicitLocation = true;
  } else if (locationOverride) {
    // Deprecated: old clients still pass location
    const parts = locationOverride.split(",").map(s => s.trim());
    city = parts[0] || "";
    state = parts.length > 1 ? parts[1] : "";
    country = parts[parts.length - 1] || "United States";
    hasExplicitLocation = true;
  } else if (userId) {
    // Logged-in user: try to get location from profile
    try {
      const { data: profile } = await supabase
        .from("employee_profiles")
        .select("location")
        .eq("id", userId)
        .single();
      if (profile?.location) {
        const parts = profile.location.split(",").map((s: string) => s.trim());
        city = parts[0] || "";
        state = parts.length > 1 ? parts[1] : "";
        country = parts[parts.length - 1] || "United States";
        hasExplicitLocation = true;
      }
    } catch {
      /* no profile location */
    }

    if (!city) {
      // Fall back to profiles table
      try {
        const { data: p } = await supabase
          .from("profiles")
          .select("location")
          .eq("id", userId)
          .single();
        if (p?.location) {
          const parts = p.location.split(",").map((s: string) => s.trim());
          city = parts[0] || "";
          state = parts.length > 1 ? parts[1] : "";
          country = parts[parts.length - 1] || "United States";
          hasExplicitLocation = true;
        }
      } catch { /* */ }
    }
  }

  if (!hasExplicitLocation) {
    // No specific location chosen — do a single country-wide search
    // by resolving the country from IP only (not city/state)
    const geo = await resolveLocation(req);
    country = geo.country;
    city = "";
    state = "";
  }

  // 2. Search Careerjet — paginate until we have at least 20 jobs
  // locale_code handles country-wide search — do NOT pass country name as `location`.
  // Only pass `location` when a specific city is typed.
  let seen = new Set<string>();
  let merged: CareerjetJob[] = [];
  const locale = getLocaleForCountry(country);
  const TARGET = 20;

  /**
   * Fetch pages from Careerjet until we reach TARGET jobs or exhaust pages.
   * Deduplicates by [title + company] across pages.
   */
  async function fetchPaginated(locParams: { keywords: string; location?: string }, seen: Set<string>): Promise<CareerjetJob[]> {
    const collected: CareerjetJob[] = [];
    const localSeen = new Set(seen);

    for (let page = 1; page <= 10; page++) {
      if (collected.length >= TARGET && page > 1) break;

      const result = await searchCareerjet({ ...locParams, page, pageSize: 20, localeCode: locale });
      if (result.type !== "JOBS" || !result.jobs?.length) break;

      for (const job of result.jobs) {
        const key = dedupKey(job);
        if (!localSeen.has(key)) {
          localSeen.add(key);
          collected.push(job);
        }
      }

      // If fewer jobs than page size, no more pages
      if (result.jobs.length < 20) break;
    }

    return collected;
  }

  if (cityParam && country) {
    // Try city — collect up to 20,
    const cityJobs = await fetchPaginated({ keywords: q, location: cityParam }, seen);
    seen = new Set([...seen, ...cityJobs.map(j => dedupKey(j))]);
    merged.push(...cityJobs);

    // If city < 20 jobs total, backfill with country-wide
    if (cityJobs.length < TARGET) {
      const countryJobs = await fetchPaginated({ keywords: q }, seen);
      seen = new Set([...seen, ...countryJobs.map(j => dedupKey(j))]);
      merged.push(...countryJobs);
    }
  } else {
    // Country-wide: fetch pages until we have 20
    const countryJobs = await fetchPaginated({ keywords: q }, seen);
    merged.push(...countryJobs);
  }

  // Sort by date (newest first)
  merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 4. Save to Supabase (upsert by external_id)
  const jobsToInsert = merged.map(job => {
    const mapped = mapJob(job);
    mapped.country = country;
    return mapped;
  });

  // Upsert in batches of 25
  let insertedCount = 0;
  try {
    for (let i = 0; i < jobsToInsert.length; i += 25) {
      const batch = jobsToInsert.slice(i, i + 25);
      const { error } = await supabase.from("jobs").upsert(batch, {
        onConflict: "external_id",
        ignoreDuplicates: false,
      });
      if (!error) insertedCount += batch.length;
    }
  } catch {
    // Non-fatal — the fetched data is still returned to the client
  }

  // 5. Map to frontend-friendly format and return FIRST 100
  const now = Date.now();
  const frontendJobs = merged.slice(0, 100).map((job, i) => {
    const salary = normalizeSalary(job);
    const postedDate = parseCareerjetDate(job.date);
    const daysDiff = Math.floor((now - new Date(postedDate).getTime()) / (1000 * 60 * 60 * 24));
    const company = (job.company || "").trim();

    let posted;
    if (daysDiff === 0) posted = "Today";
    else if (daysDiff === 1) posted = "1 day ago";
    else if (daysDiff < 7) posted = `${daysDiff} days ago`;
    else if (daysDiff < 14) posted = "1 week ago";
    else if (daysDiff < 30) posted = `${Math.floor(daysDiff / 7)} weeks ago`;
    else if (daysDiff < 365) posted = `${Math.floor(daysDiff / 30)} months ago`;
    else posted = `${Math.floor(daysDiff / 365)} years ago`;

    return {
      id: `careerjet-${i}`,
      title: job.title,
      company: company || null,
      companyLogo: company
        ? company.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
        : "XX",
      location: job.locations || "Remote",
      country: country,
      region: "",
      collar: detectCollar(job.title, job.description || ""),
      workplace: "onsite",
      seniority: detectSeniority(job.title),
      commitment: "full-time",
      salary: salary.min && salary.max
        ? `$${Math.round(salary.min / 1000)}K - $${Math.round(salary.max / 1000)}K`
        : salary.min
          ? `From $${Math.round(salary.min / 1000)}K`
          : salary.max
            ? `Up to $${Math.round(salary.max / 1000)}K`
            : "Competitive",
      salaryMin: salary.min || 0,
      salaryMax: salary.max || 0,
      industry: "",
      type: "Full-time",
      posted,
      urgent: false,
      featured: false,
      skills: extractSkills(job.title, job.description || ""),
      staffingAgency: false,
      description: (job.description || "").slice(0, 500),
      external_url: job.url || undefined,
      created_at: postedDate,
    };
  });

  return NextResponse.json({
    jobs: frontendJobs,
    total: merged.length,
    fetched: merged.length,
    inserted: insertedCount,
    source: "careerjet",
  });
}
