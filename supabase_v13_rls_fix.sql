-- ================================================================
-- AIS Dashboard — v13 RLS Fix
-- Run in Supabase SQL Editor if you see:
--   "new row violates row-level security policy for table module_control"
-- ================================================================

-- Allow the anon key (used by the dashboard and admin panel)
-- to read and write module_control freely.
-- Admin-side authorisation is enforced in the application layer.

ALTER TABLE public.module_control ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all" ON public.module_control;

CREATE POLICY "anon_all" ON public.module_control
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
