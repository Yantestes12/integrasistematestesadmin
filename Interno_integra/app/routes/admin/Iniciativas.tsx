import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Loader2, Layers, Building2, Trash2, AlertTriangle, Clock, X, FileText } from "lucide-react";

export interface IniciativaItem {
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
}

export default function Iniciativas() {
  const [iniciativas, setIniciativas] = useState<IniciativaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");

  // Estado do Modal de Confirmação com Contagem de 10 Segundos e Animação de Papel Rasgando caindo na Lixeira
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedIniciativa, setSelectedIniciativa] = useState<IniciativaItem | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTearing, setIsTearing] = useState(false);

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(savedInstitute);
    fetchIniciativas(savedInstitute);
  }, []);

  // Timer de 10 segundos para habilitar o botão de exclusão
  useEffect(() => {
    if (!deleteModalOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [deleteModalOpen, countdown]);

  const parseIniciativasList = (rawData: any): IniciativaItem[] => {
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
      const id = item.id || item.id_projeto || item.id_iniciativa || idx + 1;
      const nome = 
        item.nome || 
        item.nome_projeto || 
        item.nomeProjeto || 
        item.identificacao?.nomeProjeto || 
        item.name || 
        item.titulo || 
        `Iniciativa ${id}`;

      const descricao = item.descricao || item.identificacao?.descricao || "";
      const termo_fomento = item.termo_fomento || item.termoFomento || item.identificacao?.termoFomento || "";
      const numero_proposta = item.numero_proposta || item.numeroProposta || item.identificacao?.numeroProposta || "";
      const numero_processo_adm = item.numero_processo_adm || item.numeroProcessoAdm || item.identificacao?.numeroProcessoAdm || "";
      const numero_transferegov = item.numero_transferegov || item.numeroTransfereGov || item.identificacao?.numeroTransfereGov || "";
      const faixa_etaria = item.faixa_etaria || (item.faixaEtaria ? `${item.faixaEtaria.idadeMinima || ''} - ${item.faixaEtaria.idadeMaxima || ''}` : "") || "7 - 65";

      const isAtivo = item.ativo !== false && item.status !== false && item.status !== "inativo";
      const aplicabilidade = item.aplicabilidade || item.identificacao?.aplicabilidade || "";

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
      };
    });
  };

  const fetchIniciativas = async (instituteName: string) => {
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
        
        const parsed = parseIniciativasList(data);
        if (parsed.length > 0) {
          setIniciativas(parsed.sort((a, b) => Number(b.id) - Number(a.id)));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Erro no Webhook N8N de Iniciativas:", e);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (item: IniciativaItem) => {
    setSelectedIniciativa(item);
    setCountdown(10);
    setIsTearing(false);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteModalOpen(false);
    setSelectedIniciativa(null);
    setCountdown(10);
    setIsTearing(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIniciativa || countdown > 0 || isDeleting) return;
    setIsDeleting(true);
    setIsTearing(true); // Inicia animação visual de rasgar e cair na lixeira

    setTimeout(async () => {
      try {
        let res = await fetch("https://w.ibrase.com.br/webhook/projetos-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedIniciativa.id, instituto: currentInstitute.toUpperCase() }),
        });

        if (!res.ok) {
          res = await fetch(`https://w.ibrase.com.br/webhook/projetos-delete?id=${selectedIniciativa.id}&instituto=${currentInstitute.toUpperCase()}`, {
            method: "DELETE",
          });
        }

        if (res.ok) {
          setIniciativas(prev => prev.filter(item => item.id !== selectedIniciativa.id));
          setDeleteModalOpen(false);
          setSelectedIniciativa(null);
        } else {
          alert("Erro ao excluir iniciativa via N8N. Importe o novo fluxo N8N_PROJETOS_DELETE no seu N8N.");
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

  const filteredIniciativas = iniciativas.filter((item) =>
    (item.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.termo_fomento || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Estilos customizados para a animação do papel rasgando e CAINDO DIRETO NA LIXEIRA */}
      <style>{`
        @keyframes tearLeftAnim {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          35% { transform: translateY(15px) translateX(15px) rotate(-10deg) scale(0.9); opacity: 0.95; }
          100% { transform: translateY(90px) translateX(55px) rotate(-25deg) scale(0.2); opacity: 0; }
        }
        @keyframes tearRightAnim {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          35% { transform: translateY(15px) translateX(-15px) rotate(10deg) scale(0.9); opacity: 0.95; }
          100% { transform: translateY(90px) translateX(-55px) rotate(25deg) scale(0.2); opacity: 0; }
        }
        @keyframes trashLidAnim {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(-40deg) translateY(-8px); }
          75% { transform: rotate(-40deg) translateY(-8px); }
          100% { transform: rotate(0deg); }
        }
        .anim-tear-left { animation: tearLeftAnim 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .anim-tear-right { animation: tearRightAnim 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .anim-trash-lid { animation: trashLidAnim 1.1s ease-in-out forwards; transform-origin: left bottom; }
      `}</style>

      {/* Top Banner / Breadcrumb */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-100">
              <Building2 size={14} /> {currentInstitute}
            </span>
            <span className="text-slate-400 text-xs">• Módulo Administrativo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Iniciativas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie as iniciativas cadastradas para o instituto <strong className="text-slate-700">{currentInstitute}</strong>.
          </p>
        </div>

        <Link
          to="/admin/cadastrar-projeto"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Plus size={18} />
          <span>Cadastrar Nova Iniciativa</span>
        </Link>
      </div>

      {/* Card da Tabela de Iniciativas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Barra de Filtros e Busca */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou termo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Exibindo <strong className="text-slate-800">{filteredIniciativas.length}</strong> iniciativas
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
            <p className="text-slate-600 text-sm font-bold animate-pulse">Carregando iniciativas do instituto...</p>
          </div>
        ) : filteredIniciativas.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nenhuma iniciativa encontrada</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Não existem registros de iniciativas cadastradas para o instituto {currentInstitute} no momento.
            </p>
            <Link
              to="/admin/cadastrar-projeto"
              className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 transition-colors"
            >
              <Plus size={16} /> Cadastrar a primeira iniciativa
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-slate-700">
                  <th className="py-4 px-4 md:px-6 w-16 text-center">ID</th>
                  <th className="py-4 px-4 md:px-6">Nome da Iniciativa</th>
                  <th className="py-4 px-4 md:px-6">Documentação</th>
                  <th className="py-4 px-4 md:px-6 w-36">Faixa Etária</th>
                  <th className="py-4 px-4 md:px-6 w-32 text-center">Status</th>
                  <th className="py-4 px-4 md:px-6 w-32 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-base md:text-lg">
                {filteredIniciativas.map((item) => {
                  const isAtivo = item.ativo !== false && item.status !== "inativo" && item.status !== false;
                  const isEvento = (item.aplicabilidade || "").toLowerCase().includes("evento");

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-4 md:py-6 px-4 md:px-6 font-bold text-slate-400 text-center text-base md:text-lg">{item.id}</td>
                      
                      <td className="py-4 md:py-6 px-4 md:px-6">
                        <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors block text-base sm:text-lg md:text-xl">
                          {item.nome}
                        </span>
                        
                        <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-extrabold uppercase tracking-wider ${
                          isEvento ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {isEvento ? 'Evento' : 'Projeto de Aula'}
                        </span>
                      </td>

                      <td className="py-4 md:py-6 px-4 md:px-6">
                        {item.termo_fomento && (
                          <div className="font-extrabold text-sm md:text-base text-slate-800">
                            Termo: {item.termo_fomento}
                          </div>
                        )}
                        {item.numero_proposta && (
                          <div className="text-xs md:text-sm text-slate-600 font-semibold mt-0.5">Prop: {item.numero_proposta}</div>
                        )}
                        {item.numero_processo_adm && (
                          <div className="text-xs md:text-sm text-slate-600 font-semibold mt-0.5">Proc: {item.numero_processo_adm}</div>
                        )}
                        {item.numero_transferegov && (
                          <div className="text-xs md:text-sm text-slate-600 font-semibold mt-0.5">Transf: {item.numero_transferegov}</div>
                        )}
                      </td>

                      <td className="py-4 md:py-6 px-4 md:px-6 font-extrabold text-slate-700 text-sm md:text-base">
                        {item.faixa_etaria || "7 - 65"}
                      </td>

                      <td className="py-4 md:py-6 px-4 md:px-6 text-center">
                        <span
                          className={`inline-flex items-center px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold border ${
                            isAtivo
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                              : "bg-red-50 text-red-700 border-red-200/80"
                          }`}
                        >
                          {isAtivo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/admin/cadastrar-projeto?edit=${item.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Editar Iniciativa"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Excluir Iniciativa"
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

      {/* Modal de Confirmação com Animação de Folha de Papel Rasgando CAINDO DIRETO NA LIXEIRA */}
      {deleteModalOpen && selectedIniciativa && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">Excluir Iniciativa</h3>
              </div>

              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* ÁREA DA ANIMAÇÃO DO PAPEL RASGANDO E CAINDO DENTRO DA LIXEIRA */}
            <div className="relative py-4 flex flex-col items-center justify-center min-h-[200px] overflow-hidden">
              
              {!isTearing ? (
                /* Papel Inteiro antes de rasgar */
                <div className="w-full max-w-[280px] bg-amber-50/90 border-2 border-amber-200/80 rounded-xl p-4 shadow-sm relative rotate-[-1deg] transition-all hover:rotate-0">
                  {/* Fita adesiva / Durex no topo */}
                  <div className="w-12 h-3 bg-amber-200/60 backdrop-blur-xs absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-xs shadow-2xs border border-amber-300/40" />
                  
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                    <FileText size={14} className="text-amber-600" />
                    <span>{currentInstitute} • Ficha do Projeto</span>
                  </div>

                  <h4 className="text-slate-900 font-black text-base line-clamp-2 border-b border-amber-200/60 pb-2 mb-2">
                    {selectedIniciativa.nome}
                  </h4>

                  <p className="text-xs text-amber-900/70 font-medium">
                    {selectedIniciativa.termo_fomento ? `Termo: ${selectedIniciativa.termo_fomento}` : 'Iniciativa cadastrada no sistema'}
                  </p>
                </div>
              ) : (
                /* Papel Rasgando em 2 metades e caindo exatamente DENTRO da lixeira */
                <div className="relative w-full h-[190px] flex flex-col items-center justify-end">
                  {/* Metade Esquerda do Papel (Cai para a direita, entrando na lixeira) */}
                  <div className="absolute left-[12%] top-1 w-[120px] bg-amber-50 border-2 border-amber-200 rounded-l-xl p-3 shadow-md anim-tear-left overflow-hidden z-10">
                    <div className="text-[10px] text-amber-800 font-bold uppercase">Projeto</div>
                    <div className="text-xs font-black text-slate-800 truncate">{selectedIniciativa.nome}</div>
                  </div>

                  {/* Metade Direita do Papel (Cai para a esquerda, entrando na lixeira) */}
                  <div className="absolute right-[12%] top-1 w-[120px] bg-amber-50 border-2 border-amber-200 rounded-r-xl p-3 shadow-md anim-tear-right overflow-hidden border-l-dashed border-l-amber-300 z-10">
                    <div className="text-[10px] text-amber-800 font-bold uppercase">Excluindo...</div>
                    <div className="text-xs font-black text-slate-800 truncate">{selectedIniciativa.nome}</div>
                  </div>

                  {/* Lixeira Central com a Tampa Abrindo */}
                  <div className="mt-auto flex flex-col items-center text-red-500 z-20 pb-1">
                    <div className="anim-trash-lid mb-0.5">
                      <div className="w-14 h-2.5 bg-red-500 rounded-t-md shadow-xs mx-auto" />
                    </div>
                    <div className="w-16 h-16 bg-red-600 text-white rounded-b-2xl flex items-center justify-center shadow-xl border-2 border-red-700">
                      <Trash2 size={28} className="animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Mensagem e Trava de 10s */}
              {!isTearing && (
                <div className="mt-4 w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700">
                    <Clock size={14} className="text-amber-600" />
                    <span>Trava de Segurança: {countdown > 0 ? `Aguarde ${countdown}s` : "Liberado para excluir"}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {countdown > 0 ? "Aguarde a contagem regressiva para confirmar a exclusão." : "Clique no botão abaixo para rasgar a ficha e jogar na lixeira."}
                  </p>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={countdown > 0 || isDeleting}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-sm transition-all flex items-center gap-2 ${
                  countdown > 0 || isDeleting
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
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
