-- ================================================================
-- AIS Dashboard — Schema v4 Migration
-- e-Office Data Entry table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.eoffice_data (
  id               SERIAL PRIMARY KEY,
  officer_id       INTEGER REFERENCES public.officers(id) ON DELETE SET NULL,
  identity_no      TEXT NOT NULL,
  officer_name     TEXT NOT NULL,
  service_type     TEXT,           -- IAS | IPS | IFS
  post_name        TEXT,
  period_from      DATE NOT NULL,
  period_to        DATE NOT NULL,
  opening_balance  INTEGER NOT NULL DEFAULT 0,
  files_received   INTEGER NOT NULL DEFAULT 0,
  files_processed  INTEGER NOT NULL DEFAULT 0,
  avg_process_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  upload_type      TEXT NOT NULL DEFAULT 'officer', -- 'officer' | 'office'
  entered_by       TEXT,           -- identity_no of the data-entry operator
  entered_at       TIMESTAMPTZ     DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     DEFAULT NOW()
);

-- If the table already exists, run these to patch the schema:
-- ALTER TABLE public.eoffice_data ADD COLUMN IF NOT EXISTS service_type TEXT;
-- ALTER TABLE public.eoffice_data ADD COLUMN IF NOT EXISTS avg_process_hours NUMERIC(8,2) NOT NULL DEFAULT 0;
-- ALTER TABLE public.eoffice_data DROP COLUMN IF EXISTS avg_process_days;
-- ALTER TABLE public.eoffice_data ADD COLUMN IF NOT EXISTS upload_type TEXT NOT NULL DEFAULT 'officer';

CREATE INDEX IF NOT EXISTS idx_eoffice_identity ON public.eoffice_data(identity_no);
CREATE INDEX IF NOT EXISTS idx_eoffice_period   ON public.eoffice_data(period_from, period_to);
CREATE INDEX IF NOT EXISTS idx_eoffice_entered  ON public.eoffice_data(entered_by);

-- Allow anon key (used by the dashboard) to read/write
GRANT ALL ON public.eoffice_data                    TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.eoffice_data_id_seq TO anon;
