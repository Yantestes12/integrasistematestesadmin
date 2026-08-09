-- ==============================================================================
-- MIGRATION: Migrar dados de Núcleos existentes para Espaços Físicos Aprovados
-- Execute no Supabase SQL Editor
-- ==============================================================================

-- 1. GASCTPNA
INSERT INTO "GASCTPNA_espacos" (
  projeto_id,
  modalidade_id,
  nome,
  resp_cpf,
  resp_cnpj,
  resp_nome,
  resp_email,
  resp_telefone,
  cep,
  rua,
  numero,
  bairro,
  ponto_referencia,
  cidade,
  uf,
  status_aprovacao,
  docs_pendentes,
  ativo,
  created_at,
  updated_at
)
SELECT 
  n.projeto_id,
  n.modalidade_id,
  COALESCE(NULLIF(TRIM(n.nome), ''), 'Espaço ' || COALESCE(n.bairro, 'Indefinido')),
  n.resp_cpf,
  n.cnpj,
  n.resp_nome,
  n.resp_email,
  n.resp_telefone,
  n.cep,
  n.rua,
  n.numero,
  n.bairro,
  n.ponto_referencia,
  'Campos dos Goytacazes',
  'RJ',
  'aprovado',
  FALSE,
  COALESCE(n.ativo, TRUE),
  COALESCE(n.created_at, NOW()),
  COALESCE(n.updated_at, NOW())
FROM "GASCTPNA_nucleos" n
WHERE NOT EXISTS (
  SELECT 1 FROM "GASCTPNA_espacos" e WHERE e.nome = n.nome OR (e.bairro = n.bairro AND e.rua = n.rua)
);

-- Vincular espaco_id nos Núcleos da GASCTPNA
ALTER TABLE "GASCTPNA_nucleos" ADD COLUMN IF NOT EXISTS espaco_id BIGINT;

UPDATE "GASCTPNA_nucleos" n
SET espaco_id = e.id
FROM "GASCTPNA_espacos" e
WHERE (e.nome = n.nome OR (e.bairro = n.bairro AND e.rua = n.rua))
  AND (n.espaco_id IS NULL OR n.espaco_id = 0);


-- 2. IBRASE
INSERT INTO "IBRASE_espacos" (
  projeto_id,
  modalidade_id,
  nome,
  resp_cpf,
  resp_cnpj,
  resp_nome,
  resp_email,
  resp_telefone,
  cep,
  rua,
  numero,
  bairro,
  ponto_referencia,
  cidade,
  uf,
  status_aprovacao,
  docs_pendentes,
  ativo,
  created_at,
  updated_at
)
SELECT 
  n.projeto_id,
  n.modalidade_id,
  COALESCE(NULLIF(TRIM(n.nome), ''), 'Espaço ' || COALESCE(n.bairro, 'Indefinido')),
  n.resp_cpf,
  n.cnpj,
  n.resp_nome,
  n.resp_email,
  n.resp_telefone,
  n.cep,
  n.rua,
  n.numero,
  n.bairro,
  n.ponto_referencia,
  'Campos dos Goytacazes',
  'RJ',
  'aprovado',
  FALSE,
  COALESCE(n.ativo, TRUE),
  COALESCE(n.created_at, NOW()),
  COALESCE(n.updated_at, NOW())
FROM "IBRASE_nucleos" n
WHERE NOT EXISTS (
  SELECT 1 FROM "IBRASE_espacos" e WHERE e.nome = n.nome OR (e.bairro = n.bairro AND e.rua = n.rua)
);

ALTER TABLE "IBRASE_nucleos" ADD COLUMN IF NOT EXISTS espaco_id BIGINT;

UPDATE "IBRASE_nucleos" n
SET espaco_id = e.id
FROM "IBRASE_espacos" e
WHERE (e.nome = n.nome OR (e.bairro = n.bairro AND e.rua = n.rua))
  AND (n.espaco_id IS NULL OR n.espaco_id = 0);


-- 3. AUNI
INSERT INTO "AUNI_espacos" (
  projeto_id,
  modalidade_id,
  nome,
  resp_cpf,
  resp_cnpj,
  resp_nome,
  resp_email,
  resp_telefone,
  cep,
  rua,
  numero,
  bairro,
  ponto_referencia,
  cidade,
  uf,
  status_aprovacao,
  docs_pendentes,
  ativo,
  created_at,
  updated_at
)
SELECT 
  n.projeto_id,
  n.modalidade_id,
  COALESCE(NULLIF(TRIM(n.nome), ''), 'Espaço ' || COALESCE(n.bairro, 'Indefinido')),
  n.resp_cpf,
  n.cnpj,
  n.resp_nome,
  n.resp_email,
  n.resp_telefone,
  n.cep,
  n.rua,
  n.numero,
  n.bairro,
  n.ponto_referencia,
  'Campos dos Goytacazes',
  'RJ',
  'aprovado',
  FALSE,
  COALESCE(n.ativo, TRUE),
  COALESCE(n.created_at, NOW()),
  COALESCE(n.updated_at, NOW())
FROM "AUNI_nucleos" n
WHERE NOT EXISTS (
  SELECT 1 FROM "AUNI_espacos" e WHERE e.nome = n.nome OR (e.bairro = n.bairro AND e.rua = n.rua)
);

ALTER TABLE "AUNI_nucleos" ADD COLUMN IF NOT EXISTS espaco_id BIGINT;

UPDATE "AUNI_nucleos" n
SET espaco_id = e.id
FROM "AUNI_espacos" e
WHERE (e.nome = n.nome OR (e.bairro = n.bairro AND e.rua = n.rua))
  AND (n.espaco_id IS NULL OR n.espaco_id = 0);


-- 4. IVEM
INSERT INTO "IVEM_espacos" (
  projeto_id,
  modalidade_id,
  nome,
  resp_cpf,
  resp_cnpj,
  resp_nome,
  resp_email,
  resp_telefone,
  cep,
  rua,
  numero,
  bairro,
  ponto_referencia,
  cidade,
  uf,
  status_aprovacao,
  docs_pendentes,
  ativo,
  created_at,
  updated_at
)
SELECT 
  n.projeto_id,
  n.modalidade_id,
  COALESCE(NULLIF(TRIM(n.nome), ''), 'Espaço ' || COALESCE(n.bairro, 'Indefinido')),
  n.resp_cpf,
  n.cnpj,
  n.resp_nome,
  n.resp_email,
  n.resp_telefone,
  n.cep,
  n.rua,
  n.numero,
  n.bairro,
  n.ponto_referencia,
  'Campos dos Goytacazes',
  'RJ',
  'aprovado',
  FALSE,
  COALESCE(n.ativo, TRUE),
  COALESCE(n.created_at, NOW()),
  COALESCE(n.updated_at, NOW())
FROM "IVEM_nucleos" n
WHERE NOT EXISTS (
  SELECT 1 FROM "IVEM_espacos" e WHERE e.nome = n.nome OR (e.bairro = n.bairro AND e.rua = n.rua)
);

ALTER TABLE "IVEM_nucleos" ADD COLUMN IF NOT EXISTS espaco_id BIGINT;

UPDATE "IVEM_nucleos" n
SET espaco_id = e.id
FROM "IVEM_espacos" e
WHERE (e.nome = n.nome OR (e.bairro = n.bairro AND e.rua = n.rua))
  AND (n.espaco_id IS NULL OR n.espaco_id = 0);
