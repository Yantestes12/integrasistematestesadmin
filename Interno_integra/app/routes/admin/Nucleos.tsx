import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Edit2, Power, Loader2, Layers, Building2, Calendar, Play, Pause, HelpCircle, Check, X, Sparkles, MessageSquare, Bot, AlertCircle, CheckCircle2, Key, Send, MapPin } from "lucide-react";
import { fetchWithDedupe, clearEntityCache } from "../../utils/apiCache";

export interface NucleoItem {
  id: string | number;
  nome: string;
  projeto_id?: number;
  projeto_nome?: string;
  modalidade_id?: number;
  modalidade_nome?: string;
  bairro: string;
  cidade?: string;
  bairro_id?: number;
  espaco_id?: number;
  numero_vaga?: string | number;
  vagas?: string | number;
  instrutor?: string;
  resp_nome?: string;
  endereco?: string;
  ativo: boolean;
  aceitando_vagas: boolean;
}

// Mapa estático completo de IDs de Bairros -> Nomes para resolução instantânea
const BAIRROS_MAP: Record<number, string> = {
  1: "Piedade", 2: "Pavuna", 3: "Botafogo", 4: "Visconde de Araújo", 5: "Aroeira",
  6: "Jardim Catarina", 7: "Santa Sofia", 8: "Tapera", 9: "Tócos", 10: "Parque Rodoviário",
  11: "Nova Canaã", 12: "Salo Brand - Centro", 13: "Vila Manhães", 14: "Jardim Limeira",
  15: "Parque Fluminense", 16: "Lote XV", 17: "Santa Maria", 18: "Várzea", 19: "Tijuca",
  20: "Parada Quarenta", 21: "Tribobó", 22: "Engenho Pequeno - Zumbi", 23: "Novo Jockey",
  24: "Aeroporto", 25: "Penha", 26: "Parque Santo Amaro", 27: "Travessão", 28: "Jardim Balneário",
  29: "Aldeia da Prata", 30: "Outeiro das Pedras", 31: "Monsuaba", 32: "Vila Flávia",
  33: "Nova Brasília", 34: "Baixa Grande", 37: "Centro", 38: "Eldorado", 39: "Guaxindiba",
  40: "Parque Tropical", 41: "Pecuária", 43: "Parque Rosário", 44: "Veiga", 45: "São José",
  47: "Porto do Rosa", 48: "Apolo II", 49: "Fazenda dos Mineiros", 50: "(Bairro Temporário)",
  51: "Vila Nova", 52: "Saturnino Braga", 54: "Barra Seca", 55: "Chatuba", 59: "Santa Cruz", 60: "Loteamento Sonho Dourado"
};

// Caches dinamicos
let projetosCache: Record<number, string> = {};
let modalidadesCache: Record<number, string> = {};
let espacosCache: Record<number, any> = {};
let espacosListCache: any[] = [];

// Versão do cache — incrementar sempre que o schema de colunas do Supabase mudar.
// Isso força limpeza do sessionStorage stale quando a versão não bater.
const NUCLEOS_CACHE_VERSION = 15;

