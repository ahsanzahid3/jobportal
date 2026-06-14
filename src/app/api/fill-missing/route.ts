import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

// ─── Detection functions ───────────────────────────────────────

function detectCollar(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  const blue = [
    "laborer", "worker", "technician", "mechanic", "electrician", "plumber",
    "welder", "carpenter", "construction", "driver", "warehouse", "factory",
    "manufacturing", "maintenance", "custodian", "janitor", "cleaner",
    "assembler", "operator", "machinist", "fabricator", "painter", "roofer",
    "hvac", "landscaper", "gardener", "delivery", "courier", "housekeeper",
    "cook", "chef", "baker", "barista", "waiter", "server", "cashier",
    "security", "guard", "porter", "mover", "truck", "forklift",
    "production", "assembly", "packaging", "driver", "logistics",
    "warehouse operator", "manual worker", "tradesperson",
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
  if ((text.includes("field") || text.includes("travel") || text.includes("on the road")) && !text.includes("field of")) return "field";
  return "onsite";
}

function detectSeniority(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("senior") || t.includes("sr.") || t.includes("lead") || t.includes("head of") ||
      t.includes("director") || t.includes("vp ") || t.includes("vice president") || t.includes("principal") ||
      t.includes("manager") || t.includes("supervisor")) return "senior";
  if (t.includes("junior") || t.includes("jr.") || t.includes("entry") || t.includes("trainee") ||
      t.includes("intern") || t.includes("graduate") || t.includes("associate")) return "entry";
  if (t.includes("no experience") || t.includes("no prior")) return "no-experience";
  return "mid";
}

function extractSkills(description: string): string[] {
  const keywords: [string, string][] = [
    ["javascript", "JavaScript"], ["typescript", "TypeScript"], ["python", "Python"],
    ["java", "Java"], ["react", "React"], ["node.js", "Node.js"], ["node", "Node.js"],
    ["sql", "SQL"], ["aws", "AWS"], ["azure", "Azure"], ["gcp", "GCP"],
    ["docker", "Docker"], ["kubernetes", "Kubernetes"], ["git", "Git"],
    ["agile", "Agile"], ["scrum", "Scrum"], ["html", "HTML"], ["css", "CSS"],
    ["rest api", "REST API"], ["graphql", "GraphQL"],
    ["mongodb", "MongoDB"], ["postgresql", "PostgreSQL"], ["redis", "Redis"],
    ["terraform", "Terraform"], ["linux", "Linux"], ["bash", "Bash"],
    ["excel", "Excel"], ["sap", "SAP"], ["oracle", "Oracle"],
    ["salesforce", "Salesforce"], ["photoshop", "Photoshop"],
    ["figma", "Figma"], ["seo", "SEO"], ["google analytics", "Google Analytics"],
    ["project management", "Project Management"],
    ["machine learning", "Machine Learning"],
    ["customer service", "Customer Service"],
    ["communication", "Communication"], ["leadership", "Leadership"],
    ["team management", "Team Management"],
    ["accounting", "Accounting"], ["quickbooks", "QuickBooks"],
    ["hubspot", "HubSpot"], ["content writing", "Content Writing"],
    ["copywriting", "Copywriting"], ["data analysis", "Data Analysis"],
    ["marketing", "Marketing"], ["sales", "Sales"],
  ];
  const found: string[] = [];
  const lower = description.toLowerCase();
  for (const [kw, label] of keywords) {
    if (lower.includes(kw) && !found.includes(label)) found.push(label);
  }
  return found;
}

