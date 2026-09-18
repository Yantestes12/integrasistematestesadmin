import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Power, Loader2, Layers, Building2, Calendar, Play, Pause } from "lucide-react";

export interface NucleoItem {
  id: string | number;
  nome: string;
  projeto_id?: number;
  projeto_nome?: string;
  modalidade_id?: number;
  modalidade_nome?: string;
  bairro: string;
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

// Versão do cache — incrementar sempre que o schema de colunas do Supabase mudar.
// Isso força limpeza do sessionStorage stale quando a versão não bater.
const NUCLEOS_CACHE_VERSION = 5;

export default function Nucleos() {
  const [nucleos, setNucleos] = useState<NucleoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('auth_institute') || 'IBRASE' : 'IBRASE');
  const [userRole, setUserRole] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('auth_cargo') || 'colaborador').toLowerCase().trim() : 'colaborador');
  const [userAccountType, setUserAccountType] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('auth_account_type') || 'colaborador').toLowerCase().trim() : 'colaborador');
  const [globalFilter, setGlobalFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'ativos' | 'desativados'>('ativos');
  const [desativandoId, setDesativandoId] = useState<string | number | null>(null);

  useEffect(() => {
    const inst = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(inst);
    const IN = inst.toUpperCase();

    // ─ Cache versioning: limpa cache stale se a versão não bater ─
    const storedVersion = Number(sessionStorage.getItem(`cache_nucleos_version_${IN}`) || 0);
    if (storedVersion < NUCLEOS_CACHE_VERSION) {
      sessionStorage.removeItem(`cache_nucleos_parsed_${IN}`);
      sessionStorage.removeItem(`cache_raw_nucleos_${IN}`);
    }

    const updateGlobalFilter = () => {
      setGlobalFilter(localStorage.getItem("global_projeto_filter") || "all");
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
      const raw = sessionStorage.getItem(`cache_projetos_list_${IN}`) || sessionStorage.getItem(`cache_raw_projetos_${IN}`);
      let list = [];
      if (raw) {
        try {
          list = flattenResponse(JSON.parse(raw));
        } catch(e) {
          raw = null;
        }
      }
      if (!raw) {
        const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${instituteName.toUpperCase()}`, { cache: "no-store" });
        if (res.ok) {
          const text = await res.text();
          const data = JSON.parse(text);
          list = flattenResponse(data);
        }
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
      const raw = sessionStorage.getItem(`cache_raw_modalidades_${instituteName.toUpperCase()}`);
      let list = [];
      if (raw) {
        try {
          list = flattenResponse(JSON.parse(raw));
        } catch(e) {
          raw = null;
        }
      }
      if (!raw) {
        const res = await fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${instituteName.toUpperCase()}`, { cache: "no-store" });
        if (res.ok) {
          const text = await res.text();
          const data = JSON.parse(text);
          list = flattenResponse(data);
        }
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
      const raw = sessionStorage.getItem(`cache_raw_espacos_${instituteName.toUpperCase()}`);
      let list = [];
      if (raw) {
        try {
          list = flattenResponse(JSON.parse(raw));
        } catch(e) {
          raw = null;
        }
      }
      if (!raw) {
        const res = await fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${instituteName.toUpperCase()}`, { cache: "no-store" });
        if (res.ok) {
          const text = await res.text();
          const data = JSON.parse(text);
          list = flattenResponse(data);
        }
      }
      list.forEach((e: any) => {
        if (e.id) {
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
      const nome = item.nome || item.nome_nucleo || `Núcleo ${id}`;
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
      const espacoObj = item.espacos || (item.espaco_id ? espacosCache[Number(item.espaco_id)] : null);
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

      // 3. RESOLUÇÃO ROBUSTA DO BAIRRO (Tenta várias fontes)
      let bairroNome = "";
      if (item.bairro && item.bairro !== "temp" && !item.bairro.startsWith("Bairro ID")) {
        bairroNome = item.bairro;
      } else if (item.espacos?.bairro) {
        bairroNome = item.espacos.bairro;
      } else if (item.bairros?.nome) {
        bairroNome = item.bairros.nome;
      } else if (item.bairro_id && BAIRROS_MAP[Number(item.bairro_id)]) {
        bairroNome = BAIRROS_MAP[Number(item.bairro_id)];
      } else if (item.espaco_id && espacosCache[Number(item.espaco_id)]?.bairro) {
        bairroNome = espacosCache[Number(item.espaco_id)].bairro;
      } else {
        bairroNome = item.nome || "—";
      }

      // 4. VAGA DO NÚCLEO (Número da Vaga Alocada no Projeto)
      let numeroVaga: string | number = item.numero_vaga ?? item.vaga_numero ?? item.n_vaga ?? item.vaga_numero_alocado ?? item.vaga_alocada ?? item.slot_vaga ?? item.vaga_slot ?? "";
      // Normaliza: null, undefined, string 'null', string vazia → ''
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

      const rua = item.rua || espacoObj?.rua;
      const num = item.numero || espacoObj?.numero;
      
      let enderecoFormatado = "";
      if (rua && rua !== "temp" && rua !== "xxxxxxx") {
        enderecoFormatado = `${rua}${num ? `, ${num}` : ''} - ${bairroNome}`;
      } else {
        enderecoFormatado = bairroNome || "—";
      }

      return {
        id,
        nome,
        projeto_id: item.projeto_id,
        projeto_nome: projetoNome,
        modalidade_id: item.modalidade_id || targetModId,
        modalidade_nome: modalidadeNome,
        bairro: bairroNome,
        bairro_id: item.bairro_id,
        espaco_id: item.espaco_id,
        numero_vaga: numeroVaga,
        vagas: item.vagas,
        instrutor: instrutor,
        resp_nome: item.resp_nome,
        endereco: enderecoFormatado,
        ativo: isAtivo,
        aceitando_vagas: isAceitandoVagas,
      };
    });
  };

  const fetchRawNucleosData = async (instituteName: string) => {
    try {
      const raw = sessionStorage.getItem(`cache_raw_nucleos_${instituteName.toUpperCase()}`);
      if (raw) { try { return JSON.parse(raw); } catch (e) { sessionStorage.removeItem(`cache_raw_nucleos_${instituteName.toUpperCase()}`); } }

      const n8nEndpoint = `https://w.ibrase.com.br/webhook/nucleos-get?instituto=${instituteName.toUpperCase()}`;
      const res = await fetch(n8nEndpoint, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            try { sessionStorage.setItem(`cache_raw_nucleos_${instituteName.toUpperCase()}`, text); } catch(e) { console.warn("Cache cheio", e); sessionStorage.clear(); try { sessionStorage.setItem(`cache_raw_nucleos_${instituteName.toUpperCase()}`, text); } catch(e2) {} }
            return data;
          } catch (e) {
            console.warn("N8N returned non-JSON:", text);
          }
        }
      }
    } catch (e) {
      console.warn("Erro ao fazer fetch no Webhook N8N de Núcleos:", e);
    }
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



  const handleToggleAtivo = async (id: string | number, currentAtivo: boolean) => {
    const isActivating = !currentAtivo;
    const confirmMsg = isActivating 
      ? "Deseja reativar este núcleo? Ele retornará para a aba de Ativos."
      : "Deseja realmente desativar e arquivar este núcleo? Ele irá para a aba de Desativados.";
      
    if (!window.confirm(confirmMsg)) return;
    setDesativandoId(id);
    try {
      const authInstitute = currentInstitute.toUpperCase();
      const formData = new FormData();
      formData.append("id", String(id));
      formData.append("ativo", isActivating ? "true" : "false");
      formData.append("aceitando_vagas", isActivating ? "true" : "false");
      
      if (!isActivating) {
        formData.append("numero_vaga", "null");
      }
      
      const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-put?instituto=${authInstitute}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setNucleos(prev => prev.map(n => n.id === id ? { 
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

  const filteredNucleos = nucleos.filter((item) => {
    // Filtra por aba ativo/desativado
    if (viewMode === 'ativos' && !item.ativo) return false;
    if (viewMode === 'desativados' && item.ativo) return false;
    if (globalFilter !== "all" && String(item.projeto_id) !== globalFilter) return false;
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

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'ativos' ? 'desativados' : 'ativos')}
            className={`font-bold px-5 py-3 rounded-xl shadow-xs border transition-all flex items-center gap-2 text-sm shrink-0 ${
              viewMode === 'desativados'
                ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Power size={16} className={viewMode === 'desativados' ? 'text-white' : 'text-red-500'} />
            <span className="hidden sm:inline">
              {viewMode === 'desativados' ? `Desativados (${totalDesativados})` : `Desativados (${totalDesativados})`}
            </span>
          </button>
          <Link
            to="/admin/historico-nucleos"
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-5 py-3 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 text-sm shrink-0"
          >
            <Calendar size={18} className="text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Histórico</span>
          </Link>
        </div>
      </div>

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
            {viewMode === 'desativados' 
              ? <span className="text-red-500 font-bold">Exibindo {filteredNucleos.length} desativados</span>
              : <>Exibindo <strong className="text-slate-800 dark:text-slate-200">{filteredNucleos.length}</strong> núcleos ativos</>
            }
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
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Nenhum núcleo encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1 max-w-md mx-auto">
              Não existem registros de núcleos cadastrados para o instituto {currentInstitute} no momento.
            </p>
            <Link
              to="/admin/cadastrar-nucleo"
              className="inline-flex items-center gap-2 mt-6 text-sm md:text-base font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors"
            >
              <Plus size={16} /> Cadastrar o primeiro núcleo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-4 px-3 md:px-4">Núcleo / Endereço</th>
                  <th className="py-4 px-3 md:px-4">Projeto</th>
                  <th className="py-4 px-3 md:px-4">Modalidade</th>
                  <th className="py-4 px-3 md:px-4">Instrutor</th>
                  <th className="py-4 px-3 md:px-4 text-center">Vaga (Slot)</th>
                  <th className="py-4 px-3 md:px-4 text-center">Status Físico</th>
                  <th className="py-4 px-3 md:px-4 w-28 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm md:text-base">
                {filteredNucleos.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors group">
                      
                      {/* Núcleo e Endereço */}
                      <td className="py-3 md:py-4 px-3 md:px-4">
                        <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block text-sm sm:text-sm md:text-base">
                          {item.nome}
                        </span>
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

                      {/* Vaga do Núcleo */}
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        {item.numero_vaga !== "—" ? (
                          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs md:text-sm font-extrabold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
                            Nº {item.numero_vaga}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60">
                            ⚠ Sem vaga
                          </span>
                        )}
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
                            onClick={() => handleToggleAtivo(item.id, item.ativo)}
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

    </div>
  );
}

