-- ============================================================
--  score_config  —  admin-tunable weights & key values for all scores
--  Run this once in the Supabase SQL editor.
-- ============================================================
create table if not exists score_config (
  id          bigint generated always as identity primary key,
  score_key   text    not null,             -- 'eoffice' | 'goi' | 'composite'
  param_key   text    not null,             -- e.g. 'w_speed', 'speed_ref'
  param_label text    not null,             -- human label shown in the admin UI
  param_value numeric not null,             -- the tunable value
  unit        text    default '',           -- '', 'weight', 'min', 'files', 'files/day'
  grp         text    default '',           -- sub-group heading in the UI
  sort_order  int     default 0,
  updated_at  timestamptz default now(),
  unique (score_key, param_key)
);

-- Seed the defaults (only inserts missing rows; existing edited values are kept)
insert into score_config (score_key, param_key, param_label, param_value, unit, grp, sort_order) values
  -- e-Office (4 indicator weights — should sum to 1.00)
  ('eoffice','w_clearance',  'Clearance Rate weight',          0.25, 'weight',    'Indicator weights', 1),
  ('eoffice','w_pendency',   'Low Pendency weight',            0.10, 'weight',    'Indicator weights', 2),
  ('eoffice','w_speed',      'Disposal Speed weight',          0.45, 'weight',    'Indicator weights', 3),
  ('eoffice','w_consistency','Consistency weight',             0.20, 'weight',    'Indicator weights', 4),
  -- e-Office key values
  ('eoffice','diff_floor',   'Workload floor (lightest keeps)',0.50, 'factor',    'Key values',        5),
  ('eoffice','speed_ref',    'Speed benchmark (50/100 point)', 1200, 'min',       'Key values',        6),
  ('eoffice','speed_k',      'Speed shrinkage pseudo-count',   30,   'files',     'Key values',        7),
  ('eoffice','wl_files',     'Full-workload files (Opening+Recd)',5000,'files',   'Key values',        8),
  ('eoffice','wl_pace',      'Full-intensity pace',            60,   'files/day', 'Key values',        9),

  -- GoI Funds (4 indicator weights — should sum to 1.00)
  ('goi','w_aue','Allocation Utilisation (AUE) weight', 0.40, 'weight', 'Indicator weights', 1),
  ('goi','w_fue','Funds Utilisation (FUE) weight',      0.30, 'weight', 'Indicator weights', 2),
  ('goi','w_fte','Fund Transfer (FTE) weight',          0.20, 'weight', 'Indicator weights', 3),
  ('goi','w_ufs','Untapped-Funds (UFS) weight',         0.10, 'weight', 'Indicator weights', 4),
  ('goi','diff_floor','Volume floor (smallest fund keeps)',0.70,'factor','Key values',       5),

  -- Composite (relative weight of each component in the average; equal = simple mean)
  ('composite','w_eoffice',   'e-Office weight',         1, 'weight', 'Component weights', 1),
  ('composite','w_swarna',    'Swarnandhra weight',      1, 'weight', 'Component weights', 2),
  ('composite','w_goi',       'GoI Funds weight',        1, 'weight', 'Component weights', 3),
  ('composite','w_perception','Public Perception weight',1, 'weight', 'Component weights', 4)
on conflict (score_key, param_key) do nothing;

-- ============================================================
--  ACCESS  —  REQUIRED so the dashboard/admin (anon key) can read & save.
--  If the admin shows "No rows yet" even after seeding, it's Row-Level
--  Security hiding the rows. Run this block to fix it.
-- ============================================================
alter table score_config disable row level security;
grant select, insert, update, delete on score_config to anon, authenticated;

-- (Alternative, if you prefer to KEEP RLS enabled, comment the two lines
--  above and use a permissive policy instead:)
-- alter table score_config enable row level security;
-- drop policy if exists "score_config_rw" on score_config;
-- create policy "score_config_rw" on score_config for all
--   to anon, authenticated using (true) with check (true);

-- Make PostgREST pick up the new table/grants immediately:
notify pgrst, 'reload schema';
