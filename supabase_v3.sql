-- ================================================================
-- AIS Dashboard — Schema v3 Migration
-- Run this entire script in Supabase SQL Editor (once)
-- Adds: password reset requests table + helper RPCs
-- ================================================================

-- 1. Password reset requests table
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id              SERIAL PRIMARY KEY,
  identity_no     TEXT NOT NULL,
  user_email      TEXT NOT NULL,
  officer_name    TEXT,
  service_type    TEXT,
  personal_email  TEXT,
  personal_mobile TEXT,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'completed' | 'rejected'
  completed_at    TIMESTAMPTZ,
  new_temp_pw     TEXT                               -- filled by admin when completed
);

CREATE INDEX IF NOT EXISTS idx_prr_status   ON public.password_reset_requests(status);
CREATE INDEX IF NOT EXISTS idx_prr_email    ON public.password_reset_requests(lower(user_email));

-- 2. get_initial_password — validates identity details, returns temp pw if never logged in
CREATE OR REPLACE FUNCTION public.get_initial_password(
  p_identity_no  TEXT,
  p_service_type TEXT,
  p_batch        TEXT,    -- allotment year, e.g. '1995'
  p_dob          TEXT     -- date of birth YYYY-MM-DD
)
RETURNS TEXT AS $$
DECLARE
  v_ofr  public.officers%ROWTYPE;
  v_ur   public.user_roles%ROWTYPE;
BEGIN
  -- Match officer record
  -- date_of_birth is stored as DD-MM-YYYY text; p_dob arrives as YYYY-MM-DD from the browser date input
  SELECT * INTO v_ofr
  FROM public.officers
  WHERE UPPER(TRIM(identity_no))  = UPPER(TRIM(p_identity_no))
    AND UPPER(TRIM(service_type)) = UPPER(TRIM(p_service_type))
    AND TRIM(allotment_year::TEXT) = TRIM(p_batch)
    AND TO_DATE(TRIM(date_of_birth), 'DD-MM-YYYY') = TO_DATE(TRIM(p_dob), 'YYYY-MM-DD')
  LIMIT 1;

  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Find the login account (email = identity_no uppercase)
  SELECT * INTO v_ur
  FROM public.user_roles
  WHERE lower(email) = lower(TRIM(p_identity_no))
  LIMIT 1;

  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Only reveal if they have never logged in (temp password still active)
  IF COALESCE(v_ur.login_count, 0) > 0 THEN RETURN 'ALREADY_LOGGED_IN'; END IF;

  RETURN v_ur.temp_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. request_password_reset — officer-initiated request (from login page)
CREATE OR REPLACE FUNCTION public.request_password_reset(p_identity_no TEXT)
RETURNS TEXT AS $$  -- 'not_found' | 'never_logged_in' | 'pending_exists' | 'request_created'
DECLARE
  v_ur   public.user_roles%ROWTYPE;
  v_ofr  public.officers%ROWTYPE;
BEGIN
  SELECT * INTO v_ur
  FROM public.user_roles
  WHERE lower(email) = lower(TRIM(p_identity_no))
  LIMIT 1;

  IF NOT FOUND THEN RETURN 'not_found'; END IF;

  -- Never logged in → direct to initial password flow
  IF COALESCE(v_ur.login_count, 0) = 0 THEN RETURN 'never_logged_in'; END IF;

  -- Duplicate pending check
  IF EXISTS (
    SELECT 1 FROM public.password_reset_requests
    WHERE lower(user_email) = lower(TRIM(p_identity_no))
      AND status = 'pending'
  ) THEN RETURN 'pending_exists'; END IF;

  -- Fetch linked officer details
  SELECT * INTO v_ofr
  FROM public.officers
  WHERE id = v_ur.officer_id
  LIMIT 1;

  INSERT INTO public.password_reset_requests
    (identity_no, user_email, officer_name, service_type, personal_email, personal_mobile)
  VALUES (
    UPPER(TRIM(p_identity_no)),
    UPPER(TRIM(p_identity_no)),
    v_ofr.name_of_officer,
    v_ur.role,
    v_ur.personal_email,
    v_ur.personal_mobile
  );

  RETURN 'request_created';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. get_password_reset_requests — admin view of all requests
CREATE OR REPLACE FUNCTION public.get_password_reset_requests()
RETURNS TABLE(
  id              INTEGER,
  identity_no     TEXT,
  officer_name    TEXT,
  service_type    TEXT,
  personal_email  TEXT,
  personal_mobile TEXT,
  requested_at    TIMESTAMPTZ,
  status          TEXT,
  completed_at    TIMESTAMPTZ,
  new_temp_pw     TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.identity_no, r.officer_name, r.service_type,
         r.personal_email, r.personal_mobile,
         r.requested_at, r.status, r.completed_at, r.new_temp_pw
  FROM public.password_reset_requests r
  ORDER BY
    CASE r.status WHEN 'pending' THEN 0 ELSE 1 END,
    r.requested_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. admin_complete_reset — admin validates and generates new temp password
CREATE OR REPLACE FUNCTION public.admin_complete_reset(p_request_id INTEGER)
RETURNS TABLE(new_password TEXT, personal_email TEXT, personal_mobile TEXT, officer_name TEXT) AS $$
DECLARE
  v_req  public.password_reset_requests%ROWTYPE;
  v_pw   TEXT;
BEGIN
  SELECT * INTO v_req
  FROM public.password_reset_requests
  WHERE id = p_request_id
  LIMIT 1;

  IF NOT FOUND THEN RETURN; END IF;

  -- Generate new temp password
  v_pw := 'AIS@'
    || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || p_request_id::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 5))
    || LPAD((FLOOR(RANDOM() * 90) + 10)::TEXT, 2, '0');

  -- Update user account
  UPDATE public.user_roles
  SET password_hash        = crypt(v_pw, gen_salt('bf', 8)),
      temp_password        = v_pw,
      must_change_password = TRUE
  WHERE lower(email) = lower(v_req.user_email);

  -- Mark request completed
  UPDATE public.password_reset_requests
  SET status       = 'completed',
      completed_at = NOW(),
      new_temp_pw  = v_pw
  WHERE id = p_request_id;

  RETURN QUERY SELECT v_pw, v_req.personal_email, v_req.personal_mobile, v_req.officer_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. admin_reject_reset — admin rejects a request
CREATE OR REPLACE FUNCTION public.admin_reject_reset(p_request_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.password_reset_requests
  SET status = 'rejected', completed_at = NOW()
  WHERE id = p_request_id AND status = 'pending';
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grants
GRANT EXECUTE ON FUNCTION public.get_initial_password(TEXT,TEXT,TEXT,TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.request_password_reset(TEXT)               TO anon;
GRANT EXECUTE ON FUNCTION public.get_password_reset_requests()              TO anon;
GRANT EXECUTE ON FUNCTION public.admin_complete_reset(INTEGER)              TO anon;
GRANT EXECUTE ON FUNCTION public.admin_reject_reset(INTEGER)                TO anon;
