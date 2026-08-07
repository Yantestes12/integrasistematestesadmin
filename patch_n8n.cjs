const fs = require('fs');

const data = JSON.parse(fs.readFileSync('workflow_n8n_crud_projetos.json', 'utf8'));
const findNode = (name) => data.nodes.find(n => n.name === name);
const removeConnection = (sourceName, targetName) => {
    if (data.connections[sourceName] && data.connections[sourceName].main && data.connections[sourceName].main[0]) {
        data.connections[sourceName].main[0] = data.connections[sourceName].main[0].filter(c => c.node !== targetName);
    }
};
const addConnection = (sourceName, targetName) => {
    if (!data.connections[sourceName]) data.connections[sourceName] = { main: [[]] };
    if (!data.connections[sourceName].main) data.connections[sourceName].main = [[]];
    if (!data.connections[sourceName].main[0]) data.connections[sourceName].main[0] = [];
    data.connections[sourceName].main[0].push({ node: targetName, type: "main", index: 0 });
};

// Node Generators
const setExecuteOnce = (name) => {
    const n = findNode(name);
    if(n) {
        n.executeOnce = true;
        if(!n.parameters) n.parameters = {};
        n.parameters.executeOnce = true;
    }
};
const createSwitch = (name, x, y, webhookName) => ({
    "parameters": {
        "dataType": "string",
        "value1": `={{ $json.instituto || $('${webhookName}').item.json.query.instituto || $('${webhookName}').item.json.body.instituto }}`,
        "rules": {
            "rules": [
                { "value2": "GASCTPNA" },
                { "value2": "IBRASE", "output": 1 },
                { "value2": "AUNI", "output": 2 },
                { "value2": "IVEM", "output": 3 }
            ]
        },
        "fallbackOutput": 1
    },
    "id": `node-${Math.random().toString(36).substring(2, 10)}`,
    "name": name,
    "type": "n8n-nodes-base.switch",
    "typeVersion": 1,
    "position": [x, y]
});

const createSupabaseDelete = (name, table, x, y) => ({
    "parameters": {
        "resource": "row",
        "operation": "delete",
        "tableId": table,
        "matchColumns": "projeto_id"
    },
    "id": `node-${Math.random().toString(36).substring(2, 10)}`,
    "name": name,
    "type": "n8n-nodes-base.supabase",
    "typeVersion": 1,
    "position": [x, y],
    "credentials": { "supabaseApi": { "id": "9PCPmBxs55B86AyO", "name": "IBRASE" } }
});

const createSupabaseInsert = (name, table, x, y) => ({
    "parameters": {
        "resource": "row",
        "operation": "insert",
        "tableId": table,
        "dataToSend": "defineBelow",
        "fieldsUi": {
            "fieldValues": [
                { "fieldId": "projeto_id", "fieldValue": "={{ $json.projeto_id }}" },
                { "fieldId": "modalidade_id", "fieldValue": "={{ $json.modalidade_id }}" },
                { "fieldId": "limite", "fieldValue": "={{ $json.limite }}" }
            ]
        }
    },
    "id": `node-${Math.random().toString(36).substring(2, 10)}`,
    "name": name,
    "type": "n8n-nodes-base.supabase",
    "typeVersion": 1,
    "position": [x, y],
    "credentials": { "supabaseApi": { "id": "9PCPmBxs55B86AyO", "name": "IBRASE" } }
});

const createSupabaseGetAll = (name, table, x, y) => ({
    "parameters": {
        "resource": "row",
        "operation": "getAll",
        "tableId": table,
        "returnAll": true
    },
    "id": `node-${Math.random().toString(36).substring(2, 10)}`,
    "name": name,
    "type": "n8n-nodes-base.supabase",
    "typeVersion": 1,
    "position": [x, y],
    "credentials": { "supabaseApi": { "id": "9PCPmBxs55B86AyO", "name": "IBRASE" } }
});

const createMerge = (name, x, y) => ({
    "parameters": {},
    "id": `node-${Math.random().toString(36).substring(2, 10)}`,
    "name": name,
    "type": "n8n-nodes-base.merge",
    "typeVersion": 2,
    "position": [x, y]
});

const createSplitOut = (name, x, y) => ({
    "parameters": {
        "fieldToSplitOut": "limites_modalidade",
        "options": {}
    },
    "id": `node-${Math.random().toString(36).substring(2, 10)}`,
    "name": name,
    "type": "n8n-nodes-base.itemLists",
    "typeVersion": 2,
    "position": [x, y]
});

