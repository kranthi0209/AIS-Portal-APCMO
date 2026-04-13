-- ================================================================
-- AIS Dashboard — Migrate officer_services → officers + officer_postings
-- ================================================================
-- Run this AFTER supabase_schema.sql has been executed.
-- It is safe to run multiple times — duplicate officers are skipped
-- via ON CONFLICT DO NOTHING.
-- ================================================================

-- ----------------------------------------------------------------
-- Step 1: Insert unique officers (one row per service_type + seniority_no).
--         DISTINCT ON picks the first row in id order so we get a
--         consistent, non-duplicate officer profile.
-- ----------------------------------------------------------------
INSERT INTO public.officers (
  service_type, slno, seniority_no, identity_no, cadre,
  name_of_officer, current_posting, date_of_appointment,
  source_of_recruitment, educational_qualification,
  date_of_birth, allotment_year, domicile, email_id, phone_no
)
SELECT DISTINCT ON (service_type, seniority_no)
  service_type, slno, seniority_no, identity_no, cadre,
  name_of_officer, current_posting, date_of_appointment,
  source_of_recruitment, educational_qualification,
  date_of_birth, allotment_year, domicile, email_id, phone_no
FROM public.officer_services
ORDER BY service_type, seniority_no, id
ON CONFLICT (service_type, seniority_no) DO NOTHING;

-- ----------------------------------------------------------------
-- Step 2: Insert one posting row per original record, linked to
--         the officer just created above.
-- ----------------------------------------------------------------
INSERT INTO public.officer_postings (
  officer_id, service_type,
  from_date, to_date, hcm, post_name, department, category
)
SELECT
  o.id,
  s.service_type,
  s.from_date,
  s.to_date,
  s.hcm,
  s.post_name,
  s.department,
  s.category
FROM public.officer_services s
JOIN public.officers o
  ON  o.service_type = s.service_type
  AND o.seniority_no = s.seniority_no;

-- ----------------------------------------------------------------
-- Verification — compare counts
-- ----------------------------------------------------------------
SELECT 'officers inserted'   AS status, COUNT(*) AS count FROM public.officers
UNION ALL
SELECT 'postings inserted',  COUNT(*) FROM public.officer_postings
UNION ALL
SELECT 'source rows (officer_services)', COUNT(*) FROM public.officer_services;
