-- ================================================================
-- AIS Dashboard — Schema v10 Migration
-- Swarna AP KPI table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.swarna_data (
  id               SERIAL PRIMARY KEY,
  officer_id       INTEGER REFERENCES public.officers(id) ON DELETE SET NULL,
  identity_no      TEXT NOT NULL,
  officer_name     TEXT NOT NULL,
  service_type     TEXT,           -- IAS | IPS | IFS
  department_post  TEXT,           -- Department or post held during the period
  swarna_score     NUMERIC(6,2)  NOT NULL DEFAULT 0,  -- 0–100 (Swarna AP KPI score)
  achievements     TEXT,           -- Key achievements in support of the score
  period_from      DATE NOT NULL,
  period_to        DATE NOT NULL,
  entered_by       TEXT,           -- identity_no of the data-entry operator
  entered_at       TIMESTAMPTZ     DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swarna_identity ON public.swarna_data(identity_no);
CREATE INDEX IF NOT EXISTS idx_swarna_period   ON public.swarna_data(period_from, period_to);
CREATE INDEX IF NOT EXISTS idx_swarna_entered  ON public.swarna_data(entered_by);
CREATE INDEX IF NOT EXISTS idx_swarna_score    ON public.swarna_data(swarna_score);

-- Allow anon key (used by the dashboard) to read/write
GRANT ALL ON public.swarna_data                      TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.swarna_data_id_seq TO anon;
