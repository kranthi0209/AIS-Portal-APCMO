-- ================================================================
-- AIS Dashboard — Schema v17 Migration
-- Officer Post Date Ranges table
-- Tracks each officer's postings with date ranges, office type
-- and location. Used to compute UNIQUE days worked (overlapping
-- periods are merged so no day is counted twice).
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.officer_post_dates (
  id              SERIAL PRIMARY KEY,
  identity_no     TEXT        NOT NULL,
  post_name       TEXT        NOT NULL,
  from_date       DATE        NOT NULL,
  to_date         DATE,                   -- NULL = currently serving (uses today)
  office_type     TEXT,
  office_location TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_dates CHECK (to_date IS NULL OR to_date >= from_date)
);

CREATE INDEX IF NOT EXISTS idx_opd_identity ON public.officer_post_dates(identity_no);
CREATE INDEX IF NOT EXISTS idx_opd_from     ON public.officer_post_dates(from_date);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS trg_opd_updated ON public.officer_post_dates;
CREATE TRIGGER trg_opd_updated
  BEFORE UPDATE ON public.officer_post_dates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT ALL ON public.officer_post_dates                           TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.officer_post_dates_id_seq TO anon;

-- RLS
ALTER TABLE public.officer_post_dates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.officer_post_dates;
CREATE POLICY "anon_all" ON public.officer_post_dates
  FOR ALL TO anon USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';

-- ================================================================
-- v17 Amendment — Add department & hod to officer_post_dates
-- Run if table already exists without these columns
-- ================================================================
ALTER TABLE public.officer_post_dates
  ADD COLUMN IF NOT EXISTS department   TEXT,
  ADD COLUMN IF NOT EXISTS hod          TEXT,
  ADD COLUMN IF NOT EXISTS office_status TEXT; -- 'Secretariat' | 'HoD'

CREATE INDEX IF NOT EXISTS idx_opd_dept   ON public.officer_post_dates(department);
CREATE INDEX IF NOT EXISTS idx_opd_hod    ON public.officer_post_dates(hod);
CREATE INDEX IF NOT EXISTS idx_opd_status ON public.officer_post_dates(office_status);
