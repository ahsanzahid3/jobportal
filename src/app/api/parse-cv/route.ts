import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────
interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  is_current: boolean;
}

interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  location: string;
  start_month: string;
  end_month: string;
  is_current: boolean;
  description: string;
}

export interface ParsedCV {
  full_name?: string;
  headline?: string;
  bio?: string;
  linkedin_url?: string;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────
function parseYearToMonth(year: string, isEnd = false): string {
  if (!year || !/^\d{4}$/.test(year.trim())) return "";
  return `${year.trim()}-${isEnd ? "12" : "01"}`;
}

// Split flat text into sections by locating known header keywords.
// All skill-like sub-sections (Core Competencies, eCommerce Development, etc.)
// are merged into the single "skills" bucket.
function extractSections(text: string): Record<string, string> {
  const MARKERS: Array<{ key: string; re: RegExp }> = [
    { key: "summary",    re: /\b(?:Profile\s+)?Summary\b/i },
    { key: "education",  re: /\bEducation\b/i },
    { key: "experience", re: /\bWork\s+Experience\b|\bProfessional\s+Experience\b|\bEmployment\s+History\b|\bExperience\b/i },
    // Primary skills section
    { key: "skills",     re: /\bKey\s+Skills\b|\bTechnical\s+Skills\b|\bCore\s+Skills\b|\bSkills\b/i },
    // Extended skill sub-sections — merged into "skills" below
    { key: "_sk1",       re: /\bCore\s+Competencies\b/i },
    { key: "_sk2",       re: /\beCommerce\s+Development\b/i },
    { key: "_sk3",       re: /\bDigital\s+Marketing(?:\s+&\s+Growth)?\b/i },
    { key: "_sk4",       re: /\bAnalytics\s+(?:&\s+Monitoring\s+)?Tools?\b/i },
    { key: "_sk5",       re: /\bSoft\s+Skills\b|\bNon[-\s]Technical\s+Skills\b/i },
    { key: "_sk6",       re: /\bNotable\b.*?\bProjects?\b/i },
  ];

  const found: Array<{ key: string; start: number; headerLen: number }> = [];
  for (const { key, re } of MARKERS) {
    const m = re.exec(text);
    if (m) found.push({ key, start: m.index, headerLen: m[0].length });
  }
  found.sort((a, b) => a.start - b.start);

  const sections: Record<string, string> = {};
  sections.header = text.slice(0, found[0]?.start ?? text.length).trim();

  for (let i = 0; i < found.length; i++) {
    const { key, start, headerLen } = found[i];
    const contentStart = start + headerLen;
    const contentEnd = i + 1 < found.length ? found[i + 1].start : text.length;
    sections[key] = text.slice(contentStart, contentEnd).trim();
  }

  // Merge extended skill sections into "skills"
  const extraKeys = ["_sk1", "_sk2", "_sk3", "_sk4", "_sk5", "_sk6"];
  const extraText = extraKeys.map(k => sections[k] ?? "").filter(Boolean).join(" ");
  if (extraText) sections.skills = ((sections.skills ?? "") + " " + extraText).trim();

  return sections;
}

// ─── Name extraction ──────────────────────────────────────────────
function extractName(header: string): string | undefined {
  const chunk = header.slice(0, 300);
  // ALL-CAPS name: "AHSAN ZAHID" or "AHSAN ZAHID MALIK"
  const capsMatch = chunk.match(/\b([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\b/);
  if (capsMatch) {
    return capsMatch[1].split(/\s+/).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  }
  // Fallback: first short line that looks like a name
  const lines = chunk.split(/[\n.!]/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.length >= 4 && line.length <= 50 &&
        !line.includes("@") && !line.match(/\d{4}/) &&
        !line.match(/^(tel|phone|email|address|linkedin|www|http)/i) &&
        line.match(/^[A-Z]/) && line.split(/\s+/).length <= 5) {
      return line;
    }
  }
}

// ─── Skills extraction ────────────────────────────────────────────
const TECH_KEYWORDS = [
  // Languages
  "JavaScript","TypeScript","Python","Java","C#","C++","Go","Rust","PHP","Ruby","Swift","Kotlin","Dart","Scala","Bash",
  // Frontend
  "React","Next.js","Vue","Angular","Svelte","Node.js","Express","Fastify","NestJS","HTML","CSS","Sass","Tailwind","Bootstrap","Webpack","Vite","Liquid",
  // Backend / DB
  "Django","Flask","FastAPI","Laravel","Spring","Rails","SQL","PostgreSQL","MySQL","SQLite","MongoDB","Redis","Elasticsearch","GraphQL","REST","gRPC","tRPC","WebSockets",
  // Cloud / DevOps
  "AWS","Azure","GCP","Firebase","Supabase","Docker","Kubernetes","Terraform","CI/CD","GitHub Actions","Jenkins","Nginx","Linux",
  // Design
  "Figma","Sketch","Adobe XD","Photoshop","Illustrator","After Effects","CorelDRAW","AutoCAD",
  // Data / Analytics
  "Excel","PowerPoint","Tableau","Power BI","Looker","Mixpanel","Google Analytics","Google Tag Manager","Hotjar","Ahrefs","SEMrush","SEMRush",
  // eCommerce / Marketing
  "Shopify","WooCommerce","Magento","BigCommerce","OpenCart","PrestaShop","Klaviyo","Mailchimp","HubSpot","ActiveCampaign","FunnelKit","CartFlows","Zapier","Make","n8n","Integromat",
  "Facebook Ads","Google Ads","Meta Ads","TikTok Ads","Pinterest Ads","YouTube Ads","Bing Ads",
  "SEO","SEM","CRO","PPC","A/B Testing","Email Marketing","Affiliate Marketing","Influencer Marketing","Content Marketing","Social Media Marketing",
  "Facebook Pixel","Conversion API","Meta Pixel","Google Ads Conversion","UTM Tracking","Attribution",
  "Selenium","BeautifulSoup","Scrapy","Puppeteer","Playwright",
  // AI / ML
  "Machine Learning","Deep Learning","TensorFlow","PyTorch","scikit-learn","NLP","OpenAI","GPT","LangChain","Prompt Engineering","AI Automation",
  // Productivity / PM
  "Agile","Scrum","Jira","Confluence","Notion","Asana","Trello","ClickUp","Monday.com",
  // Others
  "Solana","Stripe","PayPal","Twilio",
];

function extractSkills(skillsSection: string, fullText: string): string[] {
  const skills = new Set<string>();

  // Parse comma / bullet / newline / slash separated items from section
  const parts = skillsSection.split(/[,•·\/\n]/);
  for (const part of parts) {
    const stripped = part
      .replace(/^[^:]+:\s*/, "")   // strip "Category: " prefix
      .trim()
      .replace(/^[-*•·▪►\s]+/, "")
      .replace(/\.$/, "")
      .trim();
    // Accept if it looks like a meaningful skill (not too long/short, not pure digits)
    if (stripped.length > 1 && stripped.length < 60 && !/^\d+$/.test(stripped)) {
      skills.add(stripped);
    }
  }

  // Scan full text for known tech keywords (case-insensitive)
  for (const kw of TECH_KEYWORDS) {
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(fullText)) skills.add(kw);
  }

  return Array.from(skills).slice(0, 30);
}

// ─── Education ────────────────────────────────────────────────────

// Strategy A: "INSTITUTION YEAR-YEAR DEGREE" compact format
// e.g. "ACCA 2015-2016 Foundation in Accountancy ACCA 2016-2019 Finalist"
function parseEducationCompact(sectionText: string): EducationEntry[] {
  const entries: EducationEntry[] = [];
  // Institution: short word or abbreviation; followed by year range; followed by degree text
  // Lookahead stops degree at next institution+year or end of string
  const re = /([A-Z][A-Za-z&./\s]{1,40}?)\s+((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|[Pp]resent|[Cc]urrent)\s+((?:[A-Za-z][a-zA-Z,\s/&()]{4,100}?)(?=\s+[A-Z][A-Za-z&./\s]{1,40}?\s+(?:19|20)\d{2}|\s*$))/g;
  for (const m of sectionText.matchAll(re)) {
    const [, institution, startYear, endYear, degree] = m;
    const isCurrent = /present|current/i.test(endYear);
    if (institution.trim().length > 0 && degree.trim().length > 0) {
      entries.push({
        id: crypto.randomUUID(),
        institution: institution.trim().slice(0, 80),
        degree: degree.trim().replace(/\s+/g, " ").slice(0, 100),
        field_of_study: "",
        start_year: startYear,
        end_year: isCurrent ? "" : endYear,
        is_current: isCurrent,
      });
    }
  }
  return entries;
}

// Strategy B: Long-form — find year ranges, extract surrounding institution/degree
function parseEducationLongForm(sectionText: string): EducationEntry[] {
  const entries: EducationEntry[] = [];
  const yearRe = /\b((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present|current)\b/gi;
  const allMatches = [...sectionText.matchAll(yearRe)];

  for (let i = 0; i < allMatches.length; i++) {
    const m = allMatches[i];
    const isCurrent = /present|current/i.test(m[2]);

    // Institution: text between end of previous year range and start of this one
    const prevEnd = i > 0 ? allMatches[i - 1].index! + allMatches[i - 1][0].length : 0;
    const rawBefore = sectionText.slice(prevEnd, m.index!).trim().replace(/\s+/g, " ");
    const institution = rawBefore
      .replace(/^[a-z][^A-Z]*/, "")  // drop any leading lowercase continuation from previous entry
      .trim()
      .replace(/^[^A-Za-z]+/, "")
      .slice(0, 80);

    // Degree: text from after this year range to start of next year range
    const nextStart = i + 1 < allMatches.length ? allMatches[i + 1].index! : sectionText.length;
    const rawAfter = sectionText.slice(m.index! + m[0].length, nextStart).trim().replace(/\s+/g, " ");
    const degree = rawAfter
      .replace(/\s+[A-Z]{2,8}\s*$/, "")  // strip trailing ALL-CAPS abbreviation (next institution)
      .replace(/\s*linkedin.*$/i, "")
      .replace(/\.$/, "")
      .trim()
      .slice(0, 100);

    if (institution.length > 1) {
      entries.push({
        id: crypto.randomUUID(),
        institution,
        degree: degree || rawAfter.slice(0, 60),
        field_of_study: "",
        start_year: m[1],
        end_year: isCurrent ? "" : m[2],
        is_current: isCurrent,
      });
    }
  }

  return entries;
}

function parseEducation(sectionText: string): EducationEntry[] {
  // Prefer compact format (works well for professional qualifications like ACCA)
  const compact = parseEducationCompact(sectionText);
  if (compact.length > 0) return compact;
  return parseEducationLongForm(sectionText);
}

// ─── Experience ───────────────────────────────────────────────────

// Strategy 1: Pipe format "Company | Location  Title | YYYY–YYYY"
// (original CV format - no `i` flag so [A-Z] stays case-sensitive)
function parseExperiencePipe(sectionText: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  const re = /([A-Z][^|]{1,70}?)\s*\|\s*([^|]+?\([^)]*\)|[^|]{3,35}?)\s{1,5}([^|]{5,160}?)\s*\|\s*((?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|[Pp]resent|[Cc]urrent))/g;
  const matches = [...sectionText.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const [, company, location, titleRaw, dateRange] = m;
    const yearMatches = [...dateRange.matchAll(/\b((?:19|20)\d{2})\b/g)].map(x => x[1]);
    const isCurrent = /present|current/i.test(dateRange);
    const descStart = m.index! + m[0].length;
    const descEnd = i + 1 < matches.length ? matches[i + 1].index! : sectionText.length;
    const description = sectionText.slice(descStart, descEnd).replace(/\s+/g, " ").trim().slice(0, 400);
    entries.push({
      id: crypto.randomUUID(),
      company: company.trim().slice(0, 100),
      title: titleRaw.trim().replace(/\s*[-–—,\s]+$/, "").trim().slice(0, 120),
      location: location.trim().slice(0, 80),
      start_month: yearMatches[0] ? parseYearToMonth(yearMatches[0]) : "",
      end_month: isCurrent ? "" : (yearMatches[1] ? parseYearToMonth(yearMatches[1], true) : ""),
      is_current: isCurrent,
      description,
    });
  }
  return entries;
}

// Strategy 2a: Em-dash format with year-range in parens
// "Company (YYYY–YYYY) — Title  YYYY-YYYY"
// e.g. "DreamCarz1 (2010–2021) — Founder / Head of eCommerce & Automation 2010-2025"
function parseExperienceDashWithParens(sectionText: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  // Company name stops at "(" so the (YYYY-YYYY) in parens is captured separately
  const re = /([A-Z][^(\n]{2,60}?)\s*\(\d{4}\s*[-–—]\s*\d{4}\)\s*[—–]\s*([^|\n]+?)\s+((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|[Pp]resent|[Cc]urrent)/g;
  const matches = [...sectionText.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const [, company, titleRaw, startYear, endYear] = m;
    const isCurrent = /present|current/i.test(endYear);
    const descStart = m.index! + m[0].length;
    const descEnd = i + 1 < matches.length ? matches[i + 1].index! : sectionText.length;
    const description = sectionText.slice(descStart, descEnd).replace(/\s+/g, " ").trim().slice(0, 400);
    entries.push({
      id: crypto.randomUUID(),
      company: company.trim().replace(/\s+$/, "").slice(0, 100),
      title: titleRaw.trim().replace(/\s*[-–—,\s]+$/, "").trim().slice(0, 120),
      location: "",
      start_month: parseYearToMonth(startYear),
      end_month: isCurrent ? "" : parseYearToMonth(endYear, true),
      is_current: isCurrent,
      description,
    });
  }
  return entries;
}

// Strategy 2b: Simple em-dash format
// "Company — Title  YYYY-YYYY" (no parens year in company)
function parseExperienceDashSimple(sectionText: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  // Company must NOT contain em-dash, en-dash, pipe, or newline
  const re = /([A-Z][^—–|\n]{2,60}?)\s*[—–]{1,2}\s*([^|—–\n]{5,120}?)\s+((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|[Pp]resent|[Cc]urrent)/g;
  const matches = [...sectionText.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const [, company, titleRaw, startYear, endYear] = m;
    const isCurrent = /present|current/i.test(endYear);
    const descStart = m.index! + m[0].length;
    const descEnd = i + 1 < matches.length ? matches[i + 1].index! : sectionText.length;
    const description = sectionText.slice(descStart, descEnd).replace(/\s+/g, " ").trim().slice(0, 400);
    entries.push({
      id: crypto.randomUUID(),
      company: company.trim().slice(0, 100),
      title: titleRaw.trim().replace(/\s*[-–—,\s]+$/, "").trim().slice(0, 120),
      location: "",
      start_month: parseYearToMonth(startYear),
      end_month: isCurrent ? "" : parseYearToMonth(endYear, true),
      is_current: isCurrent,
      description,
    });
  }
  return entries;
}

function parseExperience(sectionText: string): ExperienceEntry[] {
  // Try pipe format first (explicit separator format)
  const pipe = parseExperiencePipe(sectionText);
  if (pipe.length > 0) return pipe;

  // Try em-dash with parens year (e.g. "Company (2010-2021) — Title 2010-2025")
  const dashParens = parseExperienceDashWithParens(sectionText);
  if (dashParens.length > 0) return dashParens;

  // Fall back to simple em-dash (e.g. "Company — Title 2020-2023")
  return parseExperienceDashSimple(sectionText);
}

// ─── Route handler ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ext = file.name.toLowerCase().split(".").pop();
    if (!["pdf", "docx"].includes(ext ?? ""))
      return NextResponse.json({ error: "Only PDF and DOCX files are supported" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = "";

    if (ext === "pdf") {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text: pdfText } = await extractText(pdf, { mergePages: true });
      text = pdfText;
    } else {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    // ── Upload raw file to Supabase Storage ──────────────────────
    let cv_url: string | undefined;
    if (userId) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
          { auth: { persistSession: false } },
        );
        const storagePath = `${userId}/cv.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("cvs")
          .upload(storagePath, buffer, {
            contentType: ext === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            upsert: true,
          });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("cvs").getPublicUrl(storagePath);
          cv_url = urlData.publicUrl;
        } else {
          console.warn("[parse-cv] Storage upload failed:", uploadError.message);
        }
      } catch (storageErr) {
        console.warn("[parse-cv] Storage error (non-fatal):", storageErr);
      }
    }

    // Split into sections
    const sections = extractSections(text);

    // Contact info
    const emailMatch  = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/([\w-]+)/i) ??
                          text.match(/linkedin[:\s]+([a-z0-9_-]{3,40})/i);

    const name       = extractName(sections.header ?? "");
    const skills     = extractSkills(sections.skills ?? "", text);
    const education  = parseEducation(sections.education ?? "");
    const experience = parseExperience(sections.experience ?? "");

    const summaryText = (sections.summary ?? "").replace(/\s+/g, " ").trim();

    // Headline: prefer first experience title; fall back to ALL-CAPS job title in header; then first summary sentence
    const capsJobTitle = (() => {
      const chunk = (sections.header ?? "").slice(0, 300);
      const hits = [...chunk.matchAll(/\b([A-Z]{3,}(?:\s+[A-Z]{3,}){1,4})\b/g)];
      if (hits.length >= 2) {
        const candidate = hits[1][1];
        // Make sure it's long enough to be a job title, not an abbreviation
        if (candidate.split(/\s+/).length >= 2 && candidate.length > 6) {
          return candidate.split(/\s+/).map(w => w[0] + w.slice(1).toLowerCase()).join(" ");
        }
      }
      return undefined;
    })();

    const headline =
      experience[0]?.title ||
      capsJobTitle ||
      (summaryText ? summaryText.split(/[.!?]/)[0].trim().slice(0, 120) : undefined);

    const linkedinUrl = (() => {
      if (!linkedinMatch) return undefined;
      const handle = linkedinMatch[1];
      return handle.startsWith("http") ? handle : `https://linkedin.com/in/${handle}`;
    })();

    const result: ParsedCV & { cv_url?: string } = {
      full_name: name,
      headline,
      bio: summaryText ? summaryText.slice(0, 500) : undefined,
      linkedin_url: linkedinUrl,
      skills,
      education,
      experience,
      cv_url,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[parse-cv]", err);
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 });
  }
}
