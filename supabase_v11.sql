-- ================================================================
-- AIS Dashboard — Schema v11 Migration
-- GSDP Contribution table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.gsdp_data (
  id                SERIAL PRIMARY KEY,
  officer_id        INTEGER REFERENCES public.officers(id) ON DELETE SET NULL,
  identity_no       TEXT NOT NULL,
  officer_name      TEXT NOT NULL,
  service_type      TEXT,           -- IAS | IPS | IFS
  contribution_type TEXT NOT NULL,  -- 'Department' | 'District'
  entity_name       TEXT NOT NULL,  -- Name of the Department or District
  gsdp_score        NUMERIC(6,2)  NOT NULL DEFAULT 0,  -- 0–100
  period_from       DATE NOT NULL,
  period_to         DATE NOT NULL,
  entered_by        TEXT,           -- identity_no of the data-entry operator
  entered_at        TIMESTAMPTZ     DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gsdp_identity ON public.gsdp_data(identity_no);
CREATE INDEX IF NOT EXISTS idx_gsdp_period   ON public.gsdp_data(period_from, period_to);
CREATE INDEX IF NOT EXISTS idx_gsdp_entered  ON public.gsdp_data(entered_by);
CREATE INDEX IF NOT EXISTS idx_gsdp_type     ON public.gsdp_data(contribution_type);
CREATE INDEX IF NOT EXISTS idx_gsdp_entity   ON public.gsdp_data(entity_name);

-- Allow anon key (used by the dashboard) to read/write
GRANT ALL ON public.gsdp_data                      TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.gsdp_data_id_seq TO anon;
