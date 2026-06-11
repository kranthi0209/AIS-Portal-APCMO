-- ============================================================
--  mlcs  —  Andhra Pradesh Members of Legislative Council (MLC).
--  Run this first, then upload_mlc_photos.js, then mlcs_seed.sql.
-- ============================================================
create table if not exists mlcs (
  id                bigint generated always as identity primary key,
  mlc_id            text unique not null,
  name              text,
  category          text,
  constituency      text,
  party             text,
  father_name       text,
  mother_name       text,
  date_of_birth     text,
  marital_status    text,
  spouse_name       text,
  qualifications    text,
  profession        text,
  special_interests text,
  positions_held    text,
  present_term      text,
  retirement_date   text,
  countries_visited text,
  publications      text,
  hobbies           text,
  permanent_address text,
  phone_no          text,
  email             text,
  photo_url         text,
  source_photo_url  text,
  created_at        timestamptz default now()
);
alter table mlcs disable row level security;
grant select on mlcs to anon, authenticated;
notify pgrst, 'reload schema';
