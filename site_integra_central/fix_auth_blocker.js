const fs = require('fs');
let f = fs.readFileSync('matricula.html', 'utf8');

const regex = /\/\/ === VERIFICAÇÃO DE SEGURANÇA E ACESSO ===[\s\S]*?\}\)\(\);/;

const replacement = `// === VERIFICAÇÃO DE SEGURANÇA E ACESSO ===
    (function(){
        try {
            var finalInst = getInst();
            if (finalInst) {
                var isLogged = sessionStorage.getItem('usuario_id') || localStorage.getItem('usuario_id');
                if (!isLogged) {
                    var targetLogin = '/' + finalInst.toLowerCase() + '/login';
                    window.location.replace(targetLogin);
                    return;
                }

                var stInst = sessionStorage.getItem('instituto_ativo') || localStorage.getItem('instituto_ativo');
                var permitidos = [];
                if (stInst) permitidos.push(stInst.toUpperCase());
                
                var rawPerm = sessionStorage.getItem('institutos_permitidos') || localStorage.getItem('institutos_permitidos');
                if (rawPerm) {
                    try {
                        var parsed = JSON.parse(rawPerm);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(function(p) { permitidos.push(String(p).toUpperCase()); });
                        }
                    } catch(e) {}
                }
                
                if (permitidos.length > 0 && permitidos.indexOf(finalInst) === -1) {
                    var targetArea = '/' + finalInst.toLowerCase() + '/area_aluno';
                    window.location.replace(targetArea);
                    return;
                }
            }
        } catch(e) {
            console.error('Erro na verificação de segurança', e);
        }
    })();`;

f = f.replace(regex, replacement);
fs.writeFileSync('matricula.html', f);
