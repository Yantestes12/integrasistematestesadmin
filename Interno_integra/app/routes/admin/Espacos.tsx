import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Power, CheckCircle2, Clock, MapPin, Building2, User, Phone, FileText, AlertCircle, AlertTriangle, Trash2, Loader2, X, Home } from "lucide-react";

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
  created_at?: string;
}

export default function Espacos() {
  const [espacos, setEspacos] = useState<EspacoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"cadastrados" | "solicitacoes">("cadastrados");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [markingPendingId, setMarkingPendingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Modal de Exclusão Animação Minimalista (Estrutura Desmoronando/Desfazendo)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteEspaco, setSelectedDeleteEspaco] = useState<EspacoItem | null>(null);
  const [isCollapsing, setIsCollapsing] = useState(false);

  const fetchEspacos = async () => {
    setLoading(true);
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const res = await fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${authInstitute.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        let rawList: any[] = [];
        if (Array.isArray(data)) rawList = data;
        else if (data && Array.isArray(data.data)) rawList = data.data;
        else if (data && data.json) rawList = Array.isArray(data.json) ? data.json : [data.json];
        
        const list = rawList.map((item: any) => {
          const status = (item.status_aprovacao || "aprovado").toString().toLowerCase().trim();
          const fotoOk = !!(item.foto_url && item.foto_url.trim().length > 0);
          const termoOk = !!(item.termo_url && item.termo_url.trim().length > 0);
          const docsPerto = item.docs_pendentes === true || (!fotoOk || !termoOk);

          return {
            ...item,
            status_aprovacao: status,
            docs_pendentes: docsPerto,
          };
        });

        setEspacos(list);
      }
    } catch (e) {
      console.error("Erro ao buscar espaços:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspacos();
  }, []);

  const handleToggleAtivo = async (espaco: EspacoItem) => {
    setTogglingId(espaco.id);
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const res = await fetch("https://w.ibrase.com.br/webhook/espacos-put", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: espaco.id, ativo: !espaco.ativo, instituto: authInstitute.toUpperCase() }),
      });
      if (res.ok) {
        setEspacos(prev => prev.map(e => e.id === espaco.id ? { ...e, ativo: !espaco.ativo } : e));
      }
    } catch (e) {
      console.error("Erro ao alterar status:", e);
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
      }
    } catch (e) {
      console.error("Erro ao aprovar espaço:", e);
    } finally {
      setApprovingId(null);
    }
  };

  const handleMarcarPendente = async (espaco: EspacoItem) => {
    setMarkingPendingId(espaco.id);
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const res = await fetch("https://w.ibrase.com.br/webhook/espacos-put", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: espaco.id,
          status_aprovacao: "pendente",
          docs_pendentes: true,
          instituto: authInstitute.toUpperCase()
        }),
      });
      if (res.ok) {
        setEspacos(prev => prev.map(e => e.id === espaco.id ? { ...e, status_aprovacao: "pendente", docs_pendentes: true } : e));
      }
    } catch (e) {
      console.error("Erro ao marcar como pendente:", e);
    } finally {
      setMarkingPendingId(null);
    }
  };

  const openDeleteModal = (espaco: EspacoItem) => {
    setSelectedDeleteEspaco(espaco);
    setIsCollapsing(false);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deletingId) return;
    setDeleteModalOpen(false);
    setSelectedDeleteEspaco(null);
    setIsCollapsing(false);
  };

  const handleConfirmDeleteEspaco = async () => {
    if (!selectedDeleteEspaco || deletingId) return;
    setDeletingId(selectedDeleteEspaco.id);
    setIsCollapsing(true); // Ativa animação minimalista de desmoronamento/desfazimento

    setTimeout(async () => {
      try {
        const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
        const res = await fetch("https://w.ibrase.com.br/webhook/espacos-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedDeleteEspaco.id, instituto: authInstitute.toUpperCase() }),
        });
        if (res.ok) {
          setEspacos(prev => prev.filter(e => e.id !== selectedDeleteEspaco.id));
          setDeleteModalOpen(false);
          setSelectedDeleteEspaco(null);
        } else {
          alert("Erro ao excluir espaço. Tente novamente.");
        }
      } catch (e) {
        console.error("Erro ao excluir espaço:", e);
        alert("Erro ao conectar com o servidor.");
      } finally {
        setDeletingId(null);
        setIsCollapsing(false);
      }
    }, 950);
  };

  // 🔴 REGRA CRÍTICA: Separação ESTRITA por status_aprovacao
  const solicitacoesPendentes = espacos.filter(e => e.status_aprovacao === "pendente");
  const espacosAprovados = espacos.filter(e => e.status_aprovacao !== "pendente");

  const currentList = activeTab === "solicitacoes" ? solicitacoesPendentes : espacosAprovados;

  const filtered = currentList.filter(e =>
    !searchTerm ||
    e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.resp_nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.bairro || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.projeto_nome || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Keyframes de animação de desmoronamento minimalista de estrutura */}
      <style>{`
        @keyframes collapseAnim {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; filter: blur(0px); }
          40% { transform: translateY(8px) scale(0.96) rotate(-2deg); opacity: 0.85; }
          75% { transform: translateY(35px) scale(0.7, 0.3) rotate(3deg); opacity: 0.4; filter: blur(2px); }
          100% { transform: translateY(70px) scale(0.4, 0.05); opacity: 0; filter: blur(4px); }
        }
        @keyframes dustAnim {
          0% { transform: translateY(0) scale(0.4); opacity: 0; }
          50% { transform: translateY(-25px) scale(1.3); opacity: 0.5; }
          100% { transform: translateY(-55px) scale(2); opacity: 0; }
        }
        .anim-collapse-building { animation: collapseAnim 0.95s cubic-bezier(0.55, 0, 0.1, 1) forwards; }
        .anim-dust-rising { animation: dustAnim 0.95s ease-out forwards; }
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
              Estes espaços foram cadastrados ou solicitados mas ainda aguardam aprovação. Enquanto estiverem pendentes, eles <strong>NÃO</strong> aparecem disponíveis para alocação de Núcleos.
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

                  {/* Badge de Status de Aprovação e Alerta Info Faltante */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    {isPendente ? (
                      <span className="bg-amber-500 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 uppercase tracking-wider">
                        <Clock size={12} /> Solicitação Pendente
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle2 size={12} /> Aprovado
                      </span>
                    )}

                    {/* Aviso ⚠️ Info faltante (Apenas em espaços aprovados com docs pendentes) */}
                    {!isPendente && espaco.docs_pendentes && (
                      <div className="group relative">
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1 cursor-help">
                          <AlertTriangle size={12} className="text-amber-600" />
                          ⚠️ Info faltante
                        </span>
                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-48 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-lg z-20 font-medium">
                          Espaço aprovado sem foto ou termo anexado. Clique em editar para complementar os dados.
                        </div>
                      </div>
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
                  </div>

                  {/* Detalhes do Responsável */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                    {espaco.resp_nome && (
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">Resp: {espaco.resp_nome}</span>
                      </div>
                    )}
                    {espaco.resp_telefone && (
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

                {/* Footer do Card com Ações */}
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
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        espaco.ativo ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-100"
                      }`}>
                        {espaco.ativo ? "Ativo" : "Inativo"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleMarcarPendente(espaco)}
                          disabled={markingPendingId === espaco.id}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200/60"
                          title="Marcar como solicitação pendente"
                        >
                          {markingPendingId === espaco.id ? <Loader2 size={13} className="animate-spin" /> : <Clock size={13} />}
                          Pendente
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

      {/* Modal de Confirmação com Animação Minimalista de Estrutura Desfazendo / Desmoronando */}
      {deleteModalOpen && selectedDeleteEspaco && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">Excluir Espaço Físico</h3>
              </div>

              <button
                onClick={closeDeleteModal}
                disabled={deletingId === selectedDeleteEspaco.id}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* ÁREA DA ANIMAÇÃO MINIMALISTA DE DESFAZER / DESMORONAR O ESPAÇO */}
            <div className="relative py-4 flex flex-col items-center justify-center min-h-[160px] overflow-hidden">
              
              <div className={`w-full max-w-[290px] bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 shadow-sm relative transition-all ${
                isCollapsing ? 'anim-collapse-building' : 'hover:border-slate-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                    <Building2 size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-slate-900 font-extrabold text-sm truncate">
                      {selectedDeleteEspaco.nome}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {selectedDeleteEspaco.bairro || 'Espaço Físico'} • {selectedDeleteEspaco.cidade || 'Campos dos Goytacazes'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Partículas de poeira minimalista subindo durante o colapso */}
              {isCollapsing && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-around">
                  <div className="w-3 h-3 bg-slate-300 rounded-full anim-dust-rising" style={{ animationDelay: '0ms' }} />
                  <div className="w-4 h-4 bg-slate-400 rounded-full anim-dust-rising" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-slate-300 rounded-full anim-dust-rising" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              {!isCollapsing && (
                <p className="mt-4 text-xs text-slate-600 text-center font-medium">
                  Tem certeza que deseja remover a estrutura do espaço <strong className="text-slate-900 font-bold">"{selectedDeleteEspaco.nome}"</strong>?
                </p>
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
                disabled={deletingId === selectedDeleteEspaco.id}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-sm bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-600/20 shadow-md transition-all flex items-center gap-2"
              >
                {deletingId === selectedDeleteEspaco.id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Desfazendo Estrutura...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Confirmar Exclusão
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
