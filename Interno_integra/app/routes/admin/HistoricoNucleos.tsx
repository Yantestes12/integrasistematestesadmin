import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Search, Download, Calendar, Layers, Loader2, MapPin } from "lucide-react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import fileSaver from "file-saver";
const { saveAs } = fileSaver;

interface HistoricoVagaItem {
  id: number;
  numero_vaga: number;
  nucleo_anterior: string | null;
  nucleo_atual: string;
  modalidade_nome: string;
  data_modificacao: string;
  acao: string;
}

export default function HistoricoNucleos() {
  const navigate = useNavigate();
  const [historico, setHistorico] = useState<HistoricoVagaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);

  useEffect(() => {
    const inst = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(inst);
    fetchHistorico(inst);
  }, []);

  const fetchHistorico = async (inst: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/historico-vagas-get?instituto=${inst.toUpperCase()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && data.message !== "Workflow was started") {
           let flatList: any[] = [];
           const raw = Array.isArray(data) ? data : (data.data || [data]);
           raw.forEach((item: any) => {
              if (item.json) {
                Array.isArray(item.json) ? flatList.push(...item.json) : flatList.push(item.json);
              } else {
                flatList.push(item);
              }
           });
           setHistorico(flatList);
        }
      }
    } catch (error) {
      console.warn("Erro ao buscar histórico de vagas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistorico = useMemo(() => {
    if (!searchTerm) return historico;
    return historico.filter((item) => {
      return (
        (item.nucleo_atual || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nucleo_anterior || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.numero_vaga).includes(searchTerm)
      );
    });
  }, [historico, searchTerm]);

  // Agrupa os itens por número da vaga para exibir apenas a mudança mais recente
  const currentVagasMap = useMemo(() => {
    const map = new Map<number, HistoricoVagaItem>();
    
    // Sort chronological: oldest first, so newest overwrites
    const sorted = [...filteredHistorico].sort((a, b) => 
      new Date(a.data_modificacao).getTime() - new Date(b.data_modificacao).getTime()
    );

    sorted.forEach(item => {
      map.set(item.numero_vaga, item);
    });

    // Converter de volta pra array e ordenar por número da vaga (1, 2, 3...)
    return Array.from(map.values()).sort((a, b) => a.numero_vaga - b.numero_vaga);
  }, [filteredHistorico]);

  const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9 \-]/g, '').trim();

  const handleGerarPlanilha = async () => {
    setIsGeneratingExcel(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Histórico de Vagas');

      // Títulos das Colunas
      worksheet.columns = [
        { header: 'Numeração da Vaga', key: 'vaga', width: 22 },
        { header: 'Nome do Núcleo Anterior', key: 'anterior', width: 35 },
        { header: 'Nome do Núcleo Atual', key: 'atual', width: 35 },
        { header: 'Modalidade', key: 'modalidade', width: 25 },
        { header: 'Data de Modificação', key: 'data', width: 22 },
      ];

      // Estilizar o Cabeçalho
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' } // Indigo 600
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 25;

      // Inserir os Dados
      currentVagasMap.forEach(item => {
        worksheet.addRow({
          vaga: item.numero_vaga,
          anterior: item.nucleo_anterior || "—",
          atual: item.nucleo_atual,
          modalidade: item.modalidade_nome,
          data: new Date(item.data_modificacao).toLocaleDateString('pt-BR'),
        });
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.getCell(1).alignment = { horizontal: 'center' };
          row.getCell(4).alignment = { horizontal: 'center' };
          row.getCell(5).alignment = { horizontal: 'center' };
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Historico_Vagas_${sanitizeName(currentInstitute)}.xlsx`);

    } catch (e: any) {
      console.error("Erro ao gerar Excel:", e);
      alert("Erro ao gerar a planilha Excel: " + e.message);
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      
      {/* Banner de Topo */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-800">
              Gestão de Vagas
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Histórico de Núcleos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visualização das movimentações e preenchimento atual das vagas de núcleos do instituto <strong className="text-slate-700 dark:text-slate-200">{currentInstitute}</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/nucleos")}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          
          <button
            onClick={handleGerarPlanilha}
            disabled={isGeneratingExcel || currentVagasMap.length === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto justify-center"
          >
            {isGeneratingExcel ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Baixar Planilha Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por número da vaga ou núcleo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-2xs"
            />
          </div>
          <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-slate-200 dark:border-slate-700">
            <Layers size={14} />
            {currentVagasMap.length} Vagas Ocupadas
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <th className="py-4 px-4 text-center">Numeração da Vaga</th>
                <th className="py-4 px-4">Nome do Núcleo Anterior</th>
                <th className="py-4 px-4">Nome do Núcleo Atual</th>
                <th className="py-4 px-4 text-center">Modalidade</th>
                <th className="py-4 px-4 text-center">Última Modificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <span className="font-semibold text-sm">Carregando histórico de vagas...</span>
                    </div>
                  </td>
                </tr>
              ) : currentVagasMap.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500 dark:text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <p className="text-base font-bold">Nenhum histórico encontrado</p>
                    <p className="text-sm mt-1">Gere o SQL no banco e modifique um núcleo para que o histórico apareça.</p>
                  </td>
                </tr>
              ) : (
                currentVagasMap.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-sm border border-slate-200 dark:border-slate-700">
                        {item.numero_vaga}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {item.nucleo_anterior || "—"}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {item.nucleo_atual}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
                        {item.modalidade_nome}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400 font-medium text-xs">
                      {new Date(item.data_modificacao).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
