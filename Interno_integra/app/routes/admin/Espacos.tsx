import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Edit3, Power, Loader2, MapPin, Home } from "lucide-react";

export interface EspacoItem {
  id: string | number;
  nome: string;
  projeto_id?: number;
  projeto_nome?: string;
  modalidade_id?: number;
  modalidade_nome?: string;
  resp_nome?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  ativo: boolean;
}

let projetosCache: Record<number, string> = {};
let modalidadesCache: Record<number, string> = {};

const flattenResponse = (data: any): any[] => {
  if (!data) return [];
  let list: any[] = Array.isArray(data) ? data : data.data || data.items || (Array.isArray(data.json) ? data.json : data.json ? [data.json] : [data]);
  let flat: any[] = [];
  list.forEach((entry: any) => {
    if (entry?.json) {
      Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
    } else if (Array.isArray(entry)) {
      flat.push(...entry);
    } else {
      flat.push(entry);
    }
  });
  return flat;
};

export default function Espacos() {
  const [espacos, setEspacos] = useState<EspacoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");
  const [togglingId, setTogglingId] = useState<string | number | null>(null);

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(savedInstitute);
    Promise.all([fetchProjetos(savedInstitute), fetchModalidades(savedInstitute)]).then(() => {
      fetchEspacos(savedInstitute);
    });
  }, []);

  const fetchProjetos = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        projetosCache = {};
        flattenResponse(data).forEach((p: any) => { if (p.id && p.nome) projetosCache[Number(p.id)] = p.nome; });
      }
    } catch (e) { console.warn("Erro projetos:", e); }
  };

  const fetchModalidades = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${inst.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        modalidadesCache = {};
        flattenResponse(data).forEach((m: any) => { if (m.id && m.nome) modalidadesCache[Number(m.id)] = m.nome; });
      }
    } catch (e) { console.warn("Erro modalidades:", e); }
  };

  const fetchEspacos = async (inst: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${inst.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        const list = flattenResponse(data);
        setEspacos(list.map((e: any) => ({
          id: e.id,
          nome: e.nome || "",
          projeto_id: e.projeto_id,
          projeto_nome: e.projeto_id ? projetosCache[Number(e.projeto_id)] || `Projeto ID ${e.projeto_id}` : "—",
          modalidade_id: e.modalidade_id,
          modalidade_nome: e.modalidade_id ? modalidadesCache[Number(e.modalidade_id)] || `Modalidade ID ${e.modalidade_id}` : "—",
          resp_nome: e.resp_nome || "—",
          bairro: e.bairro || "",
          cidade: e.cidade || "",
          uf: e.uf || "",
          ativo: e.ativo !== false && e.ativo !== 0 && e.ativo !== "0",
        })));
      }
    } catch (e) {
      console.error("Erro ao buscar espaços:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivo = async (espaco: EspacoItem) => {
    setTogglingId(espaco.id);
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const res = await fetch("https://w.ibrase.com.br/webhook/espacos-put", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: espaco.id, ativo: !espaco.ativo, instituto: authInstitute }),
      });
      if (res.ok) {
        setEspacos(prev => prev.map(e => e.id === espaco.id ? { ...e, ativo: !espaco.ativo } : e));
      }
    } catch (e) {
      console.error("Erro ao alterar status:", e);
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = espacos.filter(e =>
    !searchTerm ||
    e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.resp_nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.bairro || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.projeto_nome || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-200">
              {currentInstitute}
            </span>
            <span className="text-slate-400 text-xs font-medium">• Módulo Administrativo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <Home className="w-7 h-7 text-[var(--theme-primary)]" />
            Espaços
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie os espaços físicos cadastrados para o instituto <strong className="text-slate-800">{currentInstitute}</strong>.
          </p>
        </div>
        <Link
          to="/admin/cadastrar-espaco"
          className="inline-flex items-center gap-2 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold px-5 py-3 rounded-xl shadow-sm transition-all text-sm shrink-0"
        >
          <Plus size={18} />
          Novo Espaço
        </Link>
      </div>

      {/* Busca e Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome, responsável ou bairro..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 focus:border-[var(--theme-primary)]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
            Exibindo {filtered.length} espaço{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="animate-spin w-5 h-5" />
            <span className="text-sm font-medium">Carregando espaços...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Home className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhum espaço encontrado.</p>
            <Link to="/admin/cadastrar-espaco" className="mt-4 text-sm font-bold text-[var(--theme-primary)] hover:underline">
              + Cadastrar primeiro espaço
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Espaço</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Iniciativa / Modalidade</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Responsável</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Localização</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(espaco => (
                  <tr key={espaco.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 text-slate-400 font-mono text-xs">{espaco.id}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-800">{espaco.nome}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-slate-700 font-medium">{espaco.projeto_nome}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{espaco.modalidade_nome}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{espaco.resp_nome}</td>
                    <td className="px-4 py-4">
                      {(espaco.bairro || espaco.cidade) ? (
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{[espaco.bairro, espaco.cidade, espaco.uf].filter(Boolean).join(" · ")}</span>
                        </div>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        espaco.ativo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {espaco.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/cadastrar-espaco?edit=${espaco.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--theme-primary)] hover:bg-slate-100 transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </Link>
                        <button
                          onClick={() => handleToggleAtivo(espaco)}
                          disabled={togglingId === espaco.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            espaco.ativo
                              ? "text-slate-400 hover:text-red-500 hover:bg-red-50"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={espaco.ativo ? "Desativar" : "Ativar"}
                        >
                          {togglingId === espaco.id ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
