const fs = require('fs');
const content = fs.readFileSync('workflow_n8n_crud_projetos_v2.json', 'utf8');
fs.writeFileSync('C:/Users/x/.gemini/antigravity-ide/brain/b8ed5efc-4a19-44dd-b63f-a2a0bb8a624f/workflow_n8n_crud_projetos_v2.md', '```json\n' + content + '\n```');
