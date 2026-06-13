/**
 * Adzuna API Client for Programmatic Job Backfill
 *
 * Adzuna API Docs: https://developer.adzuna.com/
 * Base URL: https://api.adzuna.com/v1/api/jobs
 *
 * The API uses either:
 *   - app_id + app_key (legacy)
 *   - A single unified API key (newer format)
 *
 * We check which format is provided at runtime.
 */

export interface AdzunaJobResult {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  description: string;
  location: {
    display_name: string;
    area: string[];
  };
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_is_predicted: string | null;
  created: string;
  redirect_url: string;
  adref: string;
  category: {
    tag: string;
    label: string;
  };
  contract_type: string;
  contract_time: string;
}

export interface AdzunaResponse {
  count: number;
  mean: number;
  results: AdzunaJobResult[];
  pages: number;
  __CLASS__: string;
}

export interface AdzunaConfig {
  appId?: string;
  apiKey: string;
}

// Supported countries and their codes for Adzuna
export const ADZUNA_COUNTRIES = [
  { code: "gb", name: "United Kingdom" },
  { code: "us", name: "United States" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "in", name: "India" },
  { code: "sg", name: "Singapore" },
  { code: "nz", name: "New Zealand" },
  { code: "za", name: "South Africa" },
  { code: "nl", name: "Netherlands" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "br", name: "Brazil" },
  { code: "at", name: "Austria" },
  { code: "be", name: "Belgium" },
  { code: "ch", name: "Switzerland" },
  { code: "es", name: "Spain" },
  { code: "it", name: "Italy" },
  { code: "lu", name: "Luxembourg" },
  { code: "no", name: "Norway" },
  { code: "pl", name: "Poland" },
  { code: "se", name: "Sweden" },
];

export function getAdzunaCountryCode(countryName: string): string {
  const match = ADZUNA_COUNTRIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  return match?.code || "gb";
}

export function mapRegion(adzunaCountryCode: string): string {
  const regionMap: Record<string, string> = {
    gb: "Europe",
    us: "North America",
    ca: "North America",
    au: "Asia",
    in: "Asia",
    sg: "Asia",
    nz: "Asia",
    za: "Africa",
    ie: "Europe",
    nl: "Europe",
    de: "Europe",
    fr: "Europe",
    br: "South America",
    at: "Europe",
    be: "Europe",
    ch: "Europe",
    es: "Europe",
    it: "Europe",
    lu: "Europe",
    no: "Europe",
    pl: "Europe",
    se: "Europe",
  };
  return regionMap[adzunaCountryCode] || "Europe";
}

export function mapCollarType(title: string, description: string, categoryLabel: string): "white" | "blue" {
  const text = `${title} ${description} ${categoryLabel}`.toLowerCase();
  const whiteCollar = [
    "software", "engineer", "developer", "manager", "analyst", "accountant",
    "consultant", "designer", "architect", "director", "coordinator",
    "specialist", "administrator", "supervisor", "executive", "president",
    "vice president", "officer", "attorney", "lawyer", "physician", "doctor",
    "nurse", "teacher", "professor", "scientist", "researcher", "marketing",
    "sales", "finance", "hr", "human resources", "legal", "operations",
    "strategy", "product", "project manager", "scrum", "data", "it",
    "information technology", "business", "financial", "accounting",
  ];
  const blueCollar = [
    "laborer", "worker", "technician", "mechanic", "electrician", "plumber",
    "welder", "carpenter", "construction", "driver", "warehouse", "factory",
    "manufacturing", "maintenance", "custodian", "janitor", "cleaner",
    "assembler", "operator", "machinist", "fabricator", "painter", "roofer",
    "hvac", "landscaper", "gardener", "delivery", "courier", "housekeeper",
    "cook", "chef", "baker", "barista", "waiter", "server", "cashier",
    "retail", "sales associate", "security", "guard", "porter", "mover",
  ];
  for (const kw of blueCollar) {
    if (text.includes(kw)) return "blue";
  }
  for (const kw of whiteCollar) {
    if (text.includes(kw)) return "white";
  }
  return "white"; // default
}

export function mapJobType(contractTime: string, contractType: string): string {
  const ct = contractTime?.toLowerCase() || "";
  const ct2 = contractType?.toLowerCase() || "";
  if (ct.includes("part") || ct2.includes("part")) return "part-time";
  if (ct.includes("contract") || ct2.includes("contract")) return "contract";
  if (ct.includes("intern") || ct2.includes("intern")) return "internship";
  if (ct.includes("temporary") || ct2.includes("temporary")) return "temporary";
  return "full-time";
}

/**
 * Normalize salary: Adzuna returns salaries in various formats.
 * Some are yearly (gbp), some are hourly/daily.
 * We'll store them as-is and let the UI decide.
 */
