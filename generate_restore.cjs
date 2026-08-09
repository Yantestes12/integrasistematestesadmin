const fs = require('fs');

const modNames = {
  1: 'Atletismo – Corrida de Rua',
  2: 'Balé',
  3: 'Ginástica Rítmica',
  4: 'Judô',
  5: 'Jiu-Jitsu',
  6: 'Taekwondo',
  7: 'Karatê',
  8: 'Capoeira',
  9: 'Futebol de Campo',
  10: 'Futebol Society',
  11: 'Futsal',
  12: 'Basquetebol',
  13: 'Voleibol',
  14: 'Vôlei de Praia',
  15: 'Handebol',
  16: 'Treinamento Funcional',
  17: 'Pilates',
  18: 'Hidroginástica',
  19: 'Natação',
  20: 'Xadrez',
  21: 'Samba',
  22: 'Forró',
  23: 'Dança Urbana',
  24: 'Dança de Salão',
  25: 'Dança Contemporânea',
  26: 'Zumba',
  27: 'FitDance',
  28: 'Recreação Esportiva',
  29: 'Iniciação Esportiva',
  30: 'Ginástica Localizada',
  31: 'Skate',
  32: 'Surf',
  33: 'Tênis de Mesa',
  34: 'Tênis de Quadra'
};

const sqlData = fs.readFileSync('5_criar_inserir_projeto_modalidade_limites.sql', 'utf8');

const regex = /INSERT INTO public\."([A-Z]+)_projeto_modalidade_limites"\s*\([^\)]+\)\s*VALUES\s*([\s\S]*?);/g;
let match;
let outputSql = `-- ==============================================================================
-- FORÇAR RESTAURAÇÃO DE MODALIDADES DOS PROJETOS (BASEADO NOS DADOS ORIGINAIS)
-- ==============================================================================
-- Este script limpa todos os projetos primeiro e, em seguida, reinsere as 
-- modalidades com base exata no arquivo "5_criar_inserir_projeto_modalidade_limites.sql"

-- 1. ZERA TUDO PARA EVITAR VESTÍGIOS DO BUG
UPDATE "GASCTPNA_projetos" SET limites_modalidades = '[]';
UPDATE "IBRASE_projetos" SET limites_modalidades = '[]';
UPDATE "AUNI_projetos" SET limites_modalidades = '[]';
UPDATE "IVEM_projetos" SET limites_modalidades = '[]';

-- 2. RECONSTRÓI PERFEITAMENTE OS PROJETOS QUE TINHAM DADOS
`;

while ((match = regex.exec(sqlData)) !== null) {
  const inst = match[1];
  const valuesStr = match[2];
  
  // (projeto_id, modalidade_id, limite, created_by, created_at)
  const valRegex = /\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*\d+\s*,\s*'[^']+'\s*\)/g;
  let valMatch;
  
  const projMap = {};
  
  while ((valMatch = valRegex.exec(valuesStr)) !== null) {
    const projId = valMatch[1];
    const modId = valMatch[2];
    const limite = valMatch[3];
    
    if (!projMap[projId]) projMap[projId] = [];
    
    projMap[projId].push({
      id: parseInt(modId),
      nome: modNames[modId] || ('Modalidade ' + modId),
      limite: parseInt(limite)
    });
  }
  
  for (const [projId, mods] of Object.entries(projMap)) {
    const jsonStr = JSON.stringify(mods).replace(/'/g, "''"); // escape quotes for SQL
    outputSql += `UPDATE "${inst}_projetos" SET limites_modalidades = '${jsonStr}' WHERE id = ${projId};\n`;
  }
  outputSql += '\n';
}

fs.writeFileSync('11_force_restore_todas_modalidades.sql', outputSql);
console.log('Script 11 generated!');
