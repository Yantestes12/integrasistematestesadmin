-- ==============================================================================
-- ATUALIZAR LIMITES DE NÚCLEOS BASEADO NOS DADOS ANTIGOS DE BACKUP
-- ==============================================================================

DO $$
BEGIN
    -- GASCTPNA
    -- Projeto 3 (ESPORTE SEM PARAR): Tinha 8 núcleos no backup
    UPDATE "GASCTPNA_projetos" SET limite_nucleos = 8 WHERE id = 3;
    
    -- Projeto 4 (OLIMPIA): Tinha 9 núcleos no backup
    UPDATE "GASCTPNA_projetos" SET limite_nucleos = 9 WHERE id = 4;
    
    -- Projeto 5 (IMPETO): Tinha 10 núcleos no backup
    UPDATE "GASCTPNA_projetos" SET limite_nucleos = 10 WHERE id = 5;

    -- =======================================================================
    -- NOTA PARA O IBRASE:
    -- Como a coluna limite_nucleos foi criada com valor DEFAULT 20,
    -- os projetos do IBRASE (PROMOV, CRESP, AGON, etc.) já estão todos com
    -- limite_nucleos = 20 automaticamente. 
    -- 
    -- Caso algum projeto do IBRASE precise de mais do que 20 núcleos,
    -- você pode alterar direto no painel administrativo agora que a tela
    -- de Cadastrar Projetos tem o campo "Limite de Núcleos"!
    -- =======================================================================
END $$;
