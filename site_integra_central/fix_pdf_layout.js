const fs = require('fs');

// 1. Fix area_aluno.html PDF Button and auto-print
let areaAlunoPath = 'area_aluno.html';
let areaHtml = fs.readFileSync(areaAlunoPath, 'utf8');

// The original button at the top
const printBtnHtml = '<div class="no-print" style="text-align:right;padding:6px;margin-bottom:8px;"><button onclick="window.print()" style="background:#003fa3;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:bold;cursor:pointer;">🖨️ Imprimir / Salvar em PDF</button></div>';
const newPrintBtnHtml = '<div class="no-print" style="text-align:center;padding:16px;margin-top:20px;border-top:1px dashed #cbd5e1;"><button onclick="window.print()" style="background:#059669;color:#fff;border:none;padding:12px 24px;border-radius:6px;font-weight:bold;font-size:11pt;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);">🖨️ BAIXAR OU IMPRIMIR PDF</button></div>';

// Replace the old button with empty (or keep it and add another at bottom)
areaHtml = areaHtml.replace(printBtnHtml, ''); // Remove from top

// Add auto-print script and button at the bottom of the body
areaHtml = areaHtml.replace(/<\/body><\/html>'\);/g, newPrintBtnHtml + '<script>setTimeout(function(){ window.print(); }, 800);</script></body></html>\');');

fs.writeFileSync(areaAlunoPath, areaHtml);

// 2. Fix matricula.html Address spacing
let matriculaPath = 'matricula.html';
let matHtml = fs.readFileSync(matriculaPath, 'utf8');

matHtml = matHtml.replace(/style="flex:0 0 130px;"/g, 'style="flex: 1; max-width: 140px;" class="address-field"');
matHtml = matHtml.replace(/style="flex:0 0 90px;"/g, 'style="flex: 1; max-width: 100px;" class="address-field"');
matHtml = matHtml.replace(/style="flex:0 0 80px;"/g, 'style="flex: 1; max-width: 90px;" class="address-field"');

fs.writeFileSync(matriculaPath, matHtml);
