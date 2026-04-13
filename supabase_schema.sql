-- ================================================================
-- AIS Dashboard — Supabase Database Schema
-- ================================================================
-- HOW TO USE:
--   1. Go to https://app.supabase.com → your project → SQL Editor
--   2. Click "New Query", paste this entire file, and click Run
--   3. After running, run migrate_split.sql to move data from the
--      old officer_services table into officers + officer_postings.
--
-- NOTE: Safe to re-run — uses IF NOT EXISTS for tables and
--       DROP POLICY IF EXISTS before every CREATE POLICY.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. user_roles — created FIRST (other policies reference it)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id    BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role  TEXT NOT NULL DEFAULT 'user'   -- 'user' | 'admin'
);

CREATE INDEX IF NOT EXISTS idx_user_roles_email
  ON public.user_roles (email);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own role"     ON public.user_roles;
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (email = auth.email());

-- ----------------------------------------------------------------
-- 2. Security-definer function — bypasses RLS to check admin
--    (prevents infinite recursion in write policies)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE email = auth.email() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
CREATE POLICY "Admins can insert user_roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "Admins can update user_roles" ON public.user_roles;
CREATE POLICY "Admins can update user_roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING      (is_admin_user())
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
CREATE POLICY "Admins can delete user_roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (is_admin_user());

-- ----------------------------------------------------------------
-- 3. officers — one row per officer, deduplicated
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.officers (
  id                        BIGSERIAL    PRIMARY KEY,
  service_type              TEXT         NOT NULL,       -- 'IAS' | 'IPS' | 'IFS'
  slno                      INTEGER,
  seniority_no              INTEGER,
  identity_no               TEXT,
  cadre                     TEXT,
  name_of_officer           TEXT         NOT NULL,
  current_posting           TEXT,
  date_of_appointment       TEXT,
  source_of_recruitment     TEXT,
  educational_qualification TEXT,
  date_of_birth             TEXT,
  allotment_year            TEXT,
  domicile                  TEXT,
  email_id                  TEXT,
  phone_no                  TEXT,
  photo_url                 TEXT,
  is_retired                BOOLEAN NOT NULL DEFAULT FALSE,
  is_transferred_from_ap    BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(service_type, seniority_no)
);

CREATE INDEX IF NOT EXISTS idx_officers_service_seniority
  ON public.officers (service_type, seniority_no);
CREATE INDEX IF NOT EXISTS idx_officers_name
  ON public.officers (name_of_officer);

ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read officers" ON public.officers;
CREATE POLICY "Authenticated users can read officers"
  ON public.officers FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin insert officers" ON public.officers;
CREATE POLICY "Admin insert officers"
  ON public.officers FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "Admin update officers" ON public.officers;
CREATE POLICY "Admin update officers"
  ON public.officers FOR UPDATE TO authenticated
  USING      (is_admin_user())
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "Admin delete officers" ON public.officers;
CREATE POLICY "Admin delete officers"
  ON public.officers FOR DELETE TO authenticated
  USING (is_admin_user());

-- ----------------------------------------------------------------
-- 4. officer_postings — one row per posting / assignment
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.officer_postings (
  id           BIGSERIAL PRIMARY KEY,
  officer_id   BIGINT    NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
  service_type TEXT      NOT NULL,       -- denormalised for direct filtering
  from_date    TEXT,
  to_date      TEXT,
  hcm          TEXT,
  post_name    TEXT,
  department   TEXT,
  category     TEXT
);

CREATE INDEX IF NOT EXISTS idx_postings_officer_id
  ON public.officer_postings (officer_id);
CREATE INDEX IF NOT EXISTS idx_postings_service_type
  ON public.officer_postings (service_type);
CREATE INDEX IF NOT EXISTS idx_postings_service_dept
  ON public.officer_postings (service_type, department);

ALTER TABLE public.officer_postings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read officer_postings" ON public.officer_postings;
CREATE POLICY "Authenticated users can read officer_postings"
  ON public.officer_postings FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin insert officer_postings" ON public.officer_postings;
CREATE POLICY "Admin insert officer_postings"
  ON public.officer_postings FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "Admin update officer_postings" ON public.officer_postings;
CREATE POLICY "Admin update officer_postings"
  ON public.officer_postings FOR UPDATE TO authenticated
  USING      (is_admin_user())
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "Admin delete officer_postings" ON public.officer_postings;
CREATE POLICY "Admin delete officer_postings"
  ON public.officer_postings FOR DELETE TO authenticated
  USING (is_admin_user());

-- ----------------------------------------------------------------
-- 5. officer_photos
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.officer_photos (
  id           BIGSERIAL PRIMARY KEY,
  service_type TEXT    NOT NULL,           -- 'IAS' | 'IPS' | 'IFS'
  seniority_no INTEGER NOT NULL,
  photo_url    TEXT    NOT NULL,
  UNIQUE(service_type, seniority_no)
);

CREATE INDEX IF NOT EXISTS idx_officer_photos_service_type
  ON public.officer_photos (service_type);

ALTER TABLE public.officer_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read photos" ON public.officer_photos;
CREATE POLICY "Authenticated users can read photos"
  ON public.officer_photos FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin insert officer_photos" ON public.officer_photos;
CREATE POLICY "Admin insert officer_photos"
  ON public.officer_photos FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "Admin update officer_photos" ON public.officer_photos;
CREATE POLICY "Admin update officer_photos"
  ON public.officer_photos FOR UPDATE TO authenticated
  USING      (is_admin_user())
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "Admin delete officer_photos" ON public.officer_photos;
CREATE POLICY "Admin delete officer_photos"
  ON public.officer_photos FOR DELETE TO authenticated
  USING (is_admin_user());
