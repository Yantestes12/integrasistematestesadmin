import React from "react";

export default function LgpdPublica() {
  const instituto = typeof window !== "undefined"
    ? window.location.pathname.split("/")[1] || "ivem"
    : "ivem";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "white", fontFamily: "sans-serif" }}>
      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,20,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Política de Privacidade e Proteção de Dados</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>Plataforma INTEGRA · LGPD (Lei nº 13.709/2018) · Versão 1.0 — 2026</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

        {/* INTRO */}
        <div style={{ borderRadius: 16, border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.07)", padding: 24, marginBottom: 40 }}>
          <p style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            Esta Política de Privacidade descreve como o <strong style={{ color: "white" }}>Instituto IVEM</strong>, por meio
            da <strong style={{ color: "white" }}>Plataforma INTEGRA</strong>, coleta, utiliza, armazena e protege os dados
            pessoais dos usuários, em conformidade com a{" "}
            <strong style={{ color: "white" }}>Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018)</strong>.
          </p>
          <p style={{ color: "#6b7280", fontSize: 11, marginTop: 12, marginBottom: 0 }}>
            Última atualização: <strong style={{ color: "#9ca3af" }}>29 de agosto de 2026</strong> · Versão <strong style={{ color: "#9ca3af" }}>v1.0</strong>
          </p>
        </div>

        {/* SEÇÕES */}
        {sections.map((s, i) => (
          <section key={i} style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "white" }}>{i + 1}. {s.title}</h2>
            </div>
            <div style={{ paddingLeft: 0, fontSize: 14, color: "#d1d5db", lineHeight: 1.8 }}>
              {s.content}
            </div>
          </section>
        ))}

        {/* DIREITOS */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✅</div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "white" }}>9. Direitos dos Titulares</h2>
          </div>
          <p style={{ color: "#d1d5db", marginBottom: 16 }}>Nos termos do Art. 18 da LGPD, você tem direito a:</p>
          <div style={{ display: "grid", gap: 8 }}>
            {rights.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#60a5fa", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 13 }}>{r.title}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, borderRadius: 12, border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.07)", padding: 16, fontSize: 12, color: "#93c5fd" }}>
            Para exercer seus direitos, envie solicitação para{" "}
            pelo canal de atendimento do instituto.
            Prazo de resposta: <strong>15 dias úteis</strong>.
          </div>
        </section>

        {/* CONTATO */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📧</div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "white" }}>13. Canal de Contato</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>📧 E-mail do DPO</div>
              pelo canal de atendimento do instituto
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>🏛️ ANPD</div>
              <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" style={{ color: "#60a5fa", fontSize: 13 }}>www.gov.br/anpd</a>
            </div>
          </div>
        </section>

        {/* VOLTAR */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button onClick={() => window.history.back()} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#9ca3af", padding: "12px 32px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            ← Voltar
          </button>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#4b5563", fontSize: 12, margin: 0 }}>© 2026 Instituto IVEM · Plataforma INTEGRA · LGPD v1.0</p>
      </footer>
    </div>
  );
}

