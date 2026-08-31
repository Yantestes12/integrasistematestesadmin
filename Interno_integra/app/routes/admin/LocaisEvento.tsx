import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Plus, Search, Edit3, Trash2, Loader2, Building2,
  MapPin, FileText, CheckCircle2, Clock, X, Eye, Calendar
} from "lucide-react";

export interface LocalEventoItem {
  id: number;
  projeto_id?: number;
  projeto_nome?: string;
  nome: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  ponto_referencia?: string;
  foto_url?: string;
  documentos?: { nome: string; url: string }[];
  status_aprovacao?: string;
  ativo?: boolean;
  created_at?: string;
}

const flattenResponse = (data: any): any[] => {
  if (!data) return [];
  let list: any[] = Array.isArray(data) ? data : data.data || data.items || (Array.isArray(data.json) ? data.json : data.json ? [data.json] : [data]);
  let flat: any[] = [];
  list.forEach((entry: any) => {
    if (entry?.json) Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
    else if (Array.isArray(entry)) flat.push(...entry);
    else flat.push(entry);
  });
  return flat.filter(item => item !== null && item !== undefined);
};

export default function LocaisEvento() {
  const [locais, setLocais] = useState<LocalEventoItem[]>([]);
  const [projetosMap, setProjetosMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");

  // Modal de Documentos
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<{ nome: string; url: string }[]>([]);
  const [selectedLocalNome, setSelectedLocalNome] = useState("");

  // Modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState<LocalEventoItem | null>(null);
  const [countdown, setCountdown] = useState(15);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const inst = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(inst);
    fetchAll(inst);
  }, []);

  useEffect(() => {
    if (!deleteModalOpen || countdown <= 0) return;
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [deleteModalOpen, countdown]);

  const fetchAll = async (inst: string) => {
    setLoading(true);
    try {
      const [rLocais, rProjetos] = await Promise.allSettled([
        fetch(`https://w.ibrase.com.br/webhook/locais-evento-get?instituto=${inst.toUpperCase()}`),
        fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst.toUpperCase()}`),
      ]);

      // Projetos (para resolver nomes)
      if (rProjetos.status === "fulfilled" && rProjetos.value.ok) {
        const t = await rProjetos.value.text();
        if (t) {
          const d = JSON.parse(t);
          const map: Record<number, string> = {};
          flattenResponse(d).forEach((p: any) => {
            if (p.id) map[Number(p.id)] = p.nome || `Projeto ${p.id}`;
          });
          setProjetosMap(map);
        }
      }

      // Locais
      if (rLocais.status === "fulfilled" && rLocais.value.ok) {
        const t = await rLocais.value.text();
        if (t && t.trim()) {
          try {
            const d = JSON.parse(t);
            const items = flattenResponse(d).map((item: any) => ({
              ...item,
              documentos: typeof item.documentos === "string" ? JSON.parse(item.documentos || "[]") : (item.documentos || []),
            }));
            setLocais(items.sort((a: any, b: any) => Number(b.id) - Number(a.id)));
          } catch (_) {
            setLocais([]);
          }
        } else {
          setLocais([]);
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar locais de evento:", e);
      setLocais([]);
    } finally {
      setLoading(false);
    }
  };

  const openDocsModal = (local: LocalEventoItem) => {
    setSelectedDocs(local.documentos || []);
    setSelectedLocalNome(local.nome);
    setDocsModalOpen(true);
  };

  const openDeleteModal = (local: LocalEventoItem) => {
    setSelectedDelete(local);
    setCountdown(15);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDelete || countdown > 0 || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch("https://w.ibrase.com.br/webhook/locais-evento-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedDelete.id, instituto: currentInstitute.toUpperCase() }),
      });
      if (res.ok) {
        setLocais(prev => prev.filter(l => l.id !== selectedDelete.id));
        setDeleteModalOpen(false);
        setSelectedDelete(null);
      } else {
        alert("Erro ao excluir local de evento.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = locais.filter(l =>
    (l.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.bairro || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.cidade || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans">

      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-purple-100 dark:border-purple-800">
              <Building2 size={14} /> {currentInstitute}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">• Módulo Eventos</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Locais de Evento
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gerencie os locais físicos cadastrados para eventos do instituto <strong className="text-slate-700 dark:text-slate-200">{currentInstitute}</strong>.
          </p>
        </div>
        <Link
          to="/admin/cadastrar-local-evento"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm shrink-0"
        >
          <Plus size={18} />
          <span>Cadastrar Local de Evento</span>
        </Link>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

        {/* Barra de busca */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, bairro ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Exibindo <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> locais
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3.5 h-3.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3.5 h-3.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold animate-pulse">Carregando locais de evento...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 font-semibold">Nenhum local de evento encontrado</p>
            <p className="text-slate-400 text-sm">Cadastre o primeiro local para um evento do instituto {currentInstitute}.</p>
            <Link to="/admin/cadastrar-local-evento" className="mt-2 text-sm text-purple-600 font-bold hover:underline flex items-center gap-1">
              <Plus size={14} /> Cadastrar local de evento
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-6 bg-slate-50/30 dark:bg-slate-900/30">
            {filtered.map((local) => (
              <div key={local.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group">
                
                {/* Cabeçalho do Card (Imagem) */}
                <div className="h-40 sm:h-48 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {local.foto_url ? (
                    <img
                      src={local.foto_url.startsWith("http://") ? `/api/proxy-image?url=${encodeURIComponent(local.foto_url)}` : local.foto_url}
                      alt={local.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as any).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Calendar size={32} className="mb-2 opacity-30" />
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Sem Imagem</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {local.status_aprovacao === "aprovado" ? (
                      <span className="bg-emerald-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                        <CheckCircle2 size={12} /> Aprovado
                      </span>
                    ) : (
                      <span className="bg-amber-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                        <Clock size={12} /> Pendente
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Corpo do Card */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">{local.nome}</h3>
                  
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mb-4 line-clamp-2 min-h-[40px]">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    <span>
                      {local.rua}{local.numero ? `, ${local.numero}` : ""}
                      {(local.rua || local.numero) && <br/>}
                      {local.bairro}{local.cidade ? `, ${local.cidade}` : ""}
                    </span>
                  </div>
                  
                  {/* Projeto */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 mb-5">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Iniciativa / Projeto</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {local.projeto_id ? (projetosMap[local.projeto_id] || `Projeto #${local.projeto_id}`) : "—"}
                    </span>
                  </div>
                  
                  {/* Ações (Rodapé do Card) */}
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-2">
                    {local.documentos && local.documentos.length > 0 ? (
                      <button onClick={() => openDocsModal(local)} className="col-span-1 flex items-center justify-center gap-1.5 p-2 text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors" title="Ver Documentos">
                        <FileText size={16} />
                        <span className="md:hidden lg:inline">{local.documentos.length}</span>
                      </button>
                    ) : (
                      <div className="col-span-1 flex items-center justify-center gap-1.5 p-2 text-xs font-bold bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500 rounded-lg cursor-not-allowed">
                        <FileText size={16} />
                      </div>
                    )}
                    
                    <Link to={`/admin/ocorrencias-evento?localId=${local.id}&nome=${encodeURIComponent(local.nome)}`} className="col-span-1 flex items-center justify-center gap-1.5 p-2 text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-100 transition-colors" title="Datas do Evento">
                      <Calendar size={16} />
                    </Link>
                    
                    <Link to={`/admin/cadastrar-local-evento?edit=${local.id}`} className="col-span-1 flex items-center justify-center p-2 text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors" title="Editar">
                      <Edit3 size={16} />
                    </Link>
                    
                    <button onClick={() => openDeleteModal(local)} className="col-span-1 flex items-center justify-center p-2 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Documentos */}
      {docsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDocsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Documentos</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedLocalNome}</p>
              </div>
              <button onClick={() => setDocsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-2">
              {selectedDocs.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">Nenhum documento cadastrado.</p>
              ) : selectedDocs.map((doc, i) => (
                <a
                  key={i}
                  href={doc.url?.startsWith("http://") ? `/api/proxy-image?url=${encodeURIComponent(doc.url)}` : doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{doc.nome || `Documento ${i + 1}`}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {deleteModalOpen && selectedDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="text-red-500" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Excluir Local de Evento</h3>
                <p className="text-sm text-slate-500 mt-1">Tem certeza que deseja excluir <strong className="text-slate-700 dark:text-slate-200">"{selectedDelete.nome}"</strong>? Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteModalOpen(false); setSelectedDelete(null); }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={countdown > 0 || isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                {countdown > 0 ? `Aguarde ${countdown}s` : "Excluir Definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
