const fs = require('fs');

function generateNodeId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const workflow = {
  name: "POST - Cadastrar Iniciativa",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "projetos-post",
        responseMode: "responseNode",
        options: {}
      },
      id: generateNodeId(),
      name: "Webhook POST",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [0, 0],
      webhookId: "projetos-post"
    },
    {
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
      name: "Switch POST",
      type: "n8n-nodes-base.switch",
      typeVersion: 1,
      position: [250, 0]
    }
  ],
  connections: {
    "Webhook POST": {
      main: [
        [
          { node: "Switch POST", type: "main", index: 0 }
        ]
      ]
    },
    "Switch POST": {
      main: [
        [{ node: "SB GASCTPNA POST", type: "main", index: 0 }],
        [{ node: "SB IBRASE POST", type: "main", index: 0 }],
        [{ node: "SB AUNI POST", type: "main", index: 0 }],
        [{ node: "SB IVEM POST", type: "main", index: 0 }]
      ]
    }
  },
  settings: { executionOrder: "v1" }
};

const institutes = ["GASCTPNA", "IBRASE", "AUNI", "IVEM"];

institutes.forEach((inst, index) => {
  const nodeName = `SB ${inst} POST`;
  workflow.nodes.push({
    parameters: {
      resource: "row",
      operation: "create", // USING CREATE INSTEAD OF INSERT
      tableId: `${inst}_projetos`,
      table: `${inst}_projetos`
    },
    id: generateNodeId(),
    name: nodeName,
    type: "n8n-nodes-base.supabase",
    typeVersion: 1,
    position: [550, -150 + (index * 100)]
  });
  
  workflow.connections[nodeName] = {
    main: [
      [{ node: "Merge POST", type: "main", index: 0 }]
    ]
  };
});

workflow.nodes.push({
  parameters: { options: {} },
  id: generateNodeId(),
  name: "Merge POST",
  type: "n8n-nodes-base.merge",
  typeVersion: 2,
  position: [850, 0]
});

workflow.connections["Merge POST"] = {
  main: [
    [{ node: "Respond POST", type: "main", index: 0 }]
  ]
};

workflow.nodes.push({
  parameters: { respondWith: "allIncomingItems", options: {} },
  id: generateNodeId(),
  name: "Respond POST",
  type: "n8n-nodes-base.respondToWebhook",
  typeVersion: 1,
  position: [1100, 0]
});

const destPath = process.argv[2] || 'workflow_n8n_post_iniciativas.json';
fs.writeFileSync(destPath, JSON.stringify(workflow, null, 2));
console.log('Workflow JSON saved to', destPath);
