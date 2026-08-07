const fs = require('fs');
const institutes = ['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
const nodes = [];
const connections = {};

// Webhook
nodes.push({
  id: 'webhook-put',
  name: 'Webhook PUT',
  type: 'n8n-nodes-base.webhook',
  typeVersion: 1,
  position: [0, 0],
  parameters: { httpMethod: 'PUT', path: 'projetos-put', responseMode: 'responseNode', options: {} },
  webhookId: 'projetos-put'
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
connections['Webhook PUT'] = { main: [[{ node: 'Switch Instituto', type: 'main', index: 0 }]] };
connections['Switch Instituto'] = { main: [[], [], [], []] };

// Branches
institutes.forEach((inst, index) => {
  const y = index * 250 - 350;
  
  // 1. Update
  const updateName = `Update ${inst}`;
  nodes.push({
    id: `update-${inst}`,
    name: updateName,
    type: 'n8n-nodes-base.supabase',
    typeVersion: 1,
    position: [500, y],
    credentials: { supabaseApi: { id: '9PCPmBxs55B86AyO', name: 'IBRASE' } },
    parameters: {
      operation: 'update',
      tableId: `${inst}_projetos`,
      filters: { conditions: [{ keyName: 'id', condition: 'eq', keyValue: '={{ $json.body.id }}' }] },
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
  connections['Switch Instituto'].main[index].push({ node: updateName, type: 'main', index: 0 });

  // 2. Delete
  const deleteName = `Delete ${inst} Limits`;
  nodes.push({
    id: `delete-${inst}`,
    name: deleteName,
    type: 'n8n-nodes-base.supabase',
    typeVersion: 1,
    position: [750, y],
    credentials: { supabaseApi: { id: '9PCPmBxs55B86AyO', name: 'IBRASE' } },
    parameters: {
      operation: 'delete',
      tableId: `${inst}_projeto_modalidade_limites`,
      filters: { conditions: [{ keyName: 'projeto_id', condition: 'eq', keyValue: '={{ $("Webhook PUT").first().json.body.id }}' }] }
    }
  });
  connections[updateName] = { main: [[{ node: deleteName, type: 'main', index: 0 }]] };

  // 3. Code
  const codeName = `Map ${inst} Limits`;
  nodes.push({
    id: `code-${inst}`,
    name: codeName,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1000, y],
    parameters: {
      jsCode: `const body = $("Webhook PUT").first().json.body;
const projId = parseInt(body.id);
const limites = body.limites_modalidade || [];
if (!limites || limites.length === 0) return [];
return limites.map(l => ({
  json: { projeto_id: projId, modalidade_id: l.id, limite: parseInt(l.limite) || 0 }
}));`
    }
  });
  connections[deleteName] = { main: [[{ node: codeName, type: 'main', index: 0 }]] };

  // 4. Create
  const createName = `Insert ${inst} Limits`;
  nodes.push({
    id: `create-${inst}`,
    name: createName,
    type: 'n8n-nodes-base.supabase',
    typeVersion: 1,
    position: [1250, y],
    credentials: { supabaseApi: { id: '9PCPmBxs55B86AyO', name: 'IBRASE' } },
    parameters: {
      operation: 'create',
      tableId: `${inst}_projeto_modalidade_limites`,
      dataToSend: 'autoMapInputData'
    }
  });
  connections[codeName] = { main: [[{ node: createName, type: 'main', index: 0 }]] };

  // 5. Respond
  const respondName = `Respond ${inst}`;
  nodes.push({
    id: `respond-${inst}`,
    name: respondName,
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1,
    position: [1000, y + 100],
    parameters: { respondWith: 'allIncomingItems', options: {} }
  });
  
  // We attach Respond to the output of Delete. Because if Code returns an empty array, the execution for that branch stops there, and Respond wouldn't run!
  // By splitting from Delete, Respond will ALWAYS run and close the webhook connection successfully!
  connections[deleteName].main[0].push({ node: respondName, type: 'main', index: 0 });
});

fs.writeFileSync('N8N_PROJETOS_PUT_FINAL_V3.json', JSON.stringify({ nodes, connections, meta: { templateCredsSetupCompleted: true } }, null, 2));
