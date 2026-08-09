const fs = require('fs');

function fixDates(filename) {
  if (!fs.existsSync(filename)) return;
  let text = fs.readFileSync(filename, 'utf8');
  
  // Replace exact JSON strings for date fields
  text = text.split('={{ $json.body.vigencia_fim }}').join('={{ $json.body.vigencia_fim ? $json.body.vigencia_fim : undefined }}');
  text = text.split('={{ $json.body.vigencia_termino }}').join('={{ $json.body.vigencia_termino ? $json.body.vigencia_termino : undefined }}');
  text = text.split('={{ $json.body.vigencia_inicio }}').join('={{ $json.body.vigencia_inicio ? $json.body.vigencia_inicio : undefined }}');
  
  fs.writeFileSync(filename, text);
  console.log('Fixed: ' + filename);
}

fixDates('N8N_PROJETOS_PUT_FINAL_V3.json');
fixDates('N8N_PROJETOS_POST_NOVO.json');
