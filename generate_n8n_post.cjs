const fs = require('fs');
const institutes = ['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
const nodes = [];
const connections = {};

// Webhook
nodes.push({
  id: 'webhook-post',
  name: 'Webhook POST',
  type: 'n8n-nodes-base.webhook',
  typeVersion: 1,
  position: [0, 0],
  parameters: { httpMethod: 'POST', path: 'projetos-post', responseMode: 'responseNode', options: {} },
  webhookId: 'projetos-post'
});

// Switch
nodes.push({
  id: 'switch-inst',
  name: 'Switch Instituto',
  type: 'n8n-nodes-base.switch',
  typeVersion: 3,
  position: [200, 0],
  parameters: {
    rules: {
      values: institutes.map(inst => ({
        conditions: {
          options: { caseSensitive: false, typeValidation: 'strict', version: 1 },
          conditions: [{
            leftValue: '={{ ($json.body?.instituto || $json.query?.instituto || "GASCTPNA").toUpperCase().trim() }}',
            rightValue: inst,
            operator: { type: 'string', operation: 'equals' }
          }],
          combinator: 'and'
        },
        renameOutput: true,
        outputKey: inst
      }))
    }
  }
});
connections['Webhook POST'] = { main: [[{ node: 'Switch Instituto', type: 'main', index: 0 }]] };
connections['Switch Instituto'] = { main: [[], [], [], []] };

// Branches
institutes.forEach((inst, index) => {
  const y = index * 250 - 350;
  
  // 1. Insert (POST)
  const insertName = `Insert ${inst}`;
  nodes.push({
    id: `insert-${inst}`,
    name: insertName,
    type: 'n8n-nodes-base.supabase',
    typeVersion: 1,
    position: [500, y],
    credentials: { supabaseApi: { id: '9PCPmBxs55B86AyO', name: 'IBRASE' } },
    parameters: {
      operation: 'insert',
      tableId: `${inst}_projetos`,
      fieldsUi: {
        fieldValues: [
            { fieldId: 'nome', fieldValue: '={{ $json.body.nome_projeto }}' },
            { fieldId: 'numero_proposta', fieldValue: '={{ $json.body.numero_proposta }}' },
            { fieldId: 'termo_fomento', fieldValue: '={{ $json.body.termo_fomento }}' },
            { fieldId: 'numero_processo_adm', fieldValue: '={{ $json.body.numero_processo_adm }}' },
            { fieldId: 'numero_transferegov', fieldValue: '={{ $json.body.numero_transferegov }}' },
            { fieldId: 'aplicabilidade', fieldValue: '={{ $json.body.aplicabilidade }}' },
            { fieldId: 'descricao', fieldValue: '={{ $json.body.descricao }}' },
            { fieldId: 'vigencia_inicio', fieldValue: '={{ $json.body.vigencia_inicio }}' },
            { fieldId: 'vigencia_fim', fieldValue: '={{ $json.body.vigencia_fim }}' },
            { fieldId: 'vigencia_termino', fieldValue: '={{ $json.body.vigencia_termino }}' },
            { fieldId: 'idade_min', fieldValue: '={{ $json.body.idade_min }}' },
            { fieldId: 'idade_max', fieldValue: '={{ $json.body.idade_max }}' },
            { fieldId: 'limites_cargos', fieldValue: '={{ $json.body.limites_cargos }}' },
            { fieldId: 'vagas_por_nucleo', fieldValue: '={{ $json.body.vagas_por_nucleo }}' },
            { fieldId: 'periodos_json', fieldValue: '={{ $json.body.periodos_json }}' },
            { fieldId: 'ativo', fieldValue: '={{ $json.body.ativo }}' }
        ]
      }
    }
  });
  connections['Switch Instituto'].main[index].push({ node: insertName, type: 'main', index: 0 });

  // 2. Code Map
  const codeName = `Map ${inst} Limits`;
  nodes.push({
    id: `code-${inst}`,
    name: codeName,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [750, y],
    parameters: {
      jsCode: `// Pegamos o ID recém-criado do nó de Insert
const createdProject = $input.first().json;
const projId = createdProject.id;
const body = $("Webhook POST").first().json.body;
const limites = body.limites_modalidade || [];
if (!limites || limites.length === 0) return [];
return limites.map(l => ({
  json: { projeto_id: projId, modalidade_id: l.id, limite: parseInt(l.limite) || 0 }
}));`
    }
  });
  connections[insertName] = { main: [[{ node: codeName, type: 'main', index: 0 }]] };

  // 3. Create Limits
  const createLimitsName = `Insert ${inst} Limits`;
  nodes.push({
    id: `create-limits-${inst}`,
    name: createLimitsName,
    type: 'n8n-nodes-base.supabase',
    typeVersion: 1,
    position: [1000, y],
    credentials: { supabaseApi: { id: '9PCPmBxs55B86AyO', name: 'IBRASE' } },
    parameters: {
      operation: 'create',
      tableId: `${inst}_projeto_modalidade_limites`,
      dataToSend: 'autoMapInputData'
    }
  });
  connections[codeName] = { main: [[{ node: createLimitsName, type: 'main', index: 0 }]] };

  // 4. Respond
  const respondName = `Respond ${inst}`;
  nodes.push({
    id: `respond-${inst}`,
    name: respondName,
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1,
    position: [1000, y + 150],
    parameters: { respondWith: 'allIncomingItems', options: {} }
  });
  
  // Como no POST não temos DELETE, se o Code retornar vazio, ele para.
  // Precisamos garantir o Respond!
  connections[insertName].main[0].push({ node: respondName, type: 'main', index: 0 });
});

fs.writeFileSync('N8N_PROJETOS_POST_NOVO.json', JSON.stringify({ nodes, connections, meta: { templateCredsSetupCompleted: true } }, null, 2));
