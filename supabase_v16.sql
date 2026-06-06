-- ================================================================
-- AIS Dashboard — Schema v16 Migration
-- Live e-Office data — Post-wise table
-- Same columns as eoffice_live_data plus post_name
-- One officer can have MULTIPLE post rows (no unique constraint)
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.eoffice_live_post (
  id               SERIAL PRIMARY KEY,
  identity_no      TEXT        NOT NULL,
  service_type     TEXT        NOT NULL,            -- 'IAS' | 'IPS' | 'IFS'
  post_name        TEXT        NOT NULL,            -- designation / post title
  data_date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  opening_balance  INT         NOT NULL DEFAULT 0,
  files_received   INT         NOT NULL DEFAULT 0,
  files_processed  INT         NOT NULL DEFAULT 0,
  files_pending    INT         NOT NULL DEFAULT 0,  -- opening_balance + files_received - files_processed
  avg_time_mins    NUMERIC(10,2),
  median_time_mins NUMERIC(10,2),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
  -- No UNIQUE constraint: same officer can hold multiple posts
);

CREATE INDEX IF NOT EXISTS idx_eo_post_svc      ON public.eoffice_live_post(service_type);
CREATE INDEX IF NOT EXISTS idx_eo_post_date     ON public.eoffice_live_post(data_date);
CREATE INDEX IF NOT EXISTS idx_eo_post_id       ON public.eoffice_live_post(identity_no);
CREATE INDEX IF NOT EXISTS idx_eo_post_postname ON public.eoffice_live_post(post_name);

-- Reuse the set_updated_at() function created in v15 (already exists)
DROP TRIGGER IF EXISTS trg_eoffice_live_post_updated ON public.eoffice_live_post;
CREATE TRIGGER trg_eoffice_live_post_updated
  BEFORE UPDATE ON public.eoffice_live_post
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT ALL ON public.eoffice_live_post                           TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.eoffice_live_post_id_seq TO anon;

-- ----------------------------------------------------------------
-- If the table was already created with the old UNIQUE constraint,
-- run this to drop it (find the constraint name first):
--   SELECT conname FROM pg_constraint
--   WHERE conrelid = 'public.eoffice_live_post'::regclass
--   AND contype = 'u';
-- Then drop it:
--   ALTER TABLE public.eoffice_live_post DROP CONSTRAINT <conname>;
-- ----------------------------------------------------------------
