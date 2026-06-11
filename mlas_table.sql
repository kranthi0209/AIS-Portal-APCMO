-- ============================================================
--  mlas  —  175 MLAs of Andhra Pradesh (from AP_MLA_Details.csv)
--  Run this in the Supabase SQL editor.
-- ============================================================
create table if not exists mlas (
  id                    bigint generated always as identity primary key,
  candidate_id          text unique not null,
  constituency_no       int,
  name                  text not null,
  district              text,
  constituency          text,
  constituency_alt      text,
  party                 text,
  position              text,
  father_name           text,
  spouse_name           text,
  qualifications        text,
  profession            text,
  positions_held        text,
  special_interests     text,
  phone_no              text,
  permanent_address     text,
  communication_address text,
  photo_url             text,
  source_photo_url      text,
  created_at            timestamptz default now()
);
alter table mlas disable row level security;
grant select, insert, update, delete on mlas to anon, authenticated;
notify pgrst, 'reload schema';
