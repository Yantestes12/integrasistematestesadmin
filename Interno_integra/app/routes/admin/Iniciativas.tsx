import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Power, Loader2, FileText, Filter, Layers, Building2 } from "lucide-react";
import { supabase } from "../../supabaseClient";

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
}

export default function Iniciativas() {
  const [iniciativas, setIniciativas] = useState<IniciativaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(savedInstitute);

    fetchIniciativas(savedInstitute);
  }, []);

  const fetchIniciativas = async (instituteName: string) => {
    setLoading(true);

    try {
      // 1. Tentar busca via Webhook do N8N enviando o instituto pelo switch
      let n8nEndpoint = "";
      switch (instituteName.toUpperCase()) {
        case "GASCTPNA":
          n8nEndpoint = "https://w.ibrase.com.br/webhook/buscas-auxiliares?tipo=projetos&instituto=GASCTPNA";
          break;
        case "AUNI":
          n8nEndpoint = "https://w.ibrase.com.br/webhook/buscas-auxiliares?tipo=projetos&instituto=AUNI";
          break;
        case "IVEM":
          n8nEndpoint = "https://w.ibrase.com.br/webhook/buscas-auxiliares?tipo=projetos&instituto=IVEM";
          break;
        case "IBRASE":
        default:
          n8nEndpoint = "https://w.ibrase.com.br/webhook/buscas-auxiliares?tipo=projetos&instituto=IBRASE";
          break;
      }

      const res = await fetch(n8nEndpoint, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setIniciativas(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Erro no Webhook N8N de Iniciativas, executando consulta direta ao Supabase...", e);
    }

    // 2. Fallback direto ao Supabase com Switch por Tabela de Instituto
    try {
      let targetTable = "";
      switch (instituteName.toUpperCase()) {
        case "GASCTPNA":
          targetTable = "GASCTPNA_projetos";
          break;
        case "AUNI":
          targetTable = "AUNI_projetos";
          break;
        case "IVEM":
          targetTable = "IVEM_projetos";
          break;
        case "IBRASE":
        default:
          targetTable = "IBRASE_projetos";
          break;
      }

      // Tenta a tabela específica do instituto ou fallback para 'projetos'
      let { data, error } = await supabase.from(targetTable).select("*").order("id", { ascending: false });

      if (error || !data || data.length === 0) {
        const fallbackRes = await supabase.from("projetos").select("*").order("id", { ascending: false });
        if (fallbackRes.data) {
          data = fallbackRes.data;
        }
      }

      if (data) {
        setIniciativas(data);
      }
    } catch (err) {
      console.error("Erro ao carregar iniciativas do Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIniciativas = iniciativas.filter((item) =>
    (item.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.termo_fomento || "").toLowerCase().includes(searchTerm.toLowerCase())
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
            Iniciativas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie os projetos e iniciativas cadastradas para o instituto <strong className="text-slate-700">{currentInstitute}</strong>.
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
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-slate-500 text-sm font-medium">Buscando iniciativas no backend do N8N...</p>
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
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 w-16 text-center">ID</th>
                  <th className="py-3.5 px-4">Nome da Iniciativa</th>
                  <th className="py-3.5 px-4">Documentação</th>
                  <th className="py-3.5 px-4 w-32">Faixa Etária</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-28 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredIniciativas.map((item) => {
                  const isAtivo = item.ativo !== false && item.status !== "inativo" && item.status !== false;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-4 px-4 font-bold text-slate-400 text-center">{item.id}</td>
                      
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block">
                          {item.nome}
                        </span>
                        {item.descricao && (
                          <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {item.descricao}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {item.termo_fomento && (
                          <div className="font-bold text-xs text-slate-800">
                            Termo: {item.termo_fomento}
                          </div>
                        )}
                        {item.numero_proposta && (
                          <div className="text-[11px] text-slate-500">Prop: {item.numero_proposta}</div>
                        )}
                        {item.numero_processo_adm && (
                          <div className="text-[11px] text-slate-500">Proc: {item.numero_processo_adm}</div>
                        )}
                        {item.numero_transferegov && (
                          <div className="text-[11px] text-slate-500">Transf: {item.numero_transferegov}</div>
                        )}
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-600">
                        {item.faixa_etaria || "7 - 65"}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
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
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <button
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
