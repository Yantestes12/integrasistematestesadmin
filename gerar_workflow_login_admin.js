const fs = require('fs');

const bcryptUMD = fs.existsSync('./node_modules/bcryptjs/umd/index.js')
  ? fs.readFileSync('./node_modules/bcryptjs/umd/index.js', 'utf8')
  : '';

const jsValidacaoAdminUser = [
  bcryptUMD,
  "",
  "function md5(s){if(!s)return '';",
  "function rl(v,b){return(v<<b)|(v>>>(32-b));}",
  "function au(x,y){var x8=(x&0x80000000),y8=(y&0x80000000),x4=(x&0x40000000),y4=(y&0x40000000),r=(x&0x3FFFFFFF)+(y&0x3FFFFFFF);",
  "if(x4&y4)return(r^0x80000000^x8^y8);if(x4|y4){if(r&0x40000000)return(r^0xC0000000^x8^y8);return(r^0x40000000^x8^y8);}return(r^x8^y8);}",
  "function F(x,y,z){return(x&y)|((~x)&z);}function G(x,y,z){return(x&z)|(y&(~z));}function H(x,y,z){return x^y^z;}function I(x,y,z){return y^(x|(~z));}",
  "function FF(a,b,c,d,x,s,ac){return au(rl(au(au(au(a,F(b,c,d)),x),ac),s),b);}",
  "function GG(a,b,c,d,x,s,ac){return au(rl(au(au(au(a,G(b,c,d)),x),ac),s),b);}",
  "function HH(a,b,c,d,x,s,ac){return au(rl(au(au(au(a,H(b,c,d)),x),ac),s),b);}",
  "function II(a,b,c,d,x,s,ac){return au(rl(au(au(au(a,I(b,c,d)),x),ac),s),b);}",
  "function cw(s){var l=s.length,n=((((l+8)-(l+8)%64)/64)+1)*16,w=Array(n-1),p=0,c=0;",
  "while(c<l){var q=(c-(c%4))/4;w[q]=(w[q]|(s.charCodeAt(c)<<((c%4)*8)));c++;}",
  "var q=(c-(c%4))/4;w[q]=w[q]|(0x80<<((c%4)*8));w[n-2]=l*8;w[n-1]=(l*8)>>>32;return w;}",
  "function wh(v){var r='',t='',b,c;for(c=0;c<=3;c++){b=(v>>>(c*8))&255;t='0'+b.toString(16);r+=t.substr(t.length-2,2);}return r;}",
  "var x=[],k,AA,BB,CC,DD,a,b,c,d,S11=7,S12=12,S13=17,S14=22,S21=5,S22=9,S23=14,S24=20,S31=4,S32=11,S33=16,S34=23,S41=6,S42=10,S43=15,S44=21;",
  "s=unescape(encodeURIComponent(s));x=cw(s);a=0x67452301;b=0xEFCDAB89;c=0x98BADCFE;d=0x10325476;",
  "for(k=0;k<x.length;k+=16){AA=a;BB=b;CC=c;DD=d;",
  "a=FF(a,b,c,d,x[k],S11,0xD76AA478);d=FF(d,a,b,c,x[k+1],S12,0xE8C7B756);c=FF(c,d,a,b,x[k+2],S13,0x242070DB);b=FF(b,c,d,a,x[k+3],S14,0xC1BDCEEE);",
  "a=FF(a,b,c,d,x[k+4],S11,0xF57C0FAF);d=FF(d,a,b,c,x[k+5],S12,0x4787C62A);c=FF(c,d,a,b,x[k+6],S13,0xA8304613);b=FF(b,c,d,a,x[k+7],S14,0xFD469501);",
  "a=FF(a,b,c,d,x[k+8],S11,0x698098D8);d=FF(d,a,b,c,x[k+9],S12,0x8B44F7AF);c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);",
  "a=FF(a,b,c,d,x[k+12],S11,0x6B901122);d=FF(d,a,b,c,x[k+13],S12,0xFD987193);c=FF(c,d,a,b,x[k+14],S13,0xA679438E);b=FF(b,c,d,a,x[k+15],S14,0x49B40821);",
  "a=GG(a,b,c,d,x[k+1],S21,0xF61E2562);d=GG(d,a,b,c,x[k+6],S22,0xC040B340);c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);b=GG(b,c,d,a,x[k],S24,0xE9B6C7AA);",
  "a=GG(a,b,c,d,x[k+5],S21,0xD62F105D);d=GG(d,a,b,c,x[k+10],S22,0x2441453);c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);b=GG(b,c,d,a,x[k+4],S24,0xE7D3FBC8);",
  "a=GG(a,b,c,d,x[k+9],S21,0x21E1CDE6);d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);c=GG(c,d,a,b,x[k+3],S23,0xF4D50D87);b=GG(b,c,d,a,x[k+8],S24,0x455A14ED);",
  "a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);d=GG(d,a,b,c,x[k+2],S22,0xFCEFA3F8);c=GG(c,d,a,b,x[k+7],S23,0x676F02D9);b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);",
  "a=HH(a,b,c,d,x[k+5],S31,0xFFFA3942);d=HH(d,a,b,c,x[k+8],S32,0x8771F681);c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);",
  "a=HH(a,b,c,d,x[k+1],S31,0xA4BEEA44);d=HH(d,a,b,c,x[k+4],S32,0x4BDECFA9);c=HH(c,d,a,b,x[k+7],S33,0xF6BB4B60);b=HH(b,c,d,a,x[k+10],S34,0xbebfbc70);",
  "a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);d=HH(d,a,b,c,x[k],S32,0xEaa127fa);c=HH(c,d,a,b,x[k+3],S33,0xd4ef3085);b=HH(b,c,d,a,x[k+6],S34,0x4881d05);",
  "a=HH(a,b,c,d,x[k+9],S31,0xd9d4d039);d=HH(d,a,b,c,x[k+12],S32,0xe6db99e5);c=HH(c,d,a,b,x[k+15],S33,0x1fa27cf8);b=HH(b,c,d,a,x[k+2],S34,0xc4ac5665);",
  "a=II(a,b,c,d,x[k],S41,0xf4292244);d=II(d,a,b,c,x[k+7],S42,0x432aff97);c=II(c,d,a,b,x[k+14],S43,0xab9423a7);b=II(b,c,d,a,x[k+5],S44,0xfc93a039);",
  "a=II(a,b,c,d,x[k+12],S41,0x655b59c3);d=II(d,a,b,c,x[k+3],S42,0x8f0ccc92);c=II(c,d,a,b,x[k+10],S43,0xffeff47d);b=II(b,c,d,a,x[k+1],S44,0x85845dd1);",
  "a=II(a,b,c,d,x[k+8],S41,0x6fa87e4f);d=II(d,a,b,c,x[k+15],S42,0xfe2ce6e0);c=II(c,d,a,b,x[k+6],S43,0xa3014314);b=II(b,c,d,a,x[k+13],S44,0x4e0811a1);",
  "a=II(a,b,c,d,x[k+4],S41,0xf7537e82);d=II(d,a,b,c,x[k+11],S42,0xbd3af235);c=II(c,d,a,b,x[k+2],S43,0x2ad7d2bb);b=II(b,c,d,a,x[k+9],S44,0xeb86d391);",
  "a=au(a,AA);b=au(b,BB);c=au(c,CC);d=au(d,DD);}",
  "return(wh(a)+wh(b)+wh(c)+wh(d)).toLowerCase();}",
  "",
  "function extrairAdminUsers(nodeName){",
  "  try{",
  "    const items=$(nodeName).all();",
  "    const list = [];",
  "    for(const item of items){",
  "      const d = item.json || {};",
  "      if(d && (d.email || d.username || d.id) && !d.error) {",
  "        list.push(d);",
  "      }",
  "    }",
  "    return list;",
  "  }catch(e){ return []; }",
  "}",
  "",
  "const uGAS = extrairAdminUsers('Busca GASCTPNA_admin_users');",
  "const uIBR = extrairAdminUsers('Busca IBRASE_admin_users');",
  "const uAUN = extrairAdminUsers('Busca AUNI_admin_users');",
  "const uIVE = extrairAdminUsers('Busca IVEM_admin_users');",
  "",
  "const contas = [];",
  "uGAS.forEach(u => contas.push({ instituto: 'GASCTPNA', dados: u }));",
  "uIBR.forEach(u => contas.push({ instituto: 'IBRASE', dados: u }));",
  "uAUN.forEach(u => contas.push({ instituto: 'AUNI', dados: u }));",
  "uIVE.forEach(u => contas.push({ instituto: 'IVEM', dados: u }));",
  "",
  "if(contas.length === 0) return [{ json: { status: 'usuario nao encontrado', message: 'Usuário ou E-mail não encontrado no banco de dados' } }];",
  "",
  "const ld = $('Login Admin').first().json || {};",
  "const q = ld.query || {};",
  "const b = ld.body || {};",
  "const pass = String(b.password || q.password || b.senha || q.senha || '').trim();",
  "",
  "function checa(hash, p){",
  "  if(!hash || !p) return false;",
  "  hash = String(hash).trim(); p = String(p);",
  "  const hl = hash.toLowerCase();",
  "",
  "  if(hash.startsWith('$2')) {",
  "    try {",
  "      const bcryptObj = (typeof dpt_bcrypt !== 'undefined') ? dpt_bcrypt : (typeof bcrypt !== 'undefined' ? bcrypt : null);",
  "      const normHash = hash.replace(/^\\$2y\\$/, '$2a$');",
  "      if (bcryptObj && bcryptObj.compareSync) {",
  "        if (bcryptObj.compareSync(p, normHash) || bcryptObj.compareSync(p.trim(), normHash)) return true;",
  "      }",
  "    } catch(e) {}",
  "  }",
  "",
  "  if(hl === md5(p).toLowerCase() || hl === md5(p.trim()).toLowerCase()) return true;",
  "  if(hash === p || hash === p.trim() || hl === p.toLowerCase()) return true;",
  "  return false;",
  "}",
  "",
  "let contaAprovada = null;",
  "let requerAtualizacao = false;",
  "",
  "for(const c of contas){",
  "  const h = String(c.dados.password_hash || c.dados.senha || c.dados.password || '').trim();",
  "  if(checa(h, pass)){",
  "    contaAprovada = c;",
  "    break;",
  "  }",
  "  // Identifica se a senha usa Argon2",
  "  if(h.startsWith('$argon2')) {",
  "    requerAtualizacao = true;",
  "  }",
  "}",
  "",
  "if(!contaAprovada) {",
  "  if (requerAtualizacao) {",
  "    return [{ json: { status: 'requer_atualizacao', usuario: (q.email || b.email || q.username || b.username), message: 'Sua senha usa um formato antigo e precisa ser atualizada com a chave mestra.' } }];",
  "  }",
  "  return [{ json: { status: 'senha incorreta', message: 'Senha incorreta. Verifique sua senha.' } }];",
  "}",
  "",
  "const user = contaAprovada.dados;",
  "const institutosPermitidos = Array.from(new Set(contas.map(c => c.instituto)));",
  "",
  "return [{",
  "  json: {",
  "    status: 'login aprovado',",
  "    id: user.id,",
  "    nome: user.name || user.nome || user.username || '',",
  "    username: user.username || '',",
  "    email: user.email || '',",
  "    cargo: user.cargo || user.account_type || 'Colaborador',",
  "    account_type: user.account_type || 'colaborador',",
  "    instituto_ativo: contaAprovada.instituto,",
  "    institutos_permitidos: institutosPermitidos",
  "  }",
  "}];"
].join('\n');

