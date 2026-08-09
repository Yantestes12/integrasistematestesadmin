const fs = require('fs');

const path = 'C:/Users/x/.gemini/antigravity-ide/brain/5e02cabd-8275-4124-aa99-842ba4a38f39/n8n_fluxos_post_e_put_corrigidos.md';
let data = fs.readFileSync(path, 'utf8');

const nucleosPutJson = fs.readFileSync('N8N_NUCLEOS_PUT_COM_GRADE.json', 'utf8');
const sqlGrade = fs.readFileSync('13_garantir_grade_horaria_nucleos.sql', 'utf8');

const addition = `

---

## 5. Fluxo N8N Núcleos PUT (nucleos-put) - Salvar Grade Horária e Turnos

Mapeia os campos \`grade_horaria\` e \`turnos_calculados\` nos 4 institutos:

\`\`\`json
${nucleosPutJson}
\`\`\`

---

## 6. SQL 3: Garantir Colunas de Grade Horária nos Núcleos (13_garantir_grade_horaria_nucleos.sql)

Adiciona as colunas \`grade_horaria\` e \`turnos_calculados\` no banco do Supabase para os 4 institutos:

\`\`\`sql
${sqlGrade}
\`\`\`
`;

fs.writeFileSync(path, data + addition);
console.log('Artifact updated with Grade Horária workflow and SQL!');
