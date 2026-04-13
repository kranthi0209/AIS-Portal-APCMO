-- ================================================================
-- AIS Dashboard — Add is_retired column to officers table
-- ================================================================
-- Run this in Supabase SQL Editor once.
-- Safe to re-run (uses IF NOT EXISTS).
-- ================================================================

-- Step 1: Add column
ALTER TABLE public.officers
  ADD COLUMN IF NOT EXISTS is_retired BOOLEAN NOT NULL DEFAULT FALSE;

-- Step 2: Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_officers_is_retired
  ON public.officers (is_retired)
  WHERE is_retired = TRUE;

-- Verification
SELECT 'Active officers'  AS status, COUNT(*) FROM public.officers WHERE NOT is_retired
UNION ALL
SELECT 'Retired officers', COUNT(*) FROM public.officers WHERE is_retired;