const filterKey = "={{ ($json.query?.username || $json.body?.username || $json.query?.email || $json.body?.email || '').includes('@') ? 'email' : 'username' }}";
const filterVal = "={{ ($json.query?.username || $json.body?.username || $json.query?.email || $json.body?.email || '').toLowerCase().trim() }}";

const mkSupabaseAdminUserNode = (table, pos, id, name) => ({
  parameters: {
    operation: 'getAll',
    tableId: table,
    returnAll: true,
    filters: {
      conditions: [
        { keyName: filterKey, condition: 'eq', keyValue: filterVal }
      ]
    }
  },
  type: 'n8n-nodes-base.supabase',
  typeVersion: 1,
  position: pos,
  id,
  name,
  alwaysOutputData: true,
  credentials: { supabaseApi: { id: '9PCPmBxs55B86AyO', name: 'IBRASE' } }
});

const workflowAdminUsers = {
  name: 'Login Admin User Multi Institutos - INTEGRA (COM MASTER KEY)',
  nodes: [
    {
      parameters: {
        httpMethod: 'POST',
        path: 'loginadmin',
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
      position: [-640, 128],
      id: 'webhook-login-admin',
      name: 'Login Admin',
      webhookId: 'login-admin-webhook-id'
    },
    mkSupabaseAdminUserNode('GASCTPNA_admin_users', [-352, -60], 'node-gasctpna-admin', 'Busca GASCTPNA_admin_users'),
    mkSupabaseAdminUserNode('IBRASE_admin_users',   [-352,   70], 'node-ibrase-admin',   'Busca IBRASE_admin_users'),
    mkSupabaseAdminUserNode('AUNI_admin_users',     [-352,  200], 'node-auni-admin',     'Busca AUNI_admin_users'),
    mkSupabaseAdminUserNode('IVEM_admin_users',     [-352,  330], 'node-ivem-admin',     'Busca IVEM_admin_users'),
    {
      parameters: { numberInputs: 4 },
      type: 'n8n-nodes-base.merge',
      typeVersion: 3,
      position: [-48, 128],
      id: 'node-merge-admin',
      name: 'Juntar 4 Buscas Admin Users'
    },
    {
      parameters: { jsCode: jsValidacaoAdminUser },
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [256, 128],
      id: 'node-valida-admin',
      name: 'Validação e Autenticação Admin User'
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: "={{ JSON.stringify($json) }}",
        options: {}
      },
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.5,
      position: [512, 128],
      id: 'node-respond-admin',
      name: 'Resposta Webhook Admin'
    }
  ],
  connections: {
    'Login Admin': {
      main: [[
        { node: 'Busca GASCTPNA_admin_users', type: 'main', index: 0 },
        { node: 'Busca IBRASE_admin_users', type: 'main', index: 0 },
        { node: 'Busca AUNI_admin_users', type: 'main', index: 0 },
        { node: 'Busca IVEM_admin_users', type: 'main', index: 0 }
      ]]
    },
    'Busca GASCTPNA_admin_users': { main: [[{ node: 'Juntar 4 Buscas Admin Users', type: 'main', index: 0 }]] },
    'Busca IBRASE_admin_users':   { main: [[{ node: 'Juntar 4 Buscas Admin Users', type: 'main', index: 1 }]] },
    'Busca AUNI_admin_users':     { main: [[{ node: 'Juntar 4 Buscas Admin Users', type: 'main', index: 2 }]] },
    'Busca IVEM_admin_users':     { main: [[{ node: 'Juntar 4 Buscas Admin Users', type: 'main', index: 3 }]] },
    'Juntar 4 Buscas Admin Users':{ main: [[{ node: 'Validação e Autenticação Admin User', type: 'main', index: 0 }]] },
    'Validação e Autenticação Admin User': { main: [[{ node: 'Resposta Webhook Admin', type: 'main', index: 0 }]] }
  }
};

const jsonContent = JSON.stringify(workflowAdminUsers, null, 2);
fs.writeFileSync('workflow_n8n_login_admin_multi_institutos.json', jsonContent, 'utf8');
fs.writeFileSync('Interno_integra/workflow_n8n_login_admin_multi_institutos.json', jsonContent, 'utf8');
console.log('Workflow Login atualizado para detectar Argon2 e pedir Chave Mestra!');
