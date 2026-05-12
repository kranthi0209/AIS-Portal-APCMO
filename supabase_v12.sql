-- ================================================================
-- AIS Dashboard — Schema v12 Migration
-- Self Appraisal table (officer-facing, no period — one draft at a time)
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.self_appraisal (
  id                SERIAL PRIMARY KEY,
  officer_id        INTEGER REFERENCES public.officers(id) ON DELETE SET NULL,
  identity_no       TEXT NOT NULL,
  officer_name      TEXT NOT NULL,
  service_type      TEXT,           -- IAS | IPS | IFS
  innovations       TEXT,           -- Section 1: Innovations Introduced
  digitalisations   TEXT,           -- Section 2: Digitalisations in Processes
  new_policies      TEXT,           -- Section 3: New Policies Framed/Introduced
  de_regularisation TEXT,           -- Section 4: De-Regularisation Activities Done
  leadership_skills TEXT,           -- Section 5: Leadership Skills
  status            TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'submitted'
  submitted_at      TIMESTAMPTZ,
  entered_at        TIMESTAMPTZ     DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sa_identity ON public.self_appraisal(identity_no);
CREATE INDEX IF NOT EXISTS idx_sa_status   ON public.self_appraisal(status);
CREATE INDEX IF NOT EXISTS idx_sa_entered  ON public.self_appraisal(entered_at);

-- Allow anon key (used by the dashboard) to read/write
GRANT ALL ON public.self_appraisal                         TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.self_appraisal_id_seq TO anon;