const createCodeMapLimits = (name, mergeNodeName, webhookNodeName, x, y) => ({
    "parameters": {
        "jsCode": `const original = item.json;
const webhookItem = $('${webhookNodeName}').item.json.body;
const limites = webhookItem.limitesModalidade || webhookItem.limites_modalidade || [];
const projId = original.id || $('${mergeNodeName}').item.json.id;
original.limites_modalidade = limites.map(l => ({
  projeto_id: projId,
  modalidade_id: l.id,
  limite: l.limite
}));
return original;`
    },
    "id": `node-${Math.random().toString(36).substring(2, 10)}`,
    "name": name,
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [x, y]
});

const createCodeInjectLimits = (name, projetosMergeName, limitesMergeName, modalidadesMergeName, x, y) => ({
    "parameters": {
        "jsCode": `const projetos = $('${projetosMergeName}').all().map(i => i.json);
const limites = $('${limitesMergeName}').all().map(i => i.json);
const modalidades = $('${modalidadesMergeName}').all().map(i => i.json);

return projetos.map(p => {
    // Pegar limites deste projeto
    const meusLimites = limites.filter(l => l.projeto_id === p.id);
    
    // Deduplicar modalidades por modalidade_id
    const uniqueMap = new Map();
    for (const l of meusLimites) {
        if (!uniqueMap.has(l.modalidade_id)) {
            uniqueMap.set(l.modalidade_id, l);
        }
    }
    
    // Mapear array final com nome da modalidade
    const arrayFormatado = Array.from(uniqueMap.values()).map(l => {
        const mod = modalidades.find(m => m.id === l.modalidade_id);
        return {
            id: l.modalidade_id,
            nome: mod ? mod.nome : 'Desconhecida',
            limite: l.limite
        };
    });
    
    p.limites_modalidade = JSON.stringify(arrayFormatado); // Retrocompatibilidade React
    return { json: p };
});`
    },
    "id": `node-${Math.random().toString(36).substring(2, 10)}`,
    "name": name,
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [x, y]
});


// ==========================================
// INJECTING LOGIC FOR PUT (UPDATE)
// ==========================================
removeConnection('Merge PUT', 'Respond PUT');
let startX = 3088;
let startY = 352;

const codeMap = createCodeMapLimits('Code Map Limites PUT', 'Merge PUT', 'Webhook PUT', startX, startY);
data.nodes.push(codeMap);
addConnection('Merge PUT', codeMap.name);

startX += 200;
const splitOut = createSplitOut('Split Limites PUT', startX, startY);
data.nodes.push(splitOut);
addConnection(codeMap.name, splitOut.name);

startX += 200;
const deleteSwitch = createSwitch('Switch Del Limits PUT', startX, startY, 'Webhook PUT');
data.nodes.push(deleteSwitch);
addConnection(splitOut.name, deleteSwitch.name);

startX += 200;
const delGas = createSupabaseDelete('Del GASCTPNA Limits PUT', 'GASCTPNA_projeto_modalidade_limites', startX, startY - 150);
const delIbr = createSupabaseDelete('Del IBRASE Limits PUT', 'IBRASE_projeto_modalidade_limites', startX, startY - 50);
const delAun = createSupabaseDelete('Del AUNI Limits PUT', 'AUNI_projeto_modalidade_limites', startX, startY + 50);
const delIve = createSupabaseDelete('Del IVEM Limits PUT', 'IVEM_projeto_modalidade_limites', startX, startY + 150);
data.nodes.push(delGas, delIbr, delAun, delIve);
addConnection(deleteSwitch.name, delGas.name);
data.connections[deleteSwitch.name].main[1] = [{ node: delIbr.name, type: "main", index: 0 }];
data.connections[deleteSwitch.name].main[2] = [{ node: delAun.name, type: "main", index: 0 }];
data.connections[deleteSwitch.name].main[3] = [{ node: delIve.name, type: "main", index: 0 }];

startX += 250;
const mergeDel = createMerge('Merge Del Limits PUT', startX, startY);
data.nodes.push(mergeDel);
addConnection(delGas.name, mergeDel.name);
addConnection(delIbr.name, mergeDel.name);
addConnection(delAun.name, mergeDel.name);
addConnection(delIve.name, mergeDel.name);

