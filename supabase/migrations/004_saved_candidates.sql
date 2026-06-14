-- =============================================================
-- CareerPortal — Saved Candidates (Recruiter Personal Talent Pool)
-- Run this in your Supabase SQL editor.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.saved_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(recruiter_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_sc_recruiter ON public.saved_candidates(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_sc_candidate ON public.saved_candidates(candidate_id);

ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recruiters manage their saved candidates" ON public.saved_candidates;
CREATE POLICY "Recruiters manage their saved candidates" ON public.saved_candidates
  FOR ALL USING (recruiter_id = auth.uid());
