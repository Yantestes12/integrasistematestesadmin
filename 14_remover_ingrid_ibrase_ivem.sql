-- ==============================================================================
-- REMOVER INGRID DE IBRASE E IVEM, E MANTER APENAS EM GASCTPNA E AUNI (COM RLS)
-- ==============================================================================

-- 1. ATIVAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public."GASCTPNA_admin_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."IBRASE_admin_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AUNI_admin_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."IVEM_admin_users" ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS DE ACESSO PERMISSIVAS
DROP POLICY IF EXISTS "Allow_all_GASCTPNA" ON public."GASCTPNA_admin_users";
CREATE POLICY "Allow_all_GASCTPNA" ON public."GASCTPNA_admin_users" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow_all_IBRASE" ON public."IBRASE_admin_users";
CREATE POLICY "Allow_all_IBRASE" ON public."IBRASE_admin_users" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow_all_AUNI" ON public."AUNI_admin_users";
CREATE POLICY "Allow_all_AUNI" ON public."AUNI_admin_users" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow_all_IVEM" ON public."IVEM_admin_users";
CREATE POLICY "Allow_all_IVEM" ON public."IVEM_admin_users" FOR ALL USING (true) WITH CHECK (true);

-- 3. APAGAR INGRID DAS TABELAS DO IBRASE E IVEM (Usa username e email que são colunas padrão em todas as tabelas)
DELETE FROM public."IBRASE_admin_users" 
WHERE id > 0 AND (
   username ILIKE '%ingrid%' 
   OR email ILIKE '%ingrid%'
);

DELETE FROM public."IVEM_admin_users" 
WHERE id > 0 AND (
   username ILIKE '%ingrid%' 
   OR email ILIKE '%ingrid%'
);

-- 4. GARANTIR QUE INGRID EXISTA EM GASCTPNA E AUNI
INSERT INTO public."GASCTPNA_admin_users" (username, email, senha, cargo, instituto_ativo)
SELECT 
  COALESCE(username, 'ingridvelasco'),
  COALESCE(email, 'ingrid@gasctpna.com.br'),
  COALESCE(senha, '123456'),
  COALESCE(cargo, 'Administrador'),
  'GASCTPNA'
FROM public."AUNI_admin_users"
WHERE id > 0 AND (username ILIKE '%ingrid%' OR email ILIKE '%ingrid%')
ON CONFLICT DO NOTHING;

INSERT INTO public."AUNI_admin_users" (username, email, senha, cargo, instituto_ativo)
SELECT 
  COALESCE(username, 'ingridvelasco'),
  COALESCE(email, 'ingrid@auni.com.br'),
  COALESCE(senha, '123456'),
  COALESCE(cargo, 'Administrador'),
  'AUNI'
FROM public."GASCTPNA_admin_users"
WHERE id > 0 AND (username ILIKE '%ingrid%' OR email ILIKE '%ingrid%')
ON CONFLICT DO NOTHING;

-- 5. ATUALIZAR PERMISSÕES DE INSTITUTOS CASO A COLUNA EXISTA
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'GASCTPNA_admin_users' AND column_name = 'institutos_permitidos'
  ) THEN
    UPDATE public."GASCTPNA_admin_users" 
    SET institutos_permitidos = '["GASCTPNA", "AUNI"]'
    WHERE id > 0 AND (username ILIKE '%ingrid%' OR email ILIKE '%ingrid%');
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'AUNI_admin_users' AND column_name = 'institutos_permitidos'
  ) THEN
    UPDATE public."AUNI_admin_users" 
    SET institutos_permitidos = '["GASCTPNA", "AUNI"]'
    WHERE id > 0 AND (username ILIKE '%ingrid%' OR email ILIKE '%ingrid%');
  END IF;
END $$;

-- Recarregar cache de esquema do Supabase
NOTIFY pgrst, 'reload schema';
