-- ================================================================
-- AIS Dashboard — Fix RLS Infinite Recursion + new table policies
-- ================================================================
-- PROBLEM:
--   Policies using FOR ALL on officer_services contain
--   EXISTS(SELECT FROM user_roles ...). That sub-select hits
--   user_roles policies, which themselves query user_roles
--   → infinite recursion on every SELECT.
--
-- FIX:
--   1. Create a SECURITY DEFINER function is_admin_user().
--      SECURITY DEFINER runs as the function owner (bypasses RLS),
--      so it can query user_roles without triggering its own policy.
--   2. Replace every FOR ALL admin policy with separate
--      INSERT / UPDATE / DELETE policies so SELECT queries are
--      never affected by the admin check.
--
-- ALSO: Adds RLS policies for the new officers + officer_postings
--       tables that replaced officer_services.
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New Query → paste → Run
-- ================================================================

-- ----------------------------------------------------------------
-- Step 1: Security-definer function (bypasses RLS when called)
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

-- ----------------------------------------------------------------
-- Step 2: Fix user_roles — drop recursive FOR ALL, split writes
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;

CREATE POLICY IF NOT EXISTS "Admins can insert user_roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

CREATE POLICY IF NOT EXISTS "Admins can update user_roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING      (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY IF NOT EXISTS "Admins can delete user_roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (is_admin_user());

-- ----------------------------------------------------------------
-- Step 3: Fix officer_services (legacy) — drop FOR ALL, split writes
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Admin can modify officer_services" ON public.officer_services;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='officer_services') THEN
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Admin insert officer_services"
      ON public.officer_services FOR INSERT TO authenticated
      WITH CHECK (is_admin_user())';
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Admin update officer_services"
      ON public.officer_services FOR UPDATE TO authenticated
      USING (is_admin_user()) WITH CHECK (is_admin_user())';
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Admin delete officer_services"
      ON public.officer_services FOR DELETE TO authenticated
      USING (is_admin_user())';
  END IF;
END $$;

-- ----------------------------------------------------------------
-- Step 4: RLS for officers table (new)
-- ----------------------------------------------------------------
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='officers') THEN
    ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can read officers" ON public.officers;
    CREATE POLICY "Authenticated users can read officers"
      ON public.officers FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Admin insert officers" ON public.officers;
    CREATE POLICY "Admin insert officers"
      ON public.officers FOR INSERT TO authenticated WITH CHECK (is_admin_user());

    DROP POLICY IF EXISTS "Admin update officers" ON public.officers;
    CREATE POLICY "Admin update officers"
      ON public.officers FOR UPDATE TO authenticated
      USING (is_admin_user()) WITH CHECK (is_admin_user());

    DROP POLICY IF EXISTS "Admin delete officers" ON public.officers;
    CREATE POLICY "Admin delete officers"
      ON public.officers FOR DELETE TO authenticated USING (is_admin_user());
  END IF;
END $$;

-- ----------------------------------------------------------------
-- Step 5: RLS for officer_postings table (new)
-- ----------------------------------------------------------------
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='officer_postings') THEN
    ALTER TABLE public.officer_postings ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can read officer_postings" ON public.officer_postings;
    CREATE POLICY "Authenticated users can read officer_postings"
      ON public.officer_postings FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Admin insert officer_postings" ON public.officer_postings;
    CREATE POLICY "Admin insert officer_postings"
      ON public.officer_postings FOR INSERT TO authenticated WITH CHECK (is_admin_user());

    DROP POLICY IF EXISTS "Admin update officer_postings" ON public.officer_postings;
    CREATE POLICY "Admin update officer_postings"
      ON public.officer_postings FOR UPDATE TO authenticated
      USING (is_admin_user()) WITH CHECK (is_admin_user());

    DROP POLICY IF EXISTS "Admin delete officer_postings" ON public.officer_postings;
    CREATE POLICY "Admin delete officer_postings"
      ON public.officer_postings FOR DELETE TO authenticated USING (is_admin_user());
  END IF;
END $$;

-- ----------------------------------------------------------------
-- Step 6: Fix officer_photos — drop FOR ALL, split writes
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Admin can modify photos" ON public.officer_photos;

CREATE POLICY IF NOT EXISTS "Admin insert officer_photos"
  ON public.officer_photos FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

CREATE POLICY IF NOT EXISTS "Admin update officer_photos"
  ON public.officer_photos FOR UPDATE TO authenticated
  USING      (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY IF NOT EXISTS "Admin delete officer_photos"
  ON public.officer_photos FOR DELETE TO authenticated
  USING (is_admin_user());
