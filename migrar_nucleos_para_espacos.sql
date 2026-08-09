-- ==============================================================================
-- MIGRATION UNIVERSAL: Migrar Núcleos para Espaços Físicos Aprovados (4 Institutos)
-- Funciona em QUALQUER banco de dados, inspecionando colunas dinamicamente!
-- Execute no Supabase SQL Editor.
-- ==============================================================================

DO $$
DECLARE
    inst TEXT;
    sql_stmt TEXT;
    has_resp_cpf BOOLEAN;
    has_cnpj BOOLEAN;
    has_resp_nome BOOLEAN;
    has_resp_email BOOLEAN;
    has_resp_telefone BOOLEAN;
    has_cep BOOLEAN;
    has_rua BOOLEAN;
    has_numero BOOLEAN;
    has_bairro BOOLEAN;
    has_ponto_ref BOOLEAN;
BEGIN
    FOR inst IN SELECT unnest(ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM']) LOOP

        -- 1. Verifica se a tabela de núcleos existe para este instituto
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = inst || '_nucleos') THEN

            -- 2. Garante que a tabela de espaços existe
            EXECUTE format('
                CREATE TABLE IF NOT EXISTS %I (
                    id BIGSERIAL PRIMARY KEY,
                    projeto_id INTEGER,
                    modalidade_id INTEGER,
                    nome TEXT NOT NULL,
                    resp_cpf TEXT,
                    resp_cnpj TEXT,
                    resp_nome TEXT,
                    resp_email TEXT,
                    resp_telefone TEXT,
                    cep TEXT,
                    rua TEXT,
                    numero TEXT,
                    bairro TEXT,
                    ponto_referencia TEXT,
                    cidade TEXT,
                    uf TEXT,
                    horarios JSONB DEFAULT ''{}''::JSONB,
                    foto_url TEXT,
                    termo_url TEXT,
                    ativo BOOLEAN DEFAULT TRUE,
                    status_aprovacao TEXT DEFAULT ''aprovado'',
                    docs_pendentes BOOLEAN DEFAULT FALSE,
                    created_by TEXT,
                    updated_by TEXT,
                    ip_cadastro TEXT,
                    user_agent TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );', inst || '_espacos');

            -- 3. Inspeciona quais colunas existem fisicamente na tabela de núcleos deste instituto
            SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = inst || '_nucleos' AND column_name = 'resp_cpf') INTO has_resp_cpf;
            SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = inst || '_nucleos' AND column_name = 'cnpj') INTO has_cnpj;
            SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = inst || '_nucleos' AND column_name = 'resp_nome') INTO has_resp_nome;
            SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = inst || '_nucleos' AND column_name = 'resp_email') INTO has_resp_email;
            SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = inst || '_nucleos' AND column_name = 'resp_telefone') INTO has_resp_telefone;
            SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = inst || '_nucleos' AND column_name = 'cep') INTO has_cep;
            SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = inst || '_nucleos' AND column_name = 'rua') INTO has_rua;
            SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = inst || '_nucleos' AND column_name = 'numero') INTO has_numero;
            SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = inst || '_nucleos' AND column_name = 'bairro') INTO has_bairro;
            SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = inst || '_nucleos' AND column_name = 'ponto_referencia') INTO has_ponto_ref;

            -- 4. Monta e executa a inserção dinâmica sem gerar erro de coluna ausente
            sql_stmt := format('
                INSERT INTO %I (
                    projeto_id, modalidade_id, nome,
                    resp_cpf, resp_cnpj, resp_nome, resp_email, resp_telefone,
                    cep, rua, numero, bairro, ponto_referencia,
                    cidade, uf, status_aprovacao, docs_pendentes, ativo, created_at, updated_at
                )
                SELECT 
                    n.projeto_id,
                    n.modalidade_id,
                    n.nome,
                    %s AS resp_cpf,
                    %s AS resp_cnpj,
                    %s AS resp_nome,
                    %s AS resp_email,
                    %s AS resp_telefone,
                    %s AS cep,
                    %s AS rua,
                    %s AS numero,
                    %s AS bairro,
                    %s AS ponto_referencia,
                    ''Campos dos Goytacazes'',
                    ''RJ'',
                    ''aprovado'',
                    FALSE,
                    COALESCE(n.ativo, TRUE),
                    COALESCE(n.created_at, NOW()),
                    NOW()
                FROM %I n
                WHERE NOT EXISTS (
                    SELECT 1 FROM %I e WHERE LOWER(TRIM(e.nome)) = LOWER(TRIM(n.nome))
                );',
                inst || '_espacos',
                CASE WHEN has_resp_cpf THEN 'n.resp_cpf' ELSE 'NULL' END,
                CASE WHEN has_cnpj THEN 'n.cnpj' ELSE 'NULL' END,
                CASE WHEN has_resp_nome THEN 'n.resp_nome' ELSE 'NULL' END,
                CASE WHEN has_resp_email THEN 'n.resp_email' ELSE 'NULL' END,
                CASE WHEN has_resp_telefone THEN 'n.resp_telefone' ELSE 'NULL' END,
                CASE WHEN has_cep THEN 'n.cep' ELSE 'NULL' END,
                CASE WHEN has_rua THEN 'n.rua' ELSE 'NULL' END,
                CASE WHEN has_numero THEN 'n.numero' ELSE 'NULL' END,
                CASE WHEN has_bairro THEN 'n.bairro' ELSE '''Bairro ID '' || COALESCE(n.bairro_id::TEXT, ''0'')' END,
                CASE WHEN has_ponto_ref THEN 'n.ponto_referencia' ELSE 'NULL' END,
                inst || '_nucleos',
                inst || '_espacos'
            );

            EXECUTE sql_stmt;

            -- 5. Cria a coluna espaco_id nos núcleos caso ainda não exista
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS espaco_id BIGINT;', inst || '_nucleos');

            -- 6. Atualiza espaco_id nos núcleos fazendo o vínculo com a nova tabela de espaços
            EXECUTE format('
                UPDATE %I n
                SET espaco_id = e.id
                FROM %I e
                WHERE LOWER(TRIM(e.nome)) = LOWER(TRIM(n.nome))
                  AND n.espaco_id IS NULL;',
                inst || '_nucleos',
                inst || '_espacos'
            );

            RAISE NOTICE 'Migração concluída com sucesso para o instituto %', inst;

        END IF;

    END LOOP;
END $$;
