import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { 
  SlidersHorizontal, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Tag, 
  GraduationCap, 
  Pause, 
  Play, 
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function Inscricoes() {
  const [nucleosList, setNucleosList] = useState<any[]>([]);
  const [matriculasList, setMatriculasList] = useState<any[]>([]);
  const [modalidadesCache, setModalidadesCache] = useState<Record<number, string>>({});
  const [projetosCache, setProjetosCache] = useState<Record<number, string>>({});
  const [projetosLimitCache, setProjetosLimitCache] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");

  const [globalProjeto, setGlobalProjeto] = useState("all");
  const [globalCidade, setGlobalCidade] = useState("all");
  const [globalNucleo, setGlobalNucleo] = useState("all");

  const [nucleoFilterStatus, setNucleoFilterStatus] = useState<"todos" | "abertos" | "pausados">("todos");
  const [nucleoSearchQuery, setNucleoSearchQuery] = useState("");
  const nucleosCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(savedInstitute);

    const updateGlobalFilter = () => {
      setGlobalProjeto(localStorage.getItem("global_projeto_filter") || "all");
      setGlobalCidade(localStorage.getItem("global_cidade_filter") || "all");
      setGlobalNucleo(localStorage.getItem("global_nucleo_filter") || "all");
    };
    updateGlobalFilter();
    window.addEventListener("globalFilterChanged", updateGlobalFilter);

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const inst = savedInstitute.toUpperCase();
        const [resNuc, resProj, resMod, resMat] = await Promise.allSettled([
          fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/matriculas-get?instituto=${inst}`)
        ]);

        const flattenArray = (rawData: any) => {
          if (!rawData) return [];
          if (Array.isArray(rawData)) {
            const result: any[] = [];
            for (let i = 0; i < rawData.length; i++) {
              const item = rawData[i];
              if (item && item.json) {
                if (Array.isArray(item.json)) {
                  for (let j = 0; j < item.json.length; j++) result.push(item.json[j]);
                } else {
                  result.push(item.json);
                }
              } else {
                result.push(item);
              }
            }
            return result;
          }
          if (typeof rawData === 'object') {
            if (Array.isArray(rawData.data)) return rawData.data;
            if (Array.isArray(rawData.items)) return rawData.items;
            if (rawData.json) return Array.isArray(rawData.json) ? rawData.json : [rawData.json];
            return [rawData];
          }
          return [];
        };

        const buildProjCache = async (resObj: any, nameCache: Record<number, string>, limitCache: Record<number, number>) => {
          if (resObj.status === 'fulfilled' && resObj.value.ok) {
            try {
              const data = await resObj.value.json();
              const arr = flattenArray(data);
              arr.forEach((i: any) => {
                const mapId = Number(i.id || i.projeto_id);
                const mapName = i.nome || i.titulo;
                const limiteVagas = Number(i.vagas_por_nucleo) || 100;
                if (!isNaN(mapId) && mapName) {
                  nameCache[mapId] = mapName;
                  limitCache[mapId] = limiteVagas;
                }
              });
            } catch(e) {}
          }
        };

        const buildModCache = async (resObj: any, cacheObj: Record<number, string>) => {
          if (resObj.status === 'fulfilled' && resObj.value.ok) {
            try {
              const data = await resObj.value.json();
              const arr = flattenArray(data);
              arr.forEach((i: any) => {
                const mapId = Number(i.id || i.modalidade_id);
                const mapName = i.nome || i.titulo;
                if (!isNaN(mapId) && mapName) cacheObj[mapId] = mapName;
              });
            } catch(e) {}
          }
        };

        let pCache: Record<number, string> = {};
        let pLimitCache: Record<number, number> = {};
        let mCache: Record<number, string> = {};

        await Promise.all([
          buildProjCache(resProj, pCache, pLimitCache),
          buildModCache(resMod, mCache)
        ]);

        setProjetosCache(pCache);
        setProjetosLimitCache(pLimitCache);
        setModalidadesCache(mCache);

        if (resMat.status === 'fulfilled' && resMat.value.ok) {
          try {
            const data = await resMat.value.json();
            setMatriculasList(flattenArray(data));
          } catch (e) {}
        }

        if (resNuc.status === 'fulfilled' && resNuc.value.ok) {
          const json = await resNuc.value.json();
          setNucleosList(flattenArray(json));
        } else {
          setErrorMsg("Erro ao carregar os núcleos.");
        }
      } catch (err) {
        setErrorMsg("Erro de conexão ao buscar núcleos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => window.removeEventListener("globalFilterChanged", updateGlobalFilter);
  }, []);

  const handleToggleCaptacao = async (item: any) => {
    try {
      const isAtivo = item.ativo !== false && item.ativo !== 0 && item.ativo !== "0" && item.ativo !== "false";
      const novoEstado = !isAtivo;
      
      const formData = new FormData();
      formData.append("id", String(item.id || item.id_nucleo || item.nucleo_id));
      formData.append("ativo", String(novoEstado));
      formData.append("aceitando_vagas", String(novoEstado));
      formData.append("instituto", currentInstitute.toUpperCase());

      const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-put?instituto=${currentInstitute.toUpperCase()}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setNucleosList(prev => prev.map(n => 
          (String(n.id || n.id_nucleo || n.nucleo_id) === String(item.id || item.id_nucleo || item.nucleo_id)) 
            ? { ...n, ativo: novoEstado, aceitando_vagas: novoEstado } 
            : n
        ));
      } else {
        alert("Erro ao alterar status do núcleo.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar com o servidor.");
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (nucleosCarouselRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      nucleosCarouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const nucleoStats = useMemo(() => {
    let abertos = 0;
    let pausados = 0;
    let totalValidos = 0;
    nucleosList.forEach((n) => {
      const isArquivado = !n.numero_vaga || n.numero_vaga === "—" || n.numero_vaga === "";
      if (isArquivado) return; // Ignora os arquivados
      
      totalValidos++;
      const isAtivo = n.ativo !== false && n.ativo !== 0 && n.ativo !== "0" && n.ativo !== "false";
      if (isAtivo) abertos++;
      else pausados++;
    });
    return { total: totalValidos, abertos, pausados };
  }, [nucleosList]);

  const filteredManagementNucleos = useMemo(() => {
    return nucleosList.filter((n) => {
      const isArquivado = !n.numero_vaga || n.numero_vaga === "—" || n.numero_vaga === "";
      if (isArquivado) return false;

      const id = n.id || n.id_nucleo || n.nucleo_id;
      const nome = n.nome || n.nome_nucleo || n.nucleo_nome || n.identificacao?.nomeNucleo || `Núcleo ${id}`;
      const isAtivo = n.ativo !== false && n.ativo !== 0 && n.ativo !== "0" && n.ativo !== "false";

      // Filtros Globais
      if (globalNucleo !== "all" && String(id) !== globalNucleo) return false;
      if (globalProjeto !== "all" && String(n.projeto_id) !== globalProjeto) return false;
      if (globalCidade !== "all" && n.cidade?.toLowerCase() !== globalCidade.toLowerCase()) return false;

      // Filtros Locais (Tabs)
      if (nucleoFilterStatus === "abertos" && !isAtivo) return false;
      if (nucleoFilterStatus === "pausados" && isAtivo) return false;

      if (nucleoSearchQuery.trim()) {
        const query = nucleoSearchQuery.toLowerCase();
        const matchesNome = nome.toLowerCase().includes(query);
        const modalidade = n.modalidade_nome || n.modalidade || (n.modalidade_id && modalidadesCache[Number(n.modalidade_id)]) || "";
        const matchesMod = modalidade.toLowerCase().includes(query);
        const projetoNome = n.projetos?.nome || n.projeto_nome || n.proposta || (n.projeto_id && projetosCache[Number(n.projeto_id)]) || "";
        const matchesProj = projetoNome.toLowerCase().includes(query);
        if (!matchesNome && !matchesMod && !matchesProj) return false;
      }

      return true;
    });
  }, [nucleosList, nucleoFilterStatus, nucleoSearchQuery, modalidadesCache, projetosCache, globalNucleo, globalProjeto, globalCidade]);

  const nucleosMetrics = useMemo(() => {
    const nucleosMap: Record<string, any> = {};

    matriculasList.forEach((m) => {
      const sx = (m.sexo || "").toLowerCase().trim();
      const isMale = sx.startsWith("m") || sx === "masculino";
      const isFemale = sx.startsWith("f") || sx === "feminino";
      const idade = Number(m.idade) || 0;
      const isValidIdade = idade > 0 && idade < 120;

      const nId = m.nucleo_id;
      const nIdKey = String(nId || '');
      
      // Identificação se é arquivado ou órfão
      let isArquivado = false;
      let isOrfao = !nIdKey || nIdKey === "sem" || nIdKey === "0";
      
      if (nucleoObj) {
        isArquivado = !nucleoObj.numero_vaga || nucleoObj.numero_vaga === "—" || nucleoObj.numero_vaga === "";
      } else if (!isOrfao) {
        // Tem ID mas não achou o núcleo na lista atual (foi apagado duro no banco)
        isOrfao = true;
      }

      // Filtros Globais
      if (globalNucleo !== "all" && nIdKey !== globalNucleo) return;
      
      const pId = nucleoObj?.projeto_id || m.projeto_id;
      if (globalProjeto !== "all" && String(pId) !== globalProjeto) return;

      if (globalCidade !== "all" && nucleoObj?.cidade?.toLowerCase() !== globalCidade.toLowerCase()) return;

      let nNome = "";
      let nProj = "";
      let projLimit = 0;

      if (isOrfao) {
        nNome = "⚠️ Alunos Sem Núcleo (Órfãos)";
        nProj = "Diversas Propostas / Indefinida";
      } else if (isArquivado) {
        const antigoNome = nucleoObj?.nome || nucleoObj?.nome_nucleo || m.nucleo_nome || `Núcleo ${nId}`;
        nNome = `🛑 [Desativado] ${antigoNome}`;
        nProj = "Aguardando realocação";
      } else {
        nNome = nucleoObj?.nome || nucleoObj?.nome_nucleo || m.nucleo_nome || `Núcleo ${nId}`;
        nProj = projetosCache[Number(pId)] || nucleoObj?.projetos?.nome || m.projeto_nome || 'Não Informada';
        projLimit = projetosLimitCache[Number(pId)] || 100;
      }

      if (!nucleosMap[nNome]) {
        nucleosMap[nNome] = { nome: nNome, projeto: nProj, limite: projLimit, total: 0, masc: 0, fem: 0, idadesValidas: 0, somaIdades: 0 };
      }
      
      nucleosMap[nNome].total++;
      if (isMale) nucleosMap[nNome].masc++; 
      else if (isFemale) nucleosMap[nNome].fem++;
      
      if (isValidIdade) {
        nucleosMap[nNome].idadesValidas++;
        nucleosMap[nNome].somaIdades += idade;
      }
    });

    return Object.values(nucleosMap)
      .map(n => {
        let pct = 0;
        if (n.limite > 0) {
          pct = Math.round((n.total / n.limite) * 100);
        } else {
          pct = 100; // Fallback "Sem Limite Definido"
        }
        
        return {
          ...n,
          percentualGeral: pct > 100 ? 100 : pct, // Cap em 100% pra barra visual
          mediaIdade: n.idadesValidas > 0 ? Math.round(n.somaIdades / n.idadesValidas) : 0,
          percentMasc: n.total > 0 ? Math.round((n.masc / n.total) * 100) : 0,
          percentFem: n.total > 0 ? Math.round((n.fem / n.total) * 100) : 0,
        };
      })
      .sort((a, b) => {
        // Colocar os de alerta sempre no final
        if (a.nome.includes("⚠️") || a.nome.includes("🛑")) return 1;
        if (b.nome.includes("⚠️") || b.nome.includes("🛑")) return -1;
        return b.total - a.total;
      });
  }, [matriculasList, nucleosList, projetosCache, projetosLimitCache, globalNucleo, globalProjeto, globalCidade]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Buscando painel de inscrições...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Oops!</h2>
        <p className="text-slate-600 dark:text-slate-400">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans pt-2">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 md:p-6 transition-all">
        {/* Header do Módulo com Contexto, Contadores e Busca */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-indigo-950/70 dark:text-indigo-300 dark:border dark:border-indigo-800/60 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Gestão de Inscrições dos Núcleos
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {nucleoStats.total} polos cadastrados
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inicie ou pause o recebimento de inscrições em cada núcleo em tempo real.
              </p>
            </div>
          </div>

          {/* Filtros de Status, Busca e Botões de Navegação do Carrossel */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Busca Rápida */}
            <div className="relative min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar núcleo, projeto..."
                value={nucleoSearchQuery}
                onChange={(e) => setNucleoSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {nucleoSearchQuery && (
                <button
                  onClick={() => setNucleoSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Tabs Segmentadas */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold shrink-0">
              <button
                onClick={() => setNucleoFilterStatus("todos")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  nucleoFilterStatus === "todos"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span>Todos</span>
                <span className="text-[10px] opacity-75 font-mono">({nucleoStats.total})</span>
              </button>
              
              <button
                onClick={() => setNucleoFilterStatus("abertos")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  nucleoFilterStatus === "abertos"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Ativos</span>
                <span className="text-[10px] opacity-75 font-mono">({nucleoStats.abertos})</span>
              </button>

              <button
                onClick={() => setNucleoFilterStatus("pausados")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  nucleoFilterStatus === "pausados"
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Pausados</span>
                <span className="text-[10px] opacity-75 font-mono">({nucleoStats.pausados})</span>
              </button>
            </div>

            {/* Botões de Navegação Lateral (Scroll Esquerda/Direita) */}
            <div className="hidden sm:flex items-center gap-1 shrink-0 pl-1">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                title="Rolar para esquerda"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                title="Rolar para direita"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Carrossel Lateral de Polos / Núcleos (Scroll Horizontal) */}
        <div className="pt-5">
          {filteredManagementNucleos.length === 0 ? (
            <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-2.5">
                <Building2 size={18} />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Nenhum núcleo encontrado</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {nucleoSearchQuery ? "Nenhum resultado corresponde à sua pesquisa." : "Não há núcleos cadastrados nesta visão."}
              </p>
              {nucleoSearchQuery && (
                <button
                  onClick={() => { setNucleoSearchQuery(""); setNucleoFilterStatus("todos"); }}
                  className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  Limpar filtros de busca
                </button>
              )}
            </div>
          ) : (
            <div 
              ref={nucleosCarouselRef}
              className="flex gap-4 overflow-x-auto pb-3 pt-1 custom-scrollbar snap-x snap-mandatory scroll-smooth"
            >
              {filteredManagementNucleos.map((n) => {
                const id = n.id || n.id_nucleo || n.nucleo_id;
                const nome = n.nome || n.nome_nucleo || n.nucleo_nome || n.identificacao?.nomeNucleo || `Núcleo ${id}`;
                const isAtivo = n.ativo !== false && n.ativo !== 0 && n.ativo !== "0" && n.ativo !== "false";
                
                // 1. Resolução da Modalidade
                let modalidade = "Modalidade não informada";
                const targetModId = n.modalidade_id || n.espacos?.modalidade_id;
                if (n.modalidade_nome || n.modalidade) {
                  modalidade = n.modalidade_nome || n.modalidade;
                } else if (n.modalidades?.nome) {
                  modalidade = n.modalidades.nome;
                } else if (n.espacos?.modalidade_nome) {
                  modalidade = n.espacos.modalidade_nome;
                } else if (targetModId && modalidadesCache[Number(targetModId)]) {
                  modalidade = modalidadesCache[Number(targetModId)];
                } else if (targetModId) {
                  modalidade = `Modalidade ID ${targetModId}`;
                }

                // 2. Resolução do Projeto / Proposta
                let projetoNome = "";
                if (n.projetos?.nome) {
                  projetoNome = n.projetos.nome;
                } else if (n.projeto_nome || n.proposta || n.projeto) {
                  projetoNome = n.projeto_nome || n.proposta || n.projeto;
                } else if (n.projeto_id && projetosCache[Number(n.projeto_id)]) {
                  projetoNome = projetosCache[Number(n.projeto_id)];
                } else if (n.projeto_id) {
                  projetoNome = `Proposta #${n.projeto_id}`;
                } else {
                  projetoNome = "Proposta Geral";
                }

                return (
                  <div
                    key={id}
                    className={`snap-start shrink-0 w-[275px] sm:w-[295px] rounded-xl p-4 flex flex-col justify-between transition-all duration-200 border ${
                      isAtivo
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-emerald-500/40 dark:border-emerald-500/30 hover:border-emerald-500/80 shadow-xs'
                        : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Barra Superior do Card: Tag Modalidade + Status Dot */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 truncate max-w-[150px]"
                          title={modalidade}
                        >
                          <Tag size={10} className="text-slate-400 shrink-0" />
                          <span className="truncate">{modalidade}</span>
                        </span>

                        {/* Indicador de Status */}
                        {isAtivo ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/70 dark:border-emerald-800/60 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Ativo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-slate-700/70 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>Pausado</span>
                          </span>
                        )}
                      </div>

                      {/* Nome do Núcleo */}
                      <h3
                        className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-snug truncate"
                        title={nome}
                      >
                        {nome}
                      </h3>

                      {/* Nome do Projeto / Proposta (Substituindo Endereço) */}
                      <p
                        className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5 truncate font-semibold"
                        title={`Proposta: ${projetoNome}`}
                      >
                        <GraduationCap size={13} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
                        <span className="truncate">{projetoNome}</span>
                      </p>
                    </div>

                    {/* Rodapé com Ação Clara e Direta */}
                    <div className="pt-3 mt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={() => handleToggleCaptacao(n)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] ${
                          isAtivo
                            ? 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:hover:border-rose-900/60 shadow-2xs'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {isAtivo ? (
                          <>
                            <Pause size={13} className="text-slate-400 group-hover:text-rose-500" />
                            <span>Pausar Captação</span>
                          </>
                        ) : (
                          <>
                            <Play size={13} className="fill-current" />
                            <span>Iniciar Captação</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Tabela de Distribuição por Núcleo Movida */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Distribuição por Núcleo</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Contagem de alunos, proporção de gênero e média etária em cada localidade</p>
            </div>
          </div>
          <Link 
            to="/pedagogico/matriculas"
            className="text-xs font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 border border-blue-200/80 dark:border-blue-800/60 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all self-start sm:self-auto shrink-0 shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            <FileText size={15} />
            <span>Ver Lista de Matrículas</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70 border-y border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <th className="py-3 px-4 w-14 text-center">Pos.</th>
                <th className="py-3 px-4">Núcleo</th>
                <th className="py-3 px-4">Proposta</th>
                <th className="py-3 px-4 text-center w-40">Total de Alunos</th>
                <th className="py-3 px-4 text-center w-48">Gênero (M / F)</th>
                <th className="py-3 px-4 w-36 text-center">Média de Idade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {nucleosMetrics.map((n: any, i: number) => {
                const rankMedal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                return (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3.5 px-4 text-center font-black text-slate-400 dark:text-slate-500 text-xs">
                      {rankMedal ? (
                        <span className="text-base" title={`${i + 1}º colocado`}>{rankMedal}</span>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[11px] inline-flex items-center justify-center">
                          {i + 1}
                        </span>
                      )}
                    </td>
                    
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      <span className="truncate max-w-[280px] block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={n.nome}>
                        {n.nome}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-600 dark:text-slate-400 text-sm block" title={n.projeto}>
                        {n.projeto}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-black text-slate-900 dark:text-white text-base">{n.total} <span className="text-[10px] text-slate-400 font-medium">/ {n.limite || '∞'} vagas</span></span>
                        <div className="flex items-center justify-center gap-1.5 mt-0.5 w-full">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600">
                            <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${n.percentualGeral}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold w-6 text-right">{n.percentualGeral}%</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                        <span className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-800/60">{n.percentMasc}% M</span>
                        <span className="text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded-md border border-pink-200/80 dark:border-pink-800/60">{n.percentFem}% F</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/60 px-3 py-1 rounded-lg text-xs font-black">
                        {n.mediaIdade > 0 ? `${n.mediaIdade} anos` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {nucleosMetrics.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3 border border-slate-200 dark:border-slate-700">
                        <Building2 size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Sem dados suficientes</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Não há matrículas ativas o suficiente para gerar a distribuição por núcleo.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
