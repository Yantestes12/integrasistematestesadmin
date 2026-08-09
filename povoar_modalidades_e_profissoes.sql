-- ==============================================================================
-- SCRIPT DE POPULAÇÃO DE MODALIDADES E PROFISSÕES (TODOS OS INSTITUTOS)
-- Executar no Editor SQL do Supabase
-- ==============================================================================

DO $$
DECLARE
    inst TEXT;
    institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
    tbl_mod TEXT;
    tbl_prof TEXT;
BEGIN
    RAISE NOTICE 'Iniciando atualização de Modalidades e Profissões para todos os institutos...';

    FOREACH inst IN ARRAY institutos LOOP
        tbl_mod := inst || '_modalidades';
        tbl_prof := inst || '_profissoes';

        -- ----------------------------------------------------------------------
        -- 1. CRIAR E LIMPAR TABELA DE MODALIDADES
        -- ----------------------------------------------------------------------
        EXECUTE format('
            CREATE TABLE IF NOT EXISTS public.%I (
                id BIGINT PRIMARY KEY,
                nome TEXT NOT NULL,
                descricao TEXT,
                ativo BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        ', tbl_mod);

        -- Limpa modalidades existentes
        EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE;', tbl_mod);

        -- Inserção das 34 Modalidades Padronizadas
        EXECUTE format('
            INSERT INTO public.%I (id, nome, ativo) VALUES
            (1, ''Atletismo – Corrida de Rua'', true),
            (2, ''Balé'', true),
            (3, ''Ginástica Rítmica'', true),
            (4, ''Judô'', true),
            (5, ''Jiu-Jitsu'', true),
            (6, ''Taekwondo'', true),
            (7, ''Karatê'', true),
            (8, ''Capoeira'', true),
            (9, ''Futebol de Campo'', true),
            (10, ''Futebol Society'', true),
            (11, ''Futsal'', true),
            (12, ''Basquetebol'', true),
            (13, ''Voleibol'', true),
            (14, ''Vôlei de Praia'', true),
            (15, ''Handebol'', true),
            (16, ''Treinamento Funcional'', true),
            (17, ''Pilates'', true),
            (18, ''Hidroginástica'', true),
            (19, ''Natação'', true),
            (20, ''Xadrez'', true),
            (21, ''Samba'', true),
            (22, ''Forró'', true),
            (23, ''Dança Urbana'', true),
            (24, ''Teatro'', true),
            (25, ''Circo'', true),
            (26, ''Música'', true),
            (27, ''Pintura'', true),
            (28, ''Fotografia'', true),
            (29, ''Artesanato em Cerâmica'', true),
            (30, ''Costura e Bordado'', true),
            (31, ''Manicure'', true),
            (32, ''Designer de sobrancelhas'', true),
            (33, ''Cabeleireiro'', true),
            (34, ''Reforço escolar'', true);
        ', tbl_mod);

        RAISE NOTICE 'Modalidades inseridas para o instituto % (%I)', inst, tbl_mod;

        -- ----------------------------------------------------------------------
        -- 2. CRIAR E LIMPAR TABELA DE PROFISSÕES
        -- ----------------------------------------------------------------------
        EXECUTE format('
            CREATE TABLE IF NOT EXISTS public.%I (
                id BIGINT PRIMARY KEY,
                nome TEXT NOT NULL,
                descricao TEXT,
                ativo BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        ', tbl_prof);

        -- Limpa profissões existentes
        EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE;', tbl_prof);

        -- Inserção das 30 Profissões Padronizadas
        EXECUTE format('
            INSERT INTO public.%I (id, nome, ativo) VALUES
            (1, ''Assist. Administrativo (Secretário)'', true),
            (2, ''Assist. Social'', true),
            (3, ''Assist. de Departamento Pessoal'', true),
            (4, ''Coord. Pedagógico'', true),
            (5, ''Coord. Geral'', true),
            (6, ''Coord. de Núcleo (Setorial)'', true),
            (7, ''Supervisor'', true),
            (8, ''Psicólogo'', true),
            (9, ''Terapeuta'', true),
            (10, ''Instrutor (Educador)'', true),
            (11, ''Auxiliar (Monitor)'', true),
            (12, ''Mediador'', true),
            (13, ''Analista de Projetos'', true),
            (14, ''Agente de Marketing'', true),
            (15, ''Designer'', true),
            (16, ''Fotógrafo'', true),
            (17, ''Produtor de Eventos'', true),
            (18, ''Programador'', true),
            (19, ''Técnico de Informática'', true),
            (20, ''Almoxarife'', true),
            (21, ''Contador'', true),
            (22, ''Advogado'', true),
            (23, ''Enfermeiro'', true),
            (24, ''Motorista'', true),
            (25, ''Auxiliar de Serviços Gerais'', true),
            (26, ''Estagiário'', true),
            (27, ''Animador cultural'', true),
            (28, ''Agente de Contratação'', true),
            (29, ''Engenheiro'', true),
            (30, ''Despachante'', true);
        ', tbl_prof);

        RAISE NOTICE 'Profissões inseridas para o instituto % (%I)', inst, tbl_prof;

    END LOOP;

    RAISE NOTICE 'População concluída com sucesso!';
END $$;
