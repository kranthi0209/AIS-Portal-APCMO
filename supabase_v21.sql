-- ================================================================
-- AIS Dashboard — Schema v21 Migration
-- GoI (CSS) Funds Utilization live table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.goi_funds_live (
  id                    SERIAL PRIMARY KEY,
  hod                   TEXT,
  department            TEXT,
  css_name              TEXT,           -- Centrally Sponsored Scheme name
  state_scheme          TEXT,
  goi_allocation        NUMERIC(18,2),  -- GoI Allocation
  funds_transferred     NUMERIC(18,2),  -- Funds Transferred by GoI
  funds_with_agencies   NUMERIC(18,2),  -- Funds available with Implementing Agencies
  expenditure           NUMERIC(18,2),  -- Expenditure
  untapped_funds        NUMERIC(18,2),  -- Untapped funds from GoI
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goi_dept ON public.goi_funds_live(department);
CREATE INDEX IF NOT EXISTS idx_goi_hod  ON public.goi_funds_live(hod);
CREATE INDEX IF NOT EXISTS idx_goi_css  ON public.goi_funds_live(css_name);

DROP TRIGGER IF EXISTS trg_goi_updated ON public.goi_funds_live;
CREATE TRIGGER trg_goi_updated
  BEFORE UPDATE ON public.goi_funds_live
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT ALL ON public.goi_funds_live                           TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.goi_funds_live_id_seq TO anon;

ALTER TABLE public.goi_funds_live ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.goi_funds_live;
CREATE POLICY "anon_all" ON public.goi_funds_live
  FOR ALL TO anon USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
