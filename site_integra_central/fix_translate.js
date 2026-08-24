const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (let f of files) {
    let content = fs.readFileSync(f, 'utf8');
    // Encontra todos os spans com class="material-symbols-outlined"
    content = content.replace(/<span([^>]*)class=\"([^\"]*)material-symbols-outlined([^\"]*)\"([^>]*)>/g, '<span$1class="$2material-symbols-outlined notranslate$3" translate="no"$4>');
    
    // Além disso, também precisamos corrigir casos onde class usa aspas simples (menos comum mas possível)
    content = content.replace(/<span([^>]*)class=\'([^\']*)material-symbols-outlined([^\']*)\'([^>]*)>/g, '<span$1class=\'$2material-symbols-outlined notranslate$3\' translate="no"$4>');

    fs.writeFileSync(f, content);
}
console.log('Fixed translate issues in ' + files.length + ' files');
