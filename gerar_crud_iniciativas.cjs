const fs = require('fs');

function generateNodeId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function createWebhook(name, method, yPosition) {
  return {
    parameters: {
      httpMethod: method,
      path: `projetos-${method.toLowerCase()}`,
      responseMode: "responseNode",
      options: {}
    },
    id: generateNodeId(),
    name: name,
    type: "n8n-nodes-base.webhook",
    typeVersion: 1,
    position: [0, yPosition],
    webhookId: `projetos-${method.toLowerCase()}`
  };
}

function createSwitch(name, yPosition) {
  return {
    parameters: {
      dataType: "string",
      value1: "={{ $json.query.instituto || $json.body.instituto }}",
      rules: {
        rules: [
          { value2: "GASCTPNA", output: 0 },
          { value2: "IBRASE", output: 1 },
          { value2: "AUNI", output: 2 },
          { value2: "IVEM", output: 3 }
        ]
      },
      fallbackOutput: 1
    },
    id: generateNodeId(),
    name: name,
    type: "n8n-nodes-base.switch",
    typeVersion: 1,
    position: [250, yPosition]
  };
}

function createSupabaseNode(name, operation, tableId, yPosition) {
  const node = {
    parameters: {
      resource: "row",
      operation: operation,
      tableId: tableId
    },
    id: generateNodeId(),
    name: name,
    type: "n8n-nodes-base.supabase",
    typeVersion: 1,
    position: [550, yPosition]
  };

  if (operation === 'getAll') {
    node.parameters.returnAll = true;
    node.parameters.filters = {};
  }
  
  if (operation === 'insert' || operation === 'update') {
    // This tells n8n to automatically map the incoming JSON to columns
    node.parameters.dataToSend = "autoMapInputData";
    node.parameters.inputsToIgnore = "instituto,id";
  }

  if (operation === 'update' || operation === 'delete') {
    node.parameters.filters = {
      conditions: [
        {
          keyName: "id",
          condition: "eq",
          keyValue: "={{ $json.body.id || $json.query.id }}"
        }
      ]
    };
  }

  return node;
}

function createMerge(name, yPosition) {
  return {
    parameters: { options: {} },
    id: generateNodeId(),
    name: name,
    type: "n8n-nodes-base.merge",
    typeVersion: 2,
    position: [850, yPosition]
  };
}

function createRespond(name, yPosition) {
  return {
    parameters: { respondWith: "allIncomingItems", options: {} },
    id: generateNodeId(),
    name: name,
    type: "n8n-nodes-base.respondToWebhook",
    typeVersion: 1,
    position: [1100, yPosition]
  };
}

function buildBranch(method, operation, startY) {
  const webhook = createWebhook(`Webhook ${method}`, method, startY + 150);
  const switchNode = createSwitch(`Switch ${method}`, startY + 150);
  
  const sbGASCTPNA = createSupabaseNode(`SB GASCTPNA ${method}`, operation, "GASCTPNA_projetos", startY);
  const sbIBRASE = createSupabaseNode(`SB IBRASE ${method}`, operation, "IBRASE_projetos", startY + 100);
  const sbAUNI = createSupabaseNode(`SB AUNI ${method}`, operation, "AUNI_projetos", startY + 200);
  const sbIVEM = createSupabaseNode(`SB IVEM ${method}`, operation, "IVEM_projetos", startY + 300);
  
  const merge = createMerge(`Merge ${method}`, startY + 150);
  const respond = createRespond(`Respond ${method}`, startY + 150);

  const nodes = [webhook, switchNode, sbGASCTPNA, sbIBRASE, sbAUNI, sbIVEM, merge, respond];
  
  const connections = {};
  connections[webhook.name] = { main: [[{ node: switchNode.name, type: "main", index: 0 }]] };
  connections[switchNode.name] = {
    main: [
      [{ node: sbGASCTPNA.name, type: "main", index: 0 }],
      [{ node: sbIBRASE.name, type: "main", index: 0 }],
      [{ node: sbAUNI.name, type: "main", index: 0 }],
      [{ node: sbIVEM.name, type: "main", index: 0 }]
    ]
  };
  
  connections[sbGASCTPNA.name] = { main: [[{ node: merge.name, type: "main", index: 0 }]] };
  connections[sbIBRASE.name] = { main: [[{ node: merge.name, type: "main", index: 0 }]] };
  connections[sbAUNI.name] = { main: [[{ node: merge.name, type: "main", index: 0 }]] };
  connections[sbIVEM.name] = { main: [[{ node: merge.name, type: "main", index: 0 }]] };
  
  connections[merge.name] = { main: [[{ node: respond.name, type: "main", index: 0 }]] };

  return { nodes, connections };
}

const workflow = {
  name: "CRUD Completo - Iniciativas (Projetos)",
  nodes: [],
  connections: {},
  settings: { executionOrder: "v1" }
};

const getBranch = buildBranch("GET", "getAll", 0);
workflow.nodes.push(...getBranch.nodes);
Object.assign(workflow.connections, getBranch.connections);

const postBranch = buildBranch("POST", "insert", 500);
workflow.nodes.push(...postBranch.nodes);
Object.assign(workflow.connections, postBranch.connections);

const putBranch = buildBranch("PUT", "update", 1000);
workflow.nodes.push(...putBranch.nodes);
Object.assign(workflow.connections, putBranch.connections);

const deleteBranch = buildBranch("DELETE", "delete", 1500);
workflow.nodes.push(...deleteBranch.nodes);
Object.assign(workflow.connections, deleteBranch.connections);


const destPath = process.argv[2] || 'workflow_n8n_crud_projetos.json';
fs.writeFileSync(destPath, JSON.stringify(workflow, null, 2));
console.log('Workflow JSON saved to', destPath);
