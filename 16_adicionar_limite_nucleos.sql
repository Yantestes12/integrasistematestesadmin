-- ==============================================================================
-- ADICIONAR COLUNA LIMITE_NUCLEOS EM TODOS OS PROJETOS
-- ==============================================================================

DO $$
BEGIN
    -- 1. GASCTPNA_projetos
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'GASCTPNA_projetos' 
        AND column_name = 'limite_nucleos'
    ) THEN
        ALTER TABLE public."GASCTPNA_projetos" ADD COLUMN limite_nucleos INT DEFAULT 20;
    END IF;

    -- 2. IBRASE_projetos
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'IBRASE_projetos' 
        AND column_name = 'limite_nucleos'
    ) THEN
        ALTER TABLE public."IBRASE_projetos" ADD COLUMN limite_nucleos INT DEFAULT 20;
    END IF;

    -- 3. AUNI_projetos
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'AUNI_projetos' 
        AND column_name = 'limite_nucleos'
    ) THEN
        ALTER TABLE public."AUNI_projetos" ADD COLUMN limite_nucleos INT DEFAULT 20;
    END IF;

    -- 4. IVEM_projetos
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'IVEM_projetos' 
        AND column_name = 'limite_nucleos'
    ) THEN
        ALTER TABLE public."IVEM_projetos" ADD COLUMN limite_nucleos INT DEFAULT 20;
    END IF;
END $$;
