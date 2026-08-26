import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Users,
  Search,
  MapPin,
  BookOpen,
  ArrowRightLeft,
  X,
  Check,
  Loader2,
} from "lucide-react";

/* ─── Tipos ─── */
interface MatriculaItem {
  id: string | number;
  aluno_nome: string;
  aluno_cpf?: string;
  nucleo_nome?: string;
  nucleo_id?: string | number;
  turma?: string;
  telefone_conta?: string;
}

interface NucleoInfo {
  id: string | number;
  nome: string;
  bairro?: string;
  foto?: string;
  cidade?: string;
  projeto_id?: string | number;
  isArquivado?: boolean;
}

/* ─── Configuração de cores por turma ─── */
const TURMA_CONFIG: Record<string, { label: string; color: string; bg: string; bgCard: string; dot: string; border: string; ring: string }> = {
  A: {
    label: "Turma A",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-500",
    bgCard: "bg-blue-50 dark:bg-blue-950/25",
    dot: "bg-blue-500",
    border: "border-blue-200 dark:border-blue-800/50",
    ring: "ring-blue-500/30",
  },
  B: {
    label: "Turma B",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500",
    bgCard: "bg-emerald-50 dark:bg-emerald-950/25",
    dot: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-800/50",
    ring: "ring-emerald-500/30",
  },
  C: {
    label: "Turma C",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500",
    bgCard: "bg-amber-50 dark:bg-amber-950/25",
    dot: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-800/50",
    ring: "ring-amber-500/30",
  },
  D: {
    label: "Turma D",
    color: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-500",
    bgCard: "bg-rose-50 dark:bg-rose-950/25",
    dot: "bg-rose-500",
    border: "border-rose-200 dark:border-rose-800/50",
    ring: "ring-rose-500/30",
  },
};

const FALLBACK_CONFIG = {
  label: "Outra",
  color: "text-slate-600 dark:text-slate-400",
  bg: "bg-slate-400",
  bgCard: "bg-slate-50 dark:bg-slate-800/30",
  dot: "bg-slate-400",
  border: "border-slate-200 dark:border-slate-700",
  ring: "ring-slate-400/30",
};

/* ─── Flatten helper ─── */
const flattenArray = (rawData: any): any[] => {
  if (Array.isArray(rawData)) {
    const result: any[] = [];
    for (const item of rawData) {
      if (item && typeof item === "object" && item.json) {
        if (Array.isArray(item.json)) result.push(...item.json);
        else result.push(item.json);
      } else {
        result.push(item);
      }
    }
    return result;
  }
  if (typeof rawData === "object") {
    if (Array.isArray(rawData.data)) return rawData.data;
    if (Array.isArray(rawData.items)) return rawData.items;
    if (rawData.json) return Array.isArray(rawData.json) ? rawData.json : [rawData.json];
    return [rawData];
  }
  return [];
};

