import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Power, Loader2, MapPin, Building2, User, CheckCircle2, Circle, Clock, Inbox, AlertTriangle, Trash2 } from "lucide-react";

export interface EspacoItem {
  id: string | number;
  nome: string;
  projeto_id?: number;
  projeto_nome?: string;
  modalidade_id?: number;
  modalidade_nome?: string;
  resp_nome?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  ativo: boolean;
  status_aprovacao?: string; // "aprovado" | "pendente" | "rejeitado"
  docs_pendentes?: boolean;
  nucleo_nome?: string; // Nome do núcleo se estiver em uso
}

let projetosCache: Record<number, string> = {};
let modalidadesCache: Record<number, string> = {};

const flattenResponse = (data: any): any[] => {
  if (!data) return [];
  let list: any[] = Array.isArray(data) ? data : data.data || data.items || (Array.isArray(data.json) ? data.json : data.json ? [data.json] : [data]);
  let flat: any[] = [];
  list.forEach((entry: any) => {
    if (entry?.json) {
      Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
    } else if (Array.isArray(entry)) {
      flat.push(...entry);
    } else {
      flat.push(entry);
    }
  });
  return flat;
};

export default function Espacos() {
  const [espacos, setEspacos] = useState<EspacoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");
  const [activeTab, setActiveTab] = useState<"aprovados" | "solicitacoes">("aprovados");
  const [togglingId, setTogglingId] = useState<string | number | null>(null);
  const [approvingId, setApprovingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(savedInstitute);
    Promise.all([
      fetchProjetos(savedInstitute),
      fetchModalidades(savedInstitute)
    ]).then(() => {
      fetchEspacos(savedInstitute);
    });
  }, []);

  const fetchProjetos = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        projetosCache = {};
        flattenResponse(data).forEach((p: any) => { if (p.id && p.nome) projetosCache[Number(p.id)] = p.nome; });
      }
    } catch (e) { console.warn("Erro projetos:", e); }
  };

  const fetchModalidades = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${inst.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        modalidadesCache = {};
        flattenResponse(data).forEach((m: any) => { if (m.id && m.nome) modalidadesCache[Number(m.id)] = m.nome; });
      }
    } catch (e) { console.warn("Erro modalidades:", e); }
  };

  const fetchEspacos = async (inst: string) => {
    setLoading(true);
    try {
      const [resEspacos, resNucleos] = await Promise.all([
        fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${inst.toUpperCase()}`),
        fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst.toUpperCase()}`).catch(() => null)
      ]);

      let nucleosMap: Record<string, string> = {};
      if (resNucleos && resNucleos.ok) {
        const nData = await resNucleos.json();
        flattenResponse(nData).forEach((n: any) => {
          if (n.espaco_id) nucleosMap[String(n.espaco_id)] = n.nome || `Núcleo #${n.id}`;
        });
      }

      if (resEspacos.ok) {
        const data = await resEspacos.json();
        const list = flattenResponse(data);
        setEspacos(list.map((e: any) => {
          // status_aprovacao estrito: se vier 'pendente' é pendente, caso contrário é aprovado por padrão
          const statusAprovacao = e.status_aprovacao === "pendente" ? "pendente" : (e.status_aprovacao || "aprovado");
          return {
            id: e.id,
            nome: e.nome || "",
            projeto_id: e.projeto_id,
            projeto_nome: e.projeto_id ? projetosCache[Number(e.projeto_id)] || `Projeto ID ${e.projeto_id}` : "—",
            modalidade_id: e.modalidade_id,
            modalidade_nome: e.modalidade_id ? modalidadesCache[Number(e.modalidade_id)] || `Modalidade ID ${e.modalidade_id}` : "—",
            resp_nome: e.resp_nome || "—",
            bairro: e.bairro || "",
            cidade: e.cidade || "",
            uf: e.uf || "",
            ativo: e.ativo !== false && e.ativo !== 0 && e.ativo !== "0",
            status_aprovacao: statusAprovacao,
            docs_pendentes: Boolean(e.docs_pendentes),
            nucleo_nome: nucleosMap[String(e.id)] || undefined,
          };
        }));
      }
    } catch (e) {
      console.error("Erro ao buscar espaços:", e);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteEspaco = async (espaco: EspacoItem) => {
    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o espaço "${espaco.nome}"?`)) return;
    setDeletingId(espaco.id);
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const res = await fetch("https://w.ibrase.com.br/webhook/espacos-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: espaco.id, instituto: authInstitute.toUpperCase() }),
      });
      if (res.ok) {
        setEspacos(prev => prev.filter(e => e.id !== espaco.id));
      } else {
        alert("Erro ao excluir espaço. Tente novamente.");
      }
    } catch (e) {
      console.error("Erro ao excluir espaço:", e);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setDeletingId(null);
    }
  };

  // 🔴 REGRA CRÍTICA: Separação ESTRITA por status_aprovacao (Sem duplicatas em ambas as abas)
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
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-200">
              {currentInstitute}
            </span>
            <span className="text-slate-400 text-xs font-medium">• Módulo Administrativo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[var(--theme-primary)]" />
            Espaços Físicos
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Locais cadastrados nos bairros para o instituto <strong className="text-slate-800">{currentInstitute}</strong>.
          </p>
        </div>
        <Link
          to="/admin/cadastrar-espaco"
          className="inline-flex items-center gap-2 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm shrink-0"
        >
          <Plus size={18} />
          Cadastrar Espaço
        </Link>
      </div>

      {/* Navegação por Abas (Espaços Aprovados vs Solicitações de Espaço) */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("aprovados")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === "aprovados"
              ? "bg-[var(--theme-primary)] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building2 size={16} />
          Espaços Cadastrados ({espacosAprovados.length})
        </button>

        <button
          onClick={() => setActiveTab("solicitacoes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all relative ${
            activeTab === "solicitacoes"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
          }`}
        >
          <Inbox size={16} />
          Solicitações de Espaço
          {solicitacoesPendentes.length > 0 && (
            <span className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full ${
              activeTab === "solicitacoes" ? "bg-white text-amber-700" : "bg-amber-500 text-white"
            }`}>
              {solicitacoesPendentes.length}
            </span>
          )}
        </button>
      </div>

      {/* Busca e Barra de Estatísticas */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={activeTab === "solicitacoes" ? "Buscar solicitações pendentes..." : "Buscar por bairro, nome ou responsável..."}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 focus:border-[var(--theme-primary)]"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {activeTab === "aprovados" ? (
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold flex-wrap">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              Em Uso ({espacosAprovados.filter(e => e.nucleo_nome).length})
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
              Disponíveis para Núcleo ({espacosAprovados.filter(e => !e.nucleo_nome).length})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Espaços pendentes NÃO ficam disponíveis para criar Núcleos até a aprovação</span>
          </div>
        )}
      </div>

      {/* Grid de Cards Quadrados */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="animate-spin w-5 h-5 text-[var(--theme-primary)]" />
          <span className="text-sm font-medium">Carregando espaços...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Building2 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {activeTab === "solicitacoes" ? "Nenhuma solicitação de espaço pendente no momento." : "Nenhum espaço cadastrado."}
          </p>
          {activeTab === "aprovados" && (
            <Link to="/admin/cadastrar-espaco" className="mt-4 text-sm font-bold text-[var(--theme-primary)] hover:underline">
              + Cadastrar primeiro espaço
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map(espaco => {
            const emUso = Boolean(espaco.nucleo_nome);
            const isSolicitacaoPendente = espaco.status_aprovacao === "pendente";

            return (
              <div 
                key={espaco.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[240px] relative group ${
                  isSolicitacaoPendente ? "border-amber-300 ring-1 ring-amber-100" : "border-slate-200"
                }`}
              >
                {/* Header do Card */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isSolicitacaoPendente ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-[var(--theme-primary)]"
                      }`}>
                        {isSolicitacaoPendente ? <Clock className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-800 text-base leading-tight group-hover:text-[var(--theme-primary)] transition-colors break-words flex items-center gap-1.5">
                          {espaco.nome}
                          {/* ⚠️ ÍCONE DE AVISO PARA INFORMAÇÃO FALTANTE MESMO SE APROVADO */}
                          {espaco.docs_pendentes && (
                            <span 
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 cursor-help shrink-0"
                              title="Atenção: Informação ou documento faltante neste espaço"
                            >
                              <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                              Info faltante
                            </span>
                          )}
                        </h3>
                        {espaco.bairro && (
                          <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{[espaco.bairro, espaco.cidade].filter(Boolean).join(" · ")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tag de Status / Solicitação */}
                    <div className="shrink-0">
                      {isSolicitacaoPendente ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                          Aguardando Aprovação
                        </span>
                      ) : emUso ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                          Em Uso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                          Disponível
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações Centrais do Card */}
                  <div className="space-y-2.5 mt-4 pt-3 border-t border-slate-100 text-xs">
                    {isSolicitacaoPendente ? (
                      <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-amber-900">
                        <span className="font-bold text-[11px] text-amber-700 uppercase tracking-wider block mb-0.5">Status da Solicitação:</span>
                        <span className="font-semibold text-xs flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          Aguardando aprovação — Não pode criar Núcleo
                        </span>
                      </div>
                    ) : emUso ? (
                      <div className="bg-emerald-50/70 border border-emerald-200/60 p-2.5 rounded-xl text-emerald-900">
                        <span className="font-bold text-[11px] text-emerald-700 uppercase tracking-wider block mb-0.5">Operando Núcleo:</span>
                        <span className="font-extrabold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {espaco.nucleo_nome}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-500">
                        <span className="font-medium text-xs flex items-center gap-1.5">
                          <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          Pronto para receber novo núcleo
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-600 pt-1">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Resp: <strong>{espaco.resp_nome}</strong></span>
                    </div>

                    {espaco.projeto_nome !== "—" && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[11px] text-slate-700">
                          {espaco.projeto_nome}
                        </span>
                        {espaco.modalidade_nome !== "—" && (
                          <span className="text-[11px] text-slate-400 truncate">
                            • {espaco.modalidade_nome}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer do Card Quadrado com Ações */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  {isSolicitacaoPendente ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => handleAprovarEspaco(espaco)}
                        disabled={approvingId === espaco.id}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl shadow-xs transition-all text-xs"
                      >
                        {approvingId === espaco.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            Aprovar Espaço
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteEspaco(espaco)}
                        disabled={deletingId === espaco.id}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-200"
                        title="Recusar e Excluir Solicitação"
                      >
                        {deletingId === espaco.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        espaco.ativo ? "text-emerald-700 bg-emerald-50" : "text-slate-400 bg-slate-100"
                      }`}>
                        {espaco.ativo ? "Ativo" : "Inativo"}
                      </span>

                      <div className="flex items-center gap-1.5">
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
                          onClick={() => handleDeleteEspaco(espaco)}
                          disabled={deletingId === espaco.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir Espaço"
                        >
                          {deletingId === espaco.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
    </div>
  );
}
