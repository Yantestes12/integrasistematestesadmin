-- ==============================================================================
-- SCRIPT DEFINITIVO: CRIAR E GARANTIR TODAS AS COLUNAS DE PROJETOS (4 INSTITUTOS)
-- ==============================================================================
-- Esse script adiciona TODAS as colunas necessárias em todas as tabelas de projetos:
-- GASCTPNA_projetos, IBRASE_projetos, AUNI_projetos e IVEM_projetos.
-- Rode no SQL Editor do Supabase para corrigir o erro "Could not find column... in schema cache".

DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
  tbl TEXT;
BEGIN
  FOREACH inst IN ARRAY institutos LOOP
    tbl := inst || '_projetos';

    -- Criar tabela caso não exista
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS public.%I (
        id SERIAL PRIMARY KEY,
        nome TEXT,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    ', tbl);

    -- Garantir todas as colunas individualmente
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS nome TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS termo_fomento TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS numero_proposta TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS numero_processo_adm TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS numero_transferegov TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS aplicabilidade TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS descricao TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS vigencia_inicio DATE;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS vigencia_fim DATE;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS vigencia_termino DATE;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS idade_min INTEGER DEFAULT 7;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS idade_max INTEGER DEFAULT 65;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS limites_cargos TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS vagas_por_nucleo INTEGER DEFAULT 100;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS periodos_json TEXT DEFAULT ''[]'';', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS limites_modalidades TEXT DEFAULT ''[]'';', tbl);

  END LOOP;
END $$;

-- FORÇAR O SUPABASE A RECARREGAR O CACHE DE SCHEMA IMEDIATAMENTE
NOTIFY pgrst, 'reload schema';
