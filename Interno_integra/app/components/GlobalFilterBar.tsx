import React, { useEffect, useState } from 'react';
import { Filter, X, Building, MapPin, Layers } from 'lucide-react';

export const GlobalFilterBar = () => {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [nucleos, setNucleos] = useState<any[]>([]);

  const [selectedProjeto, setSelectedProjeto] = useState<string>("all");
  const [selectedCidade, setSelectedCidade] = useState<string>("all");
  const [selectedNucleo, setSelectedNucleo] = useState<string>("all");

  const flattenResponse = (rawData: any): any[] => {
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (rawData && typeof rawData === 'object') {
      if (Array.isArray(rawData.data)) list = rawData.data;
      else if (Array.isArray(rawData.items)) list = rawData.items;
      else list = [rawData];
    }
    let flatList: any[] = [];
    list.forEach((entry: any) => {
      if (entry?.json) {
        if (Array.isArray(entry.json)) flatList.push(...entry.json);
        else flatList.push(entry.json);
      } else if (Array.isArray(entry)) {
        flatList.push(...entry);
      } else {
        flatList.push(entry);
      }
    });
    return flatList;
  };

  useEffect(() => {
    const savedInstitute = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();

    const fetchFilterData = async () => {
      try {
        const [resProj, resEsp, resNuc] = await Promise.allSettled([
          fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${savedInstitute}`, { cache: "no-store" }),
          fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${savedInstitute}`, { cache: "no-store" }),
          fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${savedInstitute}`, { cache: "no-store" }),
        ]);

        let pList: any[] = [];
        let eList: any[] = [];
        let nList: any[] = [];

        if (resProj.status === 'fulfilled' && resProj.value.ok) {
          try {
            const data = JSON.parse(await resProj.value.text());
            pList = flattenResponse(data).filter(p => p && (p.id || p.nome));
            setProjetos(pList);
          } catch (e) {}
        }

        if (resEsp.status === 'fulfilled' && resEsp.value.ok) {
          try {
            const data = JSON.parse(await resEsp.value.text());
            eList = flattenResponse(data);
          } catch (e) {}
        }

        if (resNuc.status === 'fulfilled' && resNuc.value.ok) {
          try {
            const data = JSON.parse(await resNuc.value.text());
            nList = flattenResponse(data).filter(n => n && (n.id || n.nome));
            setNucleos(nList);
          } catch (e) {}
        }

        // Extrai lista única de cidades a partir dos espaços e núcleos
        const cidadesSet = new Set<string>();
        eList.forEach(e => {
          if (e.cidade && typeof e.cidade === 'string' && e.cidade.trim().length > 1) {
            cidadesSet.add(e.cidade.trim());
          }
        });
        nList.forEach(n => {
          if (n.cidade && typeof n.cidade === 'string' && n.cidade.trim().length > 1) {
            cidadesSet.add(n.cidade.trim());
          }
        });
        const cidadesArr = Array.from(cidadesSet).sort();
        setCidades(cidadesArr);

      } catch (err) {
        console.warn("Erro ao carregar dados do GlobalFilterBar:", err);
      }
    };

    fetchFilterData();

    // Carrega filtros salvos
    const savedP = localStorage.getItem("global_projeto_filter") || "all";
    const savedC = localStorage.getItem("global_cidade_filter") || "all";
    const savedN = localStorage.getItem("global_nucleo_filter") || "all";
    setSelectedProjeto(savedP);
    setSelectedCidade(savedC);
    setSelectedNucleo(savedN);
  }, []);

  const handleProjetoChange = (val: string) => {
    setSelectedProjeto(val);
    localStorage.setItem("global_projeto_filter", val);
    window.dispatchEvent(new Event("globalFilterChanged"));
  };

  const handleCidadeChange = (val: string) => {
    setSelectedCidade(val);
    localStorage.setItem("global_cidade_filter", val);
    window.dispatchEvent(new Event("globalFilterChanged"));
  };

  const handleNucleoChange = (val: string) => {
    setSelectedNucleo(val);
    localStorage.setItem("global_nucleo_filter", val);
    window.dispatchEvent(new Event("globalFilterChanged"));
  };

  const handleClearFilters = () => {
    setSelectedProjeto("all");
    setSelectedCidade("all");
    setSelectedNucleo("all");
    localStorage.setItem("global_projeto_filter", "all");
    localStorage.setItem("global_cidade_filter", "all");
    localStorage.setItem("global_nucleo_filter", "all");
    window.dispatchEvent(new Event("globalFilterChanged"));
  };

  const isAnyFilterActive = selectedProjeto !== "all" || selectedCidade !== "all" || selectedNucleo !== "all";

  // Filtra núcleos compatíveis com a proposta ou cidade selecionada
  const filteredNucleosOptions = nucleos.filter(n => {
    if (selectedProjeto !== "all" && String(n.projeto_id) !== String(selectedProjeto)) {
      return false;
    }
    if (selectedCidade !== "all" && n.cidade && n.cidade.toLowerCase() !== selectedCidade.toLowerCase()) {
      return false;
    }
    return true;
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP VERSION (Invisível no Mobile)                       */}
      {/* ========================================================= */}
      <div className="hidden lg:flex sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 items-center justify-between shadow-xs w-full select-none transition-colors duration-200">
        
        <div className="flex items-center gap-4 flex-wrap">
          
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
              <option value="all">Todas as Cidades</option>
              {cidades.map(c => (
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
      {/* MOBILE VERSION (Botão Flutuante e Drawer)                   */}
      {/* ========================================================= */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-[60] text-white p-3.5 rounded-full shadow-xl shadow-slate-900/20 active:scale-95 transition-transform flex items-center justify-center border-2 border-white dark:border-slate-800 cursor-pointer"
        title="Abrir Filtros"
        style={{ backgroundColor: 'var(--theme-primary, #2563eb)' }}
      >
        <Filter size={24} />
        {isAnyFilterActive && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
        )}
      </button>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] flex flex-col justify-end font-sans">
          {/* Backdrop Escuro */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-6 pb-10 animate-in slide-in-from-bottom-full duration-300">
            {/* Handlbar for aesthetic drag look */}
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
                  <option value="all">Todas as Cidades</option>
                  {cidades.map(c => (
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

