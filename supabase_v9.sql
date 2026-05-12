-- ================================================================
-- AIS Dashboard — Schema v9 Migration
-- Media Feedback table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.media_data (
  id               SERIAL PRIMARY KEY,
  officer_id       INTEGER REFERENCES public.officers(id) ON DELETE SET NULL,
  identity_no      TEXT NOT NULL,
  officer_name     TEXT NOT NULL,
  service_type     TEXT,           -- IAS | IPS | IFS
  media_details    TEXT NOT NULL,  -- Name / details of the media outlet (free text)
  feedback_note    TEXT,           -- Brief note on the feedback / coverage
  feedback_score   NUMERIC(5,1) NOT NULL DEFAULT 50,  -- 1–100 (100 = most positive)
  period_from      DATE NOT NULL,
  period_to        DATE NOT NULL,
  entered_by       TEXT,           -- identity_no of the data-entry operator
  entered_at       TIMESTAMPTZ     DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_identity ON public.media_data(identity_no);
CREATE INDEX IF NOT EXISTS idx_media_period   ON public.media_data(period_from, period_to);
CREATE INDEX IF NOT EXISTS idx_media_entered  ON public.media_data(entered_by);
CREATE INDEX IF NOT EXISTS idx_media_outlet   ON public.media_data(media_details);

-- Allow anon key (used by the dashboard) to read/write
GRANT ALL ON public.media_data                      TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.media_data_id_seq TO anon;