startX += 200;
const insertSwitch = createSwitch('Switch Ins Limits PUT', startX, startY, 'Webhook PUT');
data.nodes.push(insertSwitch);
addConnection(mergeDel.name, insertSwitch.name);

startX += 200;
const insGas = createSupabaseInsert('Ins GASCTPNA Limits PUT', 'GASCTPNA_projeto_modalidade_limites', startX, startY - 150);
const insIbr = createSupabaseInsert('Ins IBRASE Limits PUT', 'IBRASE_projeto_modalidade_limites', startX, startY - 50);
const insAun = createSupabaseInsert('Ins AUNI Limits PUT', 'AUNI_projeto_modalidade_limites', startX, startY + 50);
const insIve = createSupabaseInsert('Ins IVEM Limits PUT', 'IVEM_projeto_modalidade_limites', startX, startY + 150);
data.nodes.push(insGas, insIbr, insAun, insIve);
addConnection(insertSwitch.name, insGas.name);
data.connections[insertSwitch.name].main[1] = [{ node: insIbr.name, type: "main", index: 0 }];
data.connections[insertSwitch.name].main[2] = [{ node: insAun.name, type: "main", index: 0 }];
data.connections[insertSwitch.name].main[3] = [{ node: insIve.name, type: "main", index: 0 }];

startX += 250;
const mergeIns = createMerge('Merge Ins Limits PUT', startX, startY);
data.nodes.push(mergeIns);
addConnection(insGas.name, mergeIns.name);
addConnection(insIbr.name, mergeIns.name);
addConnection(insAun.name, mergeIns.name);
addConnection(insIve.name, mergeIns.name);

const respondNode = findNode('Respond PUT');
respondNode.position = [startX + 200, startY];
addConnection(mergeIns.name, respondNode.name);

// ==========================================
// INJECTING LOGIC FOR POST (CREATE)
// ==========================================
removeConnection('Merge POST', 'Respond POST');
startX = 3088;
startY = -256;

const codeMapPost = createCodeMapLimits('Code Map Limites POST', 'Merge POST', 'Webhook POST', startX, startY);
data.nodes.push(codeMapPost);
addConnection('Merge POST', codeMapPost.name);

startX += 200;
const splitOutPost = createSplitOut('Split Limites POST', startX, startY);
data.nodes.push(splitOutPost);
addConnection(codeMapPost.name, splitOutPost.name);

startX += 200;
const insertSwitchPost = createSwitch('Switch Ins Limits POST', startX, startY, 'Webhook POST');
data.nodes.push(insertSwitchPost);
addConnection(splitOutPost.name, insertSwitchPost.name);

startX += 200;
const insGasPost = createSupabaseInsert('Ins GASCTPNA Limits POST', 'GASCTPNA_projeto_modalidade_limites', startX, startY - 150);
const insIbrPost = createSupabaseInsert('Ins IBRASE Limits POST', 'IBRASE_projeto_modalidade_limites', startX, startY - 50);
const insAunPost = createSupabaseInsert('Ins AUNI Limits POST', 'AUNI_projeto_modalidade_limites', startX, startY + 50);
const insIvePost = createSupabaseInsert('Ins IVEM Limits POST', 'IVEM_projeto_modalidade_limites', startX, startY + 150);
data.nodes.push(insGasPost, insIbrPost, insAunPost, insIvePost);
addConnection(insertSwitchPost.name, insGasPost.name);
data.connections[insertSwitchPost.name].main[1] = [{ node: insIbrPost.name, type: "main", index: 0 }];
data.connections[insertSwitchPost.name].main[2] = [{ node: insAunPost.name, type: "main", index: 0 }];
data.connections[insertSwitchPost.name].main[3] = [{ node: insIvePost.name, type: "main", index: 0 }];

startX += 250;
const mergeInsPost = createMerge('Merge Ins Limits POST', startX, startY);
data.nodes.push(mergeInsPost);
addConnection(insGasPost.name, mergeInsPost.name);
addConnection(insIbrPost.name, mergeInsPost.name);
addConnection(insAunPost.name, mergeInsPost.name);
addConnection(insIvePost.name, mergeInsPost.name);

const respondNodePost = findNode('Respond POST');
respondNodePost.position = [startX + 200, startY];
addConnection(mergeInsPost.name, respondNodePost.name);

