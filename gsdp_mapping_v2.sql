-- ============================================================
--  gsdp_mapping_v2.sql
--  New GSDP mapping model:
--   • The Department / HoD mapping now lives ON the gsdp table itself
--     (columns gsdp.department, gsdp.hod — comma-separated when a
--      sub-sector maps to more than one Department / HoD).
--   • officer_post_dates.gsdp_subsector is no longer used → dropped.
--   • The old gsdp_subsector_map config table is dropped.
--  Run AFTER gsdp_table.sql + gsdp_seed.sql. Safe to re-run.
-- ============================================================

-- 1) Mapping columns on the gsdp table (a sub-sector may list several
--    Departments / HoDs, comma-separated; same value across its districts).
alter table gsdp add column if not exists department text;
alter table gsdp add column if not exists hod        text;

-- 2) Retire the old per-post tag column and the separate config table.
alter table officer_post_dates drop column if exists gsdp_subsector;
drop table if exists gsdp_subsector_map;

-- 3) Admin Console (anon key) needs to write the mapping back to gsdp.
alter table gsdp disable row level security;
grant select, insert, update, delete on gsdp to anon, authenticated;

notify pgrst, 'reload schema';
