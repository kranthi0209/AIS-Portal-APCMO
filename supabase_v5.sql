-- ================================================================
-- AIS Dashboard — Schema v5 Migration
-- GoI Funds Utilization table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.goifunds_data (
  id               SERIAL PRIMARY KEY,
  officer_id       INTEGER REFERENCES public.officers(id) ON DELETE SET NULL,
  identity_no      TEXT NOT NULL,
  officer_name     TEXT NOT NULL,
  service_type     TEXT,           -- IAS | IPS | IFS
  department_name  TEXT,           -- Name of the department / ministry
  scheme_name      TEXT NOT NULL,  -- Name of the GoI / Central scheme
  period_from      DATE NOT NULL,
  period_to        DATE NOT NULL,
  funds_allotted   NUMERIC(18,2) NOT NULL DEFAULT 0,  -- Union Budget allocation to AP (₹)
  funds_received   NUMERIC(18,2) NOT NULL DEFAULT 0,  -- GoI releases received by AP (₹)
  funds_utilized   NUMERIC(18,2) NOT NULL DEFAULT 0,  -- Expenditure / utilization (₹)
  ucs_submitted    NUMERIC(18,2) NOT NULL DEFAULT 0,  -- Utilization Certificates submitted (₹)
  entered_by       TEXT,           -- identity_no of the data-entry operator
  entered_at       TIMESTAMPTZ     DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     DEFAULT NOW()
);

-- If the table already exists, run these to patch the schema:
-- ALTER TABLE public.goifunds_data ADD COLUMN IF NOT EXISTS department_name TEXT;
-- ALTER TABLE public.goifunds_data ADD COLUMN IF NOT EXISTS scheme_name TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_goifunds_identity ON public.goifunds_data(identity_no);
CREATE INDEX IF NOT EXISTS idx_goifunds_period   ON public.goifunds_data(period_from, period_to);
CREATE INDEX IF NOT EXISTS idx_goifunds_entered  ON public.goifunds_data(entered_by);
CREATE INDEX IF NOT EXISTS idx_goifunds_scheme   ON public.goifunds_data(scheme_name);

-- Allow anon key (used by the dashboard) to read/write
GRANT ALL ON public.goifunds_data                      TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.goifunds_data_id_seq TO anon;
