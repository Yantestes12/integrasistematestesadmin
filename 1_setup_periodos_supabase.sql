-- 1) CRIAR AS COLUNAS DE PERÍODOS E VIGÊNCIA NAS TABELAS DE PROJETOS DE CADA INSTITUTO
ALTER TABLE public."GASCTPNA_projetos" ADD COLUMN IF NOT EXISTS periodos_json JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."GASCTPNA_projetos" ADD COLUMN IF NOT EXISTS vigencia_inicio TEXT;
ALTER TABLE public."GASCTPNA_projetos" ADD COLUMN IF NOT EXISTS vigencia_fim TEXT;
ALTER TABLE public."GASCTPNA_projetos" ADD COLUMN IF NOT EXISTS vigencia_termino TEXT;

ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS periodos_json JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS vigencia_inicio TEXT;
ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS vigencia_fim TEXT;
ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS vigencia_termino TEXT;

ALTER TABLE public."AUNI_projetos" ADD COLUMN IF NOT EXISTS periodos_json JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."AUNI_projetos" ADD COLUMN IF NOT EXISTS vigencia_inicio TEXT;
ALTER TABLE public."AUNI_projetos" ADD COLUMN IF NOT EXISTS vigencia_fim TEXT;
ALTER TABLE public."AUNI_projetos" ADD COLUMN IF NOT EXISTS vigencia_termino TEXT;

ALTER TABLE public."IVEM_projetos" ADD COLUMN IF NOT EXISTS periodos_json JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public."IVEM_projetos" ADD COLUMN IF NOT EXISTS vigencia_inicio TEXT;
ALTER TABLE public."IVEM_projetos" ADD COLUMN IF NOT EXISTS vigencia_fim TEXT;
ALTER TABLE public."IVEM_projetos" ADD COLUMN IF NOT EXISTS vigencia_termino TEXT;

-- 2) MIGRAÇÃO DE DADOS ANTIGOS (Se a tabela projeto_periodos existir no Supabase)
-- Este bloco irá agrupar os períodos antigos em JSON e atualizar o projeto correspondente na tabela do IBRASE (que é onde o CRESP estava).
-- Se a tabela projeto_periodos não existir no seu Supabase atual, você pode ignorar ou apagar este bloco abaixo.
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Verifica se a tabela antiga existe no banco atual
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projeto_periodos') THEN
        FOR r IN (
            SELECT projeto_id,
                   jsonb_agg(
                       jsonb_build_object(
                           'id', id,
                           'tipo', tipo,
                           'rotulo', rotulo,
                           'inicio', inicio,
                           'fim', fim
                       ) ORDER BY ordem ASC
                   ) AS p_json
            FROM public.projeto_periodos
            GROUP BY projeto_id
        ) LOOP
            -- Atualiza na tabela do IBRASE (ajuste para GASCTPNA_projetos se os antigos estiverem lá)
            UPDATE public."IBRASE_projetos"
            SET periodos_json = r.p_json
            WHERE id = r.projeto_id;
            
            -- Tenta também atualizar nas outras tabelas caso o ID exista lá (segurança)
            UPDATE public."GASCTPNA_projetos" SET periodos_json = r.p_json WHERE id = r.projeto_id;
        END LOOP;
    END IF;
END $$;
