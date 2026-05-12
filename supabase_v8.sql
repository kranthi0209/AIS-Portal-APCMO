-- ================================================================
-- AIS Dashboard — Schema v8 Migration
-- Party Feedback table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.party_data (
  id               SERIAL PRIMARY KEY,
  officer_id       INTEGER REFERENCES public.officers(id) ON DELETE SET NULL,
  identity_no      TEXT NOT NULL,
  officer_name     TEXT NOT NULL,
  service_type     TEXT,           -- IAS | IPS | IFS
  feedback_from    TEXT NOT NULL,  -- MLA | MP | Party Constituency Incharge |
                                   -- District Incharge Minister | Minister Belongs to the District |
                                   -- Minister at State Level | Party Local Leaders | Not Declared
  feedback_note    TEXT,           -- Brief note describing the feedback
  feedback_score   NUMERIC(5,1) NOT NULL DEFAULT 50,  -- 1–100 (100 = most positive)
  period_from      DATE NOT NULL,
  period_to        DATE NOT NULL,
  entered_by       TEXT,           -- identity_no of the data-entry operator
  entered_at       TIMESTAMPTZ     DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_party_identity ON public.party_data(identity_no);
CREATE INDEX IF NOT EXISTS idx_party_period   ON public.party_data(period_from, period_to);
CREATE INDEX IF NOT EXISTS idx_party_entered  ON public.party_data(entered_by);
CREATE INDEX IF NOT EXISTS idx_party_from     ON public.party_data(feedback_from);

-- Allow anon key (used by the dashboard) to read/write
GRANT ALL ON public.party_data                      TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.party_data_id_seq TO anon;
