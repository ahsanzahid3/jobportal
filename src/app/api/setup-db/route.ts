import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function GET() {
  const results: { step: string; status: string; detail?: string }[] = [];

  async function exec(sql: string, label: string) {
    try {
      const { error } = await supabase.rpc("pg_exec", { sql_text: sql });
      if (error) {
        results.push({ step: label, status: "error", detail: error.message.slice(0, 200) });
      } else {
        results.push({ step: label, status: "ok" });
      }
    } catch (e: any) {
      results.push({ step: label, status: "error", detail: e.message?.slice(0, 200) || "Unknown" });
    }
  }

  // First check what columns exist
  try {
    const { data, error } = await supabase.from("jobs").select("id").limit(0);
    if (error) {
      results.push({ step: "check-jobs-table", status: "error", detail: error.message });
      return NextResponse.json({ results, note: "jobs table may not exist or needs migration" });
    }

    // Try inserting a small test record with just id to see what's there
    const { error: insertErr } = await supabase.from("jobs").insert({
      title: "_schema_test",
      description: "test",
    }).select("id,title");
    
    if (insertErr) {
      results.push({ step: "insert-test", status: "error", detail: insertErr.message.slice(0, 300) });
    } else {
      // Delete test record
      await supabase.from("jobs").delete().eq("title", "_schema_test");
      results.push({ step: "insert-test", status: "ok" });
    }
  } catch (e: any) {
    results.push({ step: "check", status: "error", detail: e.message?.slice(0, 200) });
  }

  return NextResponse.json({ results });
}
