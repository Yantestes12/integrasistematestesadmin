-- ==============================================================================
-- SCRIPT UNIVERSAL: Adicionar Colunas de Vagas e Slots em TODOS os Institutos
-- Execute este script no Supabase SQL Editor
-- ==============================================================================

-- 1. COLUNAS DE VAGAS E MODALIDADES NA TABELA DE PROJETOS
ALTER TABLE "GASCTPNA_projetos" ADD COLUMN IF NOT EXISTS vagas_por_nucleo INTEGER DEFAULT 100;
ALTER TABLE "IBRASE_projetos" ADD COLUMN IF NOT EXISTS vagas_por_nucleo INTEGER DEFAULT 100;
ALTER TABLE "AUNI_projetos" ADD COLUMN IF NOT EXISTS vagas_por_nucleo INTEGER DEFAULT 100;
ALTER TABLE "IVEM_projetos" ADD COLUMN IF NOT EXISTS vagas_por_nucleo INTEGER DEFAULT 100;

ALTER TABLE "GASCTPNA_projetos" ADD COLUMN IF NOT EXISTS limites_modalidades TEXT;
ALTER TABLE "IBRASE_projetos" ADD COLUMN IF NOT EXISTS limites_modalidades TEXT;
ALTER TABLE "AUNI_projetos" ADD COLUMN IF NOT EXISTS limites_modalidades TEXT;
ALTER TABLE "IVEM_projetos" ADD COLUMN IF NOT EXISTS limites_modalidades TEXT;

-- 2. COLUNAS DE VAGAS E NÚMERO DA VAGA (SLOT) NA TABELA DE NÚCLEOS
-- numero_vaga: guarda a posição exata (Vaga Nº 1, Nº 2, etc.) que o núcleo ocupa no projeto
-- vagas: guarda a capacidade total de alunos do núcleo
ALTER TABLE "GASCTPNA_nucleos" ADD COLUMN IF NOT EXISTS numero_vaga TEXT;
ALTER TABLE "GASCTPNA_nucleos" ADD COLUMN IF NOT EXISTS vagas TEXT DEFAULT '100';

ALTER TABLE "IBRASE_nucleos" ADD COLUMN IF NOT EXISTS numero_vaga TEXT;
ALTER TABLE "IBRASE_nucleos" ADD COLUMN IF NOT EXISTS vagas TEXT DEFAULT '100';

ALTER TABLE "AUNI_nucleos" ADD COLUMN IF NOT EXISTS numero_vaga TEXT;
ALTER TABLE "AUNI_nucleos" ADD COLUMN IF NOT EXISTS vagas TEXT DEFAULT '100';

ALTER TABLE "IVEM_nucleos" ADD COLUMN IF NOT EXISTS numero_vaga TEXT;
ALTER TABLE "IVEM_nucleos" ADD COLUMN IF NOT EXISTS vagas TEXT DEFAULT '100';

-- 3. GARANTIR QUE NÚCLEOS EXISTENTES RECEBAM UM NÚMERO DE VAGA PADRÃO SE ESTIVER NULO
UPDATE "GASCTPNA_nucleos" SET numero_vaga = id::TEXT WHERE numero_vaga IS NULL OR numero_vaga = '';
UPDATE "IBRASE_nucleos" SET numero_vaga = id::TEXT WHERE numero_vaga IS NULL OR numero_vaga = '';
UPDATE "AUNI_nucleos" SET numero_vaga = id::TEXT WHERE numero_vaga IS NULL OR numero_vaga = '';
UPDATE "IVEM_nucleos" SET numero_vaga = id::TEXT WHERE numero_vaga IS NULL OR numero_vaga = '';
