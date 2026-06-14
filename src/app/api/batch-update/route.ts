import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

export async function GET() {
  const results: Record<string, any> = {};

  // 1. Set all null collar to "white" (default)
  const { data: collarJobs, error: collarErr, count: collarCount } = await supabase
    .from("jobs")
    .select("id, title", { count: "exact", head: true })
    .is("collar", null);

  if (collarErr) {
    results.collar = { error: collarErr.message };
  } else if (collarCount && collarCount > 0) {
    // Batch update all null collar jobs
    const { error: upErr } = await supabase
      .from("jobs")
      .update({ collar: "white" })
      .is("collar", null);
    results.collar = { updated: collarCount, error: upErr?.message || null };
  } else {
    results.collar = { message: "All have collar already" };
  }

  // 2. Set all null workplace to "onsite" (default)
  const { count: wpCount } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .is("workplace", null);

  if (wpCount && wpCount > 0) {
    const { error: wpErr } = await supabase
      .from("jobs")
      .update({ workplace: "onsite" })
      .is("workplace", null);
    results.workplace = { updated: wpCount, error: wpErr?.message || null };
  } else {
    results.workplace = { message: "All have workplace already" };
  }

  // 3. Detect seniority from title for all null seniority jobs
  const { data: senJobs } = await supabase
    .from("jobs")
    .select("id, title")
    .is("seniority", null)
    .limit(500);

  if (senJobs && senJobs.length > 0) {
    let updated = 0;
    for (const job of senJobs) {
      const t = (job.title || "").toLowerCase();
      let seniority = "mid";
      if (t.includes("senior") || t.includes("sr.") || t.includes("lead") || t.includes("head of") ||
          t.includes("director") || t.includes("vp ") || t.includes("vice president") || t.includes("principal") ||
          t.includes("manager") || t.includes("supervisor")) seniority = "senior";
      else if (t.includes("junior") || t.includes("jr.") || t.includes("entry") || t.includes("trainee") ||
               t.includes("intern") || t.includes("graduate") || t.includes("associate")) seniority = "entry";
      const { error: sErr } = await supabase.from("jobs").update({ seniority }).eq("id", job.id);
      if (!sErr) updated++;
    }
    results.seniority = { updated, total: senJobs.length };
  } else {
    results.seniority = { message: "seniority column may not exist or all have values" };
  }

  // 4. Set skills to empty array instead of null
  const { error: skillsErr } = await supabase
    .from("jobs")
    .update({ skills: [] })
    .is("skills", null);
  results.skills = { error: skillsErr?.message || "converted null skills to empty arrays" };

  return NextResponse.json({ status: "complete", ...results });
}
