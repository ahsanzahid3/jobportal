-- =============================================================
-- CareerPortal — Visitor Analytics
-- Run this in your Supabase SQL editor to create the tracking table.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.visitor_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'job_view', 'job_click')),
  path TEXT,
  job_id TEXT,
  visitor_id TEXT NOT NULL,
  country TEXT DEFAULT 'Unknown',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_ve_visitor ON public.visitor_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_ve_event ON public.visitor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ve_country ON public.visitor_events(country);
CREATE INDEX IF NOT EXISTS idx_ve_created ON public.visitor_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ve_job_id ON public.visitor_events(job_id) WHERE job_id IS NOT NULL;

-- Row Level Security
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert
DROP POLICY IF EXISTS "Anyone can insert visitor_events" ON public.visitor_events;
CREATE POLICY "Anyone can insert visitor_events" ON public.visitor_events
  FOR INSERT WITH CHECK (true);

-- Only admins can read
DROP POLICY IF EXISTS "Admins can read visitor_events" ON public.visitor_events;
CREATE POLICY "Admins can read visitor_events" ON public.visitor_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
