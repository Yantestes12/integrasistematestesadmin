const fs = require('fs');
let filePath = 'matricula.html';
let f = fs.readFileSync(filePath, 'utf8');

f = f.replace(/<body>/g, '<body class="notranslate" translate="no">');
f = f.replace(/class="material-symbols-outlined"/g, 'class="material-symbols-outlined notranslate" translate="no"');
f = f.replace(/class='material-symbols-outlined'/g, "class='material-symbols-outlined notranslate' translate='no'");

fs.writeFileSync(filePath, f);
