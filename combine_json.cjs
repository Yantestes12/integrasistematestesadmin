
const fs = require('fs');
const v2 = JSON.parse(fs.readFileSync('N8N_FINAL.json', 'utf8'));
const limpo = JSON.parse(fs.readFileSync('C:/Users/x/.gemini/antigravity-ide/brain/b8ed5efc-4a19-44dd-b63f-a2a0bb8a624f/fluxo_projetos_limpo.json', 'utf8'));

const modNodes = limpo.nodes.filter(n => n.name.endsWith('1'));
v2.nodes.push(...modNodes);

for (const [source, targets] of Object.entries(limpo.connections)) {
    if (source.endsWith('1')) {
        v2.connections[source] = targets;
    }
}

v2.nodes.forEach(n => {
    if (n.name === 'Switch GET' || n.name === 'Switch GET1') {
        n.executeOnce = true;
        if (!n.parameters) n.parameters = {};
        n.parameters.executeOnce = true;
    }
});

fs.writeFileSync('N8N_FINAL_COMBINADO.json', JSON.stringify(v2, null, 2));
