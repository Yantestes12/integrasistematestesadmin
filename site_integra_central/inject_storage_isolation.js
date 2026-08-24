const fs = require('fs');

const snippet = `
  <!-- ISOLAMENTO DE ARMAZENAMENTO POR INSTITUTO (INJECTED) -->
  <script>
    (function(){
      try {
        var parts = window.location.pathname.toLowerCase().split('/').filter(Boolean);
        var def = 'GASCTPNA';
        if (parts.length > 0 && ['gasctpna','ibrase','auni','ivem'].includes(parts[0])) {
            def = parts[0].toUpperCase();
        } else {
            var urlParams = new URLSearchParams(window.location.search);
            var q = urlParams.get('instituto') || urlParams.get('instituicao');
            if (q) def = q.toUpperCase();
        }
        var prefix = def + '_';
        var keysToPrefix = ['usuario_logado', 'usuario_email', 'usuario_senha', 'email_conta', 'usuario_nome', 'usuario_primeiro_nome', 'usuario_telefone', 'telefone_conta', 'usuario_cpf', 'usuario_id', 'usuario_dados', 'usuario_dados_completos', 'institutos_permitidos', 'instituto_ativo', 'instituto', 'instituicao'];
        
        var origSet = Storage.prototype.setItem;
        var origGet = Storage.prototype.getItem;
        var origRem = Storage.prototype.removeItem;
        
        Storage.prototype.setItem = function(key, value) {
            if (keysToPrefix.includes(key)) key = prefix + key;
            origSet.call(this, key, value);
        };
        Storage.prototype.getItem = function(key) {
            if (keysToPrefix.includes(key)) key = prefix + key;
            return origGet.call(this, key);
        };
        Storage.prototype.removeItem = function(key) {
            if (keysToPrefix.includes(key)) key = prefix + key;
            origRem.call(this, key);
        };
      } catch(e) {}
    })();
  </script>
`;

const files = ['login.html', 'area_aluno.html', 'matricula.html'];

for (let file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove old snippet if it exists to avoid duplicates
    content = content.replace(/<!-- ISOLAMENTO DE ARMAZENAMENTO POR INSTITUTO \(INJECTED\) -->[\s\S]*?<\/script>/, '');
    
    // Inject right after <head> or <meta charset="UTF-8">
    content = content.replace(/(<head>[\s\S]*?<meta charset="[^"]*">|<head>)/i, '$1\n' + snippet);
    
    fs.writeFileSync(file, content);
}
console.log('Isolation injected!');