// Componente de Ajuda Rápida com Tooltip/Card Explicativo
function HelpTooltip({ title, text, align = "center" }: { title: string; text: string; align?: "left" | "right" | "center" }) {
  const [open, setOpen] = useState(false);
  const alignClass = 
    align === "left" 
      ? "left-0 top-full mt-2" 
      : align === "right" 
      ? "right-0 top-full mt-2" 
      : "left-1/2 -translate-x-1/2 top-full mt-2";

  return (
    <div className="relative inline-flex items-center ml-1 z-30">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center text-[10px] font-black cursor-pointer shadow-2xs shrink-0"
        title="Ajuda e explicação"
      >
        ?
      </button>
      {open && (
        <div 
          className={`absolute ${alignClass} w-64 p-3 bg-slate-900 text-white rounded-xl shadow-2xl text-xs z-50 normal-case font-normal border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 duration-150 text-left`}
          style={{ minWidth: "220px" }}
        >
          <p className="font-bold text-amber-400 mb-1 flex items-center gap-1">
            💡 {title}
          </p>
          <p className="text-slate-200 leading-relaxed text-[11px]">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Nucleos() {
  const [nucleos, setNucleos] = useState<NucleoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('auth_institute') || 'IBRASE' : 'IBRASE');
  const [userRole, setUserRole] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('auth_cargo') || 'colaborador').toLowerCase().trim() : 'colaborador');
  const [userAccountType, setUserAccountType] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('auth_account_type') || 'colaborador').toLowerCase().trim() : 'colaborador');
  const [globalFilter, setGlobalFilter] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('global_projeto_filter') || 'all' : 'all');
  const [globalNucleoFilter, setGlobalNucleoFilter] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('global_nucleo_filter') || 'all' : 'all');
  const [viewMode, setViewMode] = useState<'ativos' | 'desativados'>('ativos');
  const [filtroApenasPendentes, setFiltroApenasPendentes] = useState(false);
  const [desativandoId, setDesativandoId] = useState<string | number | null>(null);
  const [editingNomeId, setEditingNomeId] = useState<string | number | null>(null);
  const [editingNomeValue, setEditingNomeValue] = useState("");
  const [isSavingNome, setIsSavingNome] = useState(false);
  const [editingVagaId, setEditingVagaId] = useState<string | number | null>(null);
  const [editingVagaValue, setEditingVagaValue] = useState("");
  const [isSavingVaga, setIsSavingVaga] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const inst = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(inst);
    const IN = inst.toUpperCase();

    // ─ Cache versioning: limpa cache stale se a versão não bater ─
    const storedVersion = Number(sessionStorage.getItem(`cache_nucleos_version_${IN}`) || 0);
    if (storedVersion < NUCLEOS_CACHE_VERSION) {
      clearEntityCache(['nucleos', 'espacos']);
      sessionStorage.removeItem(`cache_raw_nucleos_${IN}`);
      sessionStorage.removeItem(`cache_nucleos_parsed_${IN}`);
      sessionStorage.setItem(`cache_nucleos_version_${IN}`, String(NUCLEOS_CACHE_VERSION));
    }

    const updateGlobalFilter = () => {
      setGlobalFilter(localStorage.getItem("global_projeto_filter") || "all");
      setGlobalNucleoFilter(localStorage.getItem("global_nucleo_filter") || "all");
    };
    updateGlobalFilter();
    window.addEventListener("globalFilterChanged", updateGlobalFilter);

    // Sempre mostra loading até que TODOS os dados estejam prontos (nucleos + projetos + modalidades + espacos).
    // Nunca exibe a tabela com dados parciais/incompletos.
    setLoading(true);

    // Repopula caches de lookup em paralelo com fetch dos núcleos.
    // Só renderiza a tabela quando TUDO estiver resolvido.
    const nucleosPromise = fetchRawNucleosData(inst);
    Promise.allSettled([fetchProjetos(inst), fetchModalidades(inst), fetchEspacos(inst)])
      .then(async () => {
        const data = await nucleosPromise;
        if (data) processNucleosData(data, inst, false);
        else setLoading(false);
      });

    return () => window.removeEventListener("globalFilterChanged", updateGlobalFilter);
  }, []);



  const fetchProjetos = async (instituteName: string) => {
    try {
      const IN = instituteName.toUpperCase();
      let raw = sessionStorage.getItem(`cache_projetos_list_${IN}`) || sessionStorage.getItem(`cache_raw_projetos_${IN}`);
      let list: any[] = [];
      if (raw) {
        try { list = flattenResponse(JSON.parse(raw)); } catch(e) { raw = null; }
      }
      if (!raw || list.length === 0) {
        list = await fetchWithDedupe(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${IN}`);
      }
      list.forEach((p: any) => {
        if (p.id && p.nome) {
          projetosCache[Number(p.id)] = p.nome;
        }
      });
    } catch (e) {
      console.warn("Erro ao buscar projetos para mapear nomes:", e);
    }
  };

  const fetchModalidades = async (instituteName: string) => {
    try {
      const IN = instituteName.toUpperCase();
      let raw = sessionStorage.getItem(`cache_raw_modalidades_${IN}`);
      let list: any[] = [];
      if (raw) {
        try { list = flattenResponse(JSON.parse(raw)); } catch(e) { raw = null; }
      }
      if (!raw || list.length === 0) {
        list = await fetchWithDedupe(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${IN}`);
      }
      list.forEach((m: any) => {
        if (m.id && m.nome) {
          modalidadesCache[Number(m.id)] = m.nome;
        }
      });
    } catch (e) {
      console.warn("Erro ao buscar modalidades para mapear nomes:", e);
    }
  };

  const fetchEspacos = async (instituteName: string) => {
    try {
      const IN = instituteName.toUpperCase();
      const list = await fetchWithDedupe(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${IN}`, 5000);
      espacosListCache = Array.isArray(list) ? list : (list?.data || []);
      espacosListCache.forEach((e: any) => {
        if (e && e.id) {
          espacosCache[Number(e.id)] = e;
        }
      });
    } catch (e) {
      console.warn("Erro ao buscar espaços para mapear bairros:", e);
    }
  };

  const flattenResponse = (rawData: any): any[] => {
    if (!rawData) return [];
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (typeof rawData === 'object') {
      if (Array.isArray(rawData.data)) list = rawData.data;
      else if (Array.isArray(rawData.items)) list = rawData.items;
      else if (Array.isArray(rawData.value)) list = rawData.value;
      else if (rawData.json) list = Array.isArray(rawData.json) ? rawData.json : [rawData.json];
      else list = [rawData];
    }
    let flat: any[] = [];
    list.forEach((entry: any) => {
      if (!entry) return;
      if (entry.json) {
        Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
      } else if (Array.isArray(entry)) {
        flat.push(...entry);
      } else {
        flat.push(entry);
      }
    });
    return flat.filter(item => item !== null && item !== undefined);
  };

  const parseNucleosList = (rawData: any): NucleoItem[] => {
    const flatList = flattenResponse(rawData);

    return flatList.map((item, idx) => {
      const id = item.id || item.id_nucleo || idx + 1;
      let espacoObj = item.espacos || (item.espaco_id ? espacosCache[Number(item.espaco_id)] : null);
      if (!espacoObj && (item.nome || item.nome_nucleo)) {
        const rawN = String(item.nome || item.nome_nucleo || '').trim().toLowerCase();
        const found = (espacosListCache || []).find((e: any) => {
          if (!e || !e.nome) return false;
          const eN = String(e.nome).trim().toLowerCase();
          return eN === rawN || rawN.startsWith(eN) || eN.startsWith(rawN);
        });
        if (found) espacoObj = found;
      }

      const nome = item.nome || item.nome_nucleo || espacoObj?.nome || `Núcleo ${id}`;
      const isAtivo = item.ativo !== false && item.ativo !== 0 && item.ativo !== "0";
      const isAceitandoVagas = item.aceitando_vagas === true;

      // 1. Resolver nome do projeto
      let projetoNome = "";
      if (item.projetos?.nome) {
        projetoNome = item.projetos.nome;
      } else if (item.projeto_nome || item.proposta) {
        projetoNome = item.projeto_nome || item.proposta;
      } else if (item.projeto_id && projetosCache[Number(item.projeto_id)]) {
        projetoNome = projetosCache[Number(item.projeto_id)];
      } else if (item.projeto_id) {
        projetoNome = `Proposta ID ${item.projeto_id}`;
      } else {
        projetoNome = "—";
      }

      // 2. Resolver nome da modalidade
      const targetModId = item.modalidade_id || espacoObj?.modalidade_id;

      let modalidadeNome = "";
      if (item.modalidades?.nome) {
        modalidadeNome = item.modalidades.nome;
      } else if (item.modalidade_nome || item.modalidade) {
        modalidadeNome = item.modalidade_nome || item.modalidade;
      } else if (espacoObj?.modalidade_nome || espacoObj?.modalidade) {
        modalidadeNome = espacoObj.modalidade_nome || espacoObj.modalidade;
      } else if (targetModId && modalidadesCache[Number(targetModId)]) {
        modalidadeNome = modalidadesCache[Number(targetModId)];
      } else if (targetModId) {
        modalidadeNome = `Modalidade ID ${targetModId}`;
      } else {
        modalidadeNome = "—";
      }

      // 3. RESOLUÇÃO ROBUSTA DA CIDADE E BAIRRO
      let cidadeNome = "";
      if (espacoObj?.cidade && espacoObj.cidade !== "temp" && !espacoObj.cidade.startsWith("Cidade ID")) {
        cidadeNome = espacoObj.cidade;
      } else if (item.cidade && item.cidade !== "temp" && !item.cidade.startsWith("Cidade ID")) {
        cidadeNome = item.cidade;
      } else if (item.espacos?.cidade) {
        cidadeNome = item.espacos.cidade;
      } else if (item.espaco_id && espacosCache[Number(item.espaco_id)]?.cidade) {
        cidadeNome = espacosCache[Number(item.espaco_id)].cidade;
      }

      // Mapeamento de contingência para nomes conhecidos
      const lowerName = String(nome || '').toLowerCase().trim();
      if (!cidadeNome) {
        if (lowerName.includes("fluminense") || lowerName.includes("wona") || lowerName.includes("lote xv") || lowerName.includes("são josé") || lowerName.includes("apollo")) {
          cidadeNome = "Belford Roxo";
        } else if (lowerName.includes("catarina") || lowerName.includes("lage") || lowerName.includes("guaxindiba") || lowerName.includes("tribobó") || lowerName.includes("zumbi") || lowerName.includes("engenho pequeno") || lowerName.includes("parada quarenta") || lowerName.includes("patronato") || lowerName.includes("santa sofia")) {
          cidadeNome = "São Gonçalo";
        } else if (lowerName.includes("josino") || lowerName.includes("saturnino") || lowerName.includes("santa cruz") || lowerName.includes("jóquei") || lowerName.includes("tócos") || lowerName.includes("tocos") || lowerName.includes("são caetano") || lowerName.includes("eldorado") || lowerName.includes("manhães") || lowerName.includes("tapera") || lowerName.includes("salo brand") || lowerName.includes("canaã") || lowerName.includes("caju") || lowerName.includes("penha") || lowerName.includes("amendoeiras") || lowerName.includes("travessão") || lowerName.includes("km 14") || lowerName.includes("goitacazes")) {
          cidadeNome = "Campos dos Goytacazes";
        } else if (lowerName.includes("batelão") || lowerName.includes("barra seca")) {
          cidadeNome = "São Francisco de Itabapoana";
        } else if (lowerName.includes("vila nova")) {
          cidadeNome = "Conceição de Macabu";
        } else if (lowerName.includes("aroeira") || lowerName.includes("botafogo") || lowerName.includes("aeroporto")) {
          cidadeNome = "Macaé";
        } else if (lowerName.includes("monsuaba")) {
          cidadeNome = "Angra dos Reis";
        } else if (lowerName.includes("itaboraí")) {
          cidadeNome = "Itaboraí";
        } else if (lowerName.includes("piedade") || lowerName.includes("pavuna") || lowerName.includes("vargem pequena")) {
          cidadeNome = "Rio de Janeiro";
        } else if (lowerName.includes("moquetá") || lowerName.includes("palmares")) {
          cidadeNome = "Nova Iguaçu";
        }
      }

      let bairroNome = "";
      if (espacoObj?.bairro && espacoObj.bairro !== "temp" && !espacoObj.bairro.startsWith("Bairro ID")) {
        bairroNome = espacoObj.bairro;
      } else if (item.bairro && item.bairro !== "temp" && !item.bairro.startsWith("Bairro ID")) {
        bairroNome = item.bairro;
      } else if (item.espacos?.bairro) {
        bairroNome = item.espacos.bairro;
      } else if (item.bairros?.nome) {
        bairroNome = item.bairros.nome;
      } else if (item.bairro_id && BAIRROS_MAP[Number(item.bairro_id)]) {
        bairroNome = BAIRROS_MAP[Number(item.bairro_id)];
      } else if (item.espaco_id && espacosCache[Number(item.espaco_id)]?.bairro) {
        bairroNome = espacosCache[Number(item.espaco_id)].bairro;
      }

      // Se bairro for idêntico ao nome do núcleo, limpa para não duplicar
      if (bairroNome && bairroNome.toLowerCase() === String(nome).toLowerCase()) {
        bairroNome = "";
      }

      // 4. VAGA DO NÚCLEO (Número da Vaga Alocada no Projeto)
      let numeroVaga: string | number = item.numero_vaga ?? item.vaga_numero ?? item.n_vaga ?? item.vaga_numero_alocado ?? item.vaga_alocada ?? item.slot_vaga ?? item.vaga_slot ?? "";
      if (numeroVaga === null || numeroVaga === undefined || String(numeroVaga).trim() === '' || String(numeroVaga) === 'null') {
        numeroVaga = "";
      }
      const semVaga = !numeroVaga || numeroVaga === "";
      if (semVaga) numeroVaga = "—";

      // 5. INSTRUTOR E ENDEREÇO
      let instrutor = item.instrutor;
      if (!instrutor || instrutor === "temp" || instrutor === "x" || instrutor === "—") {
        instrutor = "—";
      }

      const rua = espacoObj?.rua || item.rua;
      const num = espacoObj?.numero || item.numero;
      
      // Sublinha do Núcleo: Apresenta a Cidade (e rua/bairro se distintos), NUNCA repetindo o nome do núcleo
      let localizacaoFormatada = "";
      if (cidadeNome) {
        if (rua && rua !== "temp" && rua !== "xxxxxxx") {
          localizacaoFormatada = `${cidadeNome} • ${rua}${num ? `, ${num}` : ''}`;
        } else if (bairroNome && bairroNome.toLowerCase() !== cidadeNome.toLowerCase()) {
          localizacaoFormatada = `${cidadeNome} • ${bairroNome}`;
        } else {
          localizacaoFormatada = cidadeNome;
        }
      } else if (bairroNome) {
        localizacaoFormatada = bairroNome;
      } else {
        localizacaoFormatada = "Localidade vinculada";
      }

      return {
        id,
        nome,
        projeto_id: item.projeto_id,
        projeto_nome: projetoNome,
        modalidade_id: item.modalidade_id || targetModId,
        modalidade_nome: modalidadeNome,
        bairro: bairroNome,
        cidade: cidadeNome,
        bairro_id: item.bairro_id,
        espaco_id: item.espaco_id,
        numero_vaga: numeroVaga,
        vagas: item.vagas,
        instrutor: instrutor,
        resp_nome: item.resp_nome,
        endereco: localizacaoFormatada,
        ativo: isAtivo,
        aceitando_vagas: isAceitandoVagas,
      };
    });
  };

  const fetchRawNucleosData = async (instituteName: string) => {
    const IN = instituteName.toUpperCase();
    try {
      const n8nEndpoint = `https://w.ibrase.com.br/webhook/nucleos-get?instituto=${IN}`;
      const res = await fetch(n8nEndpoint, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            try { sessionStorage.setItem(`cache_raw_nucleos_${IN}`, text); } catch(e) {}
            return data;
          } catch (e) {
            console.warn("N8N returned non-JSON:", text);
          }
        }
      }
    } catch (e) {
      console.warn("Erro ao fazer fetch no Webhook N8N de Núcleos:", e);
    }
    // Fallback apenas se a rede falhar completamente
    try {
      const raw = sessionStorage.getItem(`cache_raw_nucleos_${IN}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  };

  const processNucleosData = (fetchedData: any, instituteName: string, hasCache = false) => {
    try {
      if (fetchedData) {
        if (fetchedData.message === "Workflow was started" || (Array.isArray(fetchedData) && fetchedData.length > 0 && fetchedData[0].message === "Workflow was started") || fetchedData.error) {
          if (!hasCache) console.warn("O Webhook do N8N não retornou os dados corretamente.");
          if (!hasCache) setNucleos([]);
        } else {
          const parsed = parseNucleosList(fetchedData);
          const sorted = parsed.sort((a, b) => {
            const aVaga = a.numero_vaga === "—" ? 99999 : Number(a.numero_vaga);
            const bVaga = b.numero_vaga === "—" ? 99999 : Number(b.numero_vaga);
            return aVaga - bVaga;
          });
          setNucleos(sorted);
          try {
            try { sessionStorage.setItem(`cache_nucleos_parsed_${instituteName.toUpperCase()}`, JSON.stringify(sorted)); } catch(e) { console.warn("Cache cheio", e); sessionStorage.clear(); try { sessionStorage.setItem(`cache_nucleos_parsed_${instituteName.toUpperCase()}`, JSON.stringify(sorted)); } catch(e2) {} }
            try { sessionStorage.setItem(`cache_nucleos_version_${instituteName.toUpperCase()}`, String(NUCLEOS_CACHE_VERSION)); } catch(e) { console.warn("Cache cheio", e); sessionStorage.clear(); try { sessionStorage.setItem(`cache_nucleos_version_${instituteName.toUpperCase()}`, String(NUCLEOS_CACHE_VERSION)); } catch(e2) {} }
          } catch(e) {}
        }
      }
    } catch (e) {
      console.warn("Erro ao processar dados de Núcleos:", e);
    } finally {
      setLoading(false);
    }
  };



  const handleToggleAtivo = async (item: NucleoItem) => {
    const isActivating = !item.ativo;
    const confirmMsg = isActivating 
      ? `Deseja reativar o núcleo "${item.nome}"? Ele retornará para a aba de Ativos.`
      : `Deseja realmente desativar e arquivar o núcleo "${item.nome}"? Ele irá para a aba de Desativados.`;
      
    if (!window.confirm(confirmMsg)) return;
    setDesativandoId(item.id);
    try {
      const authInstitute = currentInstitute.toUpperCase();
      const numVaga = isActivating ? ((item.numero_vaga && item.numero_vaga !== "—") ? Number(item.numero_vaga) : null) : null;
      const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-put?instituto=${authInstitute}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          nome: item.nome,
          nomeNucleo: item.nome,
          projeto_id: item.projeto_id ? Number(item.projeto_id) : null,
          projetoId: item.projeto_id ? Number(item.projeto_id) : null,
          espaco_id: item.espaco_id ? Number(item.espaco_id) : null,
          espacoId: item.espaco_id ? Number(item.espaco_id) : null,
          modalidade_id: item.modalidade_id ? Number(item.modalidade_id) : null,
          modalidadeId: item.modalidade_id ? Number(item.modalidade_id) : null,
          bairro_id: item.bairro_id ? Number(item.bairro_id) : null,
          bairroId: item.bairro_id ? Number(item.bairro_id) : null,
          bairro: item.bairro || "",
          numero_vaga: numVaga,
          numeroVaga: numVaga,
          vagas: item.vagas ? Number(item.vagas) : 100,
          ativo: isActivating,
          aceitando_vagas: isActivating,
          instrutor: (item.instrutor && item.instrutor !== "—") ? item.instrutor : null,
          instituto: authInstitute
        })
      });

      if (res.ok) {
        clearEntityCache(['nucleos']);
        setNucleos(prev => prev.map(n => n.id === item.id ? { 
          ...n, 
          ativo: isActivating, 
          aceitando_vagas: isActivating,
          ...( !isActivating ? { numero_vaga: "—" } : {} )
        } : n));
        setViewMode(isActivating ? 'ativos' : 'desativados');
      } else {
        alert("Erro ao alterar o status do núcleo via N8N.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setDesativandoId(null);
    }
  };



  // Edição rápida do nome do núcleo
  const handleStartEditNome = (item: NucleoItem) => {
    setEditingNomeId(item.id);
    setEditingNomeValue(item.nome);
  };

  const handleSaveNome = async (item: NucleoItem) => {
    const cleanNome = editingNomeValue.trim();
    if (!cleanNome || cleanNome === item.nome) {
      setEditingNomeId(null);
      return;
    }
    setIsSavingNome(true);
    try {
      const numVaga = (item.numero_vaga && item.numero_vaga !== "—") ? Number(item.numero_vaga) : null;
      const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-put?instituto=${currentInstitute}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          nome: cleanNome,
          nomeNucleo: cleanNome,
          projeto_id: item.projeto_id ? Number(item.projeto_id) : null,
          projetoId: item.projeto_id ? Number(item.projeto_id) : null,
          espaco_id: item.espaco_id ? Number(item.espaco_id) : null,
          espacoId: item.espaco_id ? Number(item.espaco_id) : null,
          modalidade_id: item.modalidade_id ? Number(item.modalidade_id) : null,
          modalidadeId: item.modalidade_id ? Number(item.modalidade_id) : null,
          bairro_id: item.bairro_id ? Number(item.bairro_id) : null,
          bairroId: item.bairro_id ? Number(item.bairro_id) : null,
          bairro: item.bairro || "",
          numero_vaga: numVaga,
          numeroVaga: numVaga,
          vagas: item.vagas ? Number(item.vagas) : 100,
          ativo: item.ativo,
          aceitando_vagas: item.aceitando_vagas,
          instrutor: (item.instrutor && item.instrutor !== "—") ? item.instrutor : null,
          instituto: currentInstitute.toUpperCase()
        })
      });
      if (res.ok) {
        setNucleos(prev => prev.map(n => n.id === item.id ? { ...n, nome: cleanNome } : n));
        clearEntityCache(['nucleos']);
        setFeedbackToast({ type: 'success', message: `Nome do núcleo atualizado para "${cleanNome}"!` });
        setTimeout(() => setFeedbackToast(null), 3500);
      } else {
        alert("Erro ao atualizar o nome do núcleo no servidor.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao salvar nome.");
    } finally {
      setIsSavingNome(false);
      setEditingNomeId(null);
    }
  };

  const handleSaveVaga = async (item: NucleoItem) => {
    const rawVal = editingVagaValue.trim();
    const cleanVaga = rawVal === "" ? null : Number(rawVal);
    setIsSavingVaga(true);
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-put?instituto=${currentInstitute}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          nome: item.nome,
          nomeNucleo: item.nome,
          projeto_id: item.projeto_id ? Number(item.projeto_id) : null,
          projetoId: item.projeto_id ? Number(item.projeto_id) : null,
          espaco_id: item.espaco_id ? Number(item.espaco_id) : null,
          espacoId: item.espaco_id ? Number(item.espaco_id) : null,
          modalidade_id: item.modalidade_id ? Number(item.modalidade_id) : null,
          modalidadeId: item.modalidade_id ? Number(item.modalidade_id) : null,
          bairro_id: item.bairro_id ? Number(item.bairro_id) : null,
          bairroId: item.bairro_id ? Number(item.bairro_id) : null,
          bairro: item.bairro || "",
          numero_vaga: cleanVaga,
          numeroVaga: cleanVaga,
          vagas: item.vagas ? Number(item.vagas) : 100,
          ativo: item.ativo,
          aceitando_vagas: item.aceitando_vagas,
          instrutor: (item.instrutor && item.instrutor !== "—") ? item.instrutor : null,
          instituto: currentInstitute.toUpperCase()
        })
      });
      if (res.ok) {
        setNucleos(prev => prev.map(n => n.id === item.id ? { ...n, numero_vaga: cleanVaga ?? "—" } : n));
        clearEntityCache(['nucleos']);
        setFeedbackToast({ type: 'success', message: cleanVaga ? `Vaga Nº ${cleanVaga} atribuída com sucesso!` : "Vaga redefinida para pendente." });
        setTimeout(() => setFeedbackToast(null), 3500);
      } else {
        alert("Erro ao atualizar a vaga no servidor.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao salvar vaga.");
    } finally {
      setIsSavingVaga(false);
      setEditingVagaId(null);
    }
  };

  const filteredNucleos = nucleos.filter((item) => {
    if (viewMode === 'ativos' && !item.ativo) return false;
    if (viewMode === 'desativados' && item.ativo) return false;
    if (viewMode === 'ativos' && filtroApenasPendentes) {
      const isPendente = item.numero_vaga === "—" || !item.numero_vaga || item.numero_vaga === "null";
      if (!isPendente) return false;
    }
    if (globalFilter !== "all" && String(item.projeto_id) !== globalFilter) return false;
    if (globalNucleoFilter !== "all" && String(item.id) !== globalNucleoFilter) return false;
    if (!searchTerm) return true;
    return (
      (item.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.bairro || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.projeto_nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.modalidade_nome || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalAtivos = nucleos.filter(n => n.ativo).length;
  const totalDesativados = nucleos.filter(n => !n.ativo).length;
  const totalPendentes = nucleos.filter(n => n.ativo && (n.numero_vaga === "—" || !n.numero_vaga || n.numero_vaga === "null")).length;

  // ─── Tela de carregamento completa ───────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 font-sans select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[var(--theme-primary)] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Layers className="w-6 h-6 text-[var(--theme-primary)]" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-slate-700 dark:text-slate-200">Carregando núcleos...</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Buscando dados de projetos, modalidades e espaços</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Skeleton preview */}
        <div className="w-full max-w-3xl space-y-3 px-4 mt-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl h-14 w-full" style={{ opacity: 1 - i * 0.18 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Núcleos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gerencie os núcleos operacionais cadastrados para o instituto <strong className="text-slate-700 dark:text-slate-200">{currentInstitute}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Botão de Núcleos Desativados */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'desativados' ? 'ativos' : 'desativados')}
            className={`font-bold px-4 py-3 rounded-xl shadow-xs border transition-all flex items-center gap-2 text-sm shrink-0 cursor-pointer ${
              viewMode === 'desativados'
                ? 'bg-red-600 text-white border-red-700 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="Visualizar núcleos desabilitados / arquivados"
          >
            <Power size={16} className={viewMode === 'desativados' ? 'text-white' : 'text-red-500'} />
            <span>Desativados ({totalDesativados})</span>
          </button>

          {/* Histórico */}
          <Link
            to="/admin/historico-nucleos"
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-5 py-3 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 text-sm shrink-0 cursor-pointer"
          >
            <Calendar size={18} className="text-slate-500 dark:text-slate-400" />
            <span>Histórico de Núcleos</span>
          </Link>
        </div>
      </div>

      {/* Alerta de Núcleos Pendentes */}
      {viewMode === 'ativos' && totalPendentes > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                {totalPendentes} núcleo(s) pendente(s) de atribuição de vaga (slot)
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Os espaços físicos cadastrados viram núcleos automaticamente. Defina a vaga clicando em "+ Definir Vaga" na tabela para habilitar a alocação.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFiltroApenasPendentes(prev => !prev)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
              filtroApenasPendentes
                ? "bg-amber-700 text-white hover:bg-amber-800 ring-2 ring-amber-500/50"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
          >
            {filtroApenasPendentes ? "Exibir Todos os Núcleos" : "Filtrar Somente Pendentes"}
          </button>
        </div>
      )}

      {/* Card da Tabela de Núcleos */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        
        {/* Barra de Filtros e Busca */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por núcleo, bairro, projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {viewMode === 'desativados' ? (
              <span className="text-red-500 font-bold">
                Exibindo {filteredNucleos.length} núcleos desativados
              </span>
            ) : filtroApenasPendentes ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                Exibindo {filteredNucleos.length} pendentes de vaga
              </span>
            ) : (
              <>Exibindo <strong className="text-slate-800 dark:text-slate-200">{filteredNucleos.length}</strong> núcleos ativos</>
            )}
          </div>
        </div>

        {/* Tabela de Dados */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-bold animate-pulse">Carregando núcleos do instituto...</p>
          </div>
        ) : filteredNucleos.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
              <Layers size={32} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
              {searchTerm || globalFilter !== "all" || globalNucleoFilter !== "all" || filtroApenasPendentes
                ? "Nenhum núcleo corresponde aos filtros"
                : "Nenhum núcleo encontrado"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1 max-w-md mx-auto">
              {searchTerm || globalFilter !== "all" || globalNucleoFilter !== "all" || filtroApenasPendentes
                ? "Tente limpar os filtros de busca ou projeto selecionados acima."
                : `Não existem registros de núcleos cadastrados para o instituto ${currentInstitute} no momento.`}
            </p>
            {searchTerm || globalFilter !== "all" || globalNucleoFilter !== "all" || filtroApenasPendentes ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setGlobalFilter("all");
                  setGlobalNucleoFilter("all");
                  setFiltroApenasPendentes(false);
                  localStorage.removeItem("global_projeto_filter");
                  localStorage.removeItem("global_nucleo_filter");
                  window.dispatchEvent(new Event("globalFilterChanged"));
                }}
                className="inline-flex items-center gap-2 mt-6 text-sm md:text-base font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors cursor-pointer"
              >
                Limpar Todos os Filtros
              </button>
            ) : (
              <Link
                to="/admin/cadastrar-nucleo"
                className="inline-flex items-center gap-2 mt-6 text-sm md:text-base font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors"
              >
                <Plus size={16} /> Cadastrar o primeiro núcleo
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-4 px-3 md:px-4 text-center w-36">
                    <div className="inline-flex items-center justify-center">
                      Vagas
                      <HelpTooltip title="Número da Vaga (Slot)" text="Número sequencial da cota/slot de atendimento vinculada ao plano de trabalho do projeto." align="left" />
                    </div>
                  </th>
                  <th className="py-4 px-3 md:px-4">
                    <div className="inline-flex items-center">
                      Núcleo
                      <HelpTooltip title="Núcleo" text="Nome de identificação do núcleo operacional e seu endereço físico vinculado. Passe o mouse ou clique no ícone de lápis para editar o nome do núcleo." align="left" />
                    </div>
                  </th>
                  <th className="py-4 px-3 md:px-4">
                    <div className="inline-flex items-center">
                      Projeto
                      <HelpTooltip title="Projeto Vinculado" text="Projeto ou iniciativa oficial do instituto onde este núcleo atua." align="center" />
                    </div>
                  </th>
                  <th className="py-4 px-3 md:px-4">
                    <div className="inline-flex items-center">
                      Modalidade
                      <HelpTooltip title="Modalidade Oferecida" text="Tipo de aula ou atividade ministrada no núcleo (ex: Futebol, Futsal, Dança, Ginástica, Natação, etc.)." align="center" />
                    </div>
                  </th>
                  <th className="py-4 px-3 md:px-4">
                    <div className="inline-flex items-center">
                      Instrutor
                      <HelpTooltip title="Instrutor / Professor" text="Profissional responsável por ministrar as aulas e orientar os alunos inscritos." align="center" />
                    </div>
                  </th>
                  <th className="py-4 px-3 md:px-4 text-center">
                    <div className="inline-flex items-center justify-center">
                      Status Físico
                      <HelpTooltip title="Status Físico Operacional" text="Ativo: Núcleo aberto e em atividade regular. Inativo: Núcleo pausado ou desativado temporariamente." align="right" />
                    </div>
                  </th>
                  <th className="py-4 px-3 md:px-4 w-28 text-center">
                    <div className="inline-flex items-center justify-center">
                      Ações
                      <HelpTooltip title="Ações Rápidas" text="Ver grade horária de turmas, editar configurações gerais ou alternar status físico do núcleo." align="right" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm md:text-base">
                {filteredNucleos.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors group">
                      
                      {/* Vagas (Primeira coluna) */}
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        {editingVagaId === item.id ? (
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              placeholder="Nº"
                              value={editingVagaValue}
                              onChange={(e) => setEditingVagaValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveVaga(item);
                                if (e.key === "Escape") setEditingVagaId(null);
                              }}
                              className="w-16 px-2 py-1 text-xs font-bold text-center bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-lg text-slate-900 dark:text-white outline-none"
                              autoFocus
                              disabled={isSavingVaga}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveVaga(item)}
                              disabled={isSavingVaga}
                              className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              title="Salvar vaga"
                            >
                              {isSavingVaga ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingVagaId(null)}
                              disabled={isSavingVaga}
                              className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 cursor-pointer"
                              title="Cancelar"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : item.numero_vaga !== "—" && item.numero_vaga !== null && item.numero_vaga !== "null" ? (
                          <div className="inline-flex items-center gap-1 group/vaga">
                            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs md:text-sm font-extrabold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
                              Nº {item.numero_vaga}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVagaId(item.id);
                                setEditingVagaValue(String(item.numero_vaga));
                              }}
                              className="opacity-0 group-hover/vaga:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer"
                              title="Alterar número da vaga"
                            >
                              <Edit2 size={11} />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60 animate-pulse">
                              ⚠ Pendente
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVagaId(item.id);
                                setEditingVagaValue("");
                              }}
                              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              + Definir Vaga
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Núcleo */}
                      <td className="py-3 md:py-4 px-3 md:px-4">
                        {editingNomeId === item.id ? (
                          <div className="flex items-center gap-1.5 py-1">
                            <input
                              type="text"
                              value={editingNomeValue}
                              onChange={(e) => setEditingNomeValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveNome(item);
                                if (e.key === "Escape") setEditingNomeId(null);
                              }}
                              className="px-2 py-1 text-sm font-bold bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-lg text-slate-900 dark:text-white outline-none ring-2 ring-blue-500/20 w-full max-w-[220px]"
                              autoFocus
                              disabled={isSavingNome}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveNome(item)}
                              disabled={isSavingNome}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                              title="Salvar novo nome"
                            >
                              {isSavingNome ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNomeId(null)}
                              disabled={isSavingNome}
                              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Cancelar edição"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block text-sm sm:text-sm md:text-base">
                              {item.nome}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditNome(item)}
                              className="opacity-60 hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                              title="Editar nome do núcleo"
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        )}
                        <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                          📍 {item.endereco}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">ID {item.id}</span>
                      </td>

                      {/* Projeto */}
                      <td className="py-3 md:py-4 px-3 md:px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">
                          {item.projeto_nome}
                        </span>
                      </td>

                      {/* Modalidade */}
                      <td className="py-3 md:py-4 px-3 md:px-4">
                        {item.modalidade_nome && item.modalidade_nome !== "—" ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm md:text-base">
                            {item.modalidade_nome}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60">
                            ⚠ Sem modalidade
                          </span>
                        )}
                      </td>

                      {/* Instrutor */}
                      <td className="py-3 md:py-4 px-3 md:px-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm md:text-base block">
                          👤 {item.instrutor || "—"}
                        </span>
                      </td>

                      {/* Status Captação (Removido) */}

                      {/* Status Físico (Ativo/Inativo) */}
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold border ${
                            item.ativo
                              ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60"
                              : "bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border-red-200/80 dark:border-red-800/60"
                          }`}
                        >
                          {item.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/admin/grade-horaria?nucleoId=${item.id}`}
                            className="p-2 rounded-lg text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                            title="Ver Grade Horária do Núcleo"
                          >
                            <Calendar size={16} />
                          </Link>
                          <Link
                            to={`/admin/cadastrar-nucleo?edit=${item.id}`}
                            className="p-2 rounded-lg text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Editar Núcleo"
                          >
                            <Edit3 size={16} />
                          </Link>

                          <button
                            onClick={() => handleToggleAtivo(item)}
                            disabled={desativandoId === item.id}
                            className={`p-2 rounded-lg transition-colors ${
                              item.ativo 
                                ? "text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50" 
                                : "text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                            }`}
                            title={item.ativo ? "Desativar e Arquivar Núcleo" : "Reativar Núcleo"}
                          >
                            {desativandoId === item.id 
                              ? <Loader2 size={16} className="animate-spin" />
                              : <Power size={16} />}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold border ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-red-600 text-white border-red-700'
          }`}>
            {feedbackToast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedbackToast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}

