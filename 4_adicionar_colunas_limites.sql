-- ==========================================
-- SCRIPT PARA CORRIGIR AS COLUNAS FALTANTES NA TABELA IBRASE_projetos
-- E PREENCHER OS LIMITES REAIS DOS PROJETOS
-- ==========================================

-- 1. CRIAR AS COLUNAS QUE ESTAVAM FALTANDO (Iguais as do GASCTPNA)
ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS limite_auxiliares int4 DEFAULT 0;
ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS qtd_supervisores int4 DEFAULT 0;
ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS qtd_coord_pedagogico int4 DEFAULT 0;
ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS qtd_coord_geral int4 DEFAULT 0;
ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS qtd_coord_nucleo int4 DEFAULT 0;
ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS qtd_instrutor int4 DEFAULT 0;

-- 2. PREENCHER COM OS LIMITES REAIS DO SEU PHPMYADMIN

-- Atualizando PROMOV
UPDATE public."IBRASE_projetos"
SET 
  limite_auxiliares = 1,
  qtd_supervisores = 3,
  qtd_coord_pedagogico = 0,
  qtd_coord_geral = 1,
  qtd_coord_nucleo = 1,
  qtd_instrutor = 1,
  vagas_por_nucleo = 110
WHERE nome = 'PROMOV';

-- Atualizando CRESP
UPDATE public."IBRASE_projetos"
SET 
  limite_auxiliares = 2,
  qtd_supervisores = 4,
  qtd_coord_pedagogico = 3,
  qtd_coord_geral = 1,
  qtd_coord_nucleo = 0,
  qtd_instrutor = 1,
  vagas_por_nucleo = 100
WHERE nome = 'CRESP';

-- Atualizando AGON
UPDATE public."IBRASE_projetos"
SET 
  limite_auxiliares = 0,
  qtd_supervisores = 0,
  qtd_coord_pedagogico = 0,
  qtd_coord_geral = 0,
  qtd_coord_nucleo = 0,
  qtd_instrutor = 0,
  vagas_por_nucleo = 100
WHERE nome = 'AGON';

-- Atualizando TONUS
UPDATE public."IBRASE_projetos"
SET 
  limite_auxiliares = 0,
  qtd_supervisores = 0,
  qtd_coord_pedagogico = 0,
  qtd_coord_geral = 0,
  qtd_coord_nucleo = 0,
  qtd_instrutor = 0,
  vagas_por_nucleo = 100
WHERE nome = 'TONUS';

-- Atualizando EROS
UPDATE public."IBRASE_projetos"
SET 
  limite_auxiliares = 0,
  qtd_supervisores = 0,
  qtd_coord_pedagogico = 0,
  qtd_coord_geral = 0,
  qtd_coord_nucleo = 0,
  qtd_instrutor = 0,
  vagas_por_nucleo = 100
WHERE nome = 'EROS';

-- Atualizando STRATOS
UPDATE public."IBRASE_projetos"
SET 
  limite_auxiliares = 0,
  qtd_supervisores = 0,
  qtd_coord_pedagogico = 0,
  qtd_coord_geral = 0,
  qtd_coord_nucleo = 0,
  qtd_instrutor = 0,
  vagas_por_nucleo = 100
WHERE nome = 'STRATOS';
