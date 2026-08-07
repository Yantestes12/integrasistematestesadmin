-- ==========================================
-- PREENCHIMENTO AUTOMÁTICO DE LIMITES DOS PROJETOS (IBRASE)
-- ==========================================

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
