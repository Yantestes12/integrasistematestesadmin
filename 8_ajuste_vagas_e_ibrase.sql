-- =====================================================
-- MIGRATION: Adicionar colunas de Vagas e corrigir IBRASE
-- Execute no Supabase SQL Editor
-- =====================================================

-- 1. Adicionar colunas caso não existam (vagas e numero_vaga)
ALTER TABLE "GASCTPNA_nucleos" ADD COLUMN IF NOT EXISTS numero_vaga TEXT;
ALTER TABLE "GASCTPNA_nucleos" ADD COLUMN IF NOT EXISTS vagas TEXT;

ALTER TABLE "IBRASE_nucleos" ADD COLUMN IF NOT EXISTS numero_vaga TEXT;
ALTER TABLE "IBRASE_nucleos" ADD COLUMN IF NOT EXISTS vagas TEXT;

ALTER TABLE "AUNI_nucleos" ADD COLUMN IF NOT EXISTS numero_vaga TEXT;
ALTER TABLE "AUNI_nucleos" ADD COLUMN IF NOT EXISTS vagas TEXT;

ALTER TABLE "IVEM_nucleos" ADD COLUMN IF NOT EXISTS numero_vaga TEXT;
ALTER TABLE "IVEM_nucleos" ADD COLUMN IF NOT EXISTS vagas TEXT;


-- 2. Preencher informações faltantes nos núcleos do IBRASE
-- A pedido: preencher modalidade e responsável onde estiverem vazios.
-- ATENÇÃO: Verifique qual é o ID correto da Modalidade Padrão que deseja usar (ex: 1).
UPDATE "IBRASE_nucleos"
SET 
  modalidade_id = COALESCE(modalidade_id, 1), -- Altere o 1 para o ID da modalidade real do IBRASE
  resp_nome = COALESCE(resp_nome, 'Coordenação IBRASE'),
  resp_cpf = COALESCE(resp_cpf, '00000000000'),
  resp_email = COALESCE(resp_email, 'contato@ibrase.org.br'),
  resp_telefone = COALESCE(resp_telefone, '00000000000')
WHERE 
  modalidade_id IS NULL OR resp_nome IS NULL OR resp_nome = '';

-- Se quiser aplicar o mesmo para os outros institutos, basta replicar o bloco de UPDATE acima
-- substituindo "IBRASE_nucleos" pelo respectivo instituto.
