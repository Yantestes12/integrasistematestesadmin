const fs = require('fs');

let ibrase = fs.readFileSync('C:/Users/x/Desktop/PROJETOS IBRASE/ibrase/index.html', 'utf8');
ibrase = ibrase.replace(/href=\"login\.html\"/g, 'href="https://plataformaintegra.com.br/login.html?instituto=IBRASE"');
fs.writeFileSync('C:/Users/x/Desktop/PROJETOS IBRASE/ibrase/index.html', ibrase);

let auni = fs.readFileSync('C:/Users/x/Desktop/PROJETOS IBRASE/auni/index.html', 'utf8');
auni = auni.replace(/href=\"login\.html\"/g, 'href="https://plataformaintegra.com.br/login.html?instituto=AUNI"');
fs.writeFileSync('C:/Users/x/Desktop/PROJETOS IBRASE/auni/index.html', auni);
console.log("Success");
