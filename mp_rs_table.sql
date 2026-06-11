-- ============================================================
--  mp_rs  —  Andhra Pradesh Members of Parliament (Rajya Sabha).
--  Source: Andhra_Pradesh_MPs_Rajya_Sabha.xlsx (5 sheets, no photos in data).
--  Run this first, then mp_rs_seed.sql.
-- ============================================================
create table if not exists mp_rs (
  id                bigint generated always as identity primary key,
  mp_code           text unique not null,
  member_name       text,
  gender            text,
  party             text,
  state_ut          text,
  date_of_birth     text,
  place_of_birth    text,
  age               text,
  father_name       text,
  mother_name       text,
  marital_status    text,
  date_of_marriage  text,
  spouse_name       text,
  sons              text,
  daughters         text,
  educational_qualification text,
  profession        text,
  profession1       text,
  profession2       text,
  profession3       text,
  previous_membership text,
  email             text,
  mobile            text,
  mobile2           text,
  local_telephone   text,
  permanent_telephone text,
  local_address     text,
  permanent_address text,
  other_permanent_address text,
  current_term      text,
  total_terms       text,
  status            text,
  notification_date text,
  expiration_date   text,
  freedom_fighter   text,
  books_published   text,
  social_cultural   text,
  countries_visited text,
  sports_clubs      text,
  other_information text,
  brief_bio_data    text,
  positions_held    text,
  term_history      text,
  photo_url         text,
  created_at        timestamptz default now()
);
alter table mp_rs disable row level security;
grant select on mp_rs to anon, authenticated;
notify pgrst, 'reload schema';
