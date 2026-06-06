-- ================================================================
-- AIS Dashboard — Schema v22 Migration
-- GoI Funds — DISTRICT-level table (for District-status posts)
-- District posts aggregate by district, irrespective of department.
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.goi_funds_district_live (
  id               SERIAL PRIMARY KEY,
  hod              TEXT,
  department       TEXT,
  css_name         TEXT,           -- Centrally Sponsored Scheme name
  state_scheme     TEXT,
  district         TEXT,           -- district the funds belong to
  funds_available  NUMERIC(18,2),  -- Funds Available
  expenditure      NUMERIC(18,2),  -- Expenditure
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goid_district ON public.goi_funds_district_live(district);
CREATE INDEX IF NOT EXISTS idx_goid_dept     ON public.goi_funds_district_live(department);
CREATE INDEX IF NOT EXISTS idx_goid_css      ON public.goi_funds_district_live(css_name);

DROP TRIGGER IF EXISTS trg_goid_updated ON public.goi_funds_district_live;
CREATE TRIGGER trg_goid_updated
  BEFORE UPDATE ON public.goi_funds_district_live
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT ALL ON public.goi_funds_district_live                           TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.goi_funds_district_live_id_seq TO anon;

ALTER TABLE public.goi_funds_district_live ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.goi_funds_district_live;
CREATE POLICY "anon_all" ON public.goi_funds_district_live
  FOR ALL TO anon USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
