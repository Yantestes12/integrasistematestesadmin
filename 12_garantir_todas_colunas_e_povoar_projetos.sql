-- ==============================================================================
-- SCRIPT MASTER DEFINITIVO: ESTRUTURA + DADOS REAIS DE PROJETOS (4 INSTITUTOS)
-- ==============================================================================
-- Este script:
-- 1. Cria todas as colunas necessárias em GASCTPNA_projetos, IBRASE_projetos, AUNI_projetos e IVEM_projetos
-- 2. Popula os dados reais (Termo de Fomento, Nº Proposta, Nº Processo ADM, Nº Transferegov, Descrição, etc.)
-- 3. Notifica o Supabase para recarregar o Schema Cache do PostgREST.

DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
  tbl TEXT;
BEGIN
  -- 1. ESTRUTURA DAS TABELAS
  FOREACH inst IN ARRAY institutos LOOP
    tbl := inst || '_projetos';

    EXECUTE format('
      CREATE TABLE IF NOT EXISTS public.%I (
        id SERIAL PRIMARY KEY,
        nome TEXT,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    ', tbl);

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

-- 2. PREENCHIMENTO DOS DADOS REAIS DOS PROJETOS EM TODOS OS INSTITUTOS

-- PROMOV
DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
BEGIN
  FOREACH inst IN ARRAY institutos LOOP
    EXECUTE format('
      UPDATE public.%I SET
        termo_fomento = ''Termo de Fomento nº 552/2024'',
        numero_proposta = ''029522/2024'',
        numero_processo_adm = ''71000.065846/2024-19'',
        numero_transferegov = ''971598/2024'',
        descricao = ''O Projeto Futuro em Movimento visa através de atividades físicas fortalecer competências esportivas de crianças e jovens de ambos os sexos, dos 7 anos aos 15 anos, nas atividades de Luta e Futebol.'',
        idade_min = 7,
        idade_max = 15,
        vigencia_inicio = ''2025-09-15'',
        periodos_json = ''[{"id":26,"fim":"2025-11-28","tipo":"planejamento","inicio":"2025-09-15","rotulo":"Iniciação"},{"id":27,"fim":"2026-02-28","tipo":"avaliacao","inicio":"2025-11-28","rotulo":"1º Trimestre"},{"id":28,"fim":"2026-05-29","tipo":"avaliacao","inicio":"2026-02-28","rotulo":"2º Trimestre"},{"id":29,"fim":"2026-08-28","tipo":"avaliacao","inicio":"2026-05-29","rotulo":"3º Trimestre"},{"id":30,"fim":"2026-11-27","tipo":"avaliacao","inicio":"2026-08-28","rotulo":"4º Trimestre"}]''
      WHERE UPPER(nome) = ''PROMOV'';
    ', inst || '_projetos');
  END LOOP;
END $$;

-- CRESP
DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
BEGIN
  FOREACH inst IN ARRAY institutos LOOP
    EXECUTE format('
      UPDATE public.%I SET
        termo_fomento = ''Termo de Fomento nº 875/2024'',
        numero_proposta = ''038073/2024'',
        numero_processo_adm = ''71000.091319/2024-60'',
        numero_transferegov = ''973805/2024'',
        descricao = ''O Projeto Crescendo com o Esporte visa através de atividades físicas fortalecer competências esportivas de crianças, jovens e adultos, de ambos os sexos, dos 7 anos aos 60 anos, nas atividades de Luta, Futebol e Funcional.'',
        idade_min = 7,
        idade_max = 60,
        vigencia_inicio = ''2025-09-15'',
        periodos_json = ''[{"id":21,"fim":"2025-11-28","tipo":"planejamento","inicio":"2025-09-15","rotulo":"Iniciação"},{"id":22,"fim":"2026-02-28","tipo":"avaliacao","inicio":"2025-11-28","rotulo":"1º Trimestre"},{"id":23,"fim":"2026-05-29","tipo":"avaliacao","inicio":"2026-02-28","rotulo":"2º Trimestre"},{"id":24,"fim":"2026-08-28","tipo":"avaliacao","inicio":"2026-05-29","rotulo":"3º Trimestre"},{"id":25,"fim":"2026-11-27","tipo":"avaliacao","inicio":"2026-08-28","rotulo":"4º Trimestre"}]''
      WHERE UPPER(nome) = ''CRESP'';
    ', inst || '_projetos');
  END LOOP;
END $$;

-- AGON
DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
BEGIN
  FOREACH inst IN ARRAY institutos LOOP
    EXECUTE format('
      UPDATE public.%I SET
        termo_fomento = ''383/2025'',
        numero_proposta = ''027869/2025'',
        numero_processo_adm = ''71000.066009/2025-98'',
        numero_transferegov = ''976980/2025'',
        idade_min = 7,
        idade_max = 65
      WHERE UPPER(nome) = ''AGON'';
    ', inst || '_projetos');
  END LOOP;
END $$;

-- TONUS
DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
BEGIN
  FOREACH inst IN ARRAY institutos LOOP
    EXECUTE format('
      UPDATE public.%I SET
        termo_fomento = ''384/2025'',
        numero_proposta = ''027882/2025'',
        numero_processo_adm = ''71000.057737/2025-17'',
        numero_transferegov = ''976981/2025'',
        idade_min = 7,
        idade_max = 19
      WHERE UPPER(nome) = ''TONUS'';
    ', inst || '_projetos');
  END LOOP;
END $$;

-- EROS
DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
BEGIN
  FOREACH inst IN ARRAY institutos LOOP
    EXECUTE format('
      UPDATE public.%I SET
        termo_fomento = ''427/2025'',
        numero_proposta = ''054734/2025'',
        numero_processo_adm = ''71000.089521/2025-11'',
        numero_transferegov = ''981248/2025'',
        idade_min = 7,
        idade_max = 20
      WHERE UPPER(nome) = ''EROS'';
    ', inst || '_projetos');
  END LOOP;
END $$;

-- STRATOS
DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
BEGIN
  FOREACH inst IN ARRAY institutos LOOP
    EXECUTE format('
      UPDATE public.%I SET
        termo_fomento = ''373/2025'',
        numero_proposta = ''027883/2025'',
        numero_processo_adm = ''71000.060508/2025-71'',
        numero_transferegov = ''976581/2025'',
        idade_min = 7,
        idade_max = 18
      WHERE UPPER(nome) = ''STRATOS'';
    ', inst || '_projetos');
  END LOOP;
END $$;

-- IMPETO
DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
BEGIN
  FOREACH inst IN ARRAY institutos LOOP
    EXECUTE format('
      UPDATE public.%I SET
        termo_fomento = ''556575757'',
        numero_proposta = ''059550/2025'',
        idade_min = 7,
        idade_max = 65,
        vigencia_inicio = ''2026-06-18''
      WHERE UPPER(nome) = ''IMPETO'';
    ', inst || '_projetos');
  END LOOP;
END $$;

-- 3. RECARREGAR SCHEMA CACHE DO SUPABASE
NOTIFY pgrst, 'reload schema';
