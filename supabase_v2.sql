-- ================================================================
-- AIS Dashboard — Schema v2 Migration
-- Run this entire script in Supabase SQL Editor (once)
-- ================================================================

-- 1. Enable pgcrypto for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Extend user_roles table with new columns
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS officer_id           INTEGER REFERENCES public.officers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS password_hash        TEXT,          -- bcrypt hash (officer-generated / changed passwords)
  ADD COLUMN IF NOT EXISTS temp_password        TEXT,          -- plain-text temp password, visible to admin only
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_first_login       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS personal_email       TEXT,
  ADD COLUMN IF NOT EXISTS personal_mobile      TEXT,
  ADD COLUMN IF NOT EXISTS login_count          INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at        TIMESTAMPTZ;

-- 3. Drop and recreate login_user with full tracking + backward compat
--    Backward compat: if password_hash is set → use bcrypt; else → plain text (admin-added users)
DROP FUNCTION IF EXISTS public.login_user(TEXT, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION public.login_user(p_email TEXT, p_password TEXT)
RETURNS TABLE(
  id                   BIGINT,
  email                TEXT,
  role                 TEXT,
  must_change_password BOOLEAN,
  is_first_login       BOOLEAN,
  officer_id           INTEGER,
  personal_email       TEXT,
  personal_mobile      TEXT
) AS $$
DECLARE
  v_row  public.user_roles%ROWTYPE;
  v_ok   BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_row
  FROM public.user_roles
  WHERE lower(user_roles.email) = lower(p_email)
  LIMIT 1;

  IF NOT FOUND THEN RETURN; END IF;

  -- Password check: bcrypt if hash column is set, plain-text fallback for legacy admin accounts
  IF v_row.password_hash IS NOT NULL THEN
    v_ok := (crypt(p_password, v_row.password_hash) = v_row.password_hash);
  ELSE
    v_ok := (v_row.password = p_password);
  END IF;

  IF NOT v_ok THEN RETURN; END IF;

  -- Track login
  UPDATE public.user_roles
  SET login_count   = COALESCE(login_count, 0) + 1,
      last_login_at = NOW()
  WHERE lower(user_roles.email) = lower(p_email);

  RETURN QUERY SELECT
    v_row.id,
    lower(v_row.email),
    v_row.role,
    COALESCE(v_row.must_change_password, FALSE),
    COALESCE(v_row.is_first_login,       FALSE),
    v_row.officer_id,
    v_row.personal_email,
    v_row.personal_mobile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Change password (called after first login or whenever user changes it)
CREATE OR REPLACE FUNCTION public.change_user_password(p_email TEXT, p_new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_roles
  SET password_hash        = crypt(p_new_password, gen_salt('bf', 10)),
      must_change_password = FALSE,
      temp_password        = NULL
  WHERE lower(email) = lower(p_email);
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update officer personal profile, marks first-login complete
CREATE OR REPLACE FUNCTION public.update_officer_profile(
  p_email TEXT, p_personal_email TEXT, p_personal_mobile TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_roles
  SET personal_email  = p_personal_email,
      personal_mobile = p_personal_mobile,
      is_first_login  = FALSE
  WHERE lower(email) = lower(p_email);
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Admin: reset a user's password (generates new temp password)
CREATE OR REPLACE FUNCTION public.reset_user_password(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_pw TEXT;
BEGIN
  -- Format: AIS@XXXXX99  (4-letter prefix + 5 uppercase + 2 digits)
  v_pw := 'AIS@'
    || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 5))
    || LPAD((FLOOR(RANDOM() * 90) + 10)::TEXT, 2, '0');

  UPDATE public.user_roles
  SET password_hash        = crypt(v_pw, gen_salt('bf', 10)),
      temp_password        = v_pw,
      must_change_password = TRUE
  WHERE lower(email) = lower(p_email);

  RETURN v_pw;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Bulk-generate officer logins from officers table
--    Call once per service type: SELECT * FROM generate_officer_users('IAS');
--    Uses bcrypt cost 6 for bulk generation (temp passwords, forced-change on first login).
--    Cost 6 ≈ 6 ms/hash vs 100 ms at cost 10 — prevents statement timeout for 100-300 officers.
--    Permanent passwords set by change_user_password use cost 10.
CREATE OR REPLACE FUNCTION public.generate_officer_users(p_service_type TEXT)
RETURNS TABLE(
  officer_name TEXT,
  login_email  TEXT,
  temp_pw      TEXT,
  action_taken TEXT
) AS $$
DECLARE
  v_rec     RECORD;
  v_email   TEXT;
  v_pw      TEXT;
  v_existed BOOLEAN;
BEGIN
  FOR v_rec IN
    SELECT id, name_of_officer, identity_no
    FROM public.officers
    WHERE upper(service_type) = upper(p_service_type)
      AND is_retired = FALSE
      AND is_transferred_from_ap = FALSE
    ORDER BY id
  LOOP
    -- Login ID = identity_no in uppercase
    v_email := UPPER(TRIM(v_rec.identity_no));

    -- Generate temp password: AIS@XXXXX99
    v_pw := 'AIS@'
      || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || v_rec.id::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 5))
      || LPAD((FLOOR(RANDOM() * 90) + 10)::TEXT, 2, '0');

    -- Check if user already exists
    SELECT EXISTS(
      SELECT 1 FROM public.user_roles WHERE lower(email) = lower(v_email)
    ) INTO v_existed;

    -- Upsert — cost 6 for temp passwords (fast bulk generation; officer must change on first login)
    INSERT INTO public.user_roles
      (email, password_hash, role, officer_id, temp_password, must_change_password, is_first_login, login_count)
    VALUES
      (v_email, crypt(v_pw, gen_salt('bf', 6)), lower(p_service_type),
       v_rec.id, v_pw, TRUE, TRUE, 0)
    ON CONFLICT (email) DO UPDATE
      SET password_hash        = EXCLUDED.password_hash,
          officer_id           = EXCLUDED.officer_id,
          role                 = EXCLUDED.role,
          temp_password        = EXCLUDED.temp_password,
          must_change_password = TRUE,
          is_first_login       = TRUE;

    RETURN QUERY SELECT
      v_rec.name_of_officer,
      v_email,
      v_pw,
      CASE WHEN v_existed THEN 'updated' ELSE 'created' END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant execute to anon role (Supabase anon key users call via RPC)
GRANT EXECUTE ON FUNCTION public.login_user(TEXT, TEXT)               TO anon;
GRANT EXECUTE ON FUNCTION public.change_user_password(TEXT, TEXT)     TO anon;
GRANT EXECUTE ON FUNCTION public.update_officer_profile(TEXT,TEXT,TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.reset_user_password(TEXT)            TO anon;
GRANT EXECUTE ON FUNCTION public.generate_officer_users(TEXT)         TO anon;
