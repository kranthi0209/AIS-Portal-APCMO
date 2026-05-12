-- ================================================================
-- AIS Dashboard — Schema v13 Migration
-- Module Control table (deadlines, pause/stop, admin notes)
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.module_control (
  id           SERIAL PRIMARY KEY,
  module_name  TEXT UNIQUE NOT NULL,  -- slug used by the app
  label        TEXT NOT NULL,         -- human-readable display name
  deadline     TIMESTAMPTZ,           -- NULL = no deadline set
  is_paused    BOOLEAN NOT NULL DEFAULT FALSE,
  notes        TEXT,                  -- optional admin notes
  updated_by   TEXT,                  -- identity_no of last admin who changed this
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate all 9 modules
INSERT INTO public.module_control (module_name, label) VALUES
  ('self_appraisal', 'Self Appraisal (Officers)'),
  ('eoffice',        'E-Office Performance'),
  ('goifunds',       'GoI Funds Utilisation'),
  ('perception',     'Perception Score'),
  ('integrity',      'Integrity Index'),
  ('party',          'Party Feedback'),
  ('media',          'Media Feedback'),
  ('swarna',         'Swarna AP KPI'),
  ('gsdp',           'GSDP Contribution')
ON CONFLICT (module_name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_mc_module ON public.module_control(module_name);

-- Allow anon key to read; restrict writes to admin via RLS or just grant all for now
GRANT ALL ON public.module_control                         TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.module_control_id_seq TO anon;
