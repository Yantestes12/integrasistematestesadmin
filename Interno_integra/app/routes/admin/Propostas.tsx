import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Loader2, Layers, Building2, Trash2, AlertTriangle, Clock, X, FileText } from "lucide-react";

export interface PropostaItem {
  id: string | number;
  nome: string;
  descricao?: string;
  termo_fomento?: string;
  numero_proposta?: string;
  numero_processo_adm?: string;
  numero_transferegov?: string;
  faixa_etaria?: string;
  status?: boolean | string;
  ativo?: boolean;
  aplicabilidade?: string;
  vagas_por_nucleo?: string | number;
  total_nucleos?: number;
}

export default function Propostas() {
  const [propostas, setPropostas] = useState<PropostaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");
  const [globalFilter, setGlobalFilter] = useState("all");

  // Estado do Modal de Confirmação com Contagem de 25 Segundos e Animação FÍSICA de Papel Rasgando por clip-path
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProposta, setSelectedProposta] = useState<PropostaItem | null>(null);
  const [countdown, setCountdown] = useState(25);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTearing, setIsTearing] = useState(false);

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(savedInstitute);
    fetchPropostas(savedInstitute);

    const updateGlobalFilter = () => {
      setGlobalFilter(localStorage.getItem("global_projeto_filter") || "all");
    };
    updateGlobalFilter();
    window.addEventListener("globalFilterChanged", updateGlobalFilter);
    
    return () => {
      window.removeEventListener("globalFilterChanged", updateGlobalFilter);
    };
  }, []);

  // Timer de 25 segundos para habilitar o botão de exclusão
  useEffect(() => {
    if (!deleteModalOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [deleteModalOpen, countdown]);

  const parsePropostasList = (rawData: any): PropostaItem[] => {
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

    return flatList.map((item, idx) => {
      const id = item.id || item.id_projeto || item.id_proposta || idx + 1;
      const nome = 
        item.nome || 
        item.nome_projeto || 
        item.nomeProjeto || 
        item.identificacao?.nomeProjeto || 
        item.name || 
        item.titulo || 
        `Proposta ${id}`;

      const descricao = item.descricao || item.identificacao?.descricao || "";
      const termo_fomento = item.termo_fomento || item.termoFomento || item.identificacao?.termoFomento || "";
      const numero_proposta = item.numero_proposta || item.numeroProposta || item.identificacao?.numeroProposta || "";
      const numero_processo_adm = item.numero_processo_adm || item.numeroProcessoAdm || item.identificacao?.numeroProcessoAdm || "";
      const numero_transferegov = item.numero_transferegov || item.numeroTransfereGov || item.identificacao?.numeroTransfereGov || "";
      
      const idMin = item.faixaEtaria?.idadeMinima ?? item.idade_min ?? item.idade_minima ?? item.idadeMinima;
      const idMax = item.faixaEtaria?.idadeMaxima ?? item.idade_max ?? item.idade_maxima ?? item.idadeMaxima;
      let faixa_etaria = item.faixa_etaria;
      if (!faixa_etaria && (idMin !== undefined || idMax !== undefined)) {
        faixa_etaria = `${idMin ?? ''} - ${idMax ?? ''}`;
      }
      faixa_etaria = faixa_etaria || "7 - 65";

      const isAtivo = item.ativo !== false && item.status !== false && item.status !== "inativo";
      const aplicabilidade = item.aplicabilidade || item.identificacao?.aplicabilidade || "";

      let vagasPN: string | number = "";
      if (item.limites) {
        if (typeof item.limites === 'string') {
          try {
            const parsedLimites = JSON.parse(item.limites);
            vagasPN = parsedLimites.vagasPorNucleo || "";
          } catch (e) {}
        } else {
          vagasPN = item.limites.vagasPorNucleo || "";
        }
      }
      if (!vagasPN) {
        vagasPN = item.vagas_por_nucleo || item.vagasPorNucleo || item.limites_vagasPorNucleo || "";
      }

      let totalNucleos = 0;
      const limitesModalidadeRaw = item.limites_modalidades || item.limitesModalidades || item.limites_modalidade || item.limitesModalidade;
      if (limitesModalidadeRaw) {
        let parsedMod = limitesModalidadeRaw;
        if (typeof parsedMod === 'string') {
          try {
            parsedMod = JSON.parse(parsedMod);
          } catch (e) {}
        }
        if (Array.isArray(parsedMod)) {
          totalNucleos = parsedMod.reduce((acc, curr) => acc + (Number(curr.limite) || 0), 0);
        }
      }

      return {
        id,
        nome,
        descricao,
        termo_fomento,
        numero_proposta,
        numero_processo_adm,
        numero_transferegov,
        faixa_etaria,
        status: isAtivo,
        ativo: isAtivo,
        aplicabilidade,
        vagas_por_nucleo: vagasPN,
        total_nucleos: totalNucleos,
      };
    });
  };

  const fetchPropostas = async (instituteName: string) => {
    setLoading(true);
    try {
      const n8nEndpoint = `https://w.ibrase.com.br/webhook/projetos-get?instituto=${instituteName.toUpperCase()}`;
      const res = await fetch(n8nEndpoint, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        
        if (data.message === "Workflow was started" || (Array.isArray(data) && data.length > 0 && data[0].message === "Workflow was started")) {
          alert("O Webhook do N8N não retornou os dados. Mude a opção 'Respond' para 'Using Respond to Webhook Node' no n8n.");
          setLoading(false);
          return;
        }
        
        const parsed = parsePropostasList(data);
        if (parsed.length > 0) {
          setPropostas(parsed.sort((a, b) => Number(b.id) - Number(a.id)));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Erro no Webhook N8N de Propostas:", e);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (item: PropostaItem) => {
    setSelectedProposta(item);
    setCountdown(25);
    setIsTearing(false);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteModalOpen(false);
    setSelectedProposta(null);
    setCountdown(25);
    setIsTearing(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProposta || countdown > 0 || isDeleting) return;
    setIsDeleting(true);
    setIsTearing(true); // Inicia animação de rasgo físico com corte exato por clip-path

    setTimeout(async () => {
      try {
        let res = await fetch("https://w.ibrase.com.br/webhook/projetos-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedProposta.id, instituto: currentInstitute.toUpperCase() }),
        });

        if (!res.ok) {
          res = await fetch(`https://w.ibrase.com.br/webhook/projetos-delete?id=${selectedProposta.id}&instituto=${currentInstitute.toUpperCase()}`, {
            method: "DELETE",
          });
        }

        if (res.ok) {
          setPropostas(prev => prev.filter(item => item.id !== selectedProposta.id));
          setDeleteModalOpen(false);
          setSelectedProposta(null);
        } else {
          alert("Erro ao excluir proposta via N8N. Certifique-se de importar o fluxo N8N_PROJETOS_DELETE.");
        }
      } catch (e) {
        console.error(e);
        alert("Erro ao conectar com o servidor para excluir.");
      } finally {
        setIsDeleting(false);
        setIsTearing(false);
      }
    }, 1100);
  };

  const filteredPropostas = propostas.filter((item) => {
    if (globalFilter !== "all" && String(item.id) !== globalFilter) return false;
    return (
      (item.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.termo_fomento || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Componente interno da Ficha em Papel (Única e física)
  const RenderFichaCard = ({ item }: { item: PropostaItem }) => (
    <div className="w-full bg-amber-50/95 border-2 border-amber-200/90 rounded-2xl p-4 shadow-md relative select-none">
      {/* Fita adesiva / Durex no topo */}
      <div className="w-14 h-3.5 bg-amber-200/70 backdrop-blur-xs absolute -top-2 left-1/2 -translate-x-1/2 rounded-xs shadow-2xs border border-amber-300/50" />
      
      <div className="flex items-center gap-2 text-amber-900/80 text-[11px] font-bold uppercase tracking-wider mb-1">
        <FileText size={14} className="text-amber-600 shrink-0" />
        <span>{currentInstitute} • Ficha Oficial do Projeto</span>
      </div>

      <h4 className="text-slate-900 font-black text-sm md:text-base border-b border-amber-200/80 pb-2 mb-2 leading-snug">
        {item.nome}
      </h4>

      <div className="flex items-center justify-between text-xs text-amber-900/80 font-medium">
        <span>{item.termo_fomento ? `Termo: ${item.termo_fomento}` : 'Projeto Cadastrado'}</span>
        <span className="font-extrabold text-amber-800">ID #{item.id}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Keyframes da Rasgadura FÍSICA por CLIP-PATH zig-zag cortando as letras ao meio */}
      <style>{`
        .clip-tear-left {
          clip-path: polygon(0 0, 52% 0, 47% 20%, 53% 40%, 46% 60%, 52% 80%, 48% 100%, 0 100%);
        }
        .clip-tear-right {
          clip-path: polygon(52% 0, 100% 0, 100% 100%, 48% 100%, 52% 80%, 46% 60%, 53% 40%, 47% 20%);
        }
        @keyframes physicalTearLeft {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          30% { transform: translateY(10px) translateX(-8px) rotate(-8deg) scale(0.95); opacity: 0.95; }
          100% { transform: translateY(110px) translateX(-20px) rotate(-22deg) scale(0.3); opacity: 0; }
        }
        @keyframes physicalTearRight {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          30% { transform: translateY(10px) translateX(8px) rotate(8deg) scale(0.95); opacity: 0.95; }
          100% { transform: translateY(110px) translateX(20px) rotate(22deg) scale(0.3); opacity: 0; }
        }
        @keyframes trashLidPhysical {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(-45deg) translateY(-10px); }
          75% { transform: rotate(-45deg) translateY(-10px); }
          100% { transform: rotate(0deg); }
        }
        .anim-physical-left { animation: physicalTearLeft 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .anim-physical-right { animation: physicalTearRight 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .anim-trash-lid-open { animation: trashLidPhysical 1.1s ease-in-out forwards; transform-origin: left bottom; }
      `}</style>

      {/* Top Banner / Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-100 dark:border-blue-800">
              <Building2 size={14} /> {currentInstitute}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">• Módulo Administrativo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Propostas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gerencie as propostas cadastradas para o instituto <strong className="text-slate-700 dark:text-slate-200">{currentInstitute}</strong>.
          </p>
        </div>

        <Link
          to="/admin/cadastrar-projeto"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Plus size={18} />
          <span>Cadastrar Nova Proposta</span>
        </Link>
      </div>

      {/* Card da Tabela de Propostas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        
        {/* Barra de Filtros e Busca */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou termo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Exibindo <strong className="text-slate-800 dark:text-slate-200">{filteredPropostas.length}</strong> propostas
          </div>
        </div>

        {/* Tabela de Dados Reais */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold animate-pulse">Carregando propostas do instituto...</p>
          </div>
        ) : filteredPropostas.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
              <Layers size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhuma proposta encontrada</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto">
              Não existem registros de propostas cadastradas para o instituto {currentInstitute} no momento.
            </p>
            <Link
              to="/admin/cadastrar-projeto"
              className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors"
            >
              <Plus size={16} /> Cadastrar a primeira proposta
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-4 px-3 md:px-4 w-16 text-center">ID</th>
                  <th className="py-4 px-3 md:px-4">Nome da Proposta</th>
                  <th className="py-4 px-3 md:px-4">Documentação</th>
                  <th className="py-4 px-3 md:px-4 w-36">Faixa Etária</th>
                  <th className="py-4 px-3 md:px-4 w-36 text-center">Qtd. de Núcleos</th>
                  <th className="py-4 px-3 md:px-4 w-36 text-center">Vagas p/ Núcleo</th>
                  <th className="py-4 px-3 md:px-4 w-32 text-center">Status</th>
                  <th className="py-4 px-3 md:px-4 w-32 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm md:text-base">
                {filteredPropostas.map((item) => {
                  const isAtivo = item.ativo !== false && item.status !== "inativo" && item.status !== false;
                  const isEvento = (item.aplicabilidade || "").toLowerCase().includes("evento");

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="py-3 md:py-4 px-3 md:px-4 font-bold text-slate-400 dark:text-slate-500 text-center text-sm md:text-base">{item.id}</td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-4">
                        <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block text-sm sm:text-sm md:text-base">
                          {item.nome}
                        </span>
                        
                        <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-extrabold uppercase tracking-wider ${
                          isEvento 
                            ? 'bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60' 
                            : 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                        }`}>
                          {isEvento ? 'Evento' : 'Projeto de Aula'}
                        </span>
                      </td>

                      <td className="py-3 md:py-4 px-3 md:px-4">
                        {item.termo_fomento && (
                          <div className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-200">
                            Termo: {item.termo_fomento}
                          </div>
                        )}
                        {item.numero_proposta && (
                          <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-semibold mt-0.5">Prop: {item.numero_proposta}</div>
                        )}
                        {item.numero_processo_adm && (
                          <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-semibold mt-0.5">Proc: {item.numero_processo_adm}</div>
                        )}
                        {item.numero_transferegov && (
                          <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-semibold mt-0.5">Transf: {item.numero_transferegov}</div>
                        )}
                      </td>

                      <td className="py-3 md:py-4 px-3 md:px-4 font-extrabold text-slate-700 dark:text-slate-300 text-sm md:text-base">
                        {item.faixa_etaria || "7 - 65"}
                      </td>

                      <td className="py-3 md:py-4 px-3 md:px-4 text-center font-extrabold text-blue-700 dark:text-blue-400 text-sm md:text-base">
                        {item.total_nucleos ? `${item.total_nucleos} núcleos` : "—"}
                      </td>

                      <td className="py-3 md:py-4 px-3 md:px-4 text-center font-extrabold text-indigo-700 dark:text-indigo-400 text-sm md:text-base">
                        {item.vagas_por_nucleo ? `${item.vagas_por_nucleo} alunos` : "—"}
                      </td>

                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold border ${
                            isAtivo
                              ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60"
                              : "bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border-red-200/80 dark:border-red-800/60"
                          }`}
                        >
                          {isAtivo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/admin/cadastrar-projeto?edit=${item.id}`}
                            className="p-2 rounded-lg text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Editar Proposta"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-2 rounded-lg text-slate-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                            title="Excluir Proposta"
                          >
                            <Trash2 size={16} />
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

      {/* Modal de Confirmação com Rasgadura FÍSICA por CLIP-PATH e Lixeira */}
      {deleteModalOpen && selectedProposta && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Excluir Proposta</h3>
              </div>

              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* ÁREA DA ANIMAÇÃO DA RASGADURA FÍSICA DENTRO DA LIXEIRA */}
            <div className="relative py-2 flex flex-col items-center justify-between min-h-[220px] overflow-hidden">
              
              {!isTearing ? (
                /* Ficha Inteira Antes do Rasgo */
                <div className="w-full px-2">
                  <RenderFichaCard item={selectedProposta} />
                </div>
              ) : (
                /* EFEITO FÍSICO REAL: A mesma Ficha é dividida por clip-path zig-zag cortando o texto exato */
                <div className="relative w-full h-[210px] flex flex-col items-center justify-between">
                  
                  {/* Metade Esquerda Físicamente Cortada */}
                  <div className="absolute inset-x-2 top-0 clip-tear-left anim-physical-left z-10">
                    <RenderFichaCard item={selectedProposta} />
                  </div>

                  {/* Metade Direita Físicamente Cortada */}
                  <div className="absolute inset-x-2 top-0 clip-tear-right anim-physical-right z-10">
                    <RenderFichaCard item={selectedProposta} />
                  </div>

                  {/* Lixeira no fundo abrindo a tampa para receber os pedaços cortados */}
                  <div className="mt-auto flex flex-col items-center text-red-500 z-20 pb-1">
                    <div className="anim-trash-lid-open mb-0.5">
                      <div className="w-14 h-2.5 bg-red-500 rounded-t-md shadow-xs mx-auto" />
                    </div>
                    <div className="w-16 h-16 bg-red-600 text-white rounded-b-2xl flex items-center justify-center shadow-xl border-2 border-red-700">
                      <Trash2 size={28} className="animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Mensagem e Trava de 25s */}
              {!isTearing && (
                <div className="mt-4 w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                    <span>Trava de Segurança: {countdown > 0 ? `Aguarde ${countdown}s` : "Liberado para excluir"}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {countdown > 0 ? "Aguarde a contagem regressiva para confirmar a exclusão." : "Clique no botão abaixo para rasgar a ficha e jogar na lixeira."}
                  </p>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={countdown > 0 || isDeleting}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-sm transition-all flex items-center gap-2 ${
                  countdown > 0 || isDeleting
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                    : "bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-600/20 shadow-md animate-bounce"
                }`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Excluindo...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Clock size={14} /> Aguarde {countdown}s
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Confirmar & Rasgar Ficha
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

