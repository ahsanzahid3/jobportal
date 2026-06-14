import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID!;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY!;

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

// ─── Column detection ──────────────────────────────────────────
let existingColumnsCache: string[] | null = null;

async function getExistingColumns(): Promise<string[]> {
  if (existingColumnsCache) return existingColumnsCache;
  const ALL = [
    "title", "slug", "description", "company", "location", "country", "region",
    "salary_min", "salary_max", "currency", "type", "workplace", "industry",
    "collar", "status", "seniority", "skills", "requirements",
    "external_id", "external_source", "external_url",
    "is_urgent", "is_featured", "is_pinned", "is_remote",
    "views_count", "application_count",
    "created_at", "updated_at",
  ];
  const existing: string[] = [];
  for (const col of ALL) {
    const { error } = await supabase.from("jobs").select(col).limit(0);
    if (!error) existing.push(col);
  }
  existingColumnsCache = existing;
  console.log(`Backfill detected ${existing.length}/${ALL.length} columns`);
  return existing;
}

// ─── Country & Region config ──────────────────────────────────
const COUNTRIES = [
  { code: "au", name: "Australia", currency: "AUD" },
  { code: "at", name: "Austria", currency: "EUR" },
  { code: "be", name: "Belgium", currency: "EUR" },
  { code: "br", name: "Brazil", currency: "BRL" },
  { code: "ca", name: "Canada", currency: "CAD" },
  { code: "ch", name: "Switzerland", currency: "CHF" },
  { code: "de", name: "Germany", currency: "EUR" },
  { code: "es", name: "Spain", currency: "EUR" },
  { code: "fr", name: "France", currency: "EUR" },
  { code: "gb", name: "United Kingdom", currency: "GBP" },
  { code: "in", name: "India", currency: "INR" },
  { code: "it", name: "Italy", currency: "EUR" },
  { code: "nl", name: "Netherlands", currency: "EUR" },
  { code: "nz", name: "New Zealand", currency: "NZD" },
  { code: "pl", name: "Poland", currency: "PLN" },
  { code: "sg", name: "Singapore", currency: "SGD" },
  { code: "us", name: "United States", currency: "USD" },
  { code: "za", name: "South Africa", currency: "ZAR" },
];

const REGION_MAP: Record<string, string> = {
  au: "Oceania", at: "Europe", be: "Europe", br: "South America",
  ca: "North America", ch: "Europe", de: "Europe", es: "Europe",
  fr: "Europe", gb: "Europe", in: "Asia", it: "Europe",
  nl: "Europe", nz: "Oceania", pl: "Europe", sg: "Asia",
  us: "North America", za: "Africa",
};

const TYPE_MAP: Record<string, string> = {
  permanent: "full-time", contract: "contract", part_time: "part-time",
  internship: "internship", full_time: "full-time",
};

function randomSlug(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ─── Smart field mappers ───────────────────────────────────────

function detectCollar(title: string, description: string, category: string): "white" | "blue" {
  const text = `${title} ${description} ${category}`.toLowerCase();
  const blue = [
    "laborer", "worker", "technician", "mechanic", "electrician", "plumber",
    "welder", "carpenter", "construction", "driver", "warehouse", "factory",
    "manufacturing", "maintenance", "custodian", "janitor", "cleaner",
    "assembler", "operator", "machinist", "fabricator", "painter", "roofer",
    "hvac", "landscaper", "gardener", "delivery", "courier", "housekeeper",
    "cook", "chef", "baker", "barista", "waiter", "server", "cashier",
    "retail", "sales associate", "security", "guard", "porter", "mover",
    "truck", "forklift", "warehouse operator", "production", "assembly line",
  ];
  for (const kw of blue) {
    if (text.includes(kw)) return "blue";
  }
  return "white";
}

function detectWorkplace(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("remote") && !text.includes("not remote") && !text.includes("no remote")) return "remote";
  if (text.includes("hybrid")) return "hybrid";
  if (text.includes("field") || text.includes("travel") || text.includes("on the road")) return "field";
  return "onsite";
}

function detectSeniority(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("senior") || t.includes("sr.") || t.includes("lead") || t.includes("head of") ||
      t.includes("director") || t.includes("vp ") || t.includes("vice president") || t.includes("principal")) return "senior";
  if (t.includes("junior") || t.includes("jr.") || t.includes("entry") || t.includes("trainee") ||
      t.includes("intern") || t.includes("graduate") || t.includes("associate")) return "entry";
  if (t.includes("no experience") || t.includes("no prior")) return "no-experience";
  return "mid";
}

function extractSkills(description: string): string[] {
  const keywords = [
    "javascript", "typescript", "python", "java", "react", "node.js", "node",
    "sql", "aws", "azure", "gcp", "docker", "kubernetes", "git", "agile", "scrum",
    "html", "css", "sass", "rest", "graphql", "mongodb", "postgresql",
    "redis", "terraform", "ansible", "linux", "bash", "powershell",
    "excel", "word", "powerpoint", "sap", "oracle", "salesforce",
    "photoshop", "illustrator", "figma", "seo", "google analytics",
    "project management", "data analysis", "machine learning", "deep learning",
    "customer service", "communication", "leadership", "team management",
    "accounting", "quickbooks", "hubspot", "content writing", "copywriting",
  ];
  const found: string[] = [];
  const lower = description.toLowerCase();
  for (const kw of keywords) {
    if (lower.includes(kw) && !found.includes(kw)) found.push(kw);
  }
  return found;
}

