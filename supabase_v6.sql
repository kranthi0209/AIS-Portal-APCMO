-- ================================================================
-- AIS Dashboard — Schema v6 Migration
-- Public Perception Survey table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.perception_data (
  id               SERIAL PRIMARY KEY,
  officer_id       INTEGER REFERENCES public.officers(id) ON DELETE SET NULL,
  identity_no      TEXT NOT NULL,
  officer_name     TEXT NOT NULL,
  service_type     TEXT,               -- IAS | IPS | IFS
  question         TEXT NOT NULL,      -- Survey question text
  positive_score   NUMERIC(6,2)  NOT NULL DEFAULT 0,  -- % of positive responses (0–100)
  period_from      DATE NOT NULL,
  period_to        DATE NOT NULL,
  upload_type      TEXT NOT NULL DEFAULT 'officer',   -- 'officer' | 'office'
  entered_by       TEXT,               -- identity_no of the data-entry operator
  entered_at       TIMESTAMPTZ         DEFAULT NOW(),
  updated_at       TIMESTAMPTZ         DEFAULT NOW()
);

-- If the table already exists, run these to patch the schema:
-- ALTER TABLE public.perception_data ADD COLUMN IF NOT EXISTS upload_type TEXT NOT NULL DEFAULT 'officer';
-- ALTER TABLE public.perception_data ADD COLUMN IF NOT EXISTS service_type TEXT;

CREATE INDEX IF NOT EXISTS idx_perception_identity ON public.perception_data(identity_no);
CREATE INDEX IF NOT EXISTS idx_perception_period   ON public.perception_data(period_from, period_to);
CREATE INDEX IF NOT EXISTS idx_perception_entered  ON public.perception_data(entered_by);
CREATE INDEX IF NOT EXISTS idx_perception_type     ON public.perception_data(upload_type);

-- Allow anon key (used by the dashboard) to read/write
GRANT ALL ON public.perception_data                      TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.perception_data_id_seq TO anon;
