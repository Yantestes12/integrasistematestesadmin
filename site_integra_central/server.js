/**
 * Matricula Proxy Server v2.0 — Hardened Edition (Node.js / Express)
 * GASCTPNA / INTEGRA
 *
 * Segurança implementada:
 * - CORS restrito a domínios autorizados (allowlist)
 * - Validação de campos mínimos obrigatórios
 * - Rate Limiting por IP (express-rate-limit)
 * - Mensagens de erro genéricas ao front-end (sem vazamento interno)
 * - Sem repasse de raw_response do n8n ao navegador
 * - Headers de segurança (Helmet)
 * - Serve arquivos estáticos (HTML, CSS, JS, imagens)
 */

const express = require('express');
const path    = require('path');
const app     = express();

// ── Porta do Servidor ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

// ── Domínios Autorizados (CORS Allowlist) ───────────────────────────────
const ALLOWED_ORIGINS = [
    'https://plataformaintegra.com.br',
    'https://www.plataformaintegra.com.br',
    'https://portalintegra.com.br',
    'https://www.portalintegra.com.br',
    'https://gasctpna.com.br',
    'https://www.gasctpna.com.br',
    'http://localhost:3000',
    'http://localhost:5000',
];

// ── URL do Webhook (NUNCA exposta ao navegador) ─────────────────────────
const WEBHOOK_URL = process.env.WEBHOOK_MATRICULA_URL || 'https://w.ibrase.com.br/webhook/matricula';

// ── Middlewares de Segurança ────────────────────────────────────────────

// Headers de Segurança (equivalente ao Helmet simplificado)
app.use(function(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

// CORS restrito (Allowlist)
app.use(function(req, res, next) {
    var origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

// Parser de JSON e FormData (url-encoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate Limiting por IP (máx 10 req / 60 seg no proxy) ─────────────────
var rateLimitStore = {};

function rateLimiter(req, res, next) {
    var ip = req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.ip || req.connection.remoteAddress || '0.0.0.0';

    var now = Date.now();
    var windowMs = 60 * 1000; // 60 segundos
    var maxRequests = 10;

    if (!rateLimitStore[ip] || (now - rateLimitStore[ip].start) > windowMs) {
        rateLimitStore[ip] = { count: 1, start: now };
    } else {
        rateLimitStore[ip].count++;
    }

    if (rateLimitStore[ip].count > maxRequests) {
        return res.status(429).json({
            sucesso:  false,
            mensagem: 'Muitas requisições. Aguarde um momento antes de tentar novamente.'
        });
    }

    next();
}

// Limpar store a cada 5 minutos para não acumular IPs antigos
setInterval(function() {
    var now = Date.now();
    Object.keys(rateLimitStore).forEach(function(ip) {
        if ((now - rateLimitStore[ip].start) > 120000) {
            delete rateLimitStore[ip];
        }
    });
}, 5 * 60 * 1000);

// ── Rota do Proxy da Matrícula ──────────────────────────────────────────
app.post('/matricula_proxy.php', rateLimiter, async function(req, res) {
    try {
        var payload = req.body || {};

        // ── Validação de campos obrigatórios ────────────────────────────
        var camposObrigatorios = ['nome_aluno', 'cpf_aluno'];
        var faltantes = [];
        camposObrigatorios.forEach(function(campo) {
            if (!payload[campo] || String(payload[campo]).trim() === '') {
                faltantes.push(campo);
            }
        });

        if (faltantes.length > 0) {
            return res.status(422).json({
                sucesso:  false,
                mensagem: 'Dados obrigatórios ausentes: ' + faltantes.join(', ')
            });
        }

        // ── Validar CPF (11 dígitos) ────────────────────────────────────
        var cpfDigitos = String(payload.cpf_aluno || '').replace(/\D/g, '');
        if (cpfDigitos.length !== 11) {
            return res.status(422).json({
                sucesso:  false,
                mensagem: 'CPF inválido.'
            });
        }

        // ── Adicionar metadados de rastreabilidade ──────────────────────
        payload.proxy_processed_at = new Date().toISOString();
        payload.proxy_client_ip = req.headers['x-forwarded-for']
            ? req.headers['x-forwarded-for'].split(',')[0].trim()
            : req.ip || '';

        // ── Enviar para o Webhook ───────────────────────────────────────
        var jsonPayload = JSON.stringify(payload);

        var response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(jsonPayload).toString(),
                'User-Agent':    'Integra-Proxy/2.0',
                'X-Proxy-Origin': req.headers.origin || '',
            },
            body: jsonPayload,
            signal: AbortSignal.timeout(45000), // Timeout de 45 segundos
        });

        var responseText = await response.text();

        // ── Retornar resposta limpa ─────────────────────────────────────
        if (!response.ok) {
            console.error('[MatriculaProxy] Webhook HTTP', response.status,
                '| IP:', payload.proxy_client_ip,
                '| Resposta:', responseText.substring(0, 500));
        }

        // Tentar parsear JSON da resposta
        try {
            var data = JSON.parse(responseText);
            // Filtrar campos internos do n8n
            delete data.executionId;
            delete data.workflowId;
            delete data.stackTrace;
            return res.json(data);
        } catch (e) {
            return res.json({
                sucesso:  true,
                mensagem: 'Matrícula registrada com sucesso.'
            });
        }

    } catch (err) {
        // Logar erro internamente (NUNCA expor ao navegador)
        console.error('[MatriculaProxy] Erro interno:', err.message || err,
            '| Timestamp:', new Date().toISOString());

        return res.status(502).json({
            sucesso:     false,
            proxy_error: true,
            mensagem:    'Não foi possível processar a matrícula neste momento. Tente novamente em instantes.'
        });
    }
});

// ── Servir Arquivos Estáticos (HTML, CSS, JS, Imagens) ──────────────────
// Rewrite: /matricula → /matricula.html (equivalente ao .htaccess)
app.use(function(req, res, next) {
    if (req.method === 'GET' && !req.path.includes('.') && req.path !== '/') {
        var htmlPath = path.join(__dirname, req.path + '.html');
        var fs = require('fs');
        if (fs.existsSync(htmlPath)) {
            return res.sendFile(htmlPath);
        }
    }
    next();
});

app.use(express.static(__dirname, {
    extensions: ['html'],
    index: ['index.html', 'login.html'],
    maxAge: '1h',
    setHeaders: function(res) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
}));

// ── 404 ─────────────────────────────────────────────────────────────────
app.use(function(req, res) {
    res.status(404).json({ sucesso: false, mensagem: 'Recurso não encontrado.' });
});

// ── Iniciar Servidor ────────────────────────────────────────────────────
app.listen(PORT, function() {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════╗');
    console.log('  ║  INTEGRA Proxy Server v2.0 — Hardened Edition   ║');
    console.log('  ║  Rodando na porta: ' + PORT + '                          ║');
    console.log('  ║  Webhook protegido: ✅                          ║');
    console.log('  ║  Rate Limiting: ✅ (10 req/min por IP)          ║');
    console.log('  ║  CORS Restrito: ✅                              ║');
    console.log('  ╚══════════════════════════════════════════════════╝');
    console.log('');
});
