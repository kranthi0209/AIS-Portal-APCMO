-- ================================================================
-- AIS Dashboard — Comprehensive RLS Fix
-- Run in Supabase SQL Editor (safe to re-run)
--
-- Fixes: "new row violates row-level security policy for table …"
--
-- Supabase enables RLS by default on all new tables.
-- GRANT ALL to anon is NOT enough — you also need explicit policies.
-- This script adds a permissive anon policy on every data table.
-- Application-layer auth (requireAuth / isAdmin) enforces access.
-- ================================================================

-- ── eoffice_data ─────────────────────────────────────────────────
ALTER TABLE public.eoffice_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.eoffice_data;
CREATE POLICY "anon_all" ON public.eoffice_data
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── goifunds_data ────────────────────────────────────────────────
ALTER TABLE public.goifunds_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.goifunds_data;
CREATE POLICY "anon_all" ON public.goifunds_data
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── perception_data ──────────────────────────────────────────────
ALTER TABLE public.perception_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.perception_data;
CREATE POLICY "anon_all" ON public.perception_data
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── integrity_data ───────────────────────────────────────────────
ALTER TABLE public.integrity_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.integrity_data;
CREATE POLICY "anon_all" ON public.integrity_data
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── party_data ───────────────────────────────────────────────────
ALTER TABLE public.party_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.party_data;
CREATE POLICY "anon_all" ON public.party_data
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── media_data ───────────────────────────────────────────────────
ALTER TABLE public.media_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.media_data;
CREATE POLICY "anon_all" ON public.media_data
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── swarna_data ──────────────────────────────────────────────────
ALTER TABLE public.swarna_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.swarna_data;
CREATE POLICY "anon_all" ON public.swarna_data
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── gsdp_data ────────────────────────────────────────────────────
ALTER TABLE public.gsdp_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.gsdp_data;
CREATE POLICY "anon_all" ON public.gsdp_data
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── self_appraisal ───────────────────────────────────────────────
ALTER TABLE public.self_appraisal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.self_appraisal;
CREATE POLICY "anon_all" ON public.self_appraisal
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── module_control ───────────────────────────────────────────────
ALTER TABLE public.module_control ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.module_control;
CREATE POLICY "anon_all" ON public.module_control
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── post_type_options (v14) ──────────────────────────────────────
ALTER TABLE public.post_type_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.post_type_options;
CREATE POLICY "anon_all" ON public.post_type_options
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── eoffice_live_data (v15) ───────────────────────────────────────
ALTER TABLE public.eoffice_live_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.eoffice_live_data;
CREATE POLICY "anon_all" ON public.eoffice_live_data
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── eoffice_live_post (v16) ───────────────────────────────────────
ALTER TABLE public.eoffice_live_post ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.eoffice_live_post;
CREATE POLICY "anon_all" ON public.eoffice_live_post
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── officer_post_dates (v17) ─────────────────────────────────────
ALTER TABLE public.officer_post_dates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.officer_post_dates;
CREATE POLICY "anon_all" ON public.officer_post_dates
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── department_hod (v18) ─────────────────────────────────────────
ALTER TABLE public.department_hod ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.department_hod;
CREATE POLICY "anon_all" ON public.department_hod
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── public_perception_live (v19) ─────────────────────────────────
ALTER TABLE public.public_perception_live ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.public_perception_live;
CREATE POLICY "anon_all" ON public.public_perception_live
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── campaign_dept_hod (v19) ──────────────────────────────────────
ALTER TABLE public.campaign_dept_hod ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.campaign_dept_hod;
CREATE POLICY "anon_all" ON public.campaign_dept_hod
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── swarna_kpi_district_live (v20) ───────────────────────────────
ALTER TABLE public.swarna_kpi_district_live ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.swarna_kpi_district_live;
CREATE POLICY "anon_all" ON public.swarna_kpi_district_live
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── swarna_kpi_dept_live (v20) ───────────────────────────────────
ALTER TABLE public.swarna_kpi_dept_live ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.swarna_kpi_dept_live;
CREATE POLICY "anon_all" ON public.swarna_kpi_dept_live
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── goi_funds_live (v21) ─────────────────────────────────────────
ALTER TABLE public.goi_funds_live ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.goi_funds_live;
CREATE POLICY "anon_all" ON public.goi_funds_live
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── goi_funds_district_live (v22) ────────────────────────────────
ALTER TABLE public.goi_funds_district_live ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.goi_funds_district_live;
CREATE POLICY "anon_all" ON public.goi_funds_district_live
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── Reload PostgREST schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
