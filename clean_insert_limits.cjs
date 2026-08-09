const fs = require('fs');

let data = JSON.parse(fs.readFileSync('N8N_PROJETOS_POST_CORRIGIDO.json', 'utf8'));

for (let node of data.nodes) {
  if (node.name && node.name.startsWith('Ins ') && node.name.includes('Limits')) {
    if (node.parameters && node.parameters.fieldsUi && node.parameters.fieldsUi.fieldValues) {
      // Only keep projeto_id, modalidade_id, limite
      node.parameters.fieldsUi.fieldValues = node.parameters.fieldsUi.fieldValues.filter(f => 
        ['projeto_id', 'modalidade_id', 'limite'].includes(f.fieldId)
      );
    }
  }
}

fs.writeFileSync('N8N_PROJETOS_POST_CORRIGIDO.json', JSON.stringify(data, null, 2));
console.log('Insert limits nodes cleaned!');
