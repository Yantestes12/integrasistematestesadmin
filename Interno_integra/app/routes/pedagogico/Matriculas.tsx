import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Plus, 
  Search, 
  Edit3, 
  Loader2, 
  Users, 
  CheckCircle2, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  X, 
  FileText, 
  Check, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Star,
  MessageSquare,
  Download
} from "lucide-react";

export interface MatriculaMeta {
  matricula_id: number | string;
  is_favorito: boolean;
  observacao: string;
}

export interface MatriculaItem {
  id: string | number;
  aluno_nome: string;
  aluno_cpf?: string;
  status: string;
  idade?: number;
  sexo?: string;
  cidade?: string;
  nucleo_nome?: string;
  nucleo_id?: string | number;
  turma?: string;
  telefone_conta?: string;
  created_at?: string;
}

export default function Matriculas() {
  const [matriculas, setMatriculas] = useState<MatriculaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");
  const [globalProjeto, setGlobalProjeto] = useState("all");
  const [globalCidade, setGlobalCidade] = useState("all");
  const [globalNucleo, setGlobalNucleo] = useState("all");
  const [nucleosLookup, setNucleosLookup] = useState<Record<string, string>>({});
  const [nucleosData, setNucleosData] = useState<any[]>([]);

  // Meta dados
  const [matriculasMeta, setMatriculasMeta] = useState<Record<string, MatriculaMeta>>({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Modal de Observações
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [obsModalData, setObsModalData] = useState<{ id: string | number; text: string }>({ id: "", text: "" });
  const [savingMeta, setSavingMeta] = useState(false);

  // Paginação: 15 itens por página
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;



  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(savedInstitute);
    
    // Instant SWR Cache Hydration: Se já temos os dados na sessão, renderiza instantaneamente (0ms)
    try {
      const cached = sessionStorage.getItem(`cache_matriculas_${savedInstitute.toUpperCase()}`);
      if (cached) {
        const parsedCached = JSON.parse(cached);
        if (Array.isArray(parsedCached) && parsedCached.length > 0) {
          setMatriculas(parsedCached);
          setLoading(false);
        }
      }
    } catch (e) {}

    fetchAll(savedInstitute);

    const updateGlobalFilter = () => {
      setGlobalProjeto(localStorage.getItem("global_projeto_filter") || "all");
      setGlobalCidade(localStorage.getItem("global_cidade_filter") || "all");
      setGlobalNucleo(localStorage.getItem("global_nucleo_filter") || "all");
    };
    updateGlobalFilter();
    window.addEventListener("globalFilterChanged", updateGlobalFilter);
    
    return () => {
      window.removeEventListener("globalFilterChanged", updateGlobalFilter);
    };
  }, []);

  // Reseta para a página 1 sempre que o filtro ou termo de busca mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, globalProjeto, globalCidade, globalNucleo]);

  const fetchAll = async (instituteName: string) => {
    const inst = instituteName.toUpperCase();
    const hasCache = sessionStorage.getItem(`cache_matriculas_${inst}`);
    if (!hasCache) {
      setLoading(true);
    }

    try {
      const [resM, resN, resMeta] = await Promise.allSettled([
        fetch(`https://w.ibrase.com.br/webhook/matriculas-get?instituto=${inst}`, { cache: "no-store" }),
        fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst}`, { cache: "no-store" }),
        fetch(`https://w.ibrase.com.br/webhook/matriculas-meta-get?instituto=${inst}`, { cache: "no-store" })
      ]);

      const nMap: Record<string, string> = {};
      let nListForFilter: any[] = [];
      if (resN.status === 'fulfilled' && resN.value.ok) {
        try {
          const nData = JSON.parse(await resN.value.text());
          const nList = flattenArray(nData);
          nListForFilter = nList;
          for (let i = 0; i < nList.length; i++) {
            const n = nList[i];
            const id = String(n.id || n.id_nucleo || n.nucleo_id || '');
            const name = n.nome || n.nome_nucleo || n.nucleo_nome || n.identificacao?.nomeNucleo || n.espaco_nome || '';
            if (id && name) nMap[id] = name;
          }
        } catch (e) {}
      }
      setNucleosLookup(nMap);
      setNucleosData(nListForFilter);

      if (resMeta.status === 'fulfilled' && resMeta.value.ok) {
        try {
          const metaText = await resMeta.value.text();
          const metaData = JSON.parse(metaText);
          const metaList = flattenArray(metaData);
          const mMetaMap: Record<string, MatriculaMeta> = {};
          metaList.forEach((m: any) => {
            if (m.matricula_id) {
              mMetaMap[String(m.matricula_id)] = {
                matricula_id: m.matricula_id,
                is_favorito: m.is_favorito === true || m.is_favorito === "true" || m.is_favorito === 1,
                observacao: m.observacao || ""
              };
            }
          });
          setMatriculasMeta(mMetaMap);
        } catch (e) {}
      }

      if (resM.status === 'fulfilled' && resM.value.ok) {
        const text = await resM.value.text();
        let data: any = [];
        if (text && text.trim() !== "") {
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.warn("Erro ao fazer parse das matriculas", e);
          }
        }
        if (data && !data.error && data.message !== "Workflow was started") {
          const rawList = flattenArray(data);
          const parsed = new Array(rawList.length);
          
          for (let idx = 0; idx < rawList.length; idx++) {
            const item = rawList[idx];
            const nId = String(item.nucleo_id || '');
            const resolvedNucleoName = item.nucleo_nome || nMap[nId] || (item.nucleo_id ? `Núcleo ${item.nucleo_id}` : "—");

            parsed[idx] = {
              id: item.id || idx + 1,
              aluno_nome: item.aluno_nome || item.nome || `Aluno #${item.id || idx + 1}`,
              aluno_cpf: item.aluno_cpf || item.cpf || "",
              status: "aprovada", // O sistema atual deixa todas aprovadas automaticamente
              idade: item.idade || null,
              sexo: item.sexo || "Não informado",
              cidade: item.cidade || item.cidade_nome || "—",
              nucleo_nome: resolvedNucleoName,
              nucleo_id: item.nucleo_id || "",
              turma: item.turma || "Sem Turma",
              telefone_conta: item.telefone_conta || item.whatsapp || "—",
              created_at: item.created_at || "",
            };
          }

          parsed.sort((a: any, b: any) => Number(b.id) - Number(a.id));
          setMatriculas(parsed);
          
          // Salva no cache da sessão
          try {
            sessionStorage.setItem(`cache_matriculas_${inst}`, JSON.stringify(parsed));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar dados pedagógicos:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async (matriculaId: string | number) => {
    const currentState = matriculasMeta[String(matriculaId)]?.is_favorito || false;
    const newState = !currentState;
    const currentObs = matriculasMeta[String(matriculaId)]?.observacao || "";

    // Otimistic update
    setMatriculasMeta(prev => ({
      ...prev,
      [String(matriculaId)]: {
        matricula_id: matriculaId,
        is_favorito: newState,
        observacao: currentObs
      }
    }));

    try {
      const formData = new FormData();
      formData.append("instituto", currentInstitute.toUpperCase());
      formData.append("matricula_id", String(matriculaId));
      formData.append("is_favorito", String(newState));
      formData.append("observacao", currentObs);

      await fetch(`https://w.ibrase.com.br/webhook/matriculas-meta-put`, {
        method: "POST", // ou PUT, dependendo de como configurar no n8n
        body: formData
      });
    } catch (e) {
      console.warn("Erro ao salvar favorito:", e);
    }
  };

  const salvarObservacao = async () => {
    setSavingMeta(true);
    const { id, text } = obsModalData;
    const isFav = matriculasMeta[String(id)]?.is_favorito || false;

    // Otimistic update
    setMatriculasMeta(prev => ({
      ...prev,
      [String(id)]: {
        matricula_id: id,
        is_favorito: isFav,
        observacao: text
      }
    }));

    try {
      const formData = new FormData();
      formData.append("instituto", currentInstitute.toUpperCase());
      formData.append("matricula_id", String(id));
      formData.append("is_favorito", String(isFav));
      formData.append("observacao", text);

      await fetch(`https://w.ibrase.com.br/webhook/matriculas-meta-put`, {
        method: "POST",
        body: formData
      });
      setObsModalOpen(false);
    } catch (e) {
      alert("Erro ao salvar a observação.");
    } finally {
      setSavingMeta(false);
    }
  };

  // Flattener linear de alta performance sem estouro de pilha
  const flattenArray = (rawData: any): any[] => {
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

  const filteredMatriculas = useMemo(() => {
    return matriculas.filter((item) => {
      if (globalNucleo !== "all" && String(item.nucleo_id) !== globalNucleo) return false;
      
      if (globalProjeto !== "all" || globalCidade !== "all") {
        const nObj = nucleosData.find(n => String(n.id || n.id_nucleo || n.nucleo_id) === String(item.nucleo_id));
        if (globalProjeto !== "all" && String(nObj?.projeto_id) !== globalProjeto) return false;
        if (globalCidade !== "all" && nObj?.cidade?.toLowerCase() !== globalCidade.toLowerCase()) return false;
      }

      if (showFavoritesOnly && !matriculasMeta[String(item.id)]?.is_favorito) return false;
      
      return (
        (item.aluno_nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.aluno_cpf || "").includes(searchTerm) ||
        (item.nucleo_nome || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [matriculas, globalNucleo, globalProjeto, globalCidade, nucleosData, searchTerm, showFavoritesOnly, matriculasMeta]);

  // Cálculos da Paginação
  const totalItems = filteredMatriculas.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedMatriculas = filteredMatriculas.slice(startIndex, endIndex);

  // Gerador inteligente de números de página com elipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const handleExportExcel = () => {
    if (filteredMatriculas.length === 0) {
      alert("Nenhum dado para exportar.");
      return;
    }
    const dataToExport = filteredMatriculas.map((m) => ({
      ID: m.id,
      Nome: m.aluno_nome,
      CPF: m.aluno_cpf || "Não informado",
      "Núcleo": m.nucleo_nome || "—",
      Turma: m.turma || "—",
      "Telefone/WhatsApp": m.telefone_conta || "—",
      "Data de Matrícula": m.created_at || "—"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Matriculas");
    XLSX.writeFile(workbook, "Matriculas.xlsx");
  };

  const handleExportPDF = () => {
    if (filteredMatriculas.length === 0) {
      alert("Nenhum dado para exportar.");
      return;
    }
    const doc = new jsPDF("landscape");
    doc.text("Relatório de Matrículas", 14, 15);
    
    const tableData = filteredMatriculas.map((m) => [
      m.id,
      m.aluno_nome,
      m.aluno_cpf || "Não informado",
      m.nucleo_nome || "—",
      m.turma || "—",
      m.telefone_conta || "—",
      m.created_at || "—"
    ]);

    autoTable(doc, {
      head: [["ID", "Nome", "CPF", "Núcleo", "Turma", "Telefone", "Data de Matrícula"]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save("Matriculas.pdf");
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
      
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-100 dark:border-blue-800">
              <Users size={14} /> Módulo Pedagógico
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Gestão de Matrículas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analise, aprove e gerencie a base de alunos matriculados.
          </p>
        </div>
      </div>

      {/* Tabela de Matrículas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
        
        {/* Barra de Filtros e Busca */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou núcleo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-black shadow-2xs
                ${showFavoritesOnly 
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <Star size={16} className={showFavoritesOnly ? "fill-amber-500" : ""} />
              Somente Favoritos
            </button>

            <button 
              onClick={handleExportExcel}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-200 dark:border-green-800/60 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 transition-all text-sm font-black shadow-2xs"
            >
              <Download size={16} />
              Excel
            </button>

            <button 
              onClick={handleExportPDF}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all text-sm font-black shadow-2xs"
            >
              <FileText size={16} />
              PDF
            </button>

            <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-slate-200 dark:border-slate-700">
              <Users size={14} />
              {totalItems} ALUNOS
            </div>
          </div>
        </div>

        {/* Tabela de Dados Reais */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold animate-pulse">Carregando matrículas da base...</p>
          </div>
        ) : filteredMatriculas.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhuma matrícula encontrada</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto">
              Não existem registros de alunos matriculados para os filtros atuais no instituto {currentInstitute}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">
                  <th className="py-3.5 px-3 md:px-4 w-16 text-center">ID</th>
                  <th className="py-3.5 px-3 md:px-4">Aluno(a)</th>
                  <th className="py-3.5 px-3 md:px-4 w-48">Núcleo & Turma</th>
                  <th className="py-3.5 px-3 md:px-4 w-32 text-center">Contato</th>
                  <th className="py-3.5 px-3 md:px-4 w-32 text-center">Status</th>
                  <th className="py-3.5 px-3 md:px-4 w-40 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm md:text-base">
                {paginatedMatriculas.map((item) => {
                  const statusRaw = (item.status || "").toLowerCase();
                  let statusColor = "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
                  if (statusRaw === "aprovada" || statusRaw === "aprovado" || statusRaw === "ativo") {
                    statusColor = "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60";
                  } else if (statusRaw === "pendente") {
                    statusColor = "bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800/60";
                  } else if (statusRaw === "reprovada" || statusRaw === "reprovado" || statusRaw === "cancelada") {
                    statusColor = "bg-red-100 dark:bg-red-950/70 text-red-900 dark:text-red-300 border-red-300 dark:border-red-800/60";
                  }

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="py-3 md:py-3.5 px-3 md:px-4 font-bold text-slate-400 dark:text-slate-500 text-center text-xs sm:text-sm">#{item.id}</td>
                      
                      <td className="py-3 md:py-3.5 px-3 md:px-4">
                        <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block text-sm sm:text-base">
                          {item.aluno_nome}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.aluno_cpf && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">CPF: {item.aluno_cpf}</span>
                          )}
                          {item.idade && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">({item.idade} anos)</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 md:py-3.5 px-3 md:px-4">
                        <div className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate" title={item.nucleo_nome}>
                          {item.nucleo_nome}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          {item.turma}
                        </div>
                      </td>

                      <td className="py-3 md:py-3.5 px-3 md:px-4 text-center font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                        {item.telefone_conta}
                      </td>

                      <td className="py-3 md:py-3.5 px-3 md:px-4 text-center">
                        {statusRaw === "validada" || statusRaw === "validado" || statusRaw === "aprovada" || statusRaw === "aprovado" || statusRaw === "ativo" ? (
                          <div className="flex items-center justify-center" title="Validada">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs inline-block" />
                          </div>
                        ) : statusRaw === "pendente" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black border uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800/60">
                            Pendente
                          </span>
                        ) : statusRaw === "reprovada" || statusRaw === "reprovado" || statusRaw === "cancelada" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black border uppercase tracking-wider bg-red-100 dark:bg-red-950/70 text-red-900 dark:text-red-300 border-red-300 dark:border-red-800/60">
                            Reprovada
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${statusColor}`}>
                            {item.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                          <button
                            onClick={() => toggleFavorito(item.id)}
                            className={`p-2 rounded-lg transition-colors border ${matriculasMeta[String(item.id)]?.is_favorito 
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 hover:bg-amber-100' 
                              : 'text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:text-amber-500 hover:bg-amber-50'}`}
                            title="Favoritar"
                          >
                            <Star size={16} className={matriculasMeta[String(item.id)]?.is_favorito ? "fill-amber-500" : ""} />
                          </button>
                          
                          <button
                            onClick={() => {
                              setObsModalData({ id: item.id, text: matriculasMeta[String(item.id)]?.observacao || "" });
                              setObsModalOpen(true);
                            }}
                            className={`p-2 rounded-lg transition-colors border relative ${matriculasMeta[String(item.id)]?.observacao 
                              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100' 
                              : 'text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:text-indigo-600 hover:bg-indigo-50'}`}
                            title="Observações"
                          >
                            <MessageSquare size={16} />
                            {matriculasMeta[String(item.id)]?.observacao && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900" />
                            )}
                          </button>

                          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                          <Link
                            to={`/pedagogico/matriculas/resumo/${item.id}`}
                            className="p-2 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors border border-blue-200 dark:border-blue-800"
                            title="Resumo da Matrícula"
                          >
                            <FileText size={16} />
                          </Link>
                          <Link
                            to={`/pedagogico/matriculas/historico/${item.id}`}
                            className="p-2 rounded-lg text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors border border-amber-200 dark:border-amber-800"
                            title="Histórico de Alterações"
                          >
                            <Clock size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Barra de Controles de Paginação (Footer da Tabela) */}
        {!loading && totalItems > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Informações da Faixa Atual */}
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Mostrando <strong className="text-slate-900 dark:text-slate-200 font-extrabold">{startIndex + 1}</strong> a{" "}
              <strong className="text-slate-900 dark:text-slate-200 font-extrabold">{endIndex}</strong> de{" "}
              <strong className="text-slate-900 dark:text-slate-200 font-extrabold">{totalItems.toLocaleString("pt-BR")}</strong> alunos
            </div>

            {/* Navegação de Páginas */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              
              {/* Primeira Página */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Primeira Página"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Página Anterior */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Página Anterior"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Botões Numéricos de Página */}
              {getPageNumbers().map((p, idx) => {
                if (p === "...") {
                  return (
                    <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 dark:text-slate-500 text-xs font-bold select-none">
                      ...
                    </span>
                  );
                }

                const pageNum = Number(p);
                const isCurrent = pageNum === safeCurrentPage;

                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-black transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white shadow-xs border border-blue-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Próxima Página */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Próxima Página"
              >
                <ChevronRight size={16} />
              </button>

              {/* Última Página */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Última Página"
              >
                <ChevronsRight size={16} />
              </button>

            </div>

          </div>
        )}
      </div>

      {/* Modal de Observação */}
      {obsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">Observação Pedagógica</h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Matrícula #{obsModalData.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setObsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5">
              <textarea
                value={obsModalData.text}
                onChange={(e) => setObsModalData({ ...obsModalData, text: e.target.value })}
                placeholder="Escreva alguma observação sobre este aluno..."
                className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-400"
              />
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex justify-end gap-3">
              <button
                onClick={() => setObsModalOpen(false)}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarObservacao}
                disabled={savingMeta}
                className="px-5 py-2.5 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-colors shadow-2xs flex items-center gap-2"
              >
                {savingMeta && <Loader2 size={16} className="animate-spin" />}
                Salvar Anotação
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
