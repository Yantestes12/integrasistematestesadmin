
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('user_clipboard_raw.json', 'utf8'));

const code = \const projetos = \\Merge GET.all().map(i => i.json);
const limites = [];
const limitesMap = new Map();
for(const i of \\Merge Get Limits GET.all()){
    const l = i.json;
    const key = l.projeto_id + '_' + l.modalidade_id;
    if(!limitesMap.has(key)) {
        limitesMap.set(key, l);
        limites.push(l);
    }
}
const modalidades = [];
const modMap = new Map();
for(const i of \\Merge Get Mod GET.all()){
    const m = i.json;
    if(!modMap.has(m.id)) {
        modMap.set(m.id, m);
        modalidades.push(m);
    }
}

const uniqueProjetos = [];
const projMap = new Map();
for(const p of projetos) {
    if(!projMap.has(p.id)) {
        projMap.set(p.id, p);
        uniqueProjetos.push(p);
    }
}

return uniqueProjetos.map(p => {
    const meusLimites = limites.filter(l => l.projeto_id === p.id);
    const arrayFormatado = meusLimites.map(l => {
        const mod = modalidades.find(m => m.id === l.modalidade_id);
        return {
            id: l.modalidade_id,
            nome: mod ? mod.nome : 'Desconhecida',
            limite: l.limite
        };
    });
    
    p.limites_modalidade = JSON.stringify(arrayFormatado);
    return { json: p };
});\;

const n = data.nodes.find(x => x.name === 'Inject Limits to Projetos GET');
if(n) {
    n.parameters.jsCode = code;
}

// Fix another one just in case the same problem is in other endpoints
// Wait, projects GET is the only one combining.

fs.writeFileSync('N8N_JS_FIX.json', JSON.stringify(data, null, 2));
console.log('Fixed');
