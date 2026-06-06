-- ================================================================
-- AIS Dashboard — Schema v20 Migration
-- Swarnandhra KPI live score tables
-- 1) swarna_kpi_district_live  — District → Score
-- 2) swarna_kpi_dept_live      — HoD + Department → Score
-- Run in Supabase SQL Editor (once)
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1) District-level KPI scores
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.swarna_kpi_district_live (
  id          SERIAL PRIMARY KEY,
  district    TEXT NOT NULL,
  score       NUMERIC(10,2),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skdl_district ON public.swarna_kpi_district_live(district);

DROP TRIGGER IF EXISTS trg_skdl_updated ON public.swarna_kpi_district_live;
CREATE TRIGGER trg_skdl_updated
  BEFORE UPDATE ON public.swarna_kpi_district_live
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT ALL ON public.swarna_kpi_district_live                           TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.swarna_kpi_district_live_id_seq TO anon;

ALTER TABLE public.swarna_kpi_district_live ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.swarna_kpi_district_live;
CREATE POLICY "anon_all" ON public.swarna_kpi_district_live
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────
-- 2) Department / HoD-level KPI scores
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.swarna_kpi_dept_live (
  id          SERIAL PRIMARY KEY,
  hod         TEXT,
  department  TEXT NOT NULL,
  score       NUMERIC(10,2),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skdept_dept ON public.swarna_kpi_dept_live(department);
CREATE INDEX IF NOT EXISTS idx_skdept_hod  ON public.swarna_kpi_dept_live(hod);

DROP TRIGGER IF EXISTS trg_skdept_updated ON public.swarna_kpi_dept_live;
CREATE TRIGGER trg_skdept_updated
  BEFORE UPDATE ON public.swarna_kpi_dept_live
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT ALL ON public.swarna_kpi_dept_live                           TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.swarna_kpi_dept_live_id_seq TO anon;

ALTER TABLE public.swarna_kpi_dept_live ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.swarna_kpi_dept_live;
CREATE POLICY "anon_all" ON public.swarna_kpi_dept_live
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
