-- ============================================================
--  mps  —  Andhra Pradesh Members of Parliament (Lok Sabha).
--  Run this first, then upload_mp_photos.js, then mps_seed.sql.
-- ============================================================
create table if not exists mps (
  id                bigint generated always as identity primary key,
  member_id         text unique not null,
  full_name         text,
  constituency      text,
  party             text,
  date_of_birth     text,
  place_of_birth    text,
  marital_status    text,
  spouse_name       text,
  sons              text,
  daughters         text,
  father_name       text,
  mother_name       text,
  educational_qualification text,
  highest_qualification     text,
  profession        text,
  other_profession  text,
  category          text,
  lok_sabha_terms   text,
  email1            text,
  email2            text,
  phone             text,
  present_address   text,
  permanent_address text,
  photo_url         text,
  source_photo_url  text,
  -- extra profile fields (from AP_MPs_Complete_Profile_Other_Details.xlsx)
  state_ut          text,
  party_short       text,
  membership_status text,
  date_of_marriage  text,
  facebook          text,
  twitter           text,
  instagram         text,
  profile_url       text,
  special_interests text,
  hobbies           text,
  sports_clubs      text,
  social_cultural   text,
  countries_visited text,
  other_information text,
  books_published   text,
  literary_activities text,
  freedom_fighter   text,
  positions_held    text,
  created_at        timestamptz default now()
);
alter table mps disable row level security;
grant select on mps to anon, authenticated;
notify pgrst, 'reload schema';
