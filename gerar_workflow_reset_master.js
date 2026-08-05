const fs = require('fs');

let bcryptUMD = fs.readFileSync('./node_modules/bcryptjs/umd/index.js', 'utf8');

// The UMD bundle calls require("crypto") in its factory check. If require("crypto") throws an error
// (which it does in restricted n8n sandboxes), the factory is never executed and bcryptObj is empty.
// This patch ensures it gracefully degrades so our Math.random fallback can actually be applied later!
bcryptUMD = bcryptUMD.replace(/require\("crypto"\)/g, "(typeof require === 'function' ? (function(){ try{ return require('crypto'); }catch(e){ return {}; } })() : {})");

const jsValidaMaster = bcryptUMD + "\n\n" + [
  "const body = $input.first().json.body || {};",
  "const masterKey = body.chave_mestra || '';",
  "const novaSenha = body.nova_senha || '';",
  "const emailOrUser = (body.usuario || '').toLowerCase().trim();",
  "",
  "if (masterKey !== 'ThomasSankara@1984') {",
  "  return [{ json: { status: 'erro', usuario: emailOrUser || 'invalido', message: 'Chave mestra inválida!' } }];",
  "}",
  "",
  "if (!novaSenha || novaSenha.length < 4) {",
  "  return [{ json: { status: 'erro', usuario: emailOrUser || 'invalido', message: 'A nova senha deve ter no mínimo 4 caracteres.' } }];",
  "}",
  "",
  "let bcryptObj = (typeof dpt_bcrypt !== 'undefined') ? dpt_bcrypt : ((typeof module !== 'undefined' && module && module.exports && module.exports.hashSync) ? module.exports : (typeof exports !== 'undefined' && exports && exports.hashSync ? exports : (typeof bcrypt !== 'undefined' ? bcrypt : null)));",
  "",
  "if (bcryptObj && bcryptObj.setRandomFallback) {",
  "  bcryptObj.setRandomFallback(function(len) {",
  "    var bytes = [];",
  "    for (var i = 0; i < len; i++) {",
  "      bytes.push(Math.floor(Math.random() * 256));",
  "    }",
  "    return bytes;",
  "  });",
  "}",
  "",
  "let newHash = '';",
  "try {",
  "  if (bcryptObj && bcryptObj.hashSync) {",
  "    newHash = bcryptObj.hashSync(novaSenha, 10);",
  "  } else {",
  "    throw new Error('Bcrypt bundle não foi carregado corretamente.');",
  "  }",
  "} catch(e) {",
  "  return [{ json: { status: 'erro', usuario: emailOrUser || 'invalido', message: 'Erro ao gerar o hash: ' + (e.message || e) } }];",
  "}",
  "",
  "return [{",
  "  json: {",
  "    status: 'sucesso',",
  "    message: 'Senha validada pela chave mestra.',",
  "    novo_hash: newHash,",
  "    usuario: emailOrUser",
  "  }",
  "}];"
].join('\n');

const updateSupabaseNode = (table, pos, id, name) => ({
  parameters: {
    operation: 'update',
    tableId: table,
    updateKey: "={{ ($json.usuario || '').includes('@') ? 'email' : 'username' }}",
    updateValue: "={{ ($json.usuario || 'invalido').toLowerCase().trim() }}",
    fieldsUi: {
      fieldValues: [
        { fieldId: 'password_hash', fieldValue: "={{ $json.novo_hash || '' }}" }
      ]
    }
  },
  type: 'n8n-nodes-base.supabase',
  typeVersion: 1,
  position: pos,
  id,
  name,
  continueOnFail: true,
  alwaysOutputData: true,
  credentials: { supabaseApi: { id: '9PCPmBxs55B86AyO', name: 'IBRASE' } }
});

const workflowReset = {
  name: 'Login Admin - Forçar Reset com Chave Mestra',
  nodes: [
    {
      parameters: {
        httpMethod: 'POST',
        path: 'loginadmin-forcar-senha',
        responseMode: 'responseNode',
        options: {
          responseHeaders: {
            entries: [
              { name: 'Access-Control-Allow-Origin', value: '*' },
              { name: 'Access-Control-Allow-Headers', value: '*' },
              { name: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' }
            ]
          }
        }
      },
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2.1,
      position: [-600, 100],
      id: 'webhook-reset-master',
      name: 'Webhook Reset',
      webhookId: 'login-admin-reset-master-id'
    },
    {
      parameters: { jsCode: jsValidaMaster },
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [-380, 100],
      id: 'node-valida-master',
      name: 'Valida Chave Mestra'
    },
    updateSupabaseNode('GASCTPNA_admin_users', [-160, -100], 'upd-gas', 'Atualiza GASCTPNA'),
    updateSupabaseNode('IBRASE_admin_users',   [-160, 40],   'upd-ibr', 'Atualiza IBRASE'),
    updateSupabaseNode('AUNI_admin_users',     [-160, 180],  'upd-aun', 'Atualiza AUNI'),
    updateSupabaseNode('IVEM_admin_users',     [-160, 320],  'upd-ive', 'Atualiza IVEM'),
    {
      parameters: { numberInputs: 4 },
      type: 'n8n-nodes-base.merge',
      typeVersion: 3,
      position: [100, 100],
      id: 'node-merge-upd',
      name: 'Juntar Updates'
    },
    {
      parameters: {
        jsCode: "const st = $('Valida Chave Mestra').first().json;\nif(st.status === 'erro') return [{json: st}];\nreturn [{json: {status: 'sucesso', message: 'Senha atualizada com sucesso! Você já pode fazer o login.'}}];"
      },
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [300, 100],
      id: 'node-resposta-reset',
      name: 'Prepara Resposta'
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: "={{ JSON.stringify($json) }}",
        options: {}
      },
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.5,
      position: [500, 100],
      id: 'node-respond-reset',
      name: 'Responde Webhook'
    }
  ],
  connections: {
    'Webhook Reset': {
      main: [[{ node: 'Valida Chave Mestra', type: 'main', index: 0 }]]
    },
    'Valida Chave Mestra': {
      main: [[
        { node: 'Atualiza GASCTPNA', type: 'main', index: 0 },
        { node: 'Atualiza IBRASE', type: 'main', index: 0 },
        { node: 'Atualiza AUNI', type: 'main', index: 0 },
        { node: 'Atualiza IVEM', type: 'main', index: 0 }
      ]]
    },
    'Atualiza GASCTPNA': { main: [[{ node: 'Juntar Updates', type: 'main', index: 0 }]] },
    'Atualiza IBRASE':   { main: [[{ node: 'Juntar Updates', type: 'main', index: 1 }]] },
    'Atualiza AUNI':     { main: [[{ node: 'Juntar Updates', type: 'main', index: 2 }]] },
    'Atualiza IVEM':     { main: [[{ node: 'Juntar Updates', type: 'main', index: 3 }]] },
    'Juntar Updates':    { main: [[{ node: 'Prepara Resposta', type: 'main', index: 0 }]] },
    'Prepara Resposta':  { main: [[{ node: 'Responde Webhook', type: 'main', index: 0 }]] }
  }
};

const jsonContent = JSON.stringify(workflowReset, null, 2);
fs.writeFileSync('workflow_n8n_reset_master.json', jsonContent, 'utf8');
fs.writeFileSync('Interno_integra/workflow_n8n_reset_master.json', jsonContent, 'utf8');
console.log('Workflow Reset gerado com sucesso!');
