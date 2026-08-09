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

-- 4. CONVERTER E POVOAR MODALIDADES EXISTENTES DAS TABELAS RELACIONAIS PARA O CAMPO JSON DA TABELA PRINCIPAL
UPDATE "GASCTPNA_projetos" p
SET limites_modalidades = (
  SELECT json_agg(json_build_object('id', l.modalidade_id, 'nome', COALESCE(m.nome, 'Modalidade ' || l.modalidade_id), 'limite', l.limite))::text
  FROM "GASCTPNA_projeto_modalidade_limites" l
  LEFT JOIN modalidades m ON m.id = l.modalidade_id
  WHERE l.projeto_id = p.id
)
WHERE (limites_modalidades IS NULL OR limites_modalidades = '' OR limites_modalidades = '[]')
  AND EXISTS (SELECT 1 FROM "GASCTPNA_projeto_modalidade_limites" WHERE projeto_id = p.id);

UPDATE "IBRASE_projetos" p
SET limites_modalidades = (
  SELECT json_agg(json_build_object('id', l.modalidade_id, 'nome', COALESCE(m.nome, 'Modalidade ' || l.modalidade_id), 'limite', l.limite))::text
  FROM "IBRASE_projeto_modalidade_limites" l
  LEFT JOIN modalidades m ON m.id = l.modalidade_id
  WHERE l.projeto_id = p.id
)
WHERE (limites_modalidades IS NULL OR limites_modalidades = '' OR limites_modalidades = '[]')
  AND EXISTS (SELECT 1 FROM "IBRASE_projeto_modalidade_limites" WHERE projeto_id = p.id);

UPDATE "AUNI_projetos" p
SET limites_modalidades = (
  SELECT json_agg(json_build_object('id', l.modalidade_id, 'nome', COALESCE(m.nome, 'Modalidade ' || l.modalidade_id), 'limite', l.limite))::text
  FROM "AUNI_projeto_modalidade_limites" l
  LEFT JOIN modalidades m ON m.id = l.modalidade_id
  WHERE l.projeto_id = p.id
)
WHERE (limites_modalidades IS NULL OR limites_modalidades = '' OR limites_modalidades = '[]')
  AND EXISTS (SELECT 1 FROM "AUNI_projeto_modalidade_limites" WHERE projeto_id = p.id);

UPDATE "IVEM_projetos" p
SET limites_modalidades = (
  SELECT json_agg(json_build_object('id', l.modalidade_id, 'nome', COALESCE(m.nome, 'Modalidade ' || l.modalidade_id), 'limite', l.limite))::text
  FROM "IVEM_projeto_modalidade_limites" l
  LEFT JOIN modalidades m ON m.id = l.modalidade_id
  WHERE l.projeto_id = p.id
)
WHERE (limites_modalidades IS NULL OR limites_modalidades = '' OR limites_modalidades = '[]')
  AND EXISTS (SELECT 1 FROM "IVEM_projeto_modalidade_limites" WHERE projeto_id = p.id);
