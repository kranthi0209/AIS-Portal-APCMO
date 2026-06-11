-- mlas_fix_education.sql
-- Removes the trailing boilerplate "Details of PAN and status of Income Tax return"
-- (with its leading "; " separator) from education_details for ALL MLAs.
-- Safe to run multiple times.
update mlas
set education_details = nullif(btrim(regexp_replace(education_details, '\s*;?\s*Details of PAN.*$', '', 'i')), '')
where education_details ~* 'Details of PAN';

notify pgrst, 'reload schema';
