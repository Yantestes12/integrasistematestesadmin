const fs = require('fs');

const path = 'C:/Users/x/.gemini/antigravity-ide/brain/5e02cabd-8275-4124-aa99-842ba4a38f39/n8n_fluxos_post_e_put_corrigidos.md';
let data = fs.readFileSync(path, 'utf8');

const miniJson = fs.readFileSync('N8N_MINI_GRADE_HORARIA_PUT.json', 'utf8');

const addition = `

---

## 7. Fluxo N8N Mínimo EXCLUSIVO para Grade Horária dos Núcleos (N8N_MINI_GRADE_HORARIA_PUT.json)

Este é um fluxo ultra-simples com apenas 7 nós que faz **APENAS** o UPDATE da coluna \`grade_horaria\` e \`turnos_calculados\` na tabela de núcleos pelo \`id\`:

\`\`\`json
${miniJson}
\`\`\`
`;

fs.writeFileSync(path, data + addition);
console.log('Artifact updated with Mini Grade workflow!');
