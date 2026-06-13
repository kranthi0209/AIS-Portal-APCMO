-- ============================================================
--  gsdp_mapping.sql
--  • Adds the gsdp_subsector tag column to officer_post_dates.
--  • Creates gsdp_subsector_map (the Admin Console "GSDP Mapping" config:
--    each GSDP sub-sector -> one/more Departments and/or HoDs).
--  Run AFTER gsdp_table.sql + gsdp_seed.sql.
-- ============================================================
alter table officer_post_dates add column if not exists gsdp_subsector text;

create table if not exists gsdp_subsector_map (
  id          bigint generated always as identity primary key,
  sub_sector  text not null,
  kind        text not null check (kind in ('department','hod')),
  value       text not null,
  updated_at  timestamptz default now(),
  unique (sub_sector, kind, value)
);

alter table gsdp_subsector_map disable row level security;
alter table officer_post_dates  disable row level security;
grant select, insert, update, delete on gsdp_subsector_map to anon, authenticated;
grant select, insert, update, delete on officer_post_dates  to anon, authenticated;

notify pgrst, 'reload schema';
