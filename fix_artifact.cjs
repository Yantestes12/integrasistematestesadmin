const fs = require('fs');

const path = 'C:/Users/x/.gemini/antigravity-ide/brain/5e02cabd-8275-4124-aa99-842ba4a38f39/n8n_fluxo_put_corrigido.md';
let data = fs.readFileSync(path, 'utf8');

// The literal string looks like "fieldValue": "={{ ... }}\n"
// We want to replace it with "fieldValue": "={{ ... }}"
data = data.replace(/\\n"/g, '"'); 

fs.writeFileSync(path, data);
console.log('Artifact JSON fixed');
