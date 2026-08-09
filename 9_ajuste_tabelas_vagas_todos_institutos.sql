-- ==============================================================================
-- SCRIPT UNIVERSAL COMPLETO: Vagas, Slots e Migração de Modalidades (JSON)
-- Execute este script no Supabase SQL Editor
-- ==============================================================================

-- 1. ADICIONAR COLUNAS NAS TABELAS DE PROJETOS DOS 4 INSTITUTOS
ALTER TABLE "GASCTPNA_projetos" ADD COLUMN IF NOT EXISTS vagas_por_nucleo INTEGER DEFAULT 100;
ALTER TABLE "IBRASE_projetos" ADD COLUMN IF NOT EXISTS vagas_por_nucleo INTEGER DEFAULT 100;
ALTER TABLE "AUNI_projetos" ADD COLUMN IF NOT EXISTS vagas_por_nucleo INTEGER DEFAULT 100;
ALTER TABLE "IVEM_projetos" ADD COLUMN IF NOT EXISTS vagas_por_nucleo INTEGER DEFAULT 100;

ALTER TABLE "GASCTPNA_projetos" ADD COLUMN IF NOT EXISTS limites_modalidades TEXT;
ALTER TABLE "IBRASE_projetos" ADD COLUMN IF NOT EXISTS limites_modalidades TEXT;
ALTER TABLE "AUNI_projetos" ADD COLUMN IF NOT EXISTS limites_modalidades TEXT;
ALTER TABLE "IVEM_projetos" ADD COLUMN IF NOT EXISTS limites_modalidades TEXT;

-- 2. ADICIONAR COLUNAS DE VAGAS E SLOT NA TABELA DE NÚCLEOS
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

-- 4. CONVERTER E POVOAR MODALIDADES EXISTENTES PARA O CAMPO JSON DA TABELA PRINCIPAL
DO $$
BEGIN
  -- GASCTPNA
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'GASCTPNA_projeto_modalidade_limites') THEN
    UPDATE "GASCTPNA_projetos" p
    SET limites_modalidades = (
      SELECT json_agg(json_build_object(
        'id', l.modalidade_id, 
        'nome', COALESCE((SELECT nome FROM "GASCTPNA_modalidades" WHERE id = l.modalidade_id LIMIT 1), 'Modalidade ' || l.modalidade_id), 
        'limite', l.limite
      ))::text
      FROM "GASCTPNA_projeto_modalidade_limites" l
      WHERE l.projeto_id = p.id
    )
    WHERE (limites_modalidades IS NULL OR limites_modalidades = '' OR limites_modalidades = '[]')
      AND EXISTS (SELECT 1 FROM "GASCTPNA_projeto_modalidade_limites" WHERE projeto_id = p.id);
  END IF;

  -- IBRASE
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'IBRASE_projeto_modalidade_limites') THEN
    UPDATE "IBRASE_projetos" p
    SET limites_modalidades = (
      SELECT json_agg(json_build_object(
        'id', l.modalidade_id, 
        'nome', COALESCE((SELECT nome FROM "IBRASE_modalidades" WHERE id = l.modalidade_id LIMIT 1), 'Modalidade ' || l.modalidade_id), 
        'limite', l.limite
      ))::text
      FROM "IBRASE_projeto_modalidade_limites" l
      WHERE l.projeto_id = p.id
    )
    WHERE (limites_modalidades IS NULL OR limites_modalidades = '' OR limites_modalidades = '[]')
      AND EXISTS (SELECT 1 FROM "IBRASE_projeto_modalidade_limites" WHERE projeto_id = p.id);
  END IF;

  -- AUNI
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AUNI_projeto_modalidade_limites') THEN
    UPDATE "AUNI_projetos" p
    SET limites_modalidades = (
      SELECT json_agg(json_build_object(
        'id', l.modalidade_id, 
        'nome', COALESCE((SELECT nome FROM "AUNI_modalidades" WHERE id = l.modalidade_id LIMIT 1), 'Modalidade ' || l.modalidade_id), 
        'limite', l.limite
      ))::text
      FROM "AUNI_projeto_modalidade_limites" l
      WHERE l.projeto_id = p.id
    )
    WHERE (limites_modalidades IS NULL OR limites_modalidades = '' OR limites_modalidades = '[]')
      AND EXISTS (SELECT 1 FROM "AUNI_projeto_modalidade_limites" WHERE projeto_id = p.id);
  END IF;

  -- IVEM
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'IVEM_projeto_modalidade_limites') THEN
    UPDATE "IVEM_projetos" p
    SET limites_modalidades = (
      SELECT json_agg(json_build_object(
        'id', l.modalidade_id, 
        'nome', COALESCE((SELECT nome FROM "IVEM_modalidades" WHERE id = l.modalidade_id LIMIT 1), 'Modalidade ' || l.modalidade_id), 
        'limite', l.limite
      ))::text
      FROM "IVEM_projeto_modalidade_limites" l
      WHERE l.projeto_id = p.id
    )
    WHERE (limites_modalidades IS NULL OR limites_modalidades = '' OR limites_modalidades = '[]')
      AND EXISTS (SELECT 1 FROM "IVEM_projeto_modalidade_limites" WHERE projeto_id = p.id);
  END IF;
END $$;
