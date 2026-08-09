-- ==============================================================================
-- GARANTIR COLUNAS DE GRADE HORÁRIA E TURNOS NAS TABELAS DE NÚCLEOS (4 INSTITUTOS)
-- ==============================================================================
-- Adiciona as colunas grade_horaria e turnos_calculados em:
-- GASCTPNA_nucleos, IBRASE_nucleos, AUNI_nucleos, IVEM_nucleos

DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
  tbl TEXT;
BEGIN
  FOREACH inst IN ARRAY institutos LOOP
    tbl := inst || '_nucleos';

    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS grade_horaria TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS turnos_calculados TEXT;', tbl);
  END LOOP;
END $$;

-- Recarregar cache de esquema do Supabase / PostgREST
NOTIFY pgrst, 'reload schema';
