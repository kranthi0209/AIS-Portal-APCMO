-- ================================================================
-- AIS Dashboard — Merge officer_photos into officers table
-- ================================================================
-- Run this in Supabase SQL Editor AFTER supabase_schema.sql.
-- Safe to re-run — uses IF NOT EXISTS / ON CONFLICT.
-- ================================================================

-- Step 1: Add photo_url column to officers (if not already there)
ALTER TABLE public.officers
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Step 2: Copy existing photo URLs from officer_photos → officers
UPDATE public.officers o
SET    photo_url = p.photo_url
FROM   public.officer_photos p
WHERE  p.service_type = o.service_type
  AND  p.seniority_no = o.seniority_no
  AND  p.photo_url IS NOT NULL;

-- Step 3: (Optional) Drop the now-redundant officer_photos table.
-- Uncomment when you are confident the migration is complete.
-- DROP TABLE IF EXISTS public.officer_photos;

-- Verification
SELECT 'officers with photo_url' AS status, COUNT(*) AS count
FROM   public.officers WHERE photo_url IS NOT NULL
UNION ALL
SELECT 'officers without photo_url', COUNT(*)
FROM   public.officers WHERE photo_url IS NULL;
