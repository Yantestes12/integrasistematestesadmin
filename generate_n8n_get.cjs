const fs = require('fs');

const institutes = ['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
const nodes = [];
const connections = {};

// 1. Webhook GET
nodes.push({
  id: 'webhook-get',
  name: 'Webhook GET',
  type: 'n8n-nodes-base.webhook',
  typeVersion: 1,
  position: [-2640, -5728],
  parameters: {
    path: 'projetos-get',
    responseMode: 'responseNode',
    options: {}
  },
  webhookId: 'projetos-get'
});

// 2. Switch GET
nodes.push({
  id: 'switch-get',
  name: 'Switch GET',
  type: 'n8n-nodes-base.switch',
  typeVersion: 1, // Using version 1 as per user's original GET flow
  position: [-2416, -5760],
  parameters: {
    dataType: 'string',
    value1: '={{ $json.query.instituto || $json.body.instituto }}',
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

connections['Webhook GET'] = { main: [[{ node: 'Switch GET', type: 'main', index: 0 }]] };
connections['Switch GET'] = { main: [[], [], [], []] };

// 3. 4x Supabase GETs
institutes.forEach((inst, index) => {
  const yBase = -6016;
  const y = yBase + (index * 192); // spacing them out properly
  
  const nodeName = `SB ${inst} GET`;
  nodes.push({
    id: `sb-${inst}-get`,
    name: nodeName,
    type: 'n8n-nodes-base.supabase',
    typeVersion: 1,
    position: [-2192, y],
    credentials: { supabaseApi: { id: '9PCPmBxs55B86AyO', name: 'IBRASE' } },
    parameters: {
      operation: 'getAll',
      tableId: `${inst}_projetos`,
      returnAll: true
    }
  });
  
  connections['Switch GET'].main[index].push({ node: nodeName, type: 'main', index: 0 });
});

// 4. Merge GET
nodes.push({
  id: 'merge-get',
  name: 'Merge GET',
  type: 'n8n-nodes-base.merge',
  typeVersion: 2,
  position: [-1968, -5728],
  parameters: {}
});

institutes.forEach(inst => {
  connections[`SB ${inst} GET`] = { main: [[{ node: 'Merge GET', type: 'main', index: 0 }]] };
});

// 5. Respond GET
nodes.push({
  id: 'respond-get',
  name: 'Respond GET',
  type: 'n8n-nodes-base.respondToWebhook',
  typeVersion: 1,
  position: [-1700, -5728],
  parameters: {
    respondWith: 'allIncomingItems',
    options: {}
  }
});

connections['Merge GET'] = { main: [[{ node: 'Respond GET', type: 'main', index: 0 }]] };

fs.writeFileSync('N8N_PROJETOS_GET_SIMPLIFICADO.json', JSON.stringify({ nodes, connections }, null, 2));
