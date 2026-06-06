-- ================================================================
-- AIS Dashboard — Schema v18 Migration
-- Department → HoD mapping table
-- Run in Supabase SQL Editor (once)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.department_hod (
  id            SERIAL PRIMARY KEY,
  department    TEXT NOT NULL,           -- department name (multiple HoDs allowed)
  hod           TEXT NOT NULL,          -- Head of Department (identity_no or name)
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dept_hod_dept ON public.department_hod(department);
CREATE INDEX IF NOT EXISTS idx_dept_hod_hod  ON public.department_hod(hod);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS trg_dept_hod_updated ON public.department_hod;
CREATE TRIGGER trg_dept_hod_updated
  BEFORE UPDATE ON public.department_hod
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.department_hod ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON public.department_hod;
CREATE POLICY "anon_all" ON public.department_hod
  FOR ALL TO anon USING (true) WITH CHECK (true);

GRANT ALL ON public.department_hod                           TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.department_hod_id_seq TO anon;

NOTIFY pgrst, 'reload schema';

-- ================================================================
-- ALTER — run this if the table was already created with the
-- UNIQUE constraint on department and you need to remove it
-- ================================================================
ALTER TABLE public.department_hod
  DROP CONSTRAINT IF EXISTS department_hod_department_key;
