-- =====================================================
-- MIGRATION: Criar tabela de Espaços por Instituto
-- Execute no Supabase SQL Editor
-- =====================================================

-- GASCTPNA
CREATE TABLE IF NOT EXISTS "GASCTPNA_espacos" (
  id                  BIGSERIAL PRIMARY KEY,
  projeto_id          INTEGER,
  modalidade_id       INTEGER,
  nome                TEXT NOT NULL,

  -- Responsável / Cedente do Espaço
  resp_cpf            TEXT,
  resp_cnpj           TEXT,
  resp_nome           TEXT,
  resp_email          TEXT,
  resp_telefone       TEXT,

  -- Endereço
  cep                 TEXT,
  rua                 TEXT,
  numero              TEXT,
  bairro              TEXT,
  ponto_referencia    TEXT,
  cidade              TEXT,
  uf                  TEXT,

  -- Horário de Funcionamento
  -- Formato: { "seg": {"abertura":"08:00","fechamento":"17:00"}, "ter": null, ... }
  horarios            JSONB DEFAULT '{}'::JSONB,

  -- Documentos (URLs do Supabase Storage)
  foto_url            TEXT,
  termo_url           TEXT,

  -- Status e Aprovação
  ativo               BOOLEAN DEFAULT TRUE,
  status_aprovacao    TEXT DEFAULT 'aprovado', -- 'aprovado', 'pendente', 'rejeitado'
  docs_pendentes      BOOLEAN DEFAULT FALSE,

  -- Auditoria
  created_by          TEXT,
  updated_by          TEXT,
  ip_cadastro         TEXT,
  user_agent          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- IBRASE
CREATE TABLE IF NOT EXISTS "IBRASE_espacos" AS TABLE "GASCTPNA_espacos" WITH NO DATA;
ALTER TABLE "IBRASE_espacos" ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;

-- AUNI  
CREATE TABLE IF NOT EXISTS "AUNI_espacos" AS TABLE "GASCTPNA_espacos" WITH NO DATA;
ALTER TABLE "AUNI_espacos" ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;

-- IVEM
CREATE TABLE IF NOT EXISTS "IVEM_espacos" AS TABLE "GASCTPNA_espacos" WITH NO DATA;
ALTER TABLE "IVEM_espacos" ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;

-- ALTER TABLEs para tabelas existentes
ALTER TABLE "GASCTPNA_espacos" ADD COLUMN IF NOT EXISTS status_aprovacao TEXT DEFAULT 'aprovado';
ALTER TABLE "GASCTPNA_espacos" ADD COLUMN IF NOT EXISTS docs_pendentes BOOLEAN DEFAULT FALSE;

ALTER TABLE "IBRASE_espacos" ADD COLUMN IF NOT EXISTS status_aprovacao TEXT DEFAULT 'aprovado';
ALTER TABLE "IBRASE_espacos" ADD COLUMN IF NOT EXISTS docs_pendentes BOOLEAN DEFAULT FALSE;

ALTER TABLE "AUNI_espacos" ADD COLUMN IF NOT EXISTS status_aprovacao TEXT DEFAULT 'aprovado';
ALTER TABLE "AUNI_espacos" ADD COLUMN IF NOT EXISTS docs_pendentes BOOLEAN DEFAULT FALSE;

ALTER TABLE "IVEM_espacos" ADD COLUMN IF NOT EXISTS status_aprovacao TEXT DEFAULT 'aprovado';
ALTER TABLE "IVEM_espacos" ADD COLUMN IF NOT EXISTS docs_pendentes BOOLEAN DEFAULT FALSE;

