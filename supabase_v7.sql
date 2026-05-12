-- ================================================================
-- AIS Dashboard — Schema v7 Migration
-- Integrity Index table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.integrity_data (
  id                 SERIAL PRIMARY KEY,
  officer_id         INTEGER REFERENCES public.officers(id) ON DELETE SET NULL,
  identity_no        TEXT NOT NULL,
  officer_name       TEXT NOT NULL,
  service_type       TEXT,               -- IAS | IPS | IFS
  corrupt_activities TEXT NOT NULL DEFAULT 'No',  -- 'Yes' | 'No'
  activity_details   TEXT,               -- Mandatory when corrupt_activities = 'Yes'
  integrity_index    NUMERIC(6,2) NOT NULL DEFAULT 0,  -- 0–100
  period_from        DATE NOT NULL,
  period_to          DATE NOT NULL,
  entered_by         TEXT,               -- identity_no of the data-entry operator
  entered_at         TIMESTAMPTZ         DEFAULT NOW(),
  updated_at         TIMESTAMPTZ         DEFAULT NOW()
);

-- If the table already exists, run these to patch the schema:
-- ALTER TABLE public.integrity_data ADD COLUMN IF NOT EXISTS corrupt_activities TEXT NOT NULL DEFAULT 'No';
-- ALTER TABLE public.integrity_data ADD COLUMN IF NOT EXISTS activity_details TEXT;

CREATE INDEX IF NOT EXISTS idx_integrity_identity ON public.integrity_data(identity_no);
CREATE INDEX IF NOT EXISTS idx_integrity_period   ON public.integrity_data(period_from, period_to);
CREATE INDEX IF NOT EXISTS idx_integrity_entered  ON public.integrity_data(entered_by);
CREATE INDEX IF NOT EXISTS idx_integrity_corrupt  ON public.integrity_data(corrupt_activities);

-- Allow anon key (used by the dashboard) to read/write
GRANT ALL ON public.integrity_data                      TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.integrity_data_id_seq TO anon;