export function normalizeSalary(
  salaryMin: number | null,
  salaryMax: number | null,
  currency: string | null
): { min: number | null; max: number | null; display: string | null } {
  if (!salaryMin && !salaryMax) return { min: null, max: null, display: null };

  const min = salaryMin || 0;
  const max = salaryMax || 0;

  // Determine timeframe from value magnitude
  const avg = (min + max) / 2;
  let display: string | null = null;

  if (avg > 10000) {
    // Yearly salary
    display = `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
  } else if (avg > 100) {
    // Daily rate
    display = `${formatCurrency(min, currency)}/day - ${formatCurrency(max, currency)}/day`;
  } else {
    // Hourly rate
    display = `${formatCurrency(min, currency)}/hr - ${formatCurrency(max, currency)}/hr`;
  }

  return { min, max, display };
}

function formatCurrency(amount: number, currency: string | null): string {
  const sym = getCurrencySymbol(currency || "USD");
  if (amount >= 1000) {
    return `${sym}${Math.round(amount / 1000)}K`;
  }
  return `${sym}${Math.round(amount)}`;
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$", GBP: "£", EUR: "€", INR: "₹", AUD: "A$",
    CAD: "C$", NZD: "NZ$", SGD: "S$", ZAR: "R", BRL: "R$",
    CHF: "Fr", NOK: "kr", SEK: "kr", PLN: "zł",
  };
  return symbols[currency] || "$";
}

/**
 * Construct the Adzuna API URL
 * Supports both app_id+app_key and unified key formats
 */
function buildApiUrl(
  countryCode: string,
  page: number,
  config: { appId?: string; apiKey: string },
  params: {
    what?: string;
    where?: string;
    resultsPerPage?: number;
    salaryMin?: number;
    salaryMax?: number;
    contractType?: string;
  } = {}
): string {
  const base = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/${page}`;

  const query = new URLSearchParams();

  if (config.appId) {
    query.set("app_id", config.appId);
  }
  query.set("app_key", config.apiKey);

  query.set("results_per_page", String(params.resultsPerPage || 50));
  query.set("content-type", "application/json");

  if (params.what) query.set("what", params.what);
  if (params.where) query.set("where", params.where);
  if (params.salaryMin) query.set("salary_min", String(params.salaryMin));
  if (params.salaryMax) query.set("salary_max", String(params.salaryMax));
  if (params.contractType) query.set("contract_type", params.contractType);

  return `${base}?${query.toString()}`;
}

/**
 * Fetch jobs from Adzuna for a given country and page
 */
export async function fetchAdzunaJobs(
  countryCode: string,
  config: AdzunaConfig,
  options: {
    what?: string;
    where?: string;
    page?: number;
    resultsPerPage?: number;
  } = {}
): Promise<AdzunaResponse> {
  const url = buildApiUrl(countryCode, options.page || 1, config, {
    what: options.what,
    where: options.where,
    resultsPerPage: options.resultsPerPage || 50,
  });

  console.log(`[Adzuna] Fetching: ${url}`);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Adzuna API error (${response.status}): ${text}`);
  }

  const data: AdzunaResponse = await response.json();
  return data;
}

/**
 * Transform an Adzuna job result into our DB schema format
 * Returns null if the job can't be mapped
 */
export function transformAdzunaJob(
  job: AdzunaJobResult,
  countryCode: string,
  countryName: string
): {
  title: string;
  company_name: string;
  description: string;
  location: string;
  country: string;
  region: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  type: string;
  collar: "white" | "blue";
  is_remote: boolean;
  requirements: string[];
  skills: string[];
  external_id: string;
  external_source: string;
  external_url: string;
  posted_date: string;
} | null {
  if (!job.title || !job.company?.display_name) return null;

  const displayName = job.location?.display_name || "";
  const city = displayName.split(",")[0]?.trim() || displayName;

  // Detect remote from title/description
  const text = `${job.title} ${job.description}`.toLowerCase();
  const isRemote = text.includes("remote") && !text.includes("not remote") && !text.includes("on-site");

  // Extract skills from description (simple keyword extraction)
  const skillKeywords = [
    "javascript", "typescript", "python", "java", "react", "node", "sql",
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "agile", "scrum",
    "html", "css", "sass", "rest", "graphql", "mongodb", "postgresql",
    "redis", "ci/cd", "terraform", "ansible", "linux", "bash", "powershell",
    "excel", "word", "powerpoint", "quickbooks", "sap", "oracle", "salesforce",
    "hubspot", "photoshop", "illustrator", "figma", "sketch", "adobe",
    "seo", "sem", "google analytics", "content", "copywriting", "social media",
  ];

  const skills: string[] = [];
  const lowerDesc = job.description.toLowerCase();
  for (const skill of skillKeywords) {
    if (lowerDesc.includes(skill) && !skills.includes(skill)) {
      skills.push(skill);
    }
  }

  // Extract requirements from description (first ~3 bullet points if available)
  const requirements: string[] = [];
  const lines = job.description.split("\n").filter((l) => l.trim());
  for (const line of lines) {
    const trimmed = line.trim().replace(/^[-•*]\s*/, "");
    if (
      trimmed.length > 20 &&
      trimmed.length < 200 &&
      !trimmed.toLowerCase().includes("apply") &&
      !trimmed.toLowerCase().includes("equal opportunity") &&
      requirements.length < 4
    ) {
      requirements.push(trimmed);
    }
  }

  const collar = mapCollarType(job.title, job.description, job.category?.label || "");
  const type = mapJobType(job.contract_time, job.contract_type);

  return {
    title: job.title,
    company_name: job.company.display_name,
    description: job.description,
    location: displayName,
    country: countryName,
    region: mapRegion(countryCode),
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_currency: job.salary_currency || "USD",
    type,
    collar,
    is_remote: isRemote,
    requirements,
    skills,
    external_id: job.id,
    external_source: "adzuna",
    external_url: job.redirect_url,
    posted_date: job.created,
  };
}
