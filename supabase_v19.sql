-- ================================================================
-- AIS Dashboard — Schema v19 Migration
-- 1) public_perception_live  — district campaign perception scores
-- 2) campaign_dept_hod       — Campaign → Dept → HoD mapping
-- Run in Supabase SQL Editor (once)
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1) Public Perception Live
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.public_perception_live (
  id          SERIAL PRIMARY KEY,
  district    TEXT NOT NULL,
  campaign    TEXT NOT NULL,
  period      TEXT,                 -- reporting period (e.g. 'Jun-2026', 'Q1-2026')
  score       NUMERIC(10,2),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ppl_district ON public.public_perception_live(district);
CREATE INDEX IF NOT EXISTS idx_ppl_campaign ON public.public_perception_live(campaign);
CREATE INDEX IF NOT EXISTS idx_ppl_period   ON public.public_perception_live(period);

DROP TRIGGER IF EXISTS trg_ppl_updated ON public.public_perception_live;
CREATE TRIGGER trg_ppl_updated
  BEFORE UPDATE ON public.public_perception_live
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT ALL ON public.public_perception_live                           TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.public_perception_live_id_seq TO anon;

ALTER TABLE public.public_perception_live ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.public_perception_live;
CREATE POLICY "anon_all" ON public.public_perception_live
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────
-- 2) Campaign → Dept → HoD Mapping
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaign_dept_hod (
  id          SERIAL PRIMARY KEY,
  campaign    TEXT NOT NULL,
  dept        TEXT NOT NULL,
  hod         TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cdh_campaign ON public.campaign_dept_hod(campaign);
CREATE INDEX IF NOT EXISTS idx_cdh_dept     ON public.campaign_dept_hod(dept);
CREATE INDEX IF NOT EXISTS idx_cdh_hod      ON public.campaign_dept_hod(hod);

DROP TRIGGER IF EXISTS trg_cdh_updated ON public.campaign_dept_hod;
CREATE TRIGGER trg_cdh_updated
  BEFORE UPDATE ON public.campaign_dept_hod
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT ALL ON public.campaign_dept_hod                           TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.campaign_dept_hod_id_seq TO anon;

ALTER TABLE public.campaign_dept_hod ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.campaign_dept_hod;
CREATE POLICY "anon_all" ON public.campaign_dept_hod
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
