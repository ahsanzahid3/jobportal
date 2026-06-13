-- =============================================================
-- CareerPortal — Initial Schema
-- Run this in your Supabase SQL editor to set up the database.
-- =============================================================

-- 1. ENUMS
-- =============================================================
CREATE TYPE user_role AS ENUM ('admin', 'recruiter', 'candidate');
CREATE TYPE collar_type AS ENUM ('white', 'blue');
CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'contract', 'remote', 'internship');
CREATE TYPE job_status AS ENUM ('active', 'paused', 'closed', 'filled');
CREATE TYPE application_status AS ENUM ('applied', 'reviewing', 'interviewing', 'rejected', 'hired');
CREATE TYPE crm_stage AS ENUM ('contacted', 'interviewing', 'rejected', 'hired');
CREATE TYPE visibility_status AS ENUM ('visible', 'blurred', 'unlocked');
CREATE TYPE ad_status AS ENUM ('active', 'paused', 'expired');
CREATE TYPE ad_placement AS ENUM ('sidebar', 'top', 'between_results', 'featured');

-- 2. TABLES
-- =============================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'candidate',
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  headline TEXT,
  bio TEXT,
  linkedin_url TEXT,
  linkedin_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  industry TEXT,
  size TEXT,
  location TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES profiles(id),
  description TEXT NOT NULL,
  requirements TEXT[],
  responsibilities TEXT[],
  skills TEXT[],
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT DEFAULT 'USD',
  location TEXT,
  country TEXT,
  region TEXT,
  collar collar_type NOT NULL,
  type job_type NOT NULL DEFAULT 'full-time',
  status job_status NOT NULL DEFAULT 'active',
  is_remote BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  pin_expires_at TIMESTAMPTZ,
  feature_expires_at TIMESTAMPTZ,
  external_id TEXT,           -- For ATS imports
  external_source TEXT,        -- greenhouse | lever | workday | ashby | bamboohr
  external_url TEXT,
  external_raw JSONB,
  views_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'applied',
  cover_letter TEXT,
  resume_url TEXT,
  match_score NUMERIC,          -- 0-100
  skills_match NUMERIC,
  experience_match NUMERIC,
  salary_match NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- Recruiter Talent Pool
CREATE TABLE talent_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  visibility visibility_status NOT NULL DEFAULT 'blurred',
  notes TEXT,
  is_watchlisted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(recruiter_id, candidate_id)
);

-- Recruiter CRM Pipeline
CREATE TABLE crm_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),
  stage crm_stage NOT NULL DEFAULT 'contacted',
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  interviewed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  hired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Recruiter Companies (which companies a recruiter manages)
CREATE TABLE recruiter_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT,  -- 'owner', 'manager', 'recruiter'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(recruiter_id, company_id)
);

-- Candidate Job Alerts
CREATE TABLE job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT,
  country TEXT,
  region TEXT,
  collar collar_type,
  type job_type,
  frequency TEXT DEFAULT 'daily',  -- daily | weekly | instant
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Advertisements (CPM Ads)
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  target_url TEXT NOT NULL,
  placement ad_placement NOT NULL DEFAULT 'sidebar',
  status ad_status NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  impressions_bought INTEGER DEFAULT 0,
  impressions_served INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cpm_rate NUMERIC NOT NULL,       -- Cost per 1000 impressions
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pinned / Highlighted Posts
CREATE TABLE pinned_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pinned', 'highlighted')),
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  fee_paid NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INDEXES
-- =============================================================
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_country ON jobs(country);
CREATE INDEX idx_jobs_region ON jobs(region);
CREATE INDEX idx_jobs_collar ON jobs(collar);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX idx_jobs_featured ON jobs(is_featured) WHERE is_featured = true;
CREATE INDEX idx_jobs_pinned ON jobs(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_jobs_external ON jobs(external_source) WHERE external_source IS NOT NULL;
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_talent_pool_recruiter ON talent_pool(recruiter_id);
CREATE INDEX idx_crm_recruiter ON crm_pipeline(recruiter_id);
CREATE INDEX idx_crm_stage ON crm_pipeline(stage);
CREATE INDEX idx_job_alerts_candidate ON job_alerts(candidate_id);

-- 4. FULL TEXT SEARCH
-- =============================================================
ALTER TABLE jobs ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX idx_jobs_search ON jobs USING GIN(search_vector);

-- 5. ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_posts ENABLE ROW LEVEL SECURITY;

-- Public: anyone can view active jobs and companies
CREATE POLICY "Public can view active jobs" ON jobs
  FOR SELECT USING (status = 'active');
CREATE POLICY "Public can view companies" ON companies
  FOR SELECT USING (true);

-- Profiles: users can view their own, recruiters can view candidates
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Recruiters can view candidate profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'recruiter')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. HANDY FUNCTIONS
-- =============================================================
CREATE OR REPLACE FUNCTION search_jobs(
  search_term TEXT,
  p_region TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_collar collar_type DEFAULT NULL,
  p_type job_type DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS SETOF jobs
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM jobs
  WHERE status = 'active'
    AND (search_term IS NULL OR search_vector @@ plainto_tsquery('english', search_term))
    AND (p_region IS NULL OR region = p_region)
    AND (p_country IS NULL OR country = p_country)
    AND (p_collar IS NULL OR collar = p_collar)
    AND (p_type IS NULL OR type = p_type)
  ORDER BY is_featured DESC, is_pinned DESC, created_at DESC
  LIMIT p_limit;
$$;
