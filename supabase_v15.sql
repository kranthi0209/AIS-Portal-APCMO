-- ================================================================
-- AIS Dashboard — Schema v15 Migration
-- Live e-Office data table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.eoffice_live_data (
  id               SERIAL PRIMARY KEY,
  identity_no      TEXT        NOT NULL,
  service_type     TEXT        NOT NULL,            -- 'IAS' | 'IPS' | 'IFS'
  data_date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  opening_balance  INT         NOT NULL DEFAULT 0,
  files_received   INT         NOT NULL DEFAULT 0,
  files_processed  INT         NOT NULL DEFAULT 0,
  files_pending    INT         NOT NULL DEFAULT 0,  -- opening_balance + files_received - files_processed
  avg_time_mins    NUMERIC(10,2),
  median_time_mins NUMERIC(10,2),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (identity_no, data_date)
);

CREATE INDEX IF NOT EXISTS idx_eo_live_svc  ON public.eoffice_live_data(service_type);
CREATE INDEX IF NOT EXISTS idx_eo_live_date ON public.eoffice_live_data(data_date);
CREATE INDEX IF NOT EXISTS idx_eo_live_id   ON public.eoffice_live_data(identity_no);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_eoffice_live_updated ON public.eoffice_live_data;
CREATE TRIGGER trg_eoffice_live_updated
  BEFORE UPDATE ON public.eoffice_live_data
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT ALL ON public.eoffice_live_data                           TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.eoffice_live_data_id_seq TO anon;
