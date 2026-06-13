-- ============================================================
--  gsdp_mapping_v3.sql
--  GSDP mapping moves OFF the gsdp table into its own normalised table.
--   • Drop gsdp.department / gsdp.hod (the previous comma-list columns).
--   • New table gsdp_mapping(sector, sub_sector, department, hod):
--       - one row per (sub-sector × HoD)  → each row has a UNIQUE HoD,
--         the sector / sub-sector / department repeat;
--       - the same HoD across several sub-sectors = several rows;
--       - department-only (Secretariat) mappings are rows with hod = NULL.
--  Filled by Admin Console → GSDP Mapping → Save.
--  Run AFTER gsdp_table.sql + gsdp_seed.sql. Safe to re-run.
-- ============================================================

-- 1) Remove the old mapping columns from gsdp (back to pure data table).
alter table gsdp drop column if exists department;
alter table gsdp drop column if exists hod;

-- 2) The new normalised mapping table.
create table if not exists gsdp_mapping (
  id          bigint generated always as identity primary key,
  sector      text,
  sub_sector  text not null,
  department  text,
  hod         text,
  updated_at  timestamptz default now()
);
create index if not exists gsdp_mapping_sub_idx  on gsdp_mapping (sub_sector);
create index if not exists gsdp_mapping_dept_idx on gsdp_mapping (department);
create index if not exists gsdp_mapping_hod_idx  on gsdp_mapping (hod);

-- 3) Admin Console (anon key) reads & rewrites this table.
alter table gsdp_mapping disable row level security;
grant select, insert, update, delete on gsdp_mapping to anon, authenticated;

notify pgrst, 'reload schema';