// ==========================================
// INJECTING LOGIC FOR GET (READ)
// ==========================================
removeConnection('Merge GET', 'Respond GET');
startX = 3088;
startY = -848;

// Switch for Limits
const getLimitSwitch = createSwitch('Switch Get Limits GET', startX, startY, 'Webhook GET');
getLimitSwitch.executeOnce = true;
data.nodes.push(getLimitSwitch);
addConnection('Merge GET', getLimitSwitch.name);

startX += 200;
const getGas = createSupabaseGetAll('Get GASCTPNA Limits GET', 'GASCTPNA_projeto_modalidade_limites', startX, startY - 150);
const getIbr = createSupabaseGetAll('Get IBRASE Limits GET', 'IBRASE_projeto_modalidade_limites', startX, startY - 50);
const getAun = createSupabaseGetAll('Get AUNI Limits GET', 'AUNI_projeto_modalidade_limites', startX, startY + 50);
const getIve = createSupabaseGetAll('Get IVEM Limits GET', 'IVEM_projeto_modalidade_limites', startX, startY + 150);
data.nodes.push(getGas, getIbr, getAun, getIve);
addConnection(getLimitSwitch.name, getGas.name);
data.connections[getLimitSwitch.name].main[1] = [{ node: getIbr.name, type: "main", index: 0 }];
data.connections[getLimitSwitch.name].main[2] = [{ node: getAun.name, type: "main", index: 0 }];
data.connections[getLimitSwitch.name].main[3] = [{ node: getIve.name, type: "main", index: 0 }];

startX += 250;
const mergeGetLimits = createMerge('Merge Get Limits GET', startX, startY);
data.nodes.push(mergeGetLimits);
addConnection(getGas.name, mergeGetLimits.name);
addConnection(getIbr.name, mergeGetLimits.name);
addConnection(getAun.name, mergeGetLimits.name);
addConnection(getIve.name, mergeGetLimits.name);

// Switch for Modalidades (to get names)
startX += 200;
const getModSwitch = createSwitch('Switch Get Mod GET', startX, startY, 'Webhook GET');
getModSwitch.executeOnce = true;
data.nodes.push(getModSwitch);
addConnection(mergeGetLimits.name, getModSwitch.name);

startX += 200;
const getGasM = createSupabaseGetAll('Get GASCTPNA Mod GET', 'GASCTPNA_modalidades', startX, startY - 150);
const getIbrM = createSupabaseGetAll('Get IBRASE Mod GET', 'IBRASE_modalidades', startX, startY - 50);
const getAunM = createSupabaseGetAll('Get AUNI Mod GET', 'AUNI_modalidades', startX, startY + 50);
const getIveM = createSupabaseGetAll('Get IVEM Mod GET', 'IVEM_modalidades', startX, startY + 150);
data.nodes.push(getGasM, getIbrM, getAunM, getIveM);
addConnection(getModSwitch.name, getGasM.name);
data.connections[getModSwitch.name].main[1] = [{ node: getIbrM.name, type: "main", index: 0 }];
data.connections[getModSwitch.name].main[2] = [{ node: getAunM.name, type: "main", index: 0 }];
data.connections[getModSwitch.name].main[3] = [{ node: getIveM.name, type: "main", index: 0 }];

startX += 250;
const mergeGetMod = createMerge('Merge Get Mod GET', startX, startY);
data.nodes.push(mergeGetMod);
addConnection(getGasM.name, mergeGetMod.name);
addConnection(getIbrM.name, mergeGetMod.name);
addConnection(getAunM.name, mergeGetMod.name);
addConnection(getIveM.name, mergeGetMod.name);

// Final Code Inject
startX += 200;
const injectLimitsNode = createCodeInjectLimits('Inject Limits to Projetos GET', 'Merge GET', 'Merge Get Limits GET', 'Merge Get Mod GET', startX, startY);
data.nodes.push(injectLimitsNode);
addConnection(mergeGetMod.name, injectLimitsNode.name);

const respondNodeGet = findNode('Respond GET');
respondNodeGet.position = [startX + 200, startY];
addConnection(injectLimitsNode.name, respondNodeGet.name);

setExecuteOnce("Switch GET");
fs.writeFileSync('workflow_n8n_crud_projetos_v2.json', JSON.stringify(data, null, 2));
console.log("Gerado workflow_n8n_crud_projetos_v2.json (POST, PUT e GET)");
