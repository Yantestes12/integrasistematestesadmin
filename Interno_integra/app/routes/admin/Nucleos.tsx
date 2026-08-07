import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Power, Loader2, FileText, Layers, Building2, MapPin } from "lucide-react";

export interface NucleoItem {
  id: string | number;
  nome: string;
  projeto_nome?: string;
  modalidade_nome?: string;
  cidade_nome?: string;
  bairro_nome?: string;
  cidade_uf?: string;
  endereco?: string;
  coordenador_nome_real?: string;
  instrutor_nome_real?: string;
  telefone?: string;
  ativo?: boolean;
}

export default function Nucleos() {
  const [nucleos, setNucleos] = useState<NucleoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(savedInstitute);

    fetchNucleos(savedInstitute);
  }, []);

  const parseNucleosList = (rawData: any): NucleoItem[] => {
    let list: any[] = [];

    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (rawData && typeof rawData === 'object') {
      if (Array.isArray(rawData.data)) list = rawData.data;
      else if (Array.isArray(rawData.items)) list = rawData.items;
      else if (rawData.json) list = Array.isArray(rawData.json) ? rawData.json : [rawData.json];
      else list = [rawData];
    }

    // Flatten any { json: [...] } or nested arrays
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
      const id = item.id || item.id_nucleo || idx + 1;
      const nome = 
        item.nome || 
        item.nome_nucleo || 
        item.nucleo_label || 
        `Núcleo ${id}`;

      const isAtivo = item.ativo !== false && item.ativo !== 0 && item.ativo !== "0";

      return {
        id,
        nome,
        projeto_nome: item.projeto_nome || item.iniciativa || item.projetos?.nome || `Projeto ID ${item.projeto_id || ''}`,
        modalidade_nome: item.modalidade_nome || item.modalidade || item.modalidades?.nome || "",
        cidade_nome: item.cidade_nome || item.cidade || "",
        bairro_nome: item.bairro_nome || item.bairro || item.bairros?.nome || "",
        cidade_uf: item.cidade_uf || item.uf || "",
        endereco: item.endereco || item.end_label || "",
        coordenador_nome_real: item.coordenador_nome_real || item.coordenador || "",
        instrutor_nome_real: item.instrutor_nome_real || item.instrutor || "",
        telefone: item.telefone || item.telefone_label || "",
        ativo: isAtivo
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
    (item.cidade_nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.projeto_nome || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-100">
              <Building2 size={14} /> {currentInstitute}
            </span>
            <span className="text-slate-400 text-xs">• Módulo Administrativo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Núcleos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie os núcleos de atendimento cadastrados para o instituto <strong className="text-slate-700">{currentInstitute}</strong>.
          </p>
        </div>

        <Link
          to="/admin/cadastrar-nucleo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Plus size={18} />
          <span>Novo Núcleo</span>
        </Link>
      </div>

      {/* Card da Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Barra de Filtros e Busca */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, cidade ou projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Exibindo <strong className="text-slate-800">{filteredNucleos.length}</strong> núcleos
          </div>
        </div>

        {/* Tabela de Dados Reais */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-slate-500 text-sm font-medium">Buscando núcleos no backend do N8N...</p>
          </div>
        ) : filteredNucleos.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nenhum núcleo encontrado</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Não existem registros de núcleos cadastrados para o instituto {currentInstitute} no momento.
            </p>
            <Link
              to="/admin/cadastrar-nucleo"
              className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 transition-colors"
            >
              <Plus size={16} /> Cadastrar o primeiro núcleo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 w-16 text-center">ID</th>
                  <th className="py-3.5 px-4">Nome do Núcleo</th>
                  <th className="py-3.5 px-4">Iniciativa / Modalidade</th>
                  <th className="py-3.5 px-4">Localidade</th>
                  <th className="py-3.5 px-4">Responsáveis</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-28 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredNucleos.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-4 px-4 font-bold text-slate-400 text-center">{item.id}</td>
                      
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block">
                          {item.nome}
                        </span>
                        {item.telefone && (
                          <div className="text-[11px] text-slate-500 mt-1">
                            Tel: {item.telefone}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-xs text-slate-800">
                          {item.projeto_nome || "Sem Projeto"}
                        </div>
                        {item.modalidade_nome && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.modalidade_nome}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-start gap-1.5 text-slate-700 text-xs font-medium">
                          <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <div>{item.cidade_nome}{item.cidade_uf ? `/${item.cidade_uf}` : ""} - {item.bairro_nome}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        {item.coordenador_nome_real && (
                          <div className="text-[11px] text-slate-700">
                            <span className="font-semibold text-slate-500">Coord:</span> {item.coordenador_nome_real}
                          </div>
                        )}
                        {item.instrutor_nome_real && (
                          <div className="text-[11px] text-slate-700 mt-0.5">
                            <span className="font-semibold text-slate-500">Instru:</span> {item.instrutor_nome_real}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            item.ativo
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                              : "bg-red-50 text-red-700 border-red-200/80"
                          }`}
                        >
                          {item.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/admin/cadastrar-nucleo?edit=${item.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Desativar / Ativar"
                          >
                            <Power size={16} />
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
