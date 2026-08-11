import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Power, CheckCircle2, Clock, MapPin, Building2, User, Phone, AlertCircle, AlertTriangle, Trash2, Loader2, X, Archive, Download, Printer, Layers } from "lucide-react";
import ToastContainer, { type ToastMessage } from "../../components/Toast";

export interface EspacoItem {
  id: number;
  projeto_id?: number;
  modalidade_id?: number;
  nome: string;
  resp_cpf?: string;
  resp_cnpj?: string;
  resp_nome?: string;
  resp_email?: string;
  resp_telefone?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  ponto_referencia?: string;
  cidade?: string;
  uf?: string;
  horarios?: any;
  foto_url?: string;
  termo_url?: string;
  ativo?: boolean;
  status_aprovacao?: string; // 'aprovado' | 'pendente' | 'rejeitado'
  projeto_nome?: string;
  nucleo_nome?: string;
  em_uso?: boolean;
  created_at?: string;
}

export default function Espacos() {
  const [espacos, setEspacos] = useState<EspacoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"todos" | "em_uso" | "disponiveis" | "incompletos" | "solicitacoes">("todos");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [togglingDocsId, setTogglingDocsId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Sistema de Notificações Flutuantes (Toasts)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "warning" | "error" | "info", title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Modal de Exclusão com Trava de 25 Segundos & Animação Lógica de Despinçar do Mapa & Dobrar Planta
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteEspaco, setSelectedDeleteEspaco] = useState<EspacoItem | null>(null);
  const [countdown, setCountdown] = useState(25);
  const [isUnpinning, setIsUnpinning] = useState(false);

  // Modal / Visualização para Download da Ficha Oficial em PDF / Impressão
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedPrintEspaco, setSelectedPrintEspaco] = useState<EspacoItem | null>(null);
  const [printTimestamp, setPrintTimestamp] = useState<string>("");

  useEffect(() => {
    fetchEspacos();
  }, []);

  // Timer de Trava de Segurança (25 segundos)
  useEffect(() => {
    if (!deleteModalOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [deleteModalOpen, countdown]);

  const flattenResponse = (rawData: any): any[] => {
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (rawData && typeof rawData === 'object') {
      if (Array.isArray(rawData.data)) list = rawData.data;
      else if (Array.isArray(rawData.items)) list = rawData.items;
      else if (rawData.json) list = Array.isArray(rawData.json) ? rawData.json : [rawData.json];
      else list = [rawData];
    }

    let flatList: any[] = [];
    list.forEach(entry => {
      if (entry && entry.json) {
        if (Array.isArray(entry.json)) {
          flatList.push(...entry.json);
        } else {
          flatList.push(entry.json);
        }
      } else if (Array.isArray(entry)) {
        flatList.push(...entry);
      } else {
        flatList.push(entry);
      }
    });
    return flatList;
  };

  const fetchEspacos = async () => {
    setLoading(true);
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      
      let rawList: any[] = [];
      let nMap: Record<number, string> = {};

      const [resE, resN] = await Promise.allSettled([
        fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${authInstitute.toUpperCase()}`),
        fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${authInstitute.toUpperCase()}`)
      ]);

      let nDataList: any[] = [];
      if (resN.status === "fulfilled" && resN.value && resN.value.ok) {
        try {
          const nData = await resN.value.json();
          nDataList = flattenResponse(nData);
          nDataList.forEach((n: any) => {
            if (n.espaco_id) {
              nMap[Number(n.espaco_id)] = n.nome || `Núcleo #${n.id}`;
            }
          });
        } catch (err) {
          console.warn("Erro ao ler núcleos:", err);
        }
      }

      if (resE.status === "fulfilled" && resE.value && resE.value.ok) {
        try {
          const data = await resE.value.json();
          rawList = flattenResponse(data);
        } catch (err) {
          console.warn("Erro ao ler espaços:", err);
        }
      }

      // Fallback: se a tabela de espaços do N8N não retornou itens, gera a lista a partir dos núcleos legados
      if (rawList.length === 0 && nDataList.length > 0) {
        rawList = nDataList.map((n: any) => ({
          id: n.espaco_id || n.id,
          nome: n.nome || `Espaço ${n.bairro || n.id}`,
          bairro: n.bairro,
          resp_nome: n.resp_nome,
          resp_cpf: n.resp_cpf,
          resp_telefone: n.resp_telefone,
          resp_email: n.resp_email,
          cep: n.cep,
          rua: n.rua,
          numero: n.numero,
          ponto_referencia: n.ponto_referencia,
          foto_url: n.foto_url,
          termo_url: n.termo_url,
          status_aprovacao: n.status_aprovacao || "aprovado",
          ativo: n.ativo !== false,
          nucleo_nome: n.nome,
          em_uso: true,
        }));
      }

      const list = rawList.map((item: any) => {
        const status = (item.status_aprovacao || "aprovado").toString().toLowerCase().trim();

        const linkedNucleo = nMap[Number(item.id)] || item.nucleo_nome || (item.projeto_nome ? `Núcleo ${item.nome}` : null);

        return {
          ...item,
          status_aprovacao: status,
          nucleo_nome: linkedNucleo,
          em_uso: !!linkedNucleo,
        };
      });

      setEspacos(list);
    } catch (e) {
      console.error("Erro ao buscar espaços:", e);
      addToast("error", "Erro de Conexão", "Não foi possível carregar os espaços do servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivo = async (espaco: EspacoItem) => {
    setTogglingId(espaco.id);
    const nextVal = !espaco.ativo;
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const res = await fetch("https://w.ibrase.com.br/webhook/espacos-put", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: espaco.id, ativo: nextVal, instituto: authInstitute.toUpperCase() }),
      });
      if (res.ok) {
        setEspacos(prev => prev.map(e => e.id === espaco.id ? { ...e, ativo: nextVal } : e));
        addToast(
          nextVal ? "success" : "warning",
          nextVal ? "ESPAÇO ATIVADO" : "ESPAÇO DESATIVADO",
          `O espaço "${espaco.nome}" foi ${nextVal ? "ativado" : "desativado"} com sucesso.`
        );
      }
    } catch (e) {
      console.error("Erro ao alterar status:", e);
      addToast("error", "Erro ao Alterar Status", "Falha na comunicação com o servidor.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleAprovarEspaco = async (espaco: EspacoItem) => {
    setApprovingId(espaco.id);
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const res = await fetch("https://w.ibrase.com.br/webhook/espacos-put", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: espaco.id,
          status_aprovacao: "aprovado",
          instituto: authInstitute.toUpperCase()
        }),
      });
      if (res.ok) {
        setEspacos(prev => prev.map(e => e.id === espaco.id ? { ...e, status_aprovacao: "aprovado" } : e));
        addToast("success", "ESPAÇO APROVADO!", `O espaço "${espaco.nome}" foi aprovado e inserido nos Espaços Cadastrados.`);
      }
    } catch (e) {
      console.error("Erro ao aprovar espaço:", e);
      addToast("error", "Erro na Aprovação", "Não foi possível aprovar a solicitação.");
    } finally {
      setApprovingId(null);
    }
  };


  const openDeleteModal = (espaco: EspacoItem) => {
    setSelectedDeleteEspaco(espaco);
    setCountdown(25); // Trava de 25 segundos
    setIsUnpinning(false);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deletingId) return;
    setDeleteModalOpen(false);
    setSelectedDeleteEspaco(null);
    setCountdown(25);
    setIsUnpinning(false);
  };

  const handleConfirmDeleteEspaco = async () => {
    if (!selectedDeleteEspaco || countdown > 0 || deletingId) return;
    setDeletingId(selectedDeleteEspaco.id);
    setIsUnpinning(true);

    setTimeout(async () => {
      try {
        const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
        
        let res = await fetch("https://w.ibrase.com.br/webhook/espacos-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedDeleteEspaco.id, instituto: authInstitute.toUpperCase() }),
        });

        if (!res.ok) {
          res = await fetch(`https://w.ibrase.com.br/webhook/espacos-delete?id=${selectedDeleteEspaco.id}&instituto=${authInstitute.toUpperCase()}`, {
            method: "DELETE",
          });
        }

        if (res.ok) {
          const nomeRemovido = selectedDeleteEspaco.nome;
          setEspacos(prev => prev.filter(e => e.id !== selectedDeleteEspaco.id));
          setDeleteModalOpen(false);
          setSelectedDeleteEspaco(null);
          addToast("success", "ESPAÇO REMOVIDO", `O espaço "${nomeRemovido}" foi desvinculado com sucesso.`);
        } else {
          addToast("error", "Falha ao Excluir", "Erro ao executar webhook N8N_ESPACOS_DELETE.");
        }
      } catch (e) {
        console.error("Erro ao excluir espaço:", e);
        addToast("error", "Erro de Conexão", "Erro ao conectar com o servidor para excluir.");
      } finally {
        setDeletingId(null);
        setIsUnpinning(false);
      }
    }, 1100);
  };

  const getInstituteLogo = (instName: string) => {
    const inst = (instName || "").toUpperCase();
    if (inst.includes("GASCTPNA")) return "/logo_gasctpna.png";
    if (inst.includes("IBRASE")) return "/logo_ibrase.png";
    if (inst.includes("AUNI")) return "/logo_auni.png";
    if (inst.includes("IVEM")) return "/logo_ivem.png";
    return "/logo_integra.png";
  };

  const getInstituteTheme = (instName: string) => {
    const inst = (instName || "").toUpperCase();
    if (inst.includes("IBRASE")) {
      return {
        borderMain: "border-orange-600",
        borderHeader: "border-orange-600",
        bgHeader: "bg-orange-600 text-white",
        textPrimary: "text-orange-950",
        textCode: "text-orange-700",
        badgeBg: "bg-orange-100 text-orange-900 border-orange-300",
        blockBg: "bg-orange-50/60 border-orange-200",
        iconColor: "text-orange-600",
        footerBorder: "border-orange-600"
      };
    }
    if (inst.includes("IVEM")) {
      return {
        borderMain: "border-blue-600",
        borderHeader: "border-blue-600",
        bgHeader: "bg-blue-600 text-white",
        textPrimary: "text-blue-950",
        textCode: "text-blue-700",
        badgeBg: "bg-blue-100 text-blue-900 border-blue-300",
        blockBg: "bg-blue-50/60 border-blue-200",
        iconColor: "text-blue-600",
        footerBorder: "border-blue-600"
      };
    }
    if (inst.includes("AUNI")) {
      return {
        borderMain: "border-purple-700",
        borderHeader: "border-purple-700",
        bgHeader: "bg-purple-700 text-white",
        textPrimary: "text-purple-950",
        textCode: "text-purple-700",
        badgeBg: "bg-purple-100 text-purple-900 border-purple-300",
        blockBg: "bg-purple-50/60 border-purple-200",
        iconColor: "text-purple-700",
        footerBorder: "border-purple-700"
      };
    }
    // GASCTPNA (Default - Verde)
    return {
      borderMain: "border-emerald-800",
      borderHeader: "border-emerald-700",
      bgHeader: "bg-emerald-800 text-white",
      textPrimary: "text-emerald-950",
      textCode: "text-emerald-800",
      badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
      blockBg: "bg-emerald-50/50 border-emerald-200",
      iconColor: "text-emerald-700",
      footerBorder: "border-emerald-800"
    };
  };

  // Função para Baixar Ficha Oficial diretamente em PDF sem página em branco
  const handleOpenPrintFicha = (espaco: EspacoItem) => {
    const printWin = window.open("", "_blank", "width=850,height=1000");
    if (!printWin) {
      alert("Por favor, permita popups neste navegador para visualizar e baixar a Ficha PDF.");
      return;
    }

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR")}`;
    const instituteLogo = getInstituteLogo(authInstitute);

    const docContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Ficha Técnica - ${espaco.nome}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; background: #fff; }
            .header { border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
            .logo-area { display: flex; align-items: center; gap: 16px; }
            .logo { height: 52px; object-fit: contain; }
            .tag { background: #0f172a; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 6px; }
            .title { font-size: 20px; font-weight: 900; margin: 0; text-transform: uppercase; color: #0f172a; }
            .subtitle { font-size: 11px; color: #64748b; margin: 2px 0 0 0; font-weight: 500; }
            .code-box { text-align: right; border-left: 2px solid #e2e8f0; padding-left: 16px; }
            .code-label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; display: block; }
            .code-val { font-size: 18px; font-weight: 900; color: #0f172a; }
            .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 18px; }
            .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0; padding-bottom: 6px; border-bottom: 1px solid #cbd5e1; color: #1e293b; }
            .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
            .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
            .field-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 2px; }
            .field-value { font-size: 12px; font-weight: 800; color: #0f172a; }
            .status-badge { background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; display: inline-block; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-area">
              <img src="${instituteLogo}" class="logo" alt="Logo" />
              <div>
                <span class="tag">INSTITUTO ${authInstitute} • PLATAFORMA INTEGRA</span>
                <h1 class="title">Ficha Técnica do Espaço</h1>
                <p class="subtitle">Documento Oficial de Cadastramento e Infraestrutura Operacional</p>
              </div>
            </div>
            <div class="code-box">
              <span class="code-label">Código do Espaço</span>
              <div class="code-val">#ESP-${espaco.id}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">1. Identificação da Instalação Física</div>
            <div class="grid-2">
              <div>
                <div class="field-label">Descrição do Espaço</div>
                <div class="field-value" style="font-size: 14px;">${espaco.nome}</div>
              </div>
              <div>
                <div class="field-label">Status da Instalação</div>
                <div><span class="status-badge">✓ Cadastrado e Operacional</span></div>
              </div>
            </div>
            ${espaco.nucleo_nome ? `
              <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                <div class="field-label">Núcleo Operacional Vinculado</div>
                <div class="field-value">${espaco.nucleo_nome}</div>
              </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">2. Endereço e Localização</div>
            <div class="grid-3">
              <div>
                <div class="field-label">Logradouro / Rua</div>
                <div class="field-value">${espaco.rua || "Não informado"}</div>
              </div>
              <div>
                <div class="field-label">Número</div>
                <div class="field-value">${espaco.numero || "S/N"}</div>
              </div>
              <div>
                <div class="field-label">Bairro</div>
                <div class="field-value">${espaco.bairro || "—"}</div>
              </div>
              <div>
                <div class="field-label">Cidade / UF</div>
                <div class="field-value">${[espaco.cidade, espaco.uf].filter(Boolean).join(" / ") || "—"}</div>
              </div>
              <div>
                <div class="field-label">CEP</div>
                <div class="field-value">${espaco.cep || "—"}</div>
              </div>
              <div>
                <div class="field-label">Ponto de Referência</div>
                <div class="field-value">${espaco.ponto_referencia || "—"}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">3. Responsável pelo Espaço / Cedente</div>
            <div class="grid-3">
              <div>
                <div class="field-label">Nome / Razão Social</div>
                <div class="field-value">${espaco.resp_nome || "—"}</div>
              </div>
              <div>
                <div class="field-label">CPF / CNPJ</div>
                <div class="field-value">${espaco.resp_cpf || espaco.resp_cnpj || "—"}</div>
              </div>
              <div>
                <div class="field-label">Contato (Telefone / E-mail)</div>
                <div class="field-value">${[espaco.resp_telefone, espaco.resp_email].filter(Boolean).join(" · ") || "—"}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <span>Gerado em ${formattedDate} • Plataforma Integra</span>
            <span>Documento Autêntico • Instituto ${authInstitute}</span>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(docContent);
    printWin.document.close();
  };

  const isIncompleto = (e: EspacoItem) => {
    return !e.resp_nome || e.resp_nome === "—" || e.resp_nome === "temp" || e.resp_nome === "x" || !e.rua || e.rua === "temp" || e.rua === "xxxxxxx";
  };

  const solicitacoesPendentes = espacos.filter(e => String(e.status_aprovacao || "").toLowerCase().trim() === "pendente");
  const espacosAprovados = espacos.filter(e => String(e.status_aprovacao || "").toLowerCase().trim() !== "pendente");

  const emUsoList = espacosAprovados.filter(e => e.em_uso || !!e.nucleo_nome);
  const disponiveisList = espacosAprovados.filter(e => !e.em_uso && !e.nucleo_nome && !isIncompleto(e));
  const incompletosList = espacosAprovados.filter(e => isIncompleto(e));

  const getCurrentList = () => {
    switch (activeTab) {
      case "em_uso": return emUsoList;
      case "disponiveis": return disponiveisList;
      case "incompletos": return incompletosList;
      case "solicitacoes": return solicitacoesPendentes;
      case "todos":
      default: return espacosAprovados;
    }
  };

  const currentList = getCurrentList();

  const filtered = currentList.filter(e =>
    !searchTerm ||
    e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.resp_nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.bairro || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.projeto_nome || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const authInstitute = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Container Flutuante de Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Keyframes da Animação Lógica: Despinçar do Mapa & Dobrar Planta */}
      <style>{`
        @keyframes mapPinPullAnim {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          40% { transform: translateY(-32px) scale(1.3) rotate(-12deg); opacity: 1; }
          100% { transform: translateY(-80px) scale(0); opacity: 0; }
        }
        @keyframes blueprintFoldAnim {
          0% { transform: perspective(900px) rotateX(0deg) scale(1); opacity: 1; }
          45% { transform: perspective(900px) rotateX(-50deg) scale(0.9); opacity: 0.85; }
          100% { transform: perspective(900px) rotateX(-90deg) scale(0.2) translateY(60px); opacity: 0; }
        }
        @keyframes archiveOpenAnim {
          0% { transform: scale(0.85) translateY(15px); opacity: 0; }
          40% { transform: scale(1.1) translateY(0); opacity: 1; }
          80% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(0.9) translateY(10px); opacity: 0.7; }
        }
        .anim-mappin-unpin { animation: mapPinPullAnim 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .anim-mapcard-fold { animation: blueprintFoldAnim 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards; transform-origin: center bottom; }
        .anim-archive-open { animation: archiveOpenAnim 1.1s ease-in-out forwards; }

        @media print {
          body * { visibility: hidden !important; }
          #printable-ficha-area, #printable-ficha-area * { visibility: visible !important; }
          #printable-ficha-area { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
          .no-print { display: none !important; }
          
          /* Estilização específica para GASCTPNA Green no Print */
          .print-logo { content: url("${getInstituteLogo("GASCTPNA")}"); }
          .print-accent-border { border-color: #166534 !important; }
          .print-accent-text { color: #166534 !important; }
          .print-accent-bg { background-color: #166534 !important; color: white !important; }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Módulo Operacional</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Descrição do Espaço
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Gerencie os locais cadastrados e acompanhe solicitações de novos espaços.
          </p>
        </div>

        <Link
          to="/admin/cadastrar-espaco"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-xs sm:text-sm shrink-0"
        >
          <Plus size={16} />
          <span>Cadastrar Espaço</span>
        </Link>
      </div>

      {/* Tabs & Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          
          {/* Navegação de Abas (Todos, Disponíveis, Em Uso, Incompletos, Solicitações) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab("todos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "todos" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Building2 size={14} />
              <span>Todos</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "todos" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
              }`}>
                {espacosAprovados.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("disponiveis")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "disponiveis" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Disponíveis</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "disponiveis" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
              }`}>
                {disponiveisList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("em_uso")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "em_uso" ? "bg-white text-blue-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers size={14} className="text-blue-500" />
              <span>Em Uso</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "em_uso" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
              }`}>
                {emUsoList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("incompletos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "incompletos" ? "bg-amber-500 text-white shadow-xs" : "text-amber-700 bg-amber-50 hover:bg-amber-100"
              }`}
            >
              <AlertTriangle size={14} />
              <span>Pendente de Dados (???)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-700 text-white">
                {incompletosList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("solicitacoes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "solicitacoes" ? "bg-white text-purple-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock size={14} className={solicitacoesPendentes.length > 0 ? "text-purple-600 animate-pulse" : ""} />
              <span>Solicitações</span>
              {solicitacoesPendentes.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                  {solicitacoesPendentes.length}
                </span>
              )}
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, bairro..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Banners Informativos das Abas */}
        {activeTab === "incompletos" && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold block text-amber-950">Espaços Incompletos (Faltando Endereço ou Responsável)</strong>
              Estes espaços vieram de migrações ou cadastros legados sem o endereço completo ou sem o responsável. Clique em <strong>Editar</strong> para preencher os dados e liberá-los como <strong>Disponíveis</strong> para vinculação nos Núcleos.
            </div>
          </div>
        )}

        {activeTab === "solicitacoes" && (
          <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-purple-900">
            <AlertCircle size={18} className="text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold block text-purple-950">Solicitações de Espaços Pendentes de Aprovação</strong>
              Cadastros novos enviados por cedentes/externos que aguardam aprovação do Administrador. Após aprovados, eles passam para a aba de Espaços Disponíveis.
            </div>
          </div>
        )}
      </div>

      {/* Lista de Espaços */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 text-xs font-semibold">Carregando espaços...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <Building2 size={40} className="text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Nenhum espaço encontrado</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {activeTab === "solicitacoes"
              ? "Não existem solicitações de espaço pendentes no momento."
              : "Nenhum espaço cadastrado corresponde aos critérios da busca."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map(espaco => {
            const isPendente = String(espaco.status_aprovacao || "").toLowerCase().trim() === "pendente";

            return (
              <div
                key={espaco.id}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:border-[var(--theme-primary)] hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Imagem de Capa ou Placeholder */}
                <div className="relative h-32 bg-slate-100 overflow-hidden">
                  {espaco.foto_url ? (
                    <img
                      src={espaco.foto_url}
                      alt={espaco.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                      <Building2 size={36} />
                      <span className="text-xs font-semibold mt-1">Sem foto cadastrada</span>
                    </div>
                  )}

                  {/* Badges do Topo: Status do Espaço */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    {isPendente ? (
                      <span className="bg-purple-600 text-white text-[11px] font-black px-2.5 py-1 rounded shadow-xs flex items-center gap-1 uppercase tracking-wider">
                        <Clock size={12} /> Solicitação Pendente
                      </span>
                    ) : isIncompleto(espaco) ? (
                      <span className="bg-amber-500 text-white text-[11px] font-black px-2.5 py-1 rounded shadow-xs flex items-center gap-1 uppercase tracking-wider">
                        <AlertTriangle size={12} /> ??? Info Pendente
                      </span>
                    ) : (
                      <div className="bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm" title="Aprovado e Completo">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Conteúdo Principal do Card */}
                <div className="p-3 sm:p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1">
                      {espaco.nome}
                    </h3>
                    
                    {(espaco.bairro || espaco.cidade) && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>{[espaco.bairro, espaco.cidade].filter(Boolean).join(" • ")}</span>
                      </p>
                    )}

                    {/* Indicador de "Em Uso" e Vínculo ao Núcleo */}
                    {espaco.em_uso && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md mt-2">
                        <Layers size={12} className="text-blue-500 shrink-0" />
                        <span>Em uso • Vinculado ao Núcleo {espaco.nucleo_nome}</span>
                      </span>
                    )}
                  </div>

                  {/* Detalhes do Responsável */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                    {espaco.resp_nome && espaco.resp_nome !== "temp" && espaco.resp_nome !== "x" && espaco.resp_nome !== "—" ? (
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">Resp: {espaco.resp_nome}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-700 font-extrabold bg-amber-50/90 p-1.5 rounded-lg border border-amber-200">
                        <AlertTriangle size={13} className="shrink-0 text-amber-600" />
                        <span>Resp: ??? (Ajeitar depois)</span>
                      </div>
                    )}

                    {espaco.resp_telefone && espaco.resp_telefone !== "00000000000" && (
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{espaco.resp_telefone}</span>
                      </div>
                    )}

                    {espaco.ponto_referencia && (
                      <div className="text-[11px] text-slate-500 italic line-clamp-1 mt-1 pt-1 border-t border-slate-200/60">
                        Ref: {espaco.ponto_referencia}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer do Card com Ações Limpas e Botão Download Ficha */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isPendente ? (
                    <>
                      <button
                        onClick={() => handleAprovarEspaco(espaco)}
                        disabled={approvingId === espaco.id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        {approvingId === espaco.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        <span>Aprovar Espaço</span>
                      </button>

                      <button
                        onClick={() => openDeleteModal(espaco)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Rejeitar / Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          espaco.ativo ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-100"
                        }`}>
                          {espaco.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Botão de Download / Imprimir Ficha Oficial */}
                        <button
                          onClick={() => handleOpenPrintFicha(espaco)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                          title="Baixar Ficha Oficial em PDF / Imprimir"
                        >
                          <Download size={13} />
                          Download Ficha
                        </button>

                        <Link
                          to={`/admin/cadastrar-espaco?edit=${espaco.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                          title="Editar Espaço"
                        >
                          <Edit3 size={13} />
                          Editar
                        </Link>

                        <button
                          onClick={() => handleToggleAtivo(espaco)}
                          disabled={togglingId === espaco.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            espaco.ativo
                              ? "text-slate-400 hover:text-red-500 hover:bg-red-50"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={espaco.ativo ? "Desativar" : "Ativar"}
                        >
                          {togglingId === espaco.id ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                        </button>

                        <button
                          onClick={() => openDeleteModal(espaco)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir Espaço"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação com Trava de Segurança de 25s & Animação Lógica */}
      {deleteModalOpen && selectedDeleteEspaco && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">Desvincular Espaço</h3>
              </div>

              <button
                onClick={closeDeleteModal}
                disabled={deletingId === selectedDeleteEspaco.id}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* ÁREA DA ANIMAÇÃO LÓGICA DE DESPINÇAR DO MAPA E DOBRAR A PLANTA FÍSICA */}
            <div className="relative py-2 flex flex-col items-center justify-between min-h-[210px] overflow-hidden">
              
              <div className="relative w-full h-[190px] flex flex-col items-center justify-end">
                
                {/* Ícone de Pin do Mapa Despinçando para Cima */}
                <div className={`absolute top-0 z-20 ${isUnpinning ? 'anim-mappin-unpin' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <MapPin size={22} className="animate-bounce" />
                  </div>
                </div>

                {/* Card de Planta Físicamente Dobrando em 3D */}
                <div className={`w-full max-w-[300px] bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 shadow-sm relative pt-7 ${
                  isUnpinning ? 'anim-mapcard-fold' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                      <Building2 size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Localização Operacional</span>
                      <h4 className="text-slate-900 font-extrabold text-sm truncate">
                        {selectedDeleteEspaco.nome}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {[selectedDeleteEspaco.bairro, selectedDeleteEspaco.cidade].filter(Boolean).join(" • ") || 'Campos dos Goytacazes'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Caixa de Arquivo recebendo a Planta Dobrada */}
                {isUnpinning && (
                  <div className="absolute bottom-0 z-10 flex flex-col items-center text-slate-600 anim-archive-open">
                    <div className="w-16 h-12 bg-slate-800 text-white rounded-t-xl flex items-center justify-center shadow-2xl border-2 border-slate-900">
                      <Archive size={26} className="text-blue-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">Arquivando...</span>
                  </div>
                )}
              </div>

              {/* Mensagem e Trava de Segurança de 25 Segundos */}
              {!isUnpinning && (
                <div className="mt-3 w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700">
                    <Clock size={14} className="text-amber-600" />
                    <span>Trava de Segurança: {countdown > 0 ? `Aguarde ${countdown}s` : "Liberado para desvincular"}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {countdown > 0 ? "Aguarde a contagem regressiva para desvincular o espaço." : "Clique no botão para desvincular e remover do mapa."}
                  </p>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingId === selectedDeleteEspaco.id}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteEspaco}
                disabled={countdown > 0 || deletingId === selectedDeleteEspaco.id}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-sm transition-all flex items-center gap-2 ${
                  countdown > 0 || deletingId === selectedDeleteEspaco.id
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-600/20 shadow-md animate-bounce"
                }`}
              >
                {deletingId === selectedDeleteEspaco.id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Desvinculando...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Clock size={14} /> Aguarde {countdown}s
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Confirmar & Desvincular
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENTO IMPRESSO OFICIAL (Sem Popup na tela, só visível na impressão/PDF) */}
      {selectedPrintEspaco && (() => {
        const theme = getInstituteTheme(authInstitute);
        return (
          <div id="printable-ficha-area" className={`hidden print:block p-8 space-y-6 font-sans bg-white text-slate-900 border-2 ${theme.borderMain}`}>
            
            {/* Header da Ficha Oficial com Cores do Instituto */}
            <div className={`border-b-4 ${theme.borderHeader} pb-5 flex items-center justify-between gap-6`}>
              <div className="flex items-center gap-4">
                <img
                  src={getInstituteLogo(authInstitute)}
                  alt={authInstitute}
                  className="h-16 max-w-[180px] object-contain"
                />
                <div>
                  <span className={`${theme.bgHeader} px-3 py-1 rounded text-[11px] font-black uppercase tracking-widest inline-block mb-1`}>
                    INSTITUTO {authInstitute} • PLATAFORMA INTEGRA
                  </span>
                  <h2 className={`text-xl font-black ${theme.textPrimary} uppercase tracking-tight`}>
                    Ficha Técnica do Espaço
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Documento Oficial de Cadastramento e Infraestrutura Operacional
                  </p>
                </div>
              </div>

              <div className="text-right border-l-2 border-slate-200 pl-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Código do Espaço</span>
                <strong className={`text-lg font-black ${theme.textCode}`}>#ESP-{selectedPrintEspaco.id}</strong>
              </div>
            </div>

            {/* Informações da Instalação */}
            <div className="space-y-4 text-xs">
              
              {/* Bloco 1: Dados do Espaço */}
              <div className={`${theme.blockBg} p-4 rounded-xl space-y-3`}>
                <h3 className={`text-xs font-black uppercase tracking-wider ${theme.textPrimary} flex items-center gap-1.5 border-b border-slate-200 pb-2`}>
                  <Building2 size={15} className={theme.iconColor} />
                  Identificação da Instalação Física
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Nome do Local</span>
                    <strong className="text-sm font-extrabold text-slate-900">{selectedPrintEspaco.nome}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Status de Operação</span>
                    <span className={`inline-block mt-0.5 ${theme.badgeBg} px-2.5 py-0.5 rounded text-[11px] font-extrabold`}>
                      ✓ Espaço Cadastrado e Operacional
                    </span>
                  </div>
                </div>

                {selectedPrintEspaco.em_uso && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Vínculo com Núcleo</span>
                    <span className={`font-bold ${theme.textCode}`}>Em Uso pelo Núcleo: {selectedPrintEspaco.nucleo_nome}</span>
                  </div>
                )}
              </div>

              {/* Bloco 2: Localização e Endereço */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <MapPin size={15} className={theme.iconColor} />
                  Endereço e Localização
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rua / Logradouro</span>
                    <span className="font-bold text-slate-900">{selectedPrintEspaco.rua || "Não informado"}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Número</span>
                    <span className="font-bold text-slate-900">{selectedPrintEspaco.numero || "S/N"}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Bairro</span>
                    <span className="font-bold text-slate-900">{selectedPrintEspaco.bairro || "Não informado"}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">CEP</span>
                    <span className="font-bold text-slate-900">{selectedPrintEspaco.cep || "Não informado"}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Cidade / UF</span>
                    <span className="font-bold text-slate-900">
                      {[selectedPrintEspaco.cidade, selectedPrintEspaco.uf].filter(Boolean).join(" / ") || "Campos dos Goytacazes / RJ"}
                    </span>
                  </div>
                </div>

                {selectedPrintEspaco.ponto_referencia && (
                  <div className="pt-2 border-t border-slate-200 text-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Ponto de Referência</span>
                    <span className="italic font-medium">{selectedPrintEspaco.ponto_referencia}</span>
                  </div>
                )}
              </div>

              {/* Bloco 3: Dados do Responsável */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <User size={15} className={theme.iconColor} />
                  Responsável Cedente da Instalação
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Nome do Responsável</span>
                    <span className="font-extrabold text-slate-900">{selectedPrintEspaco.resp_nome || "Não informado"}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">CPF / CNPJ</span>
                    <span className="font-bold text-slate-900">{selectedPrintEspaco.resp_cpf || selectedPrintEspaco.resp_cnpj || "Não informado"}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Telefone de Contato</span>
                    <span className="font-bold text-slate-900">{selectedPrintEspaco.resp_telefone || "Não informado"}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">E-mail</span>
                    <span className="font-bold text-slate-900">{selectedPrintEspaco.resp_email || "Não informado"}</span>
                  </div>
                </div>
              </div>

              {/* Foto do Espaço se houver */}
              {selectedPrintEspaco.foto_url && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Registro Fotográfico</span>
                  <div className="h-44 rounded-xl overflow-hidden border border-slate-200 max-w-md">
                    <img src={selectedPrintEspaco.foto_url} alt={selectedPrintEspaco.nome} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé Oficial de Autenticação */}
            <div className={`pt-5 border-t-2 ${theme.footerBorder} text-center space-y-1`}>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                Documento emitido digitalmente pela Plataforma Integra em <strong className={theme.textCode}>{printTimestamp}</strong>.
              </p>
              <p className="text-[9px] text-slate-400 font-medium">
                Instituto {authInstitute} • Sistema Oficial de Gestão de Projetos e Espaços
              </p>
            </div>

          </div>
        );
      })()}

    </div>
  );
}
