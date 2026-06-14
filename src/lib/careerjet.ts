/**
 * Careerjet API Client
 *
 * API Docs: https://www.careerjet.com/partners/api/
 * Endpoint: https://search.api.careerjet.net/v4/query
 *
 * Auth: HTTP Basic (api_key: with empty password)
 */

const API_BASE = "https://search.api.careerjet.net/v4/query";

export interface CareerjetJob {
  title: string;
  company: string;
  locations: string;
  description: string;
  url: string;
  date: string; // "Tue, 13 Dec 2025 11:42:15 +0000"
  salary_min: number | null;
  salary_max: number | null;
  salary_currency_code: string | null;
  salary_type: string | null; // "H" "D" "W" "M" "Y"
  site: string;
  // Additional fields
  contract_type?: string;
  contract_time?: string;
}

interface CareerjetResponse {
  type: string;
  pages: number;
  hits: number;
  jobs: CareerjetJob[];
  message?: string;
}

export interface CareerjetSearchParams {
  keywords: string;
  location?: string;
  page?: number;
  pageSize?: number;
  localeCode?: string;
}

// ─── Country → Careerjet locale mapping ─────────────────────────
export const COUNTRY_LOCALE_MAP: Record<string, string> = {
  "Japan": "ja_JP",
  "United States": "en_US",
  "Russia": "ru_RU",
  "Germany": "de_DE",
  "France": "fr_FR",
  "Brazil": "pt_BR",
  "United Kingdom": "en_GB",
  "Italy": "it_IT",
  "Mexico": "es_MX",
  "Peru": "es_PE",
  "Philippines": "en_PH",
  "Colombia": "es_CO",
  "India": "en_IN",
  "Chile": "es_CL",
  "Czech Republic": "cs_CZ",
  "Argentina": "es_AR",
  "Poland": "pl_PL",
  "Canada": "en_CA",
  "Netherlands": "nl_NL",
  "Belgium": "nl_BE",
  "Hong Kong": "en_HK",
  "Spain": "es_ES",
  "South Africa": "en_ZA",
  "Thailand": "th_TH",
  "Sweden": "sv_SE",
  "Australia": "en_AU",
  "China": "zh_CN",
  "Switzerland": "de_CH",
  "Malaysia": "en_MY",
  "Taiwan": "en_TW",
  "United Arab Emirates": "en_AE",
  "Turkey": "tr_TR",
  "Portugal": "pt_PT",
  "Saudi Arabia": "en_SA",
  "Singapore": "en_SG",
  "Ireland": "en_IE",
  "Finland": "fi_FI",
  "Norway": "no_NO",
  "Austria": "de_AT",
  "Hungary": "hu_HU",
  "Ukraine": "ru_UA",
  "Denmark": "da_DK",
  "Ecuador": "es_EC",
  "Vietnam": "en_VN",
  "New Zealand": "en_NZ",
  "Guatemala": "es_GT",
  "South Korea": "ko_KR",
  "Morocco": "fr_MA",
  "Puerto Rico": "es_PR",
  "Costa Rica": "es_CR",
  "Bangladesh": "en_BD",
  "Slovakia": "sk_SK",
  "Luxembourg": "fr_LU",
  "Qatar": "en_QA",
  "Panama": "es_PA",
  "Venezuela": "es_VE",
  "Pakistan": "en_PK",
  "Uruguay": "es_UY",
  "Kuwait": "en_KW",
  "Dominican Republic": "es_DO",
  "Oman": "en_OM",
  "Paraguay": "es_PY",
  "Bolivia": "es_BO",
};

export function getLocaleForCountry(country: string): string {
  return COUNTRY_LOCALE_MAP[country] || "en_US";
}

/**
 * Call the Careerjet API with the given parameters.
 * user_ip and user_agent are required by Careerjet.
 */
export async function searchCareerjet(
  params: CareerjetSearchParams,
  signal?: AbortSignal
): Promise<CareerjetResponse> {
  const apiKey = process.env.CAREER_JET_API_KEY;
  if (!apiKey) {
    throw new Error("CAREER_JET_API_KEY is not configured");
  }

  const query = new URLSearchParams({
    locale_code: params.localeCode || "en_US",
    sort: "date",
    page: String(params.page || 1),
    page_size: String(params.pageSize || 100),
    user_ip: process.env.CAREERJET_USER_IP || "8.8.8.8",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });

  if (params.keywords) query.set("keywords", params.keywords);
  if (params.location) query.set("location", params.location);

  const url = `${API_BASE}?${query.toString()}`;
  const credentials = Buffer.from(`${apiKey}:`).toString("base64");

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${credentials}`,
      Referer: 'https://dulyhired.com/',
    },
    signal: signal || AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Careerjet API error (${response.status}): ${body.slice(0, 200)}`);
  }

  const data: CareerjetResponse = await response.json();
  return data;
}

/**
 * Fetch jobs from Careerjet for a given keyword + location combo,
 * paginating through up to `maxPages` pages.
 */
export async function fetchCareerjetJobs(
  keywords: string,
  location: string,
  maxPages = 3,
  localeCode?: string
): Promise<CareerjetJob[]> {
  const allJobs: CareerjetJob[] = [];
  const seenUrls = new Set<string>();

  for (let page = 1; page <= maxPages; page++) {
    const result = await searchCareerjet({
      keywords,
      location,
      page,
      pageSize: 100,
      localeCode,
    });

    if (result.type !== "JOBS" || !result.jobs?.length) {
      break;
    }

    for (const job of result.jobs) {
      // Client-side dedup by URL to avoid duplicate rows within this batch
      if (!seenUrls.has(job.url)) {
        seenUrls.add(job.url);
        allJobs.push(job);
      }
    }

    // If fewer jobs than page size, no more data
    if (result.jobs.length < 100) {
      break;
    }
  }

  return allJobs;
}

/**
 * Normalize salary to yearly (annual) for consistent display.
 */
export function normalizeSalary(job: CareerjetJob, salaryType?: string): {
  min: number | null;
  max: number | null;
  currency: string;
} {
  let min = job.salary_min;
  let max = job.salary_max;
  const type = salaryType || job.salary_type;

  if (type === "H") {
    if (min !== null) min = Math.round(min * 2080);
    if (max !== null) max = Math.round(max * 2080);
  } else if (type === "D") {
    if (min !== null) min = Math.round(min * 260);
    if (max !== null) max = Math.round(max * 260);
  } else if (type === "W") {
    if (min !== null) min = Math.round(min * 52);
    if (max !== null) max = Math.round(max * 52);
  } else if (type === "M") {
    if (min !== null) min = Math.round(min * 12);
    if (max !== null) max = Math.round(max * 12);
  }

  return {
    min,
    max,
    currency: job.salary_currency_code || "USD",
  };
}

/**
 * Parse Careerjet date string into ISO string.
 */
export function parseCareerjetDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {
    /* fall through */
  }
  return new Date().toISOString();
}

/**
 * Create a unique dedup key from [title + company].
 */
export function dedupKey(job: { title: string; company: string }): string {
  const t = (job.title || "").trim().toLowerCase();
  const c = (job.company || "").trim().toLowerCase();
  return `${t}|||${c}`;
}
