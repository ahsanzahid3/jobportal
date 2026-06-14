import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

// Simple language detection from country code + text analysis
function detectLanguage(country: string, title: string, description: string): { code: string; name: string } {
  const text = `${title} ${description}`.toLowerCase();
  
  // German indicators
  const deWords = ["der ", "die ", "das ", "und ", "mit ", "für ", "sie ", "wir ", "auf ", "bei ",
    "m/w/d", "bewerbung", "erfahrung", "aufgaben", "anforderungen", "wir suchen", "ihre aufgabe",
    "ihr profil", "kenntnisse", "team", "arbeitgeber", "gehalt", "stunden", "vertrag"];
  // French indicators  
  const frWords = ["le ", "la ", "les ", "des ", "pour ", "sur ", "dans ", "avec ", "vous ", "nous ",
    "notre", "vos", "poste", "mission", "expérience", "compétences", "formation", "salaire"];
  // Spanish indicators
  const esWords = ["el ", "la ", "los ", "las ", "para ", "con ", "por ", "del ", "una ", "sus ",
    "experiencia", "conocimientos", "ofrecemos", "requisitos", "funciones", "salario", "jornada"];
  // Italian indicators
  const itWords = ["il ", "la ", "le ", "gli ", "dei ", "per ", "con ", "una ", "della ", "delle ",
    "esperienza", "competenze", "requisiti", "mansioni", "offriamo", "stipendio", "contratto"];
  // Dutch indicators
  const nlWords = ["de ", "het ", "een ", "voor ", "met ", "van ", "op ", "bij ", "uw ", "onze ",
    "ervaring", "vaardigheden", "functie", "werkzaamheden", "salaris", "vereisten", "sollicitatie"];

  const countWords = (words: string[]) => words.filter(w => text.includes(w)).length;
  
  const scores = {
    de: countWords(deWords),
    fr: countWords(frWords),
    es: countWords(esWords),
    it: countWords(itWords),
    nl: countWords(nlWords),
  };

  // If none detected, check country-based defaults
  const countryLangs: Record<string, string> = {
    "Germany": "de", "Austria": "de", "Switzerland": "de",
    "France": "fr", "Belgium": "fr",
    "Spain": "es",
    "Italy": "it",
    "Netherlands": "nl",
  };
  
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] >= 3) {
    return { code: best[0], name: best[0] };
  }
  
  const langCode = countryLangs[country] || "en";
  return { code: langCode, name: langCode };
}

const LANG_NAMES: Record<string, string> = {
  de: "German", fr: "French", es: "Spanish", it: "Italian", nl: "Dutch",
};

// Free Google Translate proxy (no API key required)
async function translateText(text: string, target: string, source?: string): Promise<string> {
  const params = new URLSearchParams({ q: text, target });
  if (source) params.set("source", source);
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source || "auto"}&tl=${target}&dt=t&q=${encodeURIComponent(text.slice(0, 5000))}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Parse Google Translate response
    const translated = data[0]?.map((s: any) => s[0]).filter(Boolean).join("") || text;
    return translated;
  } catch (e: any) {
    console.error(`Translation error: ${e.message}`);
    return text; // fallback to original
  }
}

// Detect if text is already English
function isEnglish(text: string): boolean {
  // Check if mostly ASCII with common English words
  const nonAscii = text.split("").filter(c => c.charCodeAt(0) > 127).length;
  if (nonAscii > text.length * 0.3) return false;
  
  const enIndicators = ["the ", "and ", "for ", "are ", "with ", "have ", "this ", "that ",
    "from ", "they ", "will ", "would ", "about ", "there ", "their ", "what ", "which "];
  const enCount = enIndicators.filter(w => text.toLowerCase().includes(w)).length;
  return enCount >= 3;
}

export async function GET() {
  const results: { scanned: number; translated: number; errors: string[] } = {
    scanned: 0, translated: 0, errors: [],
  };

  // Fetch jobs from non-English-speaking countries with descriptions that may need translation
  const nonEnglishCountries = ["Germany", "Austria", "France", "Belgium", "Spain", "Italy", "Netherlands", "Switzerland", "Poland", "Brazil"];
  
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, description, country")
    .in("country", nonEnglishCountries)
    .limit(300);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!jobs || jobs.length === 0) return NextResponse.json({ message: "No jobs to translate" });

  results.scanned = jobs.length;

  for (const job of jobs) {
    const title = job.title || "";
    const desc = job.description || "";
    
    // Detect language
    const lang = detectLanguage(job.country || "", title, desc);
    if (lang.code === "en") continue; // Already English
    
    if (isEnglish(title) && isEnglish(desc)) continue; // Actually English
    
    // Translate non-English descriptions
    let newTitle = title;
    let newDesc = desc;
    let changed = false;
    
    if (!isEnglish(title) && title.length > 5) {
      newTitle = await translateText(title, "en");
      if (newTitle !== title) changed = true;
    }
    if (!isEnglish(desc) && desc.length > 20) {
      newDesc = await translateText(desc, "en");
      if (newDesc !== desc) changed = true;
    }

    if (changed) {
      const { error: updateErr } = await supabase
        .from("jobs")
        .update({
          title: newTitle,
          description: newDesc,
        })
        .eq("id", job.id);
      
      if (updateErr) {
        results.errors.push(`${job.id?.slice(0, 8)}: ${updateErr.message.slice(0, 100)}`);
      } else {
        results.translated++;
      }
    }
  }

  return NextResponse.json({
    status: "complete",
    ...results,
    languages: [...new Set(jobs.map(j => detectLanguage(j.country || "", j.title || "", j.description || "").code).filter(c => c !== "en"))],
  });
}
