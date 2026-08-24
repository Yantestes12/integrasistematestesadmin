const fs = require('fs');
let f = fs.readFileSync('matricula.html', 'utf8');

// 1. Fix the second getInst function to read from the path
f = f.replace(/var getInst = function\(\) \{\s*if \(window\.integraInstitutoFinal\) return window\.integraInstitutoFinal;\s*try \{\s*var urlParams = new URLSearchParams\(window\.location\.search\);/g, `var getInst = function() {
          if (window.integraInstitutoFinal) return window.integraInstitutoFinal;
          try {
              var parts = window.location.pathname.toLowerCase().split('/').filter(Boolean);
              if (parts.length > 0 && ['gasctpna','ibrase','auni','ivem'].includes(parts[0])) return parts[0].toUpperCase();
          } catch(e) {}
          try {
              var urlParams = new URLSearchParams(window.location.search);`);

// 2. Restore the login check (auth blocker) in DOMContentLoaded
// The previous change was:
// // REMOVIDO PARA PERMITIR MATRÍCULA ABERTA! (comentário ou remoção silenciosa)
// Let's find the exact place
f = f.replace(/var uLogado = sessionStorage\.getItem\('usuario_logado'\) === 'true' \|\| localStorage\.getItem\('usuario_logado'\) === 'true';\s*\/\/ REMOVIDO PARA PERMITIR MATRÍCULA ABERTA!/g, `var uLogado = sessionStorage.getItem('usuario_logado') === 'true' || localStorage.getItem('usuario_logado') === 'true';
              if (!uLogado) {
                  // Redirects to login if not authenticated
                  var currentInst = getInst().toLowerCase();
                  window.location.href = '/' + currentInst + '/login';
                  return;
              }`);

fs.writeFileSync('matricula.html', f);
