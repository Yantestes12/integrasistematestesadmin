-- ==========================================
-- SCRIPT PARA ADICIONAR A COLUNA LIMITES_MODALIDADE DIRETAMENTE NA TABELA PROJETOS
-- ==========================================
-- Essa é a forma mais simples e inteligente para o N8N: 
-- Salvar o array de modalidades como um texto (JSON) diretamente no projeto,
-- dispensando o uso de tabelas secundárias e fluxos complexos no N8N.

ALTER TABLE public."GASCTPNA_projetos" ADD COLUMN IF NOT EXISTS limites_modalidade jsonb;
ALTER TABLE public."IBRASE_projetos" ADD COLUMN IF NOT EXISTS limites_modalidade jsonb;
ALTER TABLE public."AUNI_projetos" ADD COLUMN IF NOT EXISTS limites_modalidade jsonb;
ALTER TABLE public."IVEM_projetos" ADD COLUMN IF NOT EXISTS limites_modalidade jsonb;

-- (Opcional) Podemos apagar as tabelas secundárias que criamos anteriormente,
-- já que não vamos mais precisar delas!
DROP TABLE IF EXISTS public."GASCTPNA_projeto_modalidade_limites";
DROP TABLE IF EXISTS public."IBRASE_projeto_modalidade_limites";
DROP TABLE IF EXISTS public."AUNI_projeto_modalidade_limites";
DROP TABLE IF EXISTS public."IVEM_projeto_modalidade_limites";
