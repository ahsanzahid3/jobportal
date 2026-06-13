import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// NOTE: This requires a SERVICE ROLE key to run DDL statements.
// Set SUPABASE_SERVICE_ROLE_KEY in your .env.local file.
// Call GET /api/auth/setup-db ONCE to create all tables.

export const runtime = "nodejs";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const sql = `
    -- ── Profiles (one row per auth user) ──────────────────────────
    CREATE TABLE IF NOT EXISTS public.profiles (
      id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      role        TEXT NOT NULL DEFAULT 'employee'
                    CHECK (role IN ('employee','recruiter','admin')),
      full_name   TEXT,
      email       TEXT,
      linkedin_url TEXT,
      avatar_url  TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── Employee extended profiles ─────────────────────────────────
    CREATE TABLE IF NOT EXISTS public.employee_profiles (
      id                  UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
      headline            TEXT,
      bio                 TEXT,
      skills              TEXT[] DEFAULT '{}',
      experience_years    INT,
      desired_job_type    TEXT DEFAULT 'full-time',
      desired_workplace   TEXT DEFAULT 'any',
      desired_salary_min  INT,
      desired_salary_max  INT,
      location            TEXT,
      resume_url          TEXT,
      is_open_to_work     BOOLEAN DEFAULT TRUE,
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── Recruiter extended profiles ────────────────────────────────
    CREATE TABLE IF NOT EXISTS public.recruiter_profiles (
      id                   UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
      company_name         TEXT,
      company_website      TEXT,
      company_size         TEXT,
      company_industry     TEXT,
      company_logo_url     TEXT,
      company_description  TEXT,
      title                TEXT,
      updated_at           TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── Saved jobs (employees) ─────────────────────────────────────
    CREATE TABLE IF NOT EXISTS public.saved_jobs (
      id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      employee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      job_id       TEXT NOT NULL,
      job_title    TEXT,
      job_company  TEXT,
      job_location TEXT,
      job_salary   TEXT,
      external_url TEXT,
      saved_at     TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(employee_id, job_id)
    );

    -- ── Job alerts (employees) ─────────────────────────────────────
    CREATE TABLE IF NOT EXISTS public.job_alerts (
      id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      employee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      keyword      TEXT,
      location     TEXT,
      frequency    TEXT DEFAULT 'daily' CHECK (frequency IN ('instant','daily','weekly')),
      is_active    BOOLEAN DEFAULT TRUE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── CRM entries (recruiters track candidates) ──────────────────
    CREATE TABLE IF NOT EXISTS public.crm_entries (
      id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      recruiter_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      candidate_name    TEXT NOT NULL,
      candidate_email   TEXT,
      candidate_linkedin TEXT,
      job_title         TEXT,
      company           TEXT,
      status            TEXT DEFAULT 'contacted'
                          CHECK (status IN ('contacted','interviewing','rejected','hired')),
      notes             TEXT,
      created_at        TIMESTAMPTZ DEFAULT NOW(),
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    );

    -- ── Talent watchlist (recruiter bookmarks) ─────────────────────
    CREATE TABLE IF NOT EXISTS public.talent_watchlist (
      id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      recruiter_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      candidate_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      notes         TEXT,
      added_at      TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(recruiter_id, candidate_id)
    );

    -- ── Add recruiter_id to jobs table (nullable for backfill jobs) ─
    ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS recruiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

    -- ── RLS ────────────────────────────────────────────────────────
    ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.saved_jobs        ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.job_alerts        ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.crm_entries       ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.talent_watchlist  ENABLE ROW LEVEL SECURITY;

    -- profiles: own row + recruiters can see employee rows (for talent pool)
    DROP POLICY IF EXISTS "profiles_self"      ON public.profiles;
    DROP POLICY IF EXISTS "profiles_recruiter" ON public.profiles;
    CREATE POLICY "profiles_self"      ON public.profiles FOR ALL  USING (auth.uid() = id);
    CREATE POLICY "profiles_recruiter" ON public.profiles FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'recruiter')
    );

    -- employee_profiles: own + recruiter read
    DROP POLICY IF EXISTS "ep_self"      ON public.employee_profiles;
    DROP POLICY IF EXISTS "ep_recruiter" ON public.employee_profiles;
    CREATE POLICY "ep_self"      ON public.employee_profiles FOR ALL    USING (auth.uid() = id);
    CREATE POLICY "ep_recruiter" ON public.employee_profiles FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'recruiter')
    );

    -- recruiter_profiles: own only
    DROP POLICY IF EXISTS "rp_self" ON public.recruiter_profiles;
    CREATE POLICY "rp_self" ON public.recruiter_profiles FOR ALL USING (auth.uid() = id);

    -- saved_jobs: own only
    DROP POLICY IF EXISTS "sj_own" ON public.saved_jobs;
    CREATE POLICY "sj_own" ON public.saved_jobs FOR ALL USING (auth.uid() = employee_id);

    -- job_alerts: own only
    DROP POLICY IF EXISTS "ja_own" ON public.job_alerts;
    CREATE POLICY "ja_own" ON public.job_alerts FOR ALL USING (auth.uid() = employee_id);

    -- crm_entries: own only
    DROP POLICY IF EXISTS "crm_own" ON public.crm_entries;
    CREATE POLICY "crm_own" ON public.crm_entries FOR ALL USING (auth.uid() = recruiter_id);

    -- talent_watchlist: own only
    DROP POLICY IF EXISTS "tw_own" ON public.talent_watchlist;
    CREATE POLICY "tw_own" ON public.talent_watchlist FOR ALL USING (auth.uid() = recruiter_id);

    -- ── Trigger: auto-create profile on new user ───────────────────
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
      INSERT INTO public.profiles (id, role, full_name, email)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
        NEW.raw_user_meta_data->>'full_name',
        NEW.email
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;

  try {
    const { error } = await supabase.rpc("exec_sql", { sql_text: sql });
    if (error) {
      // Try direct execution via REST (some Supabase plans support it)
      return NextResponse.json({
        success: false,
        message: "RPC not available — please run the SQL manually in the Supabase SQL editor.",
        sql,
        error: error.message,
      });
    }
    return NextResponse.json({ success: true, message: "Database setup complete." });
  } catch {
    // Return the SQL for manual execution
    return NextResponse.json({
      success: false,
      message: "Please run the SQL below in the Supabase SQL editor (Dashboard → SQL Editor).",
      sql,
    });
  }
}
