-- ==============================================================================
-- RESTAURAR MODALIDADES ORIGINAIS DE ABSOLUTAMENTE TODOS OS PROJETOS
-- ==============================================================================
-- Esse script formata e restaura as modalidades de TODOS os projetos para o estado
-- exato do seu backup (tabelas antigas).
-- Se um projeto tinha modalidade, ele restaura o JSON completo.
-- Se um projeto NÃO tinha modalidade originalmente, ele reseta para '[]' (vazio),
-- limpando qualquer erro que tenha sido salvo acidentalmente.

DO $$
BEGIN
  -- GASCTPNA
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'GASCTPNA_projeto_modalidade_limites') THEN
    UPDATE "GASCTPNA_projetos" p
    SET limites_modalidades = COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', l.modalidade_id, 
          'nome', COALESCE((SELECT nome FROM "GASCTPNA_modalidades" WHERE id = l.modalidade_id LIMIT 1), 'Modalidade ' || l.modalidade_id), 
          'limite', l.limite
        ))::text
        FROM "GASCTPNA_projeto_modalidade_limites" l
        WHERE l.projeto_id = p.id
      ), 
      '[]'
    );
  END IF;

  -- IBRASE
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'IBRASE_projeto_modalidade_limites') THEN
    UPDATE "IBRASE_projetos" p
    SET limites_modalidades = COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', l.modalidade_id, 
          'nome', COALESCE((SELECT nome FROM "IBRASE_modalidades" WHERE id = l.modalidade_id LIMIT 1), 'Modalidade ' || l.modalidade_id), 
          'limite', l.limite
        ))::text
        FROM "IBRASE_projeto_modalidade_limites" l
        WHERE l.projeto_id = p.id
      ), 
      '[]'
    );
  END IF;

  -- AUNI
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AUNI_projeto_modalidade_limites') THEN
    UPDATE "AUNI_projetos" p
    SET limites_modalidades = COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', l.modalidade_id, 
          'nome', COALESCE((SELECT nome FROM "AUNI_modalidades" WHERE id = l.modalidade_id LIMIT 1), 'Modalidade ' || l.modalidade_id), 
          'limite', l.limite
        ))::text
        FROM "AUNI_projeto_modalidade_limites" l
        WHERE l.projeto_id = p.id
      ), 
      '[]'
    );
  END IF;

  -- IVEM
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'IVEM_projeto_modalidade_limites') THEN
    UPDATE "IVEM_projetos" p
    SET limites_modalidades = COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', l.modalidade_id, 
          'nome', COALESCE((SELECT nome FROM "IVEM_modalidades" WHERE id = l.modalidade_id LIMIT 1), 'Modalidade ' || l.modalidade_id), 
          'limite', l.limite
        ))::text
        FROM "IVEM_projeto_modalidade_limites" l
        WHERE l.projeto_id = p.id
      ), 
      '[]'
    );
  END IF;
END $$;
