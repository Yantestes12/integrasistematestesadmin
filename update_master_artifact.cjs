const fs = require('fs');

const postJson = fs.readFileSync('N8N_PROJETOS_POST_CORRIGIDO.json', 'utf8');
const putJson = fs.readFileSync('N8N_PROJETOS_PUT_TODOS_CORRIGIDOS.json', 'utf8');
const sqlRestore = fs.readFileSync('11_force_restore_todas_modalidades.sql', 'utf8');
const sqlStructure = fs.readFileSync('12_garantir_todas_colunas_e_povoar_projetos.sql', 'utf8');

const markdownContent = `# Fluxos N8N (POST e PUT) e SQLs de Estrutura + Dados

> [!IMPORTANT]
> **Todos os erros de sintaxe N8N e colunas faltantes no Supabase resolvidos!**

---

## 1. Fluxo N8N POST (projetos-post) - 100% Corrigido

- Corrigido o erro de sintaxe \`.body.\` para \`$json.body.\`
- Corrigido o envio de datas nulas para \`|| null\`
- Removidas colunas inexistentes dos nós de inserção de limites

\`\`\`json
${postJson}
\`\`\`

---

## 2. Fluxo N8N PUT (projetos-put) - 100% Corrigido

- Datas formatadas sem quebras de linha com \`|| null\`
- Modalidades formatadas em JSON com \`$json.body\`

\`\`\`json
${putJson}
\`\`\`

---

## 3. SQL 1: Garantir Colunas e Povoar Dados Reais (12_garantir_todas_colunas_e_povoar_projetos.sql)

Garante que **todas as colunas** existam nos 4 institutos e preenche os números de processos, propostas, transferegov e descrições dos backups originais:

\`\`\`sql
${sqlStructure}
\`\`\`

---

## 4. SQL 2: Restaurar Modalidades Originais (11_force_restore_todas_modalidades.sql)

Restaura as modalidades dos projetos (como as 3 modalidades do IMPETO):

\`\`\`sql
${sqlRestore}
\`\`\`
`;

const artifactPath = 'C:/Users/x/.gemini/antigravity-ide/brain/5e02cabd-8275-4124-aa99-842ba4a38f39/n8n_fluxos_post_e_put_corrigidos.md';
fs.writeFileSync(artifactPath, markdownContent);
console.log('Master artifact created!');
