const fs = require('fs');

const institutes = ['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
const nodes = [];
const connections = {};

// 1. Webhook GET
nodes.push({
  id: 'webhook-get',
  name: 'Webhook GET Cargos',
  type: 'n8n-nodes-base.webhook',
  typeVersion: 1,
  position: [0, 0],
  parameters: {
    path: 'cargos-get',
    responseMode: 'responseNode',
    options: {}
  }
});

// 2. Switch GET
nodes.push({
  id: 'switch-inst',
  name: 'Switch Instituto',
  type: 'n8n-nodes-base.switch',
  typeVersion: 1,
  position: [200, 0],
  parameters: {
    dataType: 'string',
    value1: '={{ $json.query.instituto || $json.body.instituto || "IBRASE" }}',
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
connections['Webhook GET Cargos'] = { main: [[{ node: 'Switch Instituto', type: 'main', index: 0 }]] };
connections['Switch Instituto'] = { main: [[], [], [], []] };

// 3. 4x Supabase GETs
institutes.forEach((inst, index) => {
  const y = index * 150 - 200;
  
  const nodeName = `SB ${inst} Cargos`;
  nodes.push({
    id: `sb-${inst}-cargos`,
    name: nodeName,
    type: 'n8n-nodes-base.supabase',
    typeVersion: 1,
    position: [500, y],
    credentials: { supabaseApi: { id: '9PCPmBxs55B86AyO', name: 'IBRASE' } },
    parameters: {
      operation: 'getAll',
      tableId: `${inst}_colaborador_cargos`,
      returnAll: true
    }
  });
  
  connections['Switch Instituto'].main[index].push({ node: nodeName, type: 'main', index: 0 });
});

// 4. Merge GET
nodes.push({
  id: 'merge-get',
  name: 'Merge',
  type: 'n8n-nodes-base.merge',
  typeVersion: 2,
  position: [800, 0],
  parameters: {}
});
institutes.forEach(inst => {
  connections[`SB ${inst} Cargos`] = { main: [[{ node: 'Merge', type: 'main', index: 0 }]] };
});

// 5. Respond GET
nodes.push({
  id: 'respond-get',
  name: 'Respond',
  type: 'n8n-nodes-base.respondToWebhook',
  typeVersion: 1,
  position: [1000, 0],
  parameters: {
    respondWith: 'allIncomingItems',
    options: {}
  }
});
connections['Merge'] = { main: [[{ node: 'Respond', type: 'main', index: 0 }]] };

fs.writeFileSync('N8N_CARGOS_GET.json', JSON.stringify({ nodes, connections }, null, 2));
