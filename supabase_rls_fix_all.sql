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

-- ── Reload PostgREST schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
