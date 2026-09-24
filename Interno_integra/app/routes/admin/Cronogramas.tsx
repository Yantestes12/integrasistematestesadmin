import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router";
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  CalendarDays, 
  Trophy, 
  PartyPopper,
  ExternalLink,
  Hourglass,
  Layers,
  ArrowUpDown,
  RefreshCw,
  FolderPlus
} from "lucide-react";

interface PeriodoItem {
  id?: string | number;
  tipo?: string;
  rotulo?: string;
  inicio?: string;
  fim?: string;
}

interface ProjetoCronograma {
  id: string | number;
  numero_proposta?: string;
  nome_projeto?: string;
  termo_fomento?: string;
  aplicabilidade?: string;
  ativo?: boolean;
  data_inicio?: string;
  data_fim?: string;
  vigencia_inicio?: string;
  vigencia_fim?: string;
  periodos?: PeriodoItem[] | string;
  descricao?: string;
}

export default function Cronogramas() {
  const location = useLocation();
  const navigate = useNavigate();

  // Modo determinado diretamente pela URL da rota
  const isModoEventos = location.pathname.includes("/eventos");
  const tipoAtivo = isModoEventos ? "eventos" : "projetos";

  const [currentInstitute, setCurrentInstitute] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
    }
    return "IBRASE";
  });

  const [projetos, setProjetos] = useState<ProjetoCronograma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "em_andamento" | "futuros" | "concluidos">("todos");
  const [selectedProjetoId, setSelectedProjetoId] = useState<string | number | null>(null);

  const fetchProjetos = () => {
    setLoading(true);
    const inst = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
    setCurrentInstitute(inst);

    fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}&t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        const list: ProjetoCronograma[] = Array.isArray(data) ? data : (data?.data || []);
        setProjetos(list);
      })
      .catch((err) => {
        console.error("Erro ao carregar cronogramas:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjetos();
  }, [location.pathname]);

  // Filtra itens pela aplicabilidade (Eventos vs Projetos)
  const itensDoModo = useMemo(() => {
    return projetos.filter((p) => {
      const ap = (p.aplicabilidade || "").toLowerCase().trim();
      const ehEvento = ap === "evento" || ap === "eventos";
      return isModoEventos ? ehEvento : !ehEvento;
    });
  }, [projetos, isModoEventos]);

  // Helper de cálculo de status de data
  const calcularStatusData = (inicio?: string, fim?: string) => {
    if (!inicio && !fim) return { label: "Indefinido", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", tipo: "indefinido" };
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dInicio = inicio ? new Date(inicio + "T00:00:00") : null;
    const dFim = fim ? new Date(fim + "T23:59:59") : null;

    if (dInicio && hoje < dInicio) {
      return { label: "Futuro", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300", tipo: "futuros" };
    }
    if (dFim && hoje > dFim) {
      return { label: "Concluído", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", tipo: "concluidos" };
    }
    return { label: "Em Andamento", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300", tipo: "em_andamento" };
  };

  // Helper de formatação de data
  const formatarData = (val?: string) => {
    if (!val) return "—";
    const partes = val.split("T")[0].split("-");
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return val;
  };

  // Extrai períodos de um projeto
  const extrairPeriodos = (p: ProjetoCronograma): PeriodoItem[] => {
    let raw = p.periodos;
    if (typeof raw === "string") {
      try { raw = JSON.parse(raw); } catch (e) { raw = []; }
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return raw;
    }
    // Fallback: se não tiver períodos cadastrados, usa vigência como período único
    const dtInicio = p.data_inicio || p.vigencia_inicio;
    const dtFim = p.data_fim || p.vigencia_fim;
    if (dtInicio || dtFim) {
      return [
        {
          id: "vigencia-geral",
          tipo: "execucao",
          rotulo: "Vigência Geral do Termo",
          inicio: dtInicio,
          fim: dtFim
        }
      ];
    }
    return [];
  };

  // Itens filtrados por busca e status
  const itensFiltrados = useMemo(() => {
    return itensDoModo.filter((item) => {
      const nome = (item.nome_projeto || "").toLowerCase();
      const num = (item.numero_proposta || "").toLowerCase();
      const termo = (item.termo_fomento || "").toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchTexto = !term || nome.includes(term) || num.includes(term) || termo.includes(term);
      if (!matchTexto) return false;

      if (filtroStatus !== "todos") {
        const dtInicio = item.data_inicio || item.vigencia_inicio;
        const dtFim = item.data_fim || item.vigencia_fim;
        const status = calcularStatusData(dtInicio, dtFim);
        if (status.tipo !== filtroStatus) return false;
      }

      return true;
    });
  }, [itensDoModo, searchTerm, filtroStatus]);

  // Se nenhum projeto estiver selecionado, seleciona o primeiro filtrado
  useEffect(() => {
    if (itensFiltrados.length > 0) {
      const existe = itensFiltrados.some((p) => String(p.id) === String(selectedProjetoId));
      if (!existe) {
        setSelectedProjetoId(itensFiltrados[0].id);
      }
    } else {
      setSelectedProjetoId(null);
    }
  }, [itensFiltrados]);

  const projetoSelecionado = useMemo(() => {
    return itensDoModo.find((p) => String(p.id) === String(selectedProjetoId));
  }, [itensDoModo, selectedProjetoId]);

  const periodosSelecionados = projetoSelecionado ? extrairPeriodos(projetoSelecionado) : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* ── CABEÇALHO DO MÓDULO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isModoEventos
                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}>
              <CalendarDays size={14} /> Cronogramas • {isModoEventos ? "Eventos" : "Projetos"}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Instituto: {currentInstitute}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isModoEventos ? "Cronograma de Eventos & Torneios" : "Cronograma de Projetos Sociais"}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            {isModoEventos
              ? "Acompanhe as datas e marcos temporais das etapas dos eventos, torneios e competições."
              : "Visualize as etapas, vigência e cronograma de execução das propostas e projetos esportivos."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProjetos}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Atualizar dados do servidor"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Atualizar</span>
          </button>

          <Link
            to="/admin/propostas"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-all shadow-sm"
          >
            <FolderPlus size={14} />
            <span>Gerenciar Propostas</span>
          </Link>
        </div>
      </div>

      {/* ── FILTROS E BUSCA ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, proposta ou termo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} /> Status:
          </span>
          {(["todos", "em_andamento", "futuros", "concluidos"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filtroStatus === st
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {st === "todos" && "Todos"}
              {st === "em_andamento" && "Em Andamento"}
              {st === "futuros" && "Futuros"}
              {st === "concluidos" && "Concluídos"}
            </button>
          ))}
        </div>
      </div>

      {/* ── CORPO PRINCIPAL: BLOQUINHOS À ESQUERDA + DETALHE DO CRONOGRAMA À DIREITA ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Carregando cronogramas do instituto...</p>
        </div>
      ) : itensDoModo.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            {isModoEventos ? <PartyPopper size={28} /> : <Trophy size={28} />}
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Nenhum {isModoEventos ? "evento" : "projeto"} encontrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Não há propostas com aplicabilidade de {isModoEventos ? "evento" : "projeto"} cadastradas para o instituto {currentInstitute}.
            </p>
          </div>
          <Link
            to="/admin/cadastrar-projeto"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Cadastrar Nova Proposta
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Bloquinhos das Propostas */}
          <div className="lg:col-span-4 space-y-3 max-h-[750px] overflow-y-auto pr-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Selecione o {isModoEventos ? "Evento" : "Projeto"} ({itensFiltrados.length})
            </p>

            {itensFiltrados.map((item) => {
              const isSelected = String(item.id) === String(selectedProjetoId);
              const dtInicio = item.data_inicio || item.vigencia_inicio;
              const dtFim = item.data_fim || item.vigencia_fim;
              const status = calcularStatusData(dtInicio, dtFim);
              const periodos = extrairPeriodos(item);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedProjetoId(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-3 ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-slate-900 dark:border-white shadow-md ring-2 ring-slate-900/10 dark:ring-white/10"
                      : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {item.numero_proposta ? `Proposta ${item.numero_proposta}` : `ID #${item.id}`}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.nome_projeto || "Proposta Sem Nome"}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <span>{formatarData(dtInicio)} até {formatarData(dtFim)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                      <span className="text-slate-400">Marcos cadastrados:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {periodos.length} {periodos.length === 1 ? "etapa" : "etapas"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coluna Direita: Detalhe e Timeline do Cronograma */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            {projetoSelecionado ? (
              <>
                {/* Cabeçalho do Projeto Selecionado */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {projetoSelecionado.numero_proposta ? `Proposta nº ${projetoSelecionado.numero_proposta}` : `ID #${projetoSelecionado.id}`}
                      </span>
                      {projetoSelecionado.termo_fomento && (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          Termo: {projetoSelecionado.termo_fomento}
                        </span>
                      )}
                      {(() => {
                        const dtInicio = projetoSelecionado.data_inicio || projetoSelecionado.vigencia_inicio;
                        const dtFim = projetoSelecionado.data_fim || projetoSelecionado.vigencia_fim;
                        const st = calcularStatusData(dtInicio, dtFim);
                        return (
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${st.color}`}>
                            {st.label}
                          </span>
                        );
                      })()}
                    </div>

                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {projetoSelecionado.nome_projeto}
                    </h2>

                    {projetoSelecionado.descricao && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {projetoSelecionado.descricao}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/admin/cadastrar-projeto?id=${projetoSelecionado.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Editar Proposta</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>

                {/* Resumo de Vigência Geral */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data de Início da Vigência</span>
                    <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-500" />
                      {formatarData(projetoSelecionado.data_inicio || projetoSelecionado.vigencia_inicio)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data de Término da Vigência</span>
                    <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      {formatarData(projetoSelecionado.data_fim || projetoSelecionado.vigencia_fim)}
                    </p>
                  </div>
                </div>

                {/* Timeline Visual de Marcos e Períodos */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Clock size={16} className="text-slate-500" />
                      Linha do Tempo das Etapas ({periodosSelecionados.length})
                    </h3>
                  </div>

                  {periodosSelecionados.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                      <p className="text-xs text-slate-500">Nenhum período ou etapa cadastrado para esta proposta.</p>
                      <Link
                        to={`/admin/cadastrar-projeto?id=${projetoSelecionado.id}`}
                        className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Clique aqui para adicionar etapas na proposta
                      </Link>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {periodosSelecionados.map((periodo, idx) => {
                        const statusPeriodo = calcularStatusData(periodo.inicio, periodo.fim);

                        return (
                          <div key={periodo.id || idx} className="relative space-y-1.5">
                            {/* Marcador na linha do tempo */}
                            <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                              statusPeriodo.tipo === "em_andamento"
                                ? "bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse"
                                : statusPeriodo.tipo === "concluidos"
                                ? "bg-slate-400"
                                : "bg-blue-500"
                            }`} />

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {periodo.rotulo || `Etapa #${idx + 1}`}
                                </h4>

                                <div className="flex items-center gap-2">
                                  {periodo.tipo && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                      {periodo.tipo}
                                    </span>
                                  )}
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusPeriodo.color}`}>
                                    {statusPeriodo.label}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-400">Início:</span>
                                  <span>{formatarData(periodo.inicio)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-400">Término:</span>
                                  <span>{formatarData(periodo.fim)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400">
                Selecione uma proposta à esquerda para visualizar seu cronograma completo.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
