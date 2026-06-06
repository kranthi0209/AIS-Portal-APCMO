-- ================================================================
-- supabase_officer_extras.sql
-- Run in Supabase → SQL Editor before using officer_home.html
-- ================================================================

CREATE TABLE IF NOT EXISTS officer_extras (
  identity_no      text         PRIMARY KEY,
  education        jsonb        NOT NULL DEFAULT '[]',
  certifications   jsonb        NOT NULL DEFAULT '[]',
  skills           jsonb        NOT NULL DEFAULT '[]',
  hobbies          jsonb        NOT NULL DEFAULT '[]',
  updated_at       timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE officer_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_officer_extras"
  ON officer_extras FOR ALL TO anon
  USING (true) WITH CHECK (true);
