-- ==============================================================================
-- FORÇAR RESTAURAÇÃO DE MODALIDADES DOS PROJETOS (BASEADO NOS DADOS ORIGINAIS)
-- ==============================================================================
-- Este script limpa todos os projetos primeiro e, em seguida, reinsere as 
-- modalidades com base exata no arquivo "5_criar_inserir_projeto_modalidade_limites.sql"

-- 1. ZERA TUDO PARA EVITAR VESTÍGIOS DO BUG
UPDATE "GASCTPNA_projetos" SET limites_modalidades = '[]' WHERE id > 0;
UPDATE "IBRASE_projetos" SET limites_modalidades = '[]' WHERE id > 0;
UPDATE "AUNI_projetos" SET limites_modalidades = '[]' WHERE id > 0;
UPDATE "IVEM_projetos" SET limites_modalidades = '[]' WHERE id > 0;

-- 2. RECONSTRÓI PERFEITAMENTE OS PROJETOS QUE TINHAM DADOS
UPDATE "GASCTPNA_projetos" SET limites_modalidades = '[{"id":5,"nome":"Jiu-Jitsu","limite":4},{"id":6,"nome":"Taekwondo","limite":4}]' WHERE id = 3;
UPDATE "GASCTPNA_projetos" SET limites_modalidades = '[{"id":5,"nome":"Jiu-Jitsu","limite":4},{"id":7,"nome":"Karatê","limite":5}]' WHERE id = 4;
UPDATE "GASCTPNA_projetos" SET limites_modalidades = '[{"id":8,"nome":"Capoeira","limite":3},{"id":5,"nome":"Jiu-Jitsu","limite":4},{"id":7,"nome":"Karatê","limite":3}]' WHERE id = 5;

UPDATE "IBRASE_projetos" SET limites_modalidades = '[{"id":1,"nome":"Atletismo – Corrida de Rua","limite":7},{"id":2,"nome":"Balé","limite":7}]' WHERE id = 1;
UPDATE "IBRASE_projetos" SET limites_modalidades = '[{"id":3,"nome":"Ginástica Rítmica","limite":9},{"id":1,"nome":"Atletismo – Corrida de Rua","limite":9},{"id":2,"nome":"Balé","limite":4}]' WHERE id = 2;
UPDATE "IBRASE_projetos" SET limites_modalidades = '[{"id":1,"nome":"Atletismo – Corrida de Rua","limite":7},{"id":2,"nome":"Balé","limite":3}]' WHERE id = 3;
UPDATE "IBRASE_projetos" SET limites_modalidades = '[{"id":2,"nome":"Balé","limite":6}]' WHERE id = 4;
UPDATE "IBRASE_projetos" SET limites_modalidades = '[{"id":1,"nome":"Atletismo – Corrida de Rua","limite":4},{"id":2,"nome":"Balé","limite":5}]' WHERE id = 5;
UPDATE "IBRASE_projetos" SET limites_modalidades = '[{"id":1,"nome":"Atletismo – Corrida de Rua","limite":5},{"id":2,"nome":"Balé","limite":4}]' WHERE id = 6;

UPDATE "AUNI_projetos" SET limites_modalidades = '[{"id":5,"nome":"Jiu-Jitsu","limite":3},{"id":6,"nome":"Taekwondo","limite":5}]' WHERE id = 3;

UPDATE "IVEM_projetos" SET limites_modalidades = '[{"id":5,"nome":"Jiu-Jitsu","limite":7}]' WHERE id = 3;

