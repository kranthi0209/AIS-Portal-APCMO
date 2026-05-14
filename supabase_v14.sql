-- ================================================================
-- AIS Dashboard — Schema v14 Migration
-- Post Type Options table + post_type column on officers
-- Run in Supabase SQL Editor (once)
-- ================================================================

-- 1. Add post_type column to officers table
ALTER TABLE public.officers ADD COLUMN IF NOT EXISTS post_type TEXT;

-- 2. Create maintainable post_type_options lookup table
CREATE TABLE IF NOT EXISTS public.post_type_options (
  id           SERIAL PRIMARY KEY,
  service_type TEXT NOT NULL,   -- 'IAS' | 'IPS' | 'IFS'
  label        TEXT NOT NULL,
  sort_order   INT  NOT NULL DEFAULT 0,
  UNIQUE (service_type, label)
);

CREATE INDEX IF NOT EXISTS idx_pto_svc ON public.post_type_options(service_type);

-- 3. Seed default options
INSERT INTO public.post_type_options (service_type, label, sort_order) VALUES
  ('IAS', 'Secretary',                                     1),
  ('IAS', 'Spl Secretary/Joint Secretary/Deputy Secretary', 2),
  ('IAS', 'Head Of Department',                            3),
  ('IAS', 'District Collector',                            4),
  ('IAS', 'Joint Collector',                               5),
  ('IAS', 'Sub Collector',                                 6),
  ('IAS', 'PO ITDA',                                       7),
  ('IAS', 'Municipal Commissioners',                       8),
  ('IAS', 'Others',                                        9),
  ('IPS', 'Secretary',                                     1),
  ('IPS', 'HoDs',                                          2),
  ('IPS', 'SPs',                                           3),
  ('IPS', 'Addl SPs',                                      4),
  ('IPS', 'Asst SPs',                                      5),
  ('IPS', 'Others',                                        6),
  ('IFS', 'HoDs',                                          1),
  ('IFS', 'Conservator of Forest',                         2),
  ('IFS', 'District Forest Officers',                      3),
  ('IFS', 'Others',                                        4)
ON CONFLICT (service_type, label) DO NOTHING;

-- 4. Grant access
GRANT ALL ON public.post_type_options                         TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.post_type_options_id_seq TO anon;
