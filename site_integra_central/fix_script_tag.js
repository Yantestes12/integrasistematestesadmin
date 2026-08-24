const fs = require('fs');
let areaAlunoPath = 'area_aluno.html';
let areaHtml = fs.readFileSync(areaAlunoPath, 'utf8');

// Escape the closing script tag inside the JS string literals
areaHtml = areaHtml.replace(/<\/script><\/body><\/html>'\);/g, '<\\/script></body></html>\');');

fs.writeFileSync(areaAlunoPath, areaHtml);
