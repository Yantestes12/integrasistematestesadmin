import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Power, Loader2, Layers, Building2 } from "lucide-react";

export interface NucleoItem {
  id: string | number;
  nome: string;
  projeto_id?: number;
  projeto_nome?: string;
  modalidade_id?: number;
  modalidade_nome?: string;
  bairro: string;
  bairro_id?: number;
  ativo: boolean;
  aceitando_vagas: boolean;
}

// Mapa de IDs de projetos -> nomes (preenchido via fetch de iniciativas)
let projetosCache: Record<number, string> = {};
// Mapa de IDs de modalidades -> nomes
let modalidadesCache: Record<number, string> = {};

export default function Nucleos() {
  const [nucleos, setNucleos] = useState<NucleoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(savedInstitute);

    // Busca projetos (iniciativas) e modalidades em paralelo com os núcleos
    Promise.all([
      fetchProjetos(savedInstitute),
      fetchModalidades(savedInstitute),
    ]).then(() => {
      fetchNucleos(savedInstitute);
    });
  }, []);

  // Busca a lista de projetos/iniciativas para mapear projeto_id -> nome
  const fetchProjetos = async (instituteName: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${instituteName.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        const list = flattenResponse(data);
        projetosCache = {};
        list.forEach((p: any) => {
          if (p.id && p.nome) {
            projetosCache[Number(p.id)] = p.nome;
          }
        });
      }
    } catch (e) {
      console.warn("Erro ao buscar projetos para mapear nomes:", e);
    }
  };

  // Busca a lista de modalidades para mapear modalidade_id -> nome
  const fetchModalidades = async (instituteName: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${instituteName.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        const list = flattenResponse(data);
        modalidadesCache = {};
        list.forEach((m: any) => {
          if (m.id && m.nome) {
            modalidadesCache[Number(m.id)] = m.nome;
          }
        });
      }
    } catch (e) {
      console.warn("Erro ao buscar modalidades para mapear nomes:", e);
    }
  };

  // Achata a resposta do N8N (pode vir como [{json: ...}] ou array direto)
  const flattenResponse = (rawData: any): any[] => {
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
    return flatList;
  };

  const parseNucleosList = (rawData: any): NucleoItem[] => {
    const flatList = flattenResponse(rawData);

    return flatList.map((item, idx) => {
      const id = item.id || item.id_nucleo || idx + 1;
      const nome = item.nome || item.nome_nucleo || `Núcleo ${id}`;
      const isAtivo = item.ativo !== false && item.ativo !== 0 && item.ativo !== "0";
      const isAceitandoVagas = item.aceitando_vagas === true;

      // Resolver nome do projeto: tenta objeto Supabase, depois cache, depois fallback
      let projetoNome = "";
      if (item.projetos?.nome) {
        projetoNome = item.projetos.nome;
      } else if (item.projeto_nome || item.iniciativa) {
        projetoNome = item.projeto_nome || item.iniciativa;
      } else if (item.projeto_id && projetosCache[Number(item.projeto_id)]) {
        projetoNome = projetosCache[Number(item.projeto_id)];
      } else if (item.projeto_id) {
        projetoNome = `ID ${item.projeto_id}`;
      } else {
        projetoNome = "—";
      }

      // Resolver nome da modalidade: tenta objeto Supabase, depois cache, depois fallback
      let modalidadeNome = "";
      if (item.modalidades?.nome) {
        modalidadeNome = item.modalidades.nome;
      } else if (item.modalidade_nome || item.modalidade) {
        modalidadeNome = item.modalidade_nome || item.modalidade;
      } else if (item.modalidade_id && modalidadesCache[Number(item.modalidade_id)]) {
        modalidadeNome = modalidadesCache[Number(item.modalidade_id)];
      } else if (item.modalidade_id) {
        modalidadeNome = `ID ${item.modalidade_id}`;
      } else {
        modalidadeNome = "—";
      }

      // Bairro: campo direto da tabela
      const bairro = item.bairro || item.bairros?.nome || "";

      return {
        id,
        nome,
        projeto_id: item.projeto_id,
        projeto_nome: projetoNome,
        modalidade_id: item.modalidade_id,
        modalidade_nome: modalidadeNome,
        bairro,
        bairro_id: item.bairro_id,
        ativo: isAtivo,
        aceitando_vagas: isAceitandoVagas,
      };
    });
  };

  const fetchNucleos = async (instituteName: string) => {
    setLoading(true);

    try {
      const n8nEndpoint = `https://w.ibrase.com.br/webhook/nucleos-get?instituto=${instituteName.toUpperCase()}`;
      
      const res = await fetch(n8nEndpoint, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        
        if (data.message === "Workflow was started" || (Array.isArray(data) && data.length > 0 && data[0].message === "Workflow was started")) {
          alert("O Webhook do N8N não retornou os dados. Mude o campo 'Respond' para 'Using Respond to Webhook Node'.");
          setLoading(false);
          return;
        }
        
        const parsed = parseNucleosList(data);
        if (parsed.length > 0) {
          setNucleos(parsed.sort((a, b) => Number(b.id) - Number(a.id)));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Erro no Webhook N8N de Núcleos:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Deseja realmente alterar o status deste núcleo?")) return;
    
    try {
      const res = await fetch("https://w.ibrase.com.br/webhook/nucleos-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, instituto: currentInstitute }),
      });
      if (res.ok) {
        alert("Status do núcleo atualizado com sucesso!");
        fetchNucleos(currentInstitute);
      } else {
        alert("Erro ao remover/atualizar núcleo via N8N.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar com N8N.");
    }
  };

  const filteredNucleos = nucleos.filter((item) =>
    (item.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.bairro || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.projeto_nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.modalidade_nome || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs md:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-100">
              <Building2 size={14} /> {currentInstitute}
            </span>
            <span className="text-slate-400 text-xs md:text-sm">• Módulo Administrativo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Núcleos
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">
            Gerencie os núcleos de atendimento cadastrados para o instituto <strong className="text-slate-700">{currentInstitute}</strong>.
          </p>
        </div>

        <Link
          to="/admin/cadastrar-nucleo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm md:text-base shrink-0"
        >
          <Plus size={18} />
          <span>Novo Núcleo</span>
        </Link>
      </div>

      {/* Card da Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Barra de Filtros e Busca */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, bairro, iniciativa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="text-xs md:text-sm text-slate-500 font-medium">
            Exibindo <strong className="text-slate-800">{filteredNucleos.length}</strong> núcleos
          </div>
        </div>

        {/* Tabela de Dados com Bolinhas Carregando */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-slate-600 text-sm md:text-base font-bold animate-pulse">Carregando núcleos do instituto...</p>
          </div>
        ) : filteredNucleos.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers size={32} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800">Nenhum núcleo encontrado</h3>
            <p className="text-slate-500 text-sm md:text-base mt-1 max-w-md mx-auto">
              Não existem registros de núcleos cadastrados para o instituto {currentInstitute} no momento.
            </p>
            <Link
              to="/admin/cadastrar-nucleo"
              className="inline-flex items-center gap-2 mt-6 text-sm md:text-base font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 transition-colors"
            >
              <Plus size={16} /> Cadastrar o primeiro núcleo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-slate-700">
                  <th className="py-4 px-4 md:px-6">Núcleo</th>
                  <th className="py-4 px-4 md:px-6">Iniciativa</th>
                  <th className="py-4 px-4 md:px-6">Bairro</th>
                  <th className="py-4 px-4 md:px-6">Modalidade</th>
                  <th className="py-4 px-4 md:px-6 text-center">Status Alocação</th>
                  <th className="py-4 px-4 md:px-6 text-center">Status Físico</th>
                  <th className="py-4 px-4 md:px-6 w-28 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-base md:text-lg">
                {filteredNucleos.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      
                      {/* Núcleo */}
                      <td className="py-4 md:py-5 px-4 md:px-6">
                        <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors block text-base sm:text-lg md:text-xl">
                          {item.nome}
                        </span>
                        <span className="text-xs md:text-sm text-slate-400 font-medium">ID {item.id}</span>
                      </td>

                      {/* Iniciativa (nome do projeto) */}
                      <td className="py-4 md:py-5 px-4 md:px-6">
                        <span className="font-bold text-slate-800 text-sm md:text-base">
                          {item.projeto_nome}
                        </span>
                      </td>

                      {/* Bairro */}
                      <td className="py-4 md:py-5 px-4 md:px-6">
                        <span className="font-semibold text-slate-700 text-sm md:text-base">
                          {item.bairro || "—"}
                        </span>
                      </td>

                      {/* Modalidade */}
                      <td className="py-4 md:py-5 px-4 md:px-6">
                        <span className="font-semibold text-slate-700 text-sm md:text-base">
                          {item.modalidade_nome}
                        </span>
                      </td>

                      {/* Status da Alocação (aceitando_vagas) */}
                      <td className="py-4 md:py-5 px-4 md:px-6 text-center">
                        <span
                          className={`inline-flex items-center px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold border ${
                            item.aceitando_vagas
                              ? "bg-blue-50 text-blue-700 border-blue-200/80"
                              : "bg-amber-50 text-amber-700 border-amber-200/80"
                          }`}
                        >
                          {item.aceitando_vagas ? "Aberto" : "Fechado"}
                        </span>
                      </td>

                      {/* Status Físico (ativo) */}
                      <td className="py-4 md:py-5 px-4 md:px-6 text-center">
                        <span
                          className={`inline-flex items-center px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold border ${
                            item.ativo
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                              : "bg-red-50 text-red-700 border-red-200/80"
                          }`}
                        >
                          {item.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-4 md:px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/admin/cadastrar-nucleo?edit=${item.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Desativar / Ativar"
                          >
                            <Power size={18} />
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
