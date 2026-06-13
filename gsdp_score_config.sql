-- ============================================================
--  gsdp_score_config.sql
--  Adds the GSDP target-LOAD factor knobs to score_config so they can be
--  tuned from Admin Console → Score Weights → GSDP.
--   GSDP Score = Efficiency (FY-day-weighted % achieved)
--                × load factor, where
--   load factor = load_floor + (load_ceiling − load_floor) × VW,
--   VW = log min–max of the officer's aggregated target (0 smallest … 1 largest).
--  Set load_floor = load_ceiling = 1.00 to switch load weighting OFF.
--  Run AFTER score_config.sql. Safe to re-run (keeps any edited values).
-- ============================================================
insert into score_config (score_key, param_key, param_label, param_value, unit, grp, sort_order) values
  ('gsdp','load_floor',  'Target-load floor (smallest target keeps)', 0.70, 'factor', 'Load weighting', 1),
  ('gsdp','load_ceiling','Target-load ceiling (largest target reaches)',1.00, 'factor', 'Load weighting', 2)
on conflict (score_key, param_key) do nothing;

notify pgrst, 'reload schema';
