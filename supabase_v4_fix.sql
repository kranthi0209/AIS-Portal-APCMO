-- ================================================================
-- AIS Dashboard — v4 Fix
-- Adds the upload_type column to eoffice_data if it is missing.
-- Run in Supabase SQL Editor.
--
-- Error this fixes:
--   "Could not find the 'upload_type' column of 'eoffice_data'
--    in the schema cache"
--
-- upload_type values:
--   'officer' — data entered per individual officer
--   'office'  — data entered at office / department level
-- ================================================================

ALTER TABLE public.eoffice_data
  ADD COLUMN IF NOT EXISTS upload_type TEXT NOT NULL DEFAULT 'officer';

-- Update the Supabase schema cache so the new column is visible
-- immediately without a project restart:
NOTIFY pgrst, 'reload schema';