const sections = [
  {
    icon: "👤",
    title: "Quem somos — O Controlador",
    content: (
      <p>O <strong style={{ color: "white" }}>Instituto IVEM</strong>, com sede em Campos dos Goytacazes — RJ, é o <strong style={{ color: "white" }}>Controlador</strong> dos dados pessoais tratados por meio desta plataforma. A <strong style={{ color: "white" }}>Plataforma INTEGRA</strong>, desenvolvida e operada pela Plataforma INTEGRA, atua como <strong style={{ color: "white" }}>Operador</strong> em nome do Instituto.</p>
    ),
  },
  {
    icon: "📋",
    title: "Encarregado de Dados (DPO)",
    content: (
      <p>O Instituto designou um Encarregado de Proteção de Dados (DPO) nos termos do Art. 41 da LGPD. Contato: pelo canal de atendimento do instituto — atendimento de segunda a sexta, das 9h às 18h.</p>
    ),
  },
  {
    icon: "🗄️",
    title: "Dados Coletados",
    content: (
      <div>
        <p style={{ marginBottom: 12 }}>Coletamos diretamente do titular ou de responsáveis legais (menores):</p>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {["Nome completo, CPF, data de nascimento, sexo, raça/cor", "WhatsApp, e-mail, endereço completo (CEP, logradouro, bairro, cidade, UF)", "Faixa salarial, escolaridade, condição profissional", "Altura, peso, tamanho de vestuário", "Medicação, alergias, plano de saúde, restrições físicas, necessidades especiais (dados sensíveis)", "CPF, nome, parentesco e contato do responsável (para menores)", "Instagram e redes sociais (opcional)", "IP, navegador e logs de acesso (automático)"].map((item, i) => (
            <li key={i} style={{ marginBottom: 6, color: "#d1d5db" }}>{item}</li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    icon: "🎯",
    title: "Finalidades e Bases Legais (Art. 7º LGPD)",
    content: (
      <div>
        <p>Tratamos seus dados para: gestão de matrículas e eventos (execução de contrato); comunicações operacionais; obrigações legais; análise estatística e melhoria de programas (legítimo interesse); segurança dos sistemas; adequação de atividades físicas para dados de saúde (proteção da vida/tutela da saúde); e marketing opcional (consentimento).</p>
        <div style={{ marginTop: 12, borderRadius: 12, border: "1px solid rgba(234,179,8,0.3)", background: "rgba(234,179,8,0.07)", padding: 12, fontSize: 12, color: "#fde68a" }}>
          ⚠️ <strong>Dados de saúde</strong> são dados sensíveis (Art. 11 LGPD) e recebem proteção reforçada, utilizados exclusivamente para adequar as atividades às condições do participante.
        </div>
      </div>
    ),
  },
  {
    icon: "🔗",
    title: "Compartilhamento de Dados",
    content: (
      <div>
        <p style={{ marginBottom: 12 }}><strong style={{ color: "white" }}>Não vendemos dados pessoais.</strong> Compartilhamos apenas com:</p>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {["Plataforma INTEGRA (operador técnico — sob contrato com obrigações de confidencialidade)", "Supabase Inc. (banco de dados em nuvem com criptografia AES-256)", "N8N (automação de fluxos — não armazena dados permanentemente)", "Autoridades públicas (apenas por exigência legal ou ordem judicial)", "Parceiros governamentais (prestação de contas de programas sociais, com anonimização sempre que possível)"].map((item, i) => (
            <li key={i} style={{ marginBottom: 6, color: "#d1d5db" }}>{item}</li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    icon: "🌍",
    title: "Transferência Internacional",
    content: <p>Dados podem ser processados por provedores internacionais (Supabase) com garantias adequadas: cláusulas contratuais padrão, provedores certificados sob normas equivalentes (GDPR) e criptografia em trânsito e em repouso.</p>,
  },
  {
    icon: "🗑️",
    title: "Retenção e Exclusão",
    content: (
      <div>
        <p style={{ marginBottom: 12 }}>Prazos de retenção:</p>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {["Dados de matrícula e eventos: 5 anos após encerramento do vínculo (obrigação legal)", "Dados de saúde: 5 anos (legislação sanitária)", "Logs de acesso: 6 meses (Marco Civil da Internet)", "Dados de marketing: até revogação do consentimento", "Dados de menores após maioridade: confirmação ou exclusão em até 30 dias após os 18 anos"].map((item, i) => (
            <li key={i} style={{ marginBottom: 6, color: "#d1d5db" }}>{item}</li>
          ))}
        </ul>
        <p style={{ marginTop: 12 }}>Após o prazo, os dados são <strong style={{ color: "white" }}>excluídos ou anonimizados</strong>.</p>
      </div>
    ),
  },
  {
    icon: "🔐",
    title: "Segurança da Informação",
    content: (
      <div>
        <p style={{ marginBottom: 12 }}>Medidas adotadas:</p>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {["Criptografia AES-256 para dados em repouso", "TLS/HTTPS para toda comunicação", "Controle de acesso por perfis com autenticação multifator", "Logs de auditoria de todas as operações críticas", "Backups criptografados periódicos", "Monitoramento contínuo de anomalias e tentativas de invasão"].map((item, i) => (
            <li key={i} style={{ marginBottom: 6, color: "#d1d5db" }}>{item}</li>
          ))}
        </ul>
        <div style={{ marginTop: 12, borderRadius: 12, border: "1px solid rgba(234,179,8,0.3)", background: "rgba(234,179,8,0.07)", padding: 12, fontSize: 12, color: "#fde68a" }}>
          ⚠️ Em caso de incidente que possa causar risco relevante, comunicaremos à ANPD e aos titulares dentro do prazo legal.
        </div>
      </div>
    ),
  },
  {
    icon: "🍪",
    title: "Cookies e Rastreamento",
    content: <p>Utilizamos cookies estritamente necessários (sessão/autenticação), funcionais (preferências do usuário — 1 ano) e analíticos anônimos (melhoria do sistema — 2 anos). Você pode gerenciar cookies pelas configurações do navegador. A desativação de cookies essenciais pode impedir o funcionamento da plataforma.</p>,
  },
  {
    icon: "👶",
    title: "Menores de 18 Anos",
    content: (
      <div>
        <p>O tratamento de dados de menores exige o <strong style={{ color: "white" }}>consentimento específico de pelo menos um dos pais ou responsável legal</strong>, conforme Art. 14 da LGPD.</p>
        <div style={{ marginTop: 12, borderRadius: 12, border: "1px solid rgba(234,179,8,0.3)", background: "rgba(234,179,8,0.07)", padding: 12, fontSize: 12, color: "#fde68a" }}>
          ⚠️ Ao preencher o formulário de um menor, o responsável legal declara possuir autoridade legal para consentir e assume responsabilidade pela veracidade das informações.
        </div>
      </div>
    ),
  },
  {
    icon: "🔔",
    title: "Alterações a esta Política",
    content: <p>Quando alterações relevantes ocorrerem, notificaremos por e-mail ou aviso na plataforma, atualizaremos a data desta política e versões anteriores ficarão disponíveis mediante solicitação. O uso continuado implica aceitação da nova versão.</p>,
  },
  {
    icon: "⚖️",
    title: "Legislação Aplicável e Foro",
    content: <p>Esta política é regida pela legislação brasileira, em especial a LGPD (Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014) e o Código de Defesa do Consumidor (Lei nº 8.078/1990). Fica eleito o foro da comarca de Campos dos Goytacazes — RJ para dirimir quaisquer controvérsias.</p>,
  },
];

const rights = [
  { title: "Confirmação e Acesso", desc: "Confirmar a existência do tratamento e acessar seus dados pessoais." },
  { title: "Correção", desc: "Solicitar correção de dados incompletos, inexatos ou desatualizados." },
  { title: "Anonimização / Bloqueio / Eliminação", desc: "De dados desnecessários, excessivos ou tratados em desconformidade com a LGPD." },
  { title: "Portabilidade", desc: "Receber seus dados em formato estruturado e interoperável." },
  { title: "Eliminação com consentimento", desc: "Solicitar eliminação dos dados tratados com base em consentimento." },
  { title: "Informação sobre compartilhamento", desc: "Saber com quais entidades públicas e privadas seus dados são compartilhados." },
  { title: "Revogação do consentimento", desc: "Retirar consentimento a qualquer momento, sem prejuízo do tratamento anterior." },
  { title: "Oposição", desc: "Opor-se ao tratamento baseado em legítimo interesse quando não adequado à sua situação." },
];