function extractIndustry(title: string, description: string): string | null {
  const text = `${title} ${description}`.toLowerCase();
  const patterns: [RegExp, string][] = [
    [/software|developer|engineer|programming|it |tech |digital|full.stack|frontend|backend/g, "Software & Technology"],
    [/healthcare|medical|nurse|doctor|hospital|clinical|patient|health/g, "Healthcare & Medical"],
    [/finance|banking|accounting|audit|tax |financial|investment|insurance/g, "Fintech & Finance"],
    [/marketing|advertising|brand|social media|content|seo|digital marketing/g, "Marketing & Advertising"],
    [/sales|business development|account manager|sales representative/g, "Sales & Business Development"],
    [/education|teacher|professor|teaching|school|training|tutor|student/g, "Education & Training"],
    [/construction|building|architect|civil|engineering|infrastructure/g, "Construction & Trades"],
    [/manufacturing|production|factory|assembly|plant|industrial/g, "Manufacturing"],
    [/logistics|transportation|supply chain|warehouse|delivery|shipping|fleet/g, "Logistics & Transportation"],
    [/hospitality|hotel|restaurant|tourism|travel|chef|cook|barista|waiter/g, "Hospitality & Tourism"],
    [/hr|human resources|recruitment|talent|people|personnel/g, "Human Resources"],
    [/legal|lawyer|attorney|paralegal|compliance|regulatory/g, "Legal & Compliance"],
    [/energy|utility|oil|gas|renewable|power|solar|wind/g, "Energy & Utilities"],
    [/agriculture|farming|farm|agri|rural|veterinary/g, "Agriculture & Farming"],
    [/telecom|telecommunications|network|wireless|broadband/g, "Telecommunications"],
    [/real estate|property|rental|leasing|housing/g, "Real Estate & Property"],
    [/media|entertainment|broadcast|publishing|journalism|video|film/g, "Media & Entertainment"],
    [/design|creative|ux|ui|graphic|art|illustrator|animation/g, "Design & Creative"],
    [/nonprofit|ngo|charity|volunteer|foundation/g, "Nonprofit & NGO"],
    [/cyber security|cybersecurity|security analyst|penetration/g, "Cybersecurity"],
    [/ai |artificial intelligence|machine learning|deep learning|llm|gpt/g, "AI & Machine Learning"],
    [/data scientist|data analytics|data engineer|data warehouse|bi |analytics/g, "Data & Analytics"],
  ];
  for (const [regex, industry] of patterns) {
    if ((regex as RegExp).test(text)) return industry;
  }
  return null;
}

// ─── GET handler ───────────────────────────────────────────────

export async function GET() {
  const results: { updated: number; errors: string[] } = { updated: 0, errors: [] };

  // Fetch jobs missing key fields (limit to 500 per run)
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, description, company, collar, workplace, skills, industry")
    .or("collar.is.null,workplace.is.null,skills.is.null,industry.is.null,company.is.null")
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ status: "complete", updated: 0, message: "No jobs need filling" });
  }

  // Update each job with computed values
  for (const job of jobs) {
    const title = job.title || "";
    const desc = job.description || "";
    const updates: Record<string, any> = {};

    if (!job.collar) updates.collar = detectCollar(title, desc);
    if (!job.workplace) updates.workplace = detectWorkplace(title, desc);
    if (!job.skills || (Array.isArray(job.skills) && job.skills.length === 0)) {
      const skills = extractSkills(desc);
      if (skills.length > 0) updates.skills = skills;
    }
    if (!job.industry) {
      const industry = extractIndustry(title, desc);
      if (industry) updates.industry = industry;
    }
    // For company: try to extract from description clues
    if (!job.company) {
      // Look for common patterns: "About [Company]" "at [Company]" "with [Company]"
      const match = desc.match(/(?:at|with|for|join)\s+([A-Z][A-Za-z0-9\s&.]+?)(?:\s+(?:we\s+are|is\s+looking|as\s+a|to\s+join|in\s+our))/i);
      if (match && match[1].trim().length > 2 && match[1].trim().length < 60) {
        updates.company = match[1].trim();
      }
    }

    if (Object.keys(updates).length === 0) continue;

    const { error: updateErr } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", job.id);

    if (updateErr) {
      results.errors.push(`${job.id?.slice(0, 8)}: ${updateErr.message.slice(0, 100)}`);
    } else {
      results.updated++;
    }
  }

  return NextResponse.json({
    status: "complete",
    scanned: jobs.length,
    ...results,
    remaining: jobs.length - results.updated,
  });
}
