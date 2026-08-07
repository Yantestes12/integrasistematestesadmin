
const fs = require('fs');
let data = JSON.parse(fs.readFileSync('user_clipboard_raw.json', 'utf8'));

const badStrings = ['Limits', 'Mod GET', 'Inject Limits', 'Code Map Limites', 'Split Limites'];
const isBad = (name) => badStrings.some(str => name.includes(str));

data.nodes = data.nodes.filter(n => !isBad(n.name));

// Set executeOnce = true on Switch GET nodes to prevent duplication
data.nodes.forEach(n => {
    if (n.type === 'n8n-nodes-base.switch' && (n.name === 'Switch GET' || n.name === 'Switch GET1')) {
        n.parameters.executeOnce = true;
        n.executeOnce = true;
    }
});

// Clean up connections
const newConnections = {};
for (const [source, targets] of Object.entries(data.connections)) {
    if (isBad(source)) continue;
    
    newConnections[source] = {};
    if (targets.main) {
        newConnections[source].main = targets.main.map(arr => arr.filter(t => !isBad(t.node)));
    }
}

// Manually wire Merge back to Respond
const wire = (from, to) => {
    if (!newConnections[from]) newConnections[from] = { main: [[]] };
    if (!newConnections[from].main) newConnections[from].main = [[]];
    if (!newConnections[from].main[0]) newConnections[from].main[0] = [];
    if (!newConnections[from].main[0].some(t => t.node === to)) {
        newConnections[from].main[0].push({ node: to, type: 'main', index: 0 });
    }
};

wire('Merge POST', 'Respond POST');
wire('Merge PUT', 'Respond PUT');
wire('Merge GET', 'Respond GET');
wire('Merge DELETE', 'Respond DELETE');

data.connections = newConnections;

fs.writeFileSync('C:/Users/x/.gemini/antigravity-ide/brain/b8ed5efc-4a19-44dd-b63f-a2a0bb8a624f/fluxo_projetos_limpo.json', JSON.stringify(data, null, 2));
console.log('Cleaned nodes:', data.nodes.length);
