-- ==========================================
-- PREENCHIMENTO AUTOMÁTICO DE DATAS E PERÍODOS DOS PROJETOS (IBRASE / GASCTPNA)
-- Este script pega os dados reais que encontramos no backup antigo e preenche no Supabase.
-- Projetos afetados: PROMOV (ID 1) e CRESP (ID 2). 
-- ==========================================

-- 1) Atualizando as Vigências Iniciais que estavam no banco (2025-09-15)
UPDATE public."IBRASE_projetos" SET vigencia_inicio = '2025-09-15' WHERE nome IN ('PROMOV', 'CRESP');
UPDATE public."GASCTPNA_projetos" SET vigencia_inicio = '2025-09-15' WHERE nome IN ('PROMOV', 'CRESP');

-- 2) Preenchendo os Períodos em formato JSON para o PROMOV (ID 1 do antigo banco)
UPDATE public."IBRASE_projetos"
SET periodos_json = '[
  {"id": 26, "tipo": "planejamento", "rotulo": "Iniciação", "inicio": "2025-09-15", "fim": "2025-11-28"},
  {"id": 27, "tipo": "avaliacao", "rotulo": "1º Trimestre", "inicio": "2025-11-28", "fim": "2026-02-28"},
  {"id": 28, "tipo": "avaliacao", "rotulo": "2º Trimestre", "inicio": "2026-02-28", "fim": "2026-05-29"},
  {"id": 29, "tipo": "avaliacao", "rotulo": "3º Trimestre", "inicio": "2026-05-29", "fim": "2026-08-28"},
  {"id": 30, "tipo": "avaliacao", "rotulo": "4º Trimestre", "inicio": "2026-08-28", "fim": "2026-11-27"}
]'::jsonb
WHERE nome = 'PROMOV';

UPDATE public."GASCTPNA_projetos"
SET periodos_json = '[
  {"id": 26, "tipo": "planejamento", "rotulo": "Iniciação", "inicio": "2025-09-15", "fim": "2025-11-28"},
  {"id": 27, "tipo": "avaliacao", "rotulo": "1º Trimestre", "inicio": "2025-11-28", "fim": "2026-02-28"},
  {"id": 28, "tipo": "avaliacao", "rotulo": "2º Trimestre", "inicio": "2026-02-28", "fim": "2026-05-29"},
  {"id": 29, "tipo": "avaliacao", "rotulo": "3º Trimestre", "inicio": "2026-05-29", "fim": "2026-08-28"},
  {"id": 30, "tipo": "avaliacao", "rotulo": "4º Trimestre", "inicio": "2026-08-28", "fim": "2026-11-27"}
]'::jsonb
WHERE nome = 'PROMOV';


-- 3) Preenchendo os Períodos em formato JSON para o CRESP (ID 2 do antigo banco)
UPDATE public."IBRASE_projetos"
SET periodos_json = '[
  {"id": 21, "tipo": "planejamento", "rotulo": "Iniciação", "inicio": "2025-09-15", "fim": "2025-11-28"},
  {"id": 22, "tipo": "avaliacao", "rotulo": "1º Trimestre", "inicio": "2025-11-28", "fim": "2026-02-28"},
  {"id": 23, "tipo": "avaliacao", "rotulo": "2º Trimestre", "inicio": "2026-02-28", "fim": "2026-05-29"},
  {"id": 24, "tipo": "avaliacao", "rotulo": "3º Trimestre", "inicio": "2026-05-29", "fim": "2026-08-28"},
  {"id": 25, "tipo": "avaliacao", "rotulo": "4º Trimestre", "inicio": "2026-08-28", "fim": "2026-11-27"}
]'::jsonb
WHERE nome = 'CRESP';

UPDATE public."GASCTPNA_projetos"
SET periodos_json = '[
  {"id": 21, "tipo": "planejamento", "rotulo": "Iniciação", "inicio": "2025-09-15", "fim": "2025-11-28"},
  {"id": 22, "tipo": "avaliacao", "rotulo": "1º Trimestre", "inicio": "2025-11-28", "fim": "2026-02-28"},
  {"id": 23, "tipo": "avaliacao", "rotulo": "2º Trimestre", "inicio": "2026-02-28", "fim": "2026-05-29"},
  {"id": 24, "tipo": "avaliacao", "rotulo": "3º Trimestre", "inicio": "2026-05-29", "fim": "2026-08-28"},
  {"id": 25, "tipo": "avaliacao", "rotulo": "4º Trimestre", "inicio": "2026-08-28", "fim": "2026-11-27"}
]'::jsonb
WHERE nome = 'CRESP';

-- Nota: Os projetos AGON, TONUS, EROS e STRATOS estavam com as vigências e períodos vazios (NULL) no banco antigo original.
