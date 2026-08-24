const fs = require('fs');
const filePath = 'matricula.html';
let f = fs.readFileSync(filePath, 'utf8');

f = f.replace(
    "banner.innerHTML = 'ℹ️ Nenhum projeto está disponível para nova inscrição no momento para sua idade (' + idade + ' anos). Veja os motivos em cada projeto abaixo:';",
    "banner.innerHTML = 'ℹ️ Não há projetos disponíveis para nova inscrição no momento. Veja os motivos listados abaixo:';"
);

fs.writeFileSync(filePath, f);