/* ════════════════════════════════════════════════════════ */
export default function Turmas() {
  const [matriculas, setMatriculas] = useState<MatriculaItem[]>([]);
  const [nucleosMap, setNucleosMap] = useState<Record<string, NucleoInfo>>({});
  const [loading, setLoading] = useState(true);
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");

  // Filtros Locais
  const [activeTurma, setActiveTurma] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNucleos, setExpandedNucleos] = useState<Record<string, boolean>>({});

  // Filtros Globais
  const [globalProjeto, setGlobalProjeto] = useState("all");
  const [globalCidade, setGlobalCidade] = useState("all");
  const [globalNucleo, setGlobalNucleo] = useState("all");

  const toggleNucleo = (id: string) => {
    setExpandedNucleos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Modal de edição de alocação (mudar núcleo e turma)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"select" | "turma" | "nucleo">("select");
  const [selectedStudent, setSelectedStudent] = useState<MatriculaItem | null>(null);
  const [targetNucleoId, setTargetNucleoId] = useState<string>("");
  const [targetTurma, setTargetTurma] = useState<string>("A");
  const [savingAlocacao, setSavingAlocacao] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const BASE = "https://w.ibrase.com.br/webhook/";

  const openAlocacaoModal = (aluno: MatriculaItem) => {
    setSelectedStudent(aluno);
    setTargetNucleoId(String(aluno.nucleo_id || ""));
    setTargetTurma(aluno.turma && aluno.turma !== "—" ? aluno.turma : "A");
    setSaveSuccessMsg(null);
    setModalStep("select");
    setEditModalOpen(true);
  };

  const handleSaveAlocacao = async (newTurma?: string, newNucleoId?: string) => {
    if (!selectedStudent) return;
    setSavingAlocacao(true);
    setSaveSuccessMsg(null);

    const finalTurma = newTurma ?? targetTurma;
    const finalNucleoId = newNucleoId ?? targetNucleoId;

    if (newTurma) setTargetTurma(newTurma);
    if (newNucleoId) setTargetNucleoId(newNucleoId);

    try {
      const payload = {
        instituto: currentInstitute,
        id: selectedStudent.id,
        nucleo_id: finalNucleoId ? (isNaN(Number(finalNucleoId)) ? finalNucleoId : Number(finalNucleoId)) : null,
        turma: finalTurma.trim() || "A",
      };

      const res = await fetch(`${BASE}matriculas-alocacao-put`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Atualização otimista local
      const updatedNucleoNome = nucleosMap[finalNucleoId]?.nome || (finalNucleoId ? `Núcleo ${finalNucleoId}` : "Sem Núcleo");
      setMatriculas((prev) =>
        prev.map((m) =>
          String(m.id) === String(selectedStudent.id)
            ? {
                ...m,
                nucleo_id: payload.nucleo_id ?? "",
                nucleo_nome: updatedNucleoNome,
                turma: payload.turma,
              }
            : m
        )
      );

      const pNome = selectedStudent.aluno_nome ? selectedStudent.aluno_nome.split(" ")[0] : "Aluno";
      if (newTurma) {
        setSaveSuccessMsg(`${pNome} movido(a) para Turma ${finalTurma}!`);
      } else {
        setSaveSuccessMsg(`${pNome} transferido(a) para ${updatedNucleoNome}!`);
      }
      
      setTimeout(() => {
        setEditModalOpen(false);
        setSelectedStudent(null);
        setSaveSuccessMsg(null);
      }, 1500);
    } catch (err) {
      console.error("Erro ao atualizar alocação:", err);
      alert("Erro ao salvar alocação. Verifique a conexão com o webhook.");
    } finally {
      setSavingAlocacao(false);
    }
  };

  /* ─── Fetch ─── */
  useEffect(() => {
    const inst = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(inst);
    fetchData(inst);

    const updateGlobalFilter = () => {
      setGlobalProjeto(localStorage.getItem("global_projeto_filter") || "all");
      setGlobalCidade(localStorage.getItem("global_cidade_filter") || "all");
      setGlobalNucleo(localStorage.getItem("global_nucleo_filter") || "all");
    };
    updateGlobalFilter();
    window.addEventListener("globalFilterChanged", updateGlobalFilter);
    return () => window.removeEventListener("globalFilterChanged", updateGlobalFilter);
  }, []);

  const fetchData = async (inst: string) => {
    setLoading(true);
    try {
      const [resN, resM] = await Promise.allSettled([
        fetch(`${BASE}nucleos-get?instituto=${inst}`),
        fetch(`${BASE}matriculas-get?instituto=${inst}`),
      ]);

      const nMap: Record<string, NucleoInfo> = {};
      if (resN.status === "fulfilled" && resN.value.ok) {
        const nData = await resN.value.json();
        for (const n of flattenArray(nData)) {
          const id = String(n.id || n.id_nucleo || n.nucleo_id || "");
          const isArquivado = !n.numero_vaga || n.numero_vaga === "—" || n.numero_vaga === "";
          const foto = n.foto || n.imagem_capa || n.imagem || n.url_foto || n.url || "";
          if (id) nMap[id] = { 
            id, 
            nome: n.nome || n.nucleo_nome || `Núcleo ${id}`, 
            bairro: n.bairro || "", 
            foto,
            cidade: n.cidade || n.cidade_nome || "",
            projeto_id: n.projeto_id || "",
            isArquivado
          };
        }
      }
      setNucleosMap(nMap);

      if (resM.status === "fulfilled" && resM.value.ok) {
        const text = await resM.value.text();
        const data = JSON.parse(text);
        if (data && !data.error && data.message !== "Workflow was started") {
          const rawList = flattenArray(data);
          const parsed: MatriculaItem[] = rawList.map((item: any, idx: number) => {
            const nId = String(item.nucleo_id || "");
            return {
              id: item.id || idx + 1,
              aluno_nome: item.aluno_nome || item.nome || `Aluno #${item.id || idx + 1}`,
              aluno_cpf: item.aluno_cpf || item.cpf || "",
              nucleo_nome: item.nucleo_nome || nMap[nId]?.nome || (nId ? `Núcleo ${nId}` : "Sem Núcleo"),
              nucleo_id: item.nucleo_id || "",
              turma: item.turma || "Sem Turma",
              telefone_conta: item.telefone_conta || item.whatsapp || "",
            };
          });
          setMatriculas(parsed);
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar dados de turmas:", e);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Turmas disponíveis (dinâmico) ─── */
  const turmasDisponiveis = useMemo(() => {
    const seen = new Set<string>();
    for (const m of matriculas) {
      const t = (m.turma || "").trim();
      if (t && t !== "Sem Turma") seen.add(t);
    }
    return Array.from(seen).sort();
  }, [matriculas]);

  /* ─── Dados filtrados e agrupados por núcleo ─── */
  const groupedByNucleo = useMemo(() => {
    const filtered = matriculas.filter((m) => {
      // Filtros Globais
      if (globalNucleo !== "all" && String(m.nucleo_id) !== globalNucleo) return false;
      
      if (globalProjeto !== "all" || globalCidade !== "all") {
        const nObj = nucleosMap[String(m.nucleo_id)];
        if (globalProjeto !== "all" && String(nObj?.projeto_id) !== globalProjeto) return false;
        if (globalCidade !== "all" && nObj?.cidade?.toLowerCase() !== globalCidade.toLowerCase()) return false;
      }

      // Filtro por turma
      if (activeTurma !== "all" && (m.turma || "Sem Turma") !== activeTurma) return false;
      
      // Filtro por busca
      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        return (
          (m.aluno_nome || "").toLowerCase().includes(t) ||
          (m.aluno_cpf || "").includes(searchTerm) ||
          (m.nucleo_nome || "").toLowerCase().includes(t)
        );
      }
      return true;
    });

    // Agrupar por núcleo
    const groups: Record<string, { info: NucleoInfo; alunos: MatriculaItem[] }> = {};
    for (const m of filtered) {
      const nKey = String(m.nucleo_id || "sem");
      if (!groups[nKey]) {
        groups[nKey] = {
          info: nucleosMap[nKey] || { id: nKey, nome: m.nucleo_nome || "Sem Núcleo", bairro: "" },
          alunos: [],
        };
      }
      groups[nKey].alunos.push(m);
    }

    return Object.values(groups)
      .sort((a, b) => a.info.nome.localeCompare(b.info.nome))
      .map((g) => {
        const turmasGrouped: Record<string, MatriculaItem[]> = {};
        for (const aluno of g.alunos) {
          const t = aluno.turma || "—";
          if (!turmasGrouped[t]) turmasGrouped[t] = [];
          turmasGrouped[t].push(aluno);
        }
        
        const turmasArray = Object.entries(turmasGrouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([t, alunos]) => ({
            turma: t,
            alunos: alunos.sort((a, b) => (a.aluno_nome || "").localeCompare(b.aluno_nome || ""))
          }));

        return {
          info: g.info,
          total: g.alunos.length,
          turmas: turmasArray
        };
      });
  }, [matriculas, nucleosMap, activeTurma, searchTerm, globalNucleo, globalProjeto, globalCidade]);

  /* ─── Contadores por turma (pra mostrar nos tabs) ─── */
  const turmaCounters = useMemo(() => {
    const counts: Record<string, number> = { all: matriculas.length };
    for (const m of matriculas) {
      const t = (m.turma || "—").trim();
      counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, [matriculas]);

  const totalFiltered = groupedByNucleo.reduce((sum, g) => sum + g.total, 0);

  // Auto-expandir núcleos quando há uma busca ativa
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const allExpanded: Record<string, boolean> = {};
      groupedByNucleo.forEach((g) => {
        allExpanded[String(g.info.id)] = true;
      });
      setExpandedNucleos(allExpanded);
    }
  }, [searchTerm, groupedByNucleo]);

  /* ════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5 pb-12 font-sans max-w-7xl mx-auto">

      {/* ─── Header ─── */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-100 dark:border-blue-800">
            <Users size={14} /> Módulo Pedagógico
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Gestão de Turmas
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Clique em uma turma para ver os alunos distribuídos por núcleo.
        </p>
      </div>

      {/* ─── Tabs de Turma (grande, óbvio, colorido) ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-colors">
        
        {/* Filtros: Dropdown de Turma e Busca */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
          
          <div className="w-full sm:w-auto relative">
            <select
              value={activeTurma}
              onChange={(e) => setActiveTurma(e.target.value)}
              className="w-full sm:w-56 appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm font-extrabold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">Todas as Turmas ({turmaCounters.all || 0})</option>
              {turmasDisponiveis.map(t => (
                <option key={t} value={t}>
                  Turma {t} ({turmaCounters[t] || 0})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

        {/* Barra de busca + contador */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Buscar aluno por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-slate-200 dark:border-slate-700">
            <Users size={14} />
            {totalFiltered} alunos exibidos
          </div>
        </div>
        </div>
      </div>

      {/* ─── Conteúdo principal ─── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-bold animate-pulse">Carregando turmas...</p>
        </div>
      ) : groupedByNucleo.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
            <BookOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhum aluno encontrado</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto">
            Nenhum aluno corresponde à turma ou busca selecionada.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByNucleo.map((group) => {
            const isExpanded = expandedNucleos[String(group.info.id)];
            return (
              <div
                key={String(group.info.id)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* ─── Cabeçalho do núcleo (Accordion Toggle) ─── */}
                <div 
                  onClick={() => toggleNucleo(String(group.info.id))}
                  className="flex items-center gap-4 p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {group.info.foto ? (
                    <img src={group.info.foto} alt="Espaço" className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0 border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                      <MapPin size={20} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight truncate">
                        {group.info.nome}
                      </h2>
                      {group.info.isArquivado && (
                        <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border border-red-200 dark:border-red-800/50">
                          Desativado
                        </span>
                      )}
                      {String(group.info.id) === "sem" && (
                        <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border border-orange-200 dark:border-orange-800/50">
                          Órfãos
                        </span>
                      )}
                    </div>
                    {group.info.bairro && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{group.info.bairro}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg text-xs font-black border border-slate-200 dark:border-slate-700">
                      {group.total} alunos
                    </span>
                    <div className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                {/* ─── Lista de turmas dentro do núcleo ─── */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/20 space-y-5 animate-in slide-in-from-top-2 duration-200">
                    {group.turmas.map((turmaGroup) => {
                      const tKey = turmaGroup.turma;
                      const cfg = TURMA_CONFIG[tKey] || FALLBACK_CONFIG;
                      return (
                        <div key={tKey} className="space-y-3">
                          <div className="flex items-center gap-2 px-2">
                            <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                            <h3 className={`text-sm font-black uppercase tracking-wider ${cfg.color}`}>
                              Turma {tKey}
                            </h3>
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                              {turmaGroup.alunos.length}
                            </span>
                          </div>
                          
                          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="py-2.5 px-4 w-12">#</th>
                                    <th className="py-2.5 px-4">Aluno(a)</th>
                                    <th className="py-2.5 px-4 w-36 text-center hidden sm:table-cell">Contato</th>
                                    <th className="py-2.5 px-4 w-32 text-center">Ações</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                  {turmaGroup.alunos.map((aluno, idx) => (
                                    <tr
                                      key={aluno.id}
                                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group"
                                    >
                                      <td className="py-2.5 px-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                                        {idx + 1}
                                      </td>
                                      <td className="py-2.5 px-4">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bgCard} ${cfg.border} border`}>
                                            <span className={`text-[10px] font-black ${cfg.color}`}>
                                              {(aluno.aluno_nome || "?")[0].toUpperCase()}
                                            </span>
                                          </div>
                                          <div className="min-w-0">
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block truncate">
                                              {aluno.aluno_nome}
                                            </span>
                                            {aluno.aluno_cpf && (
                                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                                CPF: {aluno.aluno_cpf}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                                        {aluno.telefone_conta || "—"}
                                      </td>
                                      <td className="py-2.5 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                          <button
                                            onClick={() => openAlocacaoModal(aluno)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
                                            title="Mover de turma"
                                          >
                                            <ArrowRightLeft size={12} />
                                            Mover
                                          </button>
                                          <Link
                                            to={`/pedagogico/matriculas/resumo/${aluno.id}`}
                                            className="px-2 py-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-[11px] font-bold no-underline hover:underline"
                                          >
                                            Ver Perfil
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL: MUDAR NÚCLEO E TURMA (ALOCAÇÃO DO ALUNO) ═════════ */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {editModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-6 transition-colors">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ArrowRightLeft size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                    Mudar Alocação
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Alterar núcleo e turma do aluno
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                disabled={savingAlocacao}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info do Aluno */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Aluno Selecionado
              </span>
              <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                {selectedStudent.aluno_nome}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                <span>Alocação atual:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {selectedStudent.nucleo_nome || "Sem Núcleo"}
                </span>
                <span>•</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  Turma {selectedStudent.turma || "—"}
                </span>
              </div>
            </div>

            {/* Formulário Interativo */}
            <div className="space-y-4">
              {modalStep === "select" && !saveSuccessMsg && (
                <div className="flex flex-col gap-3 pt-2">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1 text-center">
                    O que você deseja alterar?
                  </p>
                  <button
                    onClick={() => setModalStep("turma")}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors text-blue-700 dark:text-blue-300 font-extrabold"
                  >
                    <span>Mudar Turma</span>
                    <ArrowRightLeft size={16} />
                  </button>
                  <button
                    onClick={() => setModalStep("nucleo")}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-bold"
                  >
                    <span>Mudar Núcleo</span>
                    <MapPin size={16} />
                  </button>
                </div>
              )}

              {modalStep === "turma" && !saveSuccessMsg && (
                <div className="animate-in slide-in-from-right-4 duration-200">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center">
                    Selecione a nova Turma
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {["A", "B", "C", "D"].map((t) => {
                      const cfg = TURMA_CONFIG[t];
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleSaveAlocacao(t, undefined)}
                          disabled={savingAlocacao}
                          className={`py-4 px-2 rounded-2xl text-sm font-black border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95
                            ${cfg.bgCard} ${cfg.color} ${cfg.border} hover:shadow-md
                          `}
                        >
                          <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                          Turma {t}
                        </button>
                      );
                    })}
                  </div>
                  {savingAlocacao && (
                    <div className="flex justify-center mt-4 text-blue-600 dark:text-blue-400">
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  )}
                </div>
              )}

              {modalStep === "nucleo" && !saveSuccessMsg && (
                <div className="animate-in slide-in-from-right-4 duration-200 space-y-4">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Selecione o novo Núcleo
                  </p>
                  <select
                    value={targetNucleoId}
                    onChange={(e) => setTargetNucleoId(e.target.value)}
                    disabled={savingAlocacao}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="">Selecione um núcleo...</option>
                    {Object.values(nucleosMap)
                      .filter((n) => !n.isArquivado)
                      .sort((a, b) => a.nome.localeCompare(b.nome))
                      .map((n) => (
                        <option key={String(n.id)} value={String(n.id)}>
                          {n.nome} {n.bairro ? `(${n.bairro})` : ""}
                        </option>
                      ))}
                  </select>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setModalStep("select")}
                      disabled={savingAlocacao}
                      className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => handleSaveAlocacao(undefined, targetNucleoId)}
                      disabled={savingAlocacao}
                      className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {savingAlocacao ? <Loader2 size={16} className="animate-spin" /> : "Salvar Núcleo"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mensagem de Sucesso */}
            {saveSuccessMsg && (
              <div className="flex flex-col items-center justify-center gap-3 py-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-2">
                  <Check size={24} strokeWidth={3} />
                </div>
                <p className="text-emerald-800 dark:text-emerald-300 font-extrabold text-center px-4">
                  {saveSuccessMsg}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
