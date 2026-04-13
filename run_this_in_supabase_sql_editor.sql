-- ================================================================
-- AIS Dashboard — One-time schema migration
-- Run this entire script in: Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to run multiple times (all operations use IF NOT EXISTS / ON CONFLICT).
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Add photo_url to officers (merges officer_photos table)
-- ----------------------------------------------------------------
ALTER TABLE public.officers
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Copy existing photo URLs from officer_photos → officers
UPDATE public.officers o
SET    photo_url = p.photo_url
FROM   public.officer_photos p
WHERE  p.service_type = o.service_type
  AND  p.seniority_no = o.seniority_no
  AND  p.photo_url IS NOT NULL;

-- ----------------------------------------------------------------
-- 2. Add is_retired flag to officers
-- ----------------------------------------------------------------
ALTER TABLE public.officers
  ADD COLUMN IF NOT EXISTS is_retired BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_officers_is_retired
  ON public.officers (is_retired)
  WHERE is_retired = TRUE;

-- ----------------------------------------------------------------
-- 3. Add is_transferred_from_ap flag to officers
-- ----------------------------------------------------------------
ALTER TABLE public.officers
  ADD COLUMN IF NOT EXISTS is_transferred_from_ap BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_officers_is_transferred_from_ap
  ON public.officers (is_transferred_from_ap)
  WHERE is_transferred_from_ap = TRUE;

-- ----------------------------------------------------------------
-- 4. Verify
-- ----------------------------------------------------------------
SELECT
  'Officers total'                    AS label, COUNT(*)          AS count FROM public.officers
UNION ALL
SELECT 'Officers with photo_url',          COUNT(photo_url)                            FROM public.officers
UNION ALL
SELECT 'Active officers',                  COUNT(*) FILTER (WHERE NOT is_retired AND NOT is_transferred_from_ap) FROM public.officers
UNION ALL
SELECT 'Retired officers',                 COUNT(*) FILTER (WHERE is_retired)           FROM public.officers
UNION ALL
SELECT 'Transferred from AP officers',     COUNT(*) FILTER (WHERE is_transferred_from_ap) FROM public.officers;
