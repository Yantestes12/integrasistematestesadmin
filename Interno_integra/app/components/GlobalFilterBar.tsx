import React, { useEffect, useState, useMemo } from 'react';
import { safeSetSession, flattenResponse } from '~/utils/apiCache';
import { Filter, X, Building, MapPin, Layers, Calendar } from 'lucide-react';

export const GlobalFilterBar = () => {
  const [currentInstitute, setCurrentInstitute] = useState(() => 
    typeof window !== 'undefined' ? (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase() : "IBRASE"
  );

  // 1. SWR Cache Hydration: Inicializa propostas e núcleos instantaneamente em 0ms
  const [projetos, setProjetos] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const inst = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
      const cached = sessionStorage.getItem(`cache_projetos_list_${inst}`);
      if (cached) {
        try {
          const list = flattenResponse(JSON.parse(cached));
          if (Array.isArray(list) && list.length > 0) {
            return list.filter((p: any) => p && (p.id || p.nome));
          }
        } catch (e) {}
      }
    }
    return [];
  });

  const [nucleos, setNucleos] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const inst = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
      const cached = sessionStorage.getItem(`cache_nucleos_list_${inst}`) || sessionStorage.getItem(`cache_raw_nucleos_${inst}`);
      if (cached) {
        try {
          const list = flattenResponse(JSON.parse(cached));
          if (Array.isArray(list) && list.length > 0) {
            return list.filter((n: any) => n && (n.id || n.nome));
          }
        } catch (e) {}
      }
    }
    return [];
  });

  const [cidades, setCidades] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const inst = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
      const cached = sessionStorage.getItem(`cache_nucleos_list_${inst}`) || sessionStorage.getItem(`cache_raw_nucleos_${inst}`);
      if (cached) {
        try {
          const list = JSON.parse(cached);
          if (Array.isArray(list)) {
            const set = new Set<string>();
            list.forEach((n: any) => {
              if (n.cidade && typeof n.cidade === 'string' && n.cidade.trim().length > 1) {
                set.add(n.cidade.trim());
              }
            });
            return Array.from(set).sort();
          }
        } catch (e) {}
      }
    }
    return [];
  });

  const [selectedProjeto, setSelectedProjeto] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem("global_projeto_filter") || "all" : "all"
  );
  const [selectedCidade, setSelectedCidade] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem("global_cidade_filter") || "all" : "all"
  );
  const [selectedNucleo, setSelectedNucleo] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem("global_nucleo_filter") || "all" : "all"
  );
  const [selectedTrimestre, setSelectedTrimestre] = useState<string>(() => 
    typeof window !== 'undefined' ? localStorage.getItem("global_trimestre_filter") || "all" : "all"
  );

  const [isMobileOpen, setIsMobileOpen] = useState(false);


  // 2. Busca paralela resiliente com salvamento em cache (projetos, nucleos e espacos para cidades)
  const fetchFilterData = async (inst: string) => {
    // 2.1 Busca de Projetos / Propostas
    fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const text = await res.text();
        const data = JSON.parse(text);
        const flat = flattenResponse(data).filter((p: any) => p && (p.id || p.nome));
        if (flat.length > 0) {
          setProjetos(flat);
          safeSetSession(`cache_projetos_list_${inst}`, flat);

          // Só reseta se o projeto salvo anteriormente realmente não existe nessa lista nova de projetos
          const savedP = localStorage.getItem('global_projeto_filter') || 'all';
          if (savedP !== 'all' && !flat.find((p: any) => String(p.id) === savedP)) {
            localStorage.setItem('global_projeto_filter', 'all');
            setSelectedProjeto('all');
            window.dispatchEvent(new Event("globalFilterChanged"));
          }
        }
      })
      .catch((err) => console.warn("Erro ao buscar projetos no GlobalFilterBar:", err));

    // 2.2 Busca de Núcleos e Espaços (para resolver Cidades reais dos núcleos)
    Promise.allSettled([
      fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst}`, { cache: "no-store" }),
      fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${inst}`, { cache: "no-store" }),
    ]).then(async ([resN, resE]) => {
      const espacosMap: Record<string, string> = {};
      const espacosByName: Record<string, string> = {};

      if (resE.status === "fulfilled" && resE.value.ok) {
        try {
          const textE = await resE.value.text();
          const dataE = JSON.parse(textE);
          const flatE = flattenResponse(dataE);
          flatE.forEach((e: any) => {
            if (e.id && e.cidade && e.cidade !== "temp" && !String(e.cidade).startsWith("Cidade ID")) {
              espacosMap[String(e.id)] = String(e.cidade).trim();
            }
            if (e.nome && e.cidade && e.cidade !== "temp" && !String(e.cidade).startsWith("Cidade ID")) {
              espacosByName[String(e.nome).trim().toLowerCase()] = String(e.cidade).trim();
            }
          });
        } catch (e) {}
      }

      if (resN.status === "fulfilled" && resN.value.ok) {
        try {
          const textN = await resN.value.text();
          const dataN = JSON.parse(textN);
          const flatN = flattenResponse(dataN).filter((n: any) => n && (n.id || n.nome));

          const enriched = flatN.map((n: any) => {
            const espacoId = n.espaco_id ? String(n.espaco_id) : "";
            const nNome = String(n.nome || n.nome_nucleo || "").trim().toLowerCase();
            const cid = n.cidade || espacosMap[espacoId] || espacosByName[nNome] || "";
            return {
              ...n,
              cidade: cid,
              cidade_nome: cid,
            };
          });

          if (enriched.length > 0) {
            setNucleos(enriched);
            safeSetSession(`cache_nucleos_list_${inst}`, enriched);

            const cidadesSet = new Set<string>();
            enriched.forEach((n: any) => {
              const c = (n.cidade || "").trim();
              if (c && c.length > 1) {
                cidadesSet.add(c);
              }
            });
            setCidades(Array.from(cidadesSet).sort());

            // Validação inicial do núcleo salvo contra a lista e o projeto
            const savedP = localStorage.getItem('global_projeto_filter') || 'all';
            const savedN = localStorage.getItem('global_nucleo_filter') || 'all';
            if (savedN !== 'all') {
              const foundN = enriched.find((n: any) => String(n.id) === savedN);
              const nProj = foundN?.projeto_id ?? foundN?.id_projeto ?? foundN?.projeto;
              if (!foundN || (savedP !== 'all' && String(nProj).trim() !== savedP.trim())) {
                localStorage.setItem('global_nucleo_filter', 'all');
                setSelectedNucleo('all');
                window.dispatchEvent(new Event("globalFilterChanged"));
              }
            }
          }
        } catch (e) {}
      }
    }).catch((err) => console.warn("Erro ao buscar núcleos e espaços no GlobalFilterBar:", err));
  };

  useEffect(() => {
    const inst = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
    setCurrentInstitute(inst);
    fetchFilterData(inst);

    // Carrega filtros salvos inicialmente
    setSelectedProjeto(localStorage.getItem("global_projeto_filter") || "all");
    setSelectedCidade(localStorage.getItem("global_cidade_filter") || "all");
    setSelectedNucleo(localStorage.getItem("global_nucleo_filter") || "all");
    setSelectedTrimestre(localStorage.getItem("global_trimestre_filter") || "all");

    // Listener para quando o instituto for alterado em outra tela/topbar
    const handleStorageUpdate = () => {
      const updatedInst = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
      setCurrentInstitute(updatedInst);
      fetchFilterData(updatedInst);
    };

    window.addEventListener("activeRoleChanged", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("activeRoleChanged", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Sincroniza estado local se o filtro for alterado externamente
  useEffect(() => {
    const syncFilters = () => {
      setSelectedProjeto(localStorage.getItem("global_projeto_filter") || "all");
      setSelectedCidade(localStorage.getItem("global_cidade_filter") || "all");
      setSelectedNucleo(localStorage.getItem("global_nucleo_filter") || "all");
      setSelectedTrimestre(localStorage.getItem("global_trimestre_filter") || "all");
    };
    window.addEventListener("globalFilterChanged", syncFilters);
    return () => window.removeEventListener("globalFilterChanged", syncFilters);
  }, []);

  // 3. Determina os trimestres (períodos) disponíveis com base no projeto selecionado
  const trimestresOptions = useMemo(() => {
    if (selectedProjeto === "all") return [];
    const proj = projetos.find(p => String(p.id) === String(selectedProjeto));
    if (!proj) return [];

    const raw = proj.periodos_json || proj.periodos;
    let pJson: any[] = [];
    if (typeof raw === 'string') {
      try { pJson = JSON.parse(raw); } catch (e) { pJson = []; }
    } else if (Array.isArray(raw)) {
      pJson = raw;
    }

    return pJson.map((t: any, idx: number) => {
      const rotulo = t.rotulo || t.nome || (t.tipo === 'planejamento' ? 'Iniciação' : `Trimestre #${idx}`);
      let dateRange = "";
      if (t.inicio && t.fim) {
        const formatD = (d: string) => {
          const parts = d.split('-');
          return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : d;
        };
        dateRange = ` (${formatD(t.inicio)} a ${formatD(t.fim)})`;
      }
      return {
        ...t,
        id: String(t.id || rotulo),
        rotulo: rotulo,
        displayLabel: `${rotulo}${dateRange}`
      };
    });
  }, [selectedProjeto, projetos]);

  // Filtra cidades disponíveis com base na proposta selecionada
  const filteredCidadesOptions = useMemo(() => {
    const list = nucleos.filter(n => {
      if (selectedProjeto !== "all") {
        const nProj = n.projeto_id ?? n.id_projeto ?? n.projeto;
        if (!nProj || String(nProj).trim() !== String(selectedProjeto).trim()) {
          return false;
        }
      }
      return true;
    });

    const set = new Set<string>();
    list.forEach((n: any) => {
      const cid = (n.cidade || n.cidade_nome || "").trim();
      if (cid && cid !== "temp" && !cid.startsWith("Cidade ID")) {
        set.add(cid);
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  }, [nucleos, selectedProjeto]);

  // Filtra núcleos compatíveis com a proposta ou cidade selecionada
  const filteredNucleosOptions = useMemo(() => {
    const list = nucleos.filter(n => {
      if (selectedProjeto !== "all") {
        const nProj = n.projeto_id ?? n.id_projeto ?? n.projeto;
        if (!nProj || String(nProj).trim() !== String(selectedProjeto).trim()) {
          return false;
        }
      }
      if (selectedCidade !== "all") {
        const nCid = (n.cidade || n.cidade_nome || "").trim().toLowerCase();
        if (!nCid || nCid !== selectedCidade.trim().toLowerCase()) {
          return false;
        }
      }
      return true;
    });

    return list.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }, [nucleos, selectedProjeto, selectedCidade]);

  // Se o núcleo atualmente selecionado não pertencer mais às opções filtradas, reseta para "all"
  useEffect(() => {
    if (selectedNucleo !== "all" && filteredNucleosOptions.length > 0) {
      const exists = filteredNucleosOptions.some(n => String(n.id) === String(selectedNucleo));
      if (!exists) {
        setSelectedNucleo("all");
        localStorage.setItem("global_nucleo_filter", "all");
        window.dispatchEvent(new Event("globalFilterChanged"));
      }
    }
  }, [filteredNucleosOptions, selectedNucleo]);

  const handleProjetoChange = (val: string) => {
    setSelectedProjeto(val);
    localStorage.setItem("global_projeto_filter", val);
    
    // Sempre reseta o núcleo ao trocar o projeto para que não fique selecionado um núcleo de outro projeto
    setSelectedNucleo("all");
    localStorage.setItem("global_nucleo_filter", "all");

    // Limpa o trimestre ao trocar de projeto (já que os trimestres são por projeto)
    setSelectedTrimestre("all");
    localStorage.setItem("global_trimestre_filter", "all");
    localStorage.removeItem("global_trimestre_inicio");
    localStorage.removeItem("global_trimestre_fim");

    // Verifica se a cidade atualmente selecionada pertence ao novo projeto
    const savedC = localStorage.getItem("global_cidade_filter") || "all";
    if (savedC !== "all") {
      const pNucleos = val === "all" ? nucleos : nucleos.filter(n => String(n.projeto_id ?? n.id_projeto ?? n.projeto).trim() === val.trim());
      const hasCidade = pNucleos.some(n => (n.cidade || n.cidade_nome || "").trim().toLowerCase() === savedC.trim().toLowerCase());
      if (!hasCidade) {
        setSelectedCidade("all");
        localStorage.setItem("global_cidade_filter", "all");
      }
    }
    
    window.dispatchEvent(new Event("globalFilterChanged"));
  };

  const handleCidadeChange = (val: string) => {
    setSelectedCidade(val);
    localStorage.setItem("global_cidade_filter", val);

    // Se o núcleo selecionado não pertencer à nova cidade, reseta núcleo para "all"
    if (val !== "all" && selectedNucleo !== "all") {
      const curNucleo = nucleos.find(n => String(n.id) === selectedNucleo);
      const curCid = (curNucleo?.cidade || curNucleo?.cidade_nome || "").trim().toLowerCase();
      if (curCid !== val.trim().toLowerCase()) {
        setSelectedNucleo("all");
        localStorage.setItem("global_nucleo_filter", "all");
      }
    }

    window.dispatchEvent(new Event("globalFilterChanged"));
  };

  const handleTrimestreChange = (val: string) => {
    setSelectedTrimestre(val);
    localStorage.setItem("global_trimestre_filter", val);
    
    let inicio = "";
    let fim = "";
    if (val !== "all") {
      const t = trimestresOptions.find(item => String(item.id || item.rotulo) === val);
      if (t) {
        inicio = t.inicio || "";
        fim = t.fim || "";
      }
    }
    localStorage.setItem("global_trimestre_inicio", inicio);
    localStorage.setItem("global_trimestre_fim", fim);
    
    window.dispatchEvent(new Event("globalFilterChanged"));
  };

  // Se a cidade atualmente selecionada não pertencer mais às opções disponíveis do projeto, reseta para "all"
  useEffect(() => {
    if (selectedCidade !== "all" && filteredCidadesOptions.length > 0) {
      const exists = filteredCidadesOptions.some(c => c.toLowerCase() === selectedCidade.toLowerCase());
      if (!exists) {
        setSelectedCidade("all");
        localStorage.setItem("global_cidade_filter", "all");
        window.dispatchEvent(new Event("globalFilterChanged"));
      }
    }
  }, [filteredCidadesOptions, selectedCidade]);

  const handleNucleoChange = (val: string) => {
    setSelectedNucleo(val);
    localStorage.setItem("global_nucleo_filter", val);
    window.dispatchEvent(new Event("globalFilterChanged"));
  };

  const handleClearFilters = () => {
    setSelectedProjeto("all");
    setSelectedCidade("all");
    setSelectedNucleo("all");
    setSelectedTrimestre("all");
    localStorage.setItem("global_projeto_filter", "all");
    localStorage.setItem("global_cidade_filter", "all");
    localStorage.setItem("global_nucleo_filter", "all");
    localStorage.setItem("global_trimestre_filter", "all");
    localStorage.removeItem("global_trimestre_inicio");
    localStorage.removeItem("global_trimestre_fim");
    window.dispatchEvent(new Event("globalFilterChanged"));
  };

  const isAnyFilterActive = selectedProjeto !== "all" || selectedCidade !== "all" || selectedNucleo !== "all" || selectedTrimestre !== "all";

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP & NOTEBOOK VERSION (Visível em md: e superiores)    */}
      {/* ========================================================= */}
      <div className="hidden md:flex sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 items-center justify-between shadow-xs w-full select-none transition-colors duration-200">
        
        <div className="flex items-center gap-3.5 flex-wrap">
          
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mr-1">
            <Filter size={14} className="text-slate-500 dark:text-slate-400" />
            <span>Filtro Geral:</span>
          </div>

          {/* 1. Filtro de Proposta */}
          <div className="flex items-center gap-1.5">
            <Layers size={13} className="text-slate-400 dark:text-slate-500" />
            <select 
              value={selectedProjeto}
              onChange={(e) => handleProjetoChange(e.target.value)}
              className={`text-xs font-bold outline-none cursor-pointer border rounded-lg px-2.5 py-1.5 transition-all ${
                selectedProjeto !== "all"
                  ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 ring-2 ring-blue-500/10"
                  : "bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700"
              }`}
            >
              <option value="all">Todas as Propostas</option>
              {projetos.map(p => (
                <option key={p.id} value={p.id}>{p.nome || p.proposta || `Proposta #${p.id}`}</option>
              ))}
            </select>
          </div>

          {/* 1.5. Filtro de Trimestre (Vinculado à Proposta) */}
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
            <select 
              value={selectedTrimestre}
              onChange={(e) => handleTrimestreChange(e.target.value)}
              disabled={selectedProjeto === "all"}
              className={`text-xs font-bold outline-none border rounded-lg px-2.5 py-1.5 transition-all ${
                selectedProjeto === "all"
                  ? "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70 border-slate-200 dark:border-slate-800"
                  : selectedTrimestre !== "all"
                  ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/10 cursor-pointer"
                  : "bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700 cursor-pointer"
              }`}
            >
              <option value="all">
                {selectedProjeto === "all" ? "Selecione a Proposta" : "Todos os Períodos"}
              </option>
              {selectedProjeto !== "all" && trimestresOptions.length === 0 && (
                <option value="all" disabled>⚠️ Sem períodos cadastrados</option>
              )}
              {trimestresOptions.map((t, idx) => (
                <option key={t.id || idx} value={t.id || t.rotulo}>
                  {t.displayLabel || t.rotulo}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filtro de Cidade */}
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-slate-400 dark:text-slate-500" />
            <select 
              value={selectedCidade}
              onChange={(e) => handleCidadeChange(e.target.value)}
              className={`text-xs font-bold outline-none cursor-pointer border rounded-lg px-2.5 py-1.5 transition-all ${
                selectedCidade !== "all"
                  ? "bg-violet-50 dark:bg-violet-950/60 border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300 ring-2 ring-violet-500/10"
                  : "bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700"
              }`}
            >
              <option value="all">
                {selectedProjeto !== "all" ? "Todas as Cidades do Projeto" : "Todas as Cidades"}
              </option>
              {filteredCidadesOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 3. Filtro de Núcleo */}
          <div className="flex items-center gap-1.5">
            <Building size={13} className="text-slate-400 dark:text-slate-500" />
            <select 
              value={selectedNucleo}
              onChange={(e) => handleNucleoChange(e.target.value)}
              className={`text-xs font-bold outline-none cursor-pointer border rounded-lg px-2.5 py-1.5 transition-all max-w-[220px] truncate ${
                selectedNucleo !== "all"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/10"
                  : "bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700"
              }`}
            >
              <option value="all">Todos os Núcleos</option>
              {filteredNucleosOptions.map(n => (
                <option key={n.id} value={n.id}>{n.nome || `Núcleo #${n.id}`}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Botão de Limpar Filtros Ativos */}
        {isAnyFilterActive && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/50 hover:bg-red-100/80 dark:hover:bg-red-900/40 border border-red-200/80 dark:border-red-800/80 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            title="Limpar todos os filtros"
          >
            <X size={13} />
            <span>Limpar</span>
          </button>
        )}

      </div>

      {/* ========================================================= */}
      {/* MOBILE VERSION (Botão Flutuante e Drawer para telas < md)  */}
      {/* ========================================================= */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-[60] text-white p-3.5 rounded-full shadow-xl shadow-slate-900/20 active:scale-95 transition-transform flex items-center justify-center border-2 border-white dark:border-slate-800 cursor-pointer"
        title="Abrir Filtros"
        style={{ backgroundColor: 'var(--theme-primary, #2563eb)' }}
      >
        <Filter size={24} />
        {isAnyFilterActive && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
        )}
      </button>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-[70] flex flex-col justify-end font-sans">
          {/* Backdrop Escuro */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-6 pb-10 animate-in slide-in-from-bottom-full duration-300">
            {/* Handlebar */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[var(--theme-primary, #2563eb)]">
                  <Filter size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Filtros Globais</h3>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Refine a busca de dados no painel</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Proposta */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Layers size={13} /> Proposta
                </label>
                <select 
                  value={selectedProjeto}
                  onChange={(e) => handleProjetoChange(e.target.value)}
                  className="w-full text-sm font-bold outline-none border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-850 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all appearance-none"
                >
                  <option value="all">Todas as Propostas</option>
                  {projetos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome || p.proposta || `Proposta #${p.id}`}</option>
                  ))}
                </select>
              </div>

              {/* 1.5. Trimestre (Período) */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Calendar size={13} /> Trimestre
                </label>
                <select 
                  value={selectedTrimestre}
                  onChange={(e) => handleTrimestreChange(e.target.value)}
                  disabled={selectedProjeto === "all"}
                  className={`w-full text-sm font-bold outline-none border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 transition-all appearance-none ${
                    selectedProjeto === "all"
                      ? "bg-slate-100 dark:bg-slate-900 text-slate-400 opacity-60"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-850 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/30"
                  }`}
                >
                  <option value="all">
                    {selectedProjeto === "all" ? "Selecione a Proposta" : "Todos os Períodos"}
                  </option>
                  {selectedProjeto !== "all" && trimestresOptions.length === 0 && (
                    <option value="all" disabled>⚠️ Sem períodos cadastrados</option>
                  )}
                  {trimestresOptions.map((t, idx) => (
                    <option key={t.id || idx} value={t.id || t.rotulo}>
                      {t.displayLabel || t.rotulo}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Cidade */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <MapPin size={13} /> Cidade
                </label>
                <select 
                  value={selectedCidade}
                  onChange={(e) => handleCidadeChange(e.target.value)}
                  className="w-full text-sm font-bold outline-none border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-850 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all appearance-none"
                >
                  <option value="all">
                    {selectedProjeto !== "all" ? "Todas as Cidades do Projeto" : "Todas as Cidades"}
                  </option>
                  {filteredCidadesOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 3. Núcleo */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Building size={13} /> Núcleo
                </label>
                <select 
                  value={selectedNucleo}
                  onChange={(e) => handleNucleoChange(e.target.value)}
                  className="w-full text-sm font-bold outline-none border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-850 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all appearance-none"
                >
                  <option value="all">Todos os Núcleos</option>
                  {filteredNucleosOptions.map(n => (
                    <option key={n.id} value={n.id}>{n.nome || `Núcleo #${n.id}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              {isAnyFilterActive && (
                <button
                  onClick={handleClearFilters}
                  className="flex-[0.5] py-3.5 rounded-xl font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/80 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X size={18} /> Limpar
                </button>
              )}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--theme-primary, #2563eb)' }}
              >
                Ver Resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
