-- ============================================================
--  gsdp  —  Andhra Pradesh district x sub-sector GDDP (Gross District Domestic Product)
--  Source: GSDP Data.xlsx (sheet "Merged GDDP"). 28 districts x 17 sub-sectors.
--  Values in Rs. crore: 2024-25 baseline, 2025-26 target, 2025-26 achievement.
--  Run this first, then gsdp_seed.sql.
-- ============================================================
create table if not exists gsdp (
  id                   bigint generated always as identity primary key,
  sector               text not null,
  sub_sector           text not null,
  district             text not null,
  value_2024_25        numeric,
  target_2025_26       numeric,
  achievement_2025_26  numeric,
  created_at           timestamptz default now(),
  unique (district, sub_sector)
);
alter table gsdp disable row level security;
grant select on gsdp to anon, authenticated;
notify pgrst, 'reload schema';
