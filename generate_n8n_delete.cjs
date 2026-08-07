const fs = require('fs');

const institutes = ['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
const nodes = [];
const connections = {};

// 1. Webhook DELETE
nodes.push({
  id: 'webhook-delete',
  name: 'Webhook DELETE Modalidade',
  type: 'n8n-nodes-base.webhook',
  typeVersion: 1,
  position: [0, 0],
  parameters: {
    httpMethod: 'POST',
    path: 'modalidades-delete',
    responseMode: 'responseNode',
    options: {}
  }
});

// 2. Switch
nodes.push({
  id: 'switch-inst',
  name: 'Switch Instituto',
  type: 'n8n-nodes-base.switch',
  typeVersion: 1,
  position: [200, 0],
  parameters: {
    dataType: 'string',
    value1: '={{ $json.query.instituto || $json.body.instituto || "GASCTPNA" }}',
    rules: {
      rules: [
        { value2: 'GASCTPNA' },
        { value2: 'IBRASE', output: 1 },
        { value2: 'AUNI', output: 2 },
        { value2: 'IVEM', output: 3 }
      ]
    },
    fallbackOutput: 1
  }
});
connections['Webhook DELETE Modalidade'] = { main: [[{ node: 'Switch Instituto', type: 'main', index: 0 }]] };
connections['Switch Instituto'] = { main: [[], [], [], []] };

// 3. Supabase Delete Nodes
institutes.forEach((inst, index) => {
  const y = index * 200 - 300;
  const nodeName = `Delete ${inst} Modalidade`;
  
  nodes.push({
    id: `delete-${inst}`,
    name: nodeName,
    type: 'n8n-nodes-base.supabase',
    typeVersion: 1,
    position: [500, y],
    credentials: { supabaseApi: { id: '9PCPmBxs55B86AyO', name: 'IBRASE' } },
    parameters: {
      operation: 'delete',
      tableId: `${inst}_modalidades`,
      filters: {
        conditions: [
          { keyName: 'id', condition: 'eq', keyValue: '={{ $(\"Webhook DELETE Modalidade\").first().json.body.id }}' }
        ]
      }
    }
  });
  
  connections['Switch Instituto'].main[index].push({ node: nodeName, type: 'main', index: 0 });
});

// 4. Merge
nodes.push({
  id: 'merge-delete',
  name: 'Merge',
  type: 'n8n-nodes-base.merge',
  typeVersion: 2,
  position: [800, 0],
  parameters: {}
});
institutes.forEach(inst => {
  connections[`Delete ${inst} Modalidade`] = { main: [[{ node: 'Merge', type: 'main', index: 0 }]] };
});

// 5. Respond
nodes.push({
  id: 'respond-delete',
  name: 'Respond Webhook',
  type: 'n8n-nodes-base.respondToWebhook',
  typeVersion: 1,
  position: [1000, 0],
  parameters: {
    respondWith: 'text',
    responseBody: '{\"success\": true, \"message\": \"Modalidade excluída com sucesso\"}',
    options: {}
  }
});
connections['Merge'] = { main: [[{ node: 'Respond Webhook', type: 'main', index: 0 }]] };

fs.writeFileSync('N8N_MODALIDADES_DELETE.json', JSON.stringify({ nodes, connections }, null, 2));
