-- ================================================================
-- supabase_v16_post_details.sql
-- Creates the eoffice_post_details table to track Step 2 progress.
-- Run this in Supabase → SQL Editor before using the new modal.
-- ================================================================

CREATE TABLE IF NOT EXISTS eoffice_post_details (
  id           bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  identity_no  text         NOT NULL,
  service_type text         NOT NULL,
  period_from  date         NOT NULL,
  period_to    date         NOT NULL,
  num_posts    integer      NOT NULL DEFAULT 1,
  post_details jsonb        NOT NULL DEFAULT '[]',
  entered_by   text         NOT NULL,
  entered_at   timestamptz  NOT NULL DEFAULT now(),

  -- one row per officer-period-operator; upsert replaces it
  UNIQUE (identity_no, service_type, period_from, period_to, entered_by)
);

ALTER TABLE eoffice_post_details ENABLE ROW LEVEL SECURITY;

-- Allow the anon key (used by the dashboard) full access
CREATE POLICY "anon_all_eoffice_post_details"
  ON eoffice_post_details
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);