function formatSalary(min: number | null, max: number | null): { min: number | null; max: number | null } {
  if (min === null && max === null) return { min: null, max: null };
  // If values are small (hourly/daily), scale to yearly approximation
  let smin = min ?? max ?? null;
  let smax = max ?? min ?? null;
  if (smin !== null && smin < 1000) smin = smin * 2000; // hourly → yearly
  if (smax !== null && smax < 1000) smax = smax * 2000;
  if (smin !== null && smin < 10000) smin = smin * 250; // daily → yearly
  if (smax !== null && smax < 10000) smax = smax * 250;
  return { min: smin, max: smax };
}

// ─── Fetch & insert for one country ────────────────────────────

async function fetchAndInsertCountry(
  country: { code: string; name: string; currency: string },
  pages: number,
  existingCols: string[]
): Promise<{ fetched: number; upserted: number; errors: string[] }> {
  const errors: string[] = [];
  let fetched = 0;
  let upserted = 0;

  for (let page = 1; page <= pages; page++) {
    const url = `https://api.adzuna.com/v1/api/jobs/${country.code}/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&results_per_page=50&content-type=application/json`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) {
        if (res.status === 404) continue;
        const body = await res.text();
        errors.push(`${country.code} p${page}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const results = data.results || [];
      if (results.length === 0) continue;

      fetched += results.length;

      // Transform each raw Adzuna record into our schema
      const rawJobs = results.map((r: any) => {
        const title = r.title || "Unknown Position";
        const desc = r.description || "";
        const category = r.category?.label || "";
        const text = `${title} ${desc}`.toLowerCase();

        const salaryNorm = formatSalary(r.salary_min, r.salary_max);

        return {
          title,
          slug: randomSlug() + "-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60),
          description: desc,
          company: r.company?.display_name || r.company?.name || null,
          location: (r.location?.display_name?.split(",")[0]?.trim() || r.location?.area?.[0] || "Unknown").slice(0, 100),
          country: country.name,
          region: REGION_MAP[country.code] || "Other",
          salary_min: salaryNorm.min,
          salary_max: salaryNorm.max,
          currency: r.salary_currency || country.currency,
          type: TYPE_MAP[r.contract_type?.toLowerCase()] || "full-time",
          workplace: detectWorkplace(title, desc),
          industry: category || null,
          collar: detectCollar(title, desc, category),
          seniority: detectSeniority(title),
          skills: extractSkills(desc),
          requirements: null,
          external_id: r.id,
          external_source: "adzuna",
          external_url: r.redirect_url || null,
          is_urgent: text.includes("urgent") || text.includes("immediate"),
          is_featured: false,
          is_remote: text.includes("remote") || text.includes("work from home"),
          status: "active",
          created_at: r.created ? new Date(r.created).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      // Strip to only existing columns & remove empty external_id rows
      const jobs = rawJobs
        .filter((j: any) => j.external_id)
        .map((j: Record<string, any>) => {
          const filtered: Record<string, any> = {};
          for (const col of existingCols) {
            if (col in j) filtered[col] = (j as any)[col];
          }
          return filtered;
        });

      // Delete existing records for these external_ids first
      const extIds = jobs.map((j: any) => j.external_id).filter(Boolean);
      if (extIds.length > 0) {
        try {
          await supabase.from("jobs").delete().in("external_id", extIds);
        } catch { /* table just has no matching rows */ }
      }

      // Then insert fresh batches
      for (let i = 0; i < jobs.length; i += 20) {
        const batch = jobs.slice(i, i + 20);
        try {
          const { error } = await supabase.from("jobs").insert(batch);
          if (error) {
            errors.push(`${country.code} b${Math.floor(i / 20)}: ${error.message.slice(0, 120)}`);
          } else {
            upserted += batch.length;
          }
        } catch (e: any) {
          errors.push(`${country.code} b${Math.floor(i / 20)}: ${e.message?.slice(0, 120) || "unknown"}`);
        }
      }
    } catch (e: any) {
      errors.push(`${country.code} p${page}: ${e.message?.slice(0, 120) || "network error"}`);
    }
  }

  return { fetched, upserted, errors };
}

// ─── GET handler ───────────────────────────────────────────────

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pages = parseInt(url.searchParams.get("pages") || "2");
  const specificCountry = url.searchParams.get("country");

  const countriesToFetch = specificCountry
    ? COUNTRIES.filter(c => c.code === specificCountry)
    : COUNTRIES;

  // Detect schema columns
  const existingCols = await getExistingColumns();

  const results: Record<string, any> = {};
  let totalFetched = 0;
  let totalUpserted = 0;
  let allErrors: string[] = [];

  for (const country of countriesToFetch) {
    const result = await fetchAndInsertCountry(country, pages, existingCols);
    results[country.code] = {
      name: country.name,
      fetched: result.fetched,
      upserted: result.upserted,
      errors: result.errors.length,
    };
    totalFetched += result.fetched;
    totalUpserted += result.upserted;
    allErrors.push(...result.errors);
    console.log(`  ${country.name}: fetched=${result.fetched} upserted=${result.upserted} errors=${result.errors.length}`);
  }

  return NextResponse.json({
    status: "complete",
    countries: results,
    totals: { fetched: totalFetched, upserted: totalUpserted, errors: allErrors.length },
    errors: allErrors.slice(0, 50),
  });
}
