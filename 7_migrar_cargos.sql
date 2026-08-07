-- Adiciona a coluna limites_cargos em formato JSONB nas tabelas de projetos
ALTER TABLE "IBRASE_projetos" ADD COLUMN IF NOT EXISTS "limites_cargos" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "GASCTPNA_projetos" ADD COLUMN IF NOT EXISTS "limites_cargos" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "AUNI_projetos" ADD COLUMN IF NOT EXISTS "limites_cargos" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "IVEM_projetos" ADD COLUMN IF NOT EXISTS "limites_cargos" JSONB DEFAULT '[]'::jsonb;

-- Opcional: Migrar os dados antigos das colunas fixas para o novo JSONB
-- Isso cria um JSON array com os cargos padrão para os projetos já existentes.
UPDATE "IBRASE_projetos" SET "limites_cargos" = jsonb_build_array(
    jsonb_build_object('nome', 'Instrutor', 'limite', COALESCE(qtd_instrutor, 0)),
    jsonb_build_object('nome', 'Auxiliar', 'limite', COALESCE(limite_auxiliares, 0)),
    jsonb_build_object('nome', 'Coordenador Geral', 'limite', COALESCE(qtd_coord_geral, 0)),
    jsonb_build_object('nome', 'Coordenador de Núcleo', 'limite', COALESCE(qtd_coord_nucleo, 0)),
    jsonb_build_object('nome', 'Coordenador Pedagógico', 'limite', COALESCE(qtd_coord_pedagogico, 0)),
    jsonb_build_object('nome', 'Supervisor', 'limite', COALESCE(qtd_supervisores, 0))
) WHERE "limites_cargos" = '[]'::jsonb OR "limites_cargos" IS NULL;

UPDATE "GASCTPNA_projetos" SET "limites_cargos" = jsonb_build_array(
    jsonb_build_object('nome', 'Instrutor', 'limite', COALESCE(qtd_instrutor, 0)),
    jsonb_build_object('nome', 'Auxiliar', 'limite', COALESCE(limite_auxiliares, 0)),
    jsonb_build_object('nome', 'Coordenador Geral', 'limite', COALESCE(qtd_coord_geral, 0)),
    jsonb_build_object('nome', 'Coordenador de Núcleo', 'limite', COALESCE(qtd_coord_nucleo, 0)),
    jsonb_build_object('nome', 'Coordenador Pedagógico', 'limite', COALESCE(qtd_coord_pedagogico, 0)),
    jsonb_build_object('nome', 'Supervisor', 'limite', COALESCE(qtd_supervisores, 0))
) WHERE "limites_cargos" = '[]'::jsonb OR "limites_cargos" IS NULL;

UPDATE "AUNI_projetos" SET "limites_cargos" = jsonb_build_array(
    jsonb_build_object('nome', 'Instrutor', 'limite', COALESCE(qtd_instrutor, 0)),
    jsonb_build_object('nome', 'Auxiliar', 'limite', COALESCE(limite_auxiliares, 0)),
    jsonb_build_object('nome', 'Coordenador Geral', 'limite', COALESCE(qtd_coord_geral, 0)),
    jsonb_build_object('nome', 'Coordenador de Núcleo', 'limite', COALESCE(qtd_coord_nucleo, 0)),
    jsonb_build_object('nome', 'Coordenador Pedagógico', 'limite', COALESCE(qtd_coord_pedagogico, 0)),
    jsonb_build_object('nome', 'Supervisor', 'limite', COALESCE(qtd_supervisores, 0))
) WHERE "limites_cargos" = '[]'::jsonb OR "limites_cargos" IS NULL;

UPDATE "IVEM_projetos" SET "limites_cargos" = jsonb_build_array(
    jsonb_build_object('nome', 'Instrutor', 'limite', COALESCE(qtd_instrutor, 0)),
    jsonb_build_object('nome', 'Auxiliar', 'limite', COALESCE(limite_auxiliares, 0)),
    jsonb_build_object('nome', 'Coordenador Geral', 'limite', COALESCE(qtd_coord_geral, 0)),
    jsonb_build_object('nome', 'Coordenador de Núcleo', 'limite', COALESCE(qtd_coord_nucleo, 0)),
    jsonb_build_object('nome', 'Coordenador Pedagógico', 'limite', COALESCE(qtd_coord_pedagogico, 0)),
    jsonb_build_object('nome', 'Supervisor', 'limite', COALESCE(qtd_supervisores, 0))
) WHERE "limites_cargos" = '[]'::jsonb OR "limites_cargos" IS NULL;

