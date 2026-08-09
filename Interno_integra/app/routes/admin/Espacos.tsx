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
  docs_pendentes?: boolean;
  projeto_nome?: string;
  nucleo_nome?: string;
  em_uso?: boolean;
  created_at?: string;
}

export default function Espacos() {
  const [espacos, setEspacos] = useState<EspacoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"cadastrados" | "solicitacoes">("cadastrados");
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
          docs_pendentes: n.docs_pendentes,
          ativo: n.ativo !== false,
          nucleo_nome: n.nome,
          em_uso: true,
        }));
      }

      const list = rawList.map((item: any) => {
        const status = (item.status_aprovacao || "aprovado").toString().toLowerCase().trim();
        const fotoOk = !!(item.foto_url && item.foto_url.trim().length > 0);
        const termoOk = !!(item.termo_url && item.termo_url.trim().length > 0);
        const docsPerto = item.docs_pendentes === true || (!fotoOk || !termoOk);

        const linkedNucleo = nMap[Number(item.id)] || item.nucleo_nome || (item.projeto_nome ? `Núcleo ${item.nome}` : null);

        return {
          ...item,
          status_aprovacao: status,
          docs_pendentes: docsPerto,
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

  const handleToggleDocsPendentes = async (espaco: EspacoItem) => {
    setTogglingDocsId(espaco.id);
    const nextVal = !espaco.docs_pendentes;
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const res = await fetch("https://w.ibrase.com.br/webhook/espacos-put", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: espaco.id,
          docs_pendentes: nextVal,
          instituto: authInstitute.toUpperCase()
        }),
      });
      if (res.ok) {
        setEspacos(prev => prev.map(e => e.id === espaco.id ? { ...e, docs_pendentes: nextVal } : e));
        addToast(
          nextVal ? "warning" : "success",
          nextVal ? "INFO FALTANTE MARCADA" : "DOCUMENTAÇÃO COMPLETA",
          `Status de documentação de "${espaco.nome}" atualizado.`
        );
      }
    } catch (e) {
      console.error("Erro ao alterar docs_pendentes:", e);
    } finally {
      setTogglingDocsId(null);
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

  // Função para Abrir a Ficha Oficial do Espaço e Imprimir / Baixar em PDF
  const handleOpenPrintFicha = (espaco: EspacoItem) => {
    setSelectedPrintEspaco(espaco);
    const now = new Date();
    const formatted = `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR")}`;
    setPrintTimestamp(formatted);
    setPrintModalOpen(true);

    addToast("info", "GERANDO FICHA TÉCNICA", `Preparando documento oficial de "${espaco.nome}"...`);
  };

  const triggerPrintWindow = () => {
    window.print();
  };

  // 🔴 REGRA CRÍTICA: Separação ESTRITA por status_aprovacao
  // Espaço aprovado NUNCA aparece na aba Solicitações!
  const solicitacoesPendentes = espacos.filter(e => String(e.status_aprovacao || "").toLowerCase().trim() === "pendente");
  const espacosAprovados = espacos.filter(e => String(e.status_aprovacao || "").toLowerCase().trim() !== "pendente");

  const currentList = activeTab === "solicitacoes" ? solicitacoesPendentes : espacosAprovados;

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
          body * { visibility: hidden; }
          #printable-ficha-area, #printable-ficha-area * { visibility: visible; }
          #printable-ficha-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Módulo Operacional</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Espaços Físicos
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
          
          {/* Navegação de Abas */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("cadastrados")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === "cadastrados"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Building2 size={15} />
              <span>Espaços Cadastrados</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === "cadastrados" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
              }`}>
                {espacosAprovados.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("solicitacoes")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === "solicitacoes"
                  ? "bg-white text-amber-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock size={15} className={solicitacoesPendentes.length > 0 ? "text-amber-500 animate-pulse" : ""} />
              <span>Solicitações de Espaço</span>
              {solicitacoesPendentes.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200">
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

        {/* Banner Informativo da Aba */}
        {activeTab === "solicitacoes" && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold block text-amber-950">Solicitações de Espaço Físico Pendentes</strong>
              Estes espaços aguardam aprovação do administrador. Enquanto estiverem em solicitações pendentes, eles <strong>NÃO</strong> aparecem disponíveis para vincular em Núcleos.
            </div>
          </div>
        )}
      </div>

      {/* Lista de Espaços */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 text-xs font-semibold">Carregando espaços físicos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <Building2 size={40} className="text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">Nenhum espaço encontrado</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {activeTab === "solicitacoes"
              ? "Não existem solicitações de espaço pendentes no momento."
              : "Nenhum espaço físico cadastrado corresponde aos critérios da busca."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {filtered.map(espaco => {
            const isPendente = espaco.status_aprovacao === "pendente";

            return (
              <div
                key={espaco.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Imagem de Capa ou Placeholder */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
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

                  {/* Badges do Topo: Lzinho Aprovado + Badge Interativa Info Faltante */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    {isPendente ? (
                      <span className="bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1 uppercase tracking-wider">
                        <Clock size={12} /> Pendente
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle2 size={12} /> ✓ Aprovado
                      </span>
                    )}

                    {/* Badge do Topo ÚNICA para Info Faltante / Docs OK */}
                    {!isPendente && (
                      <button
                        onClick={() => handleToggleDocsPendentes(espaco)}
                        disabled={togglingDocsId === espaco.id}
                        className={`text-[11px] font-black px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer border ${
                          espaco.docs_pendentes
                            ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                        }`}
                        title="Clique para alternar o status de documentação"
                      >
                        {espaco.docs_pendentes ? (
                          <>
                            <AlertTriangle size={12} className="text-amber-600" />
                            ⚠️ Info faltante
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            ✓ Docs OK
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Conteúdo Principal do Card */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
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
                    {espaco.resp_nome && espaco.resp_nome !== "temp" ? (
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">Resp: {espaco.resp_nome}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 italic">
                        <User size={13} className="shrink-0" />
                        <span>Responsável não cadastrado</span>
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
                <h3 className="text-base font-extrabold text-slate-800">Desvincular Espaço Físico</h3>
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

      {/* Modal / Ficha Impressa Oficial para Download em PDF */}
      {printModalOpen && selectedPrintEspaco && (
        <div className="fixed inset-0 z-[9990] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden space-y-0 my-8">
            
            {/* Action Bar no Topo do Modal (No Print) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-black uppercase tracking-wider">Ficha Técnica do Espaço</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={triggerPrintWindow}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Printer size={15} />
                  <span>Imprimir / Salvar PDF</span>
                </button>

                <button
                  onClick={() => setPrintModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ÁREA IMPRESSA DO DOCUMENTO OFICIAL */}
            <div id="printable-ficha-area" className="p-8 space-y-6 font-sans bg-white text-slate-800">
              
              {/* Header da Ficha Oficial */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                    {authInstitute} • PLATAFORMA INTEGRA
                  </span>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Ficha Oficial de Cadastramento de Espaço Físico
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Documento de identificação e validação de infraestrutura do sistema.
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-black text-xl shadow-md">
                  {authInstitute.slice(0, 2)}
                </div>
              </div>

              {/* Informações da Instalação */}
              <div className="space-y-4 text-xs">
                
                {/* Bloco 1: Dados do Espaço */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Building2 size={14} className="text-blue-600" />
                    Identificação do Espaço Físico
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Nome da Instalação</span>
                      <strong className="text-sm font-extrabold text-slate-900">{selectedPrintEspaco.nome}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Status da Aprovação</span>
                      <span className="inline-block mt-0.5 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-extrabold border border-emerald-200">
                        ✓ Aprovado e Operacional
                      </span>
                    </div>
                  </div>

                  {selectedPrintEspaco.em_uso && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Vínculo Operacional</span>
                      <span className="font-bold text-blue-700">Em Uso pelo Núcleo: {selectedPrintEspaco.nucleo_nome}</span>
                    </div>
                  )}
                </div>

                {/* Bloco 2: Localização e Endereço */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <MapPin size={14} className="text-red-500" />
                    Endereço e Localização
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Rua / Logradouro</span>
                      <span className="font-bold text-slate-800">{selectedPrintEspaco.rua || "Não informado"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Número</span>
                      <span className="font-bold text-slate-800">{selectedPrintEspaco.numero || "S/N"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Bairro</span>
                      <span className="font-bold text-slate-800">{selectedPrintEspaco.bairro || "Não informado"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">CEP</span>
                      <span className="font-bold text-slate-800">{selectedPrintEspaco.cep || "Não informado"}</span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Cidade / UF</span>
                      <span className="font-bold text-slate-800">
                        {[selectedPrintEspaco.cidade, selectedPrintEspaco.uf].filter(Boolean).join(" / ") || "Campos dos Goytacazes / RJ"}
                      </span>
                    </div>
                  </div>

                  {selectedPrintEspaco.ponto_referencia && (
                    <div className="pt-2 border-t border-slate-200/60 text-slate-600">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Ponto de Referência</span>
                      <span className="italic font-medium">{selectedPrintEspaco.ponto_referencia}</span>
                    </div>
                  )}
                </div>

                {/* Bloco 3: Dados do Responsável */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <User size={14} className="text-blue-600" />
                    Responsável da Instalação
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Nome do Responsável</span>
                      <span className="font-extrabold text-slate-900">{selectedPrintEspaco.resp_nome || "Não informado"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">CPF / CNPJ</span>
                      <span className="font-bold text-slate-800">{selectedPrintEspaco.resp_cpf || selectedPrintEspaco.resp_cnpj || "Não informado"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Telefone de Contato</span>
                      <span className="font-bold text-slate-800">{selectedPrintEspaco.resp_telefone || "Não informado"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">E-mail</span>
                      <span className="font-bold text-slate-800">{selectedPrintEspaco.resp_email || "Não informado"}</span>
                    </div>
                  </div>
                </div>

                {/* Foto do Espaço se houver */}
                {selectedPrintEspaco.foto_url && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Registro Fotográfico</span>
                    <div className="h-48 rounded-2xl overflow-hidden border border-slate-200">
                      <img src={selectedPrintEspaco.foto_url} alt={selectedPrintEspaco.nome} className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              {/* Rodapé Oficial de Autenticação */}
              <div className="pt-6 border-t-2 border-slate-900 text-center space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Documento emitido digitalmente pela Plataforma Integra em <strong className="text-slate-800">{printTimestamp}</strong>.
                </p>
                <p className="text-[9px] text-slate-400 font-medium">
                  Instituto {authInstitute} • Sistema de Gestão de Projetos e Espaços Físicos
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
