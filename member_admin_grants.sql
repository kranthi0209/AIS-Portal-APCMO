-- ============================================================
--  member_admin_grants.sql
--  Lets the Admin Console add / edit / delete member records
--  (Ministers + MLAs are in `mlas`; MPs in `mps` / `mp_rs`; MLCs in `mlcs`).
--  Run ONCE in the Supabase SQL editor.
--
--  NOTE: This grants write access via the public anon key (same model the
--  app already uses for `mlas`). The Admin Console is login-gated, but the
--  grants themselves are at the DB level. Run only if you are comfortable
--  with that (these are public reference profiles, not secrets).
-- ============================================================
alter table mlas  disable row level security;
alter table mps   disable row level security;
alter table mp_rs disable row level security;
alter table mlcs  disable row level security;

grant select, insert, update, delete on mlas  to anon, authenticated;
grant select, insert, update, delete on mps   to anon, authenticated;
grant select, insert, update, delete on mp_rs to anon, authenticated;
grant select, insert, update, delete on mlcs  to anon, authenticated;

notify pgrst, 'reload schema';
