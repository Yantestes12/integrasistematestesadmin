import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";

import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import fileSaver from "file-saver";
const { saveAs } = fileSaver;
import {
  FileText,
  Search,
  MapPin,
  Download,
  Loader2,
  Users,
  Eye
} from "lucide-react";

/* ─── Tipos ─── */
interface MatriculaItem {
  id: string | number;
  aluno_nome: string;
  aluno_cpf?: string;
  nucleo_id?: string | number;
  turma?: string;
  sexo?: string;
  idade?: number;
  telefone_conta?: string;
  status?: string;
}

interface NucleoInfo {
  id: string | number;
  nome: string;
  bairro?: string;
  cidade?: string;
  projeto_id?: string | number;
  modalidade_id?: string | number;
  espaco_id?: string | number;
}

/* ─── Flatten helper ─── */
const flattenArray = (rawData: any): any[] => {
  if (Array.isArray(rawData)) {
    const result: any[] = [];
    for (const item of rawData) {
      if (item && typeof item === "object" && item.json) {
        if (Array.isArray(item.json)) result.push(...item.json);
        else result.push(item.json);
      } else {
        result.push(item);
      }
    }
    return result;
  }
  if (typeof rawData === "object") {
    if (Array.isArray(rawData.data)) return rawData.data;
    if (Array.isArray(rawData.items)) return rawData.items;
    if (rawData.json) return Array.isArray(rawData.json) ? rawData.json : [rawData.json];
    return [rawData];
  }
  return [];
};

export default function Relatorios() {
  const [matriculas, setMatriculas] = useState<MatriculaItem[]>([]);
  const [nucleosList, setNucleosList] = useState<NucleoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");

  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [nucleoGerando, setNucleoGerando] = useState("");

  const [projetosCache, setProjetosCache] = useState<Record<number, any>>({});
  const [modalidadesCache, setModalidadesCache] = useState<Record<number, string>>({});
  const [espacosCache, setEspacosCache] = useState<Record<number, any>>({});

  // Filtros Locais
  const [searchTerm, setSearchTerm] = useState("");

  // Filtros Globais
  const [globalProjeto, setGlobalProjeto] = useState("all");
  const [globalCidade, setGlobalCidade] = useState("all");
  const [globalNucleo, setGlobalNucleo] = useState("all");

  const BASE = "https://w.ibrase.com.br/webhook/";

  /* ─── Fetch ─── */
  useEffect(() => {
    const inst = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(inst);
    fetchData(inst);

    const updateGlobalFilter = () => {
      setGlobalProjeto(localStorage.getItem("global_projeto_filter") || "all");
      setGlobalCidade(localStorage.getItem("global_cidade_filter") || "all");
      setGlobalNucleo(localStorage.getItem("global_nucleo_filter") || "all");
    };
    updateGlobalFilter();
    window.addEventListener("globalFilterChanged", updateGlobalFilter);
    return () => window.removeEventListener("globalFilterChanged", updateGlobalFilter);
  }, []);

  const fetchData = async (inst: string) => {
    setLoading(true);
    try {
      const [resN, resM, resP, resMod, resE] = await Promise.allSettled([
        fetch(`${BASE}nucleos-get?instituto=${inst}`, { cache: "no-store" }),
        fetch(`${BASE}matriculas-get?instituto=${inst}`, { cache: "no-store" }),
        fetch(`${BASE}projetos-get?instituto=${inst}`, { cache: "no-store" }),
        fetch(`${BASE}modalidades-get?instituto=${inst}`, { cache: "no-store" }),
        fetch(`${BASE}espacos-get?instituto=${inst}`, { cache: "no-store" }),
      ]);

      const pCache: Record<number, any> = {};
      if (resP.status === "fulfilled" && resP.value.ok) {
        try {
          const pData = await resP.value.json();
          for (const p of flattenArray(pData)) {
            if (p.id) pCache[Number(p.id)] = p;
          }
        } catch(e) {}
      }
      setProjetosCache(pCache);

      const mCache: Record<number, string> = {};
      if (resMod.status === "fulfilled" && resMod.value.ok) {
        try {
          const modData = await resMod.value.json();
          for (const m of flattenArray(modData)) {
            const mapId = Number(m.id || m.modalidade_id);
            if (mapId && m.nome) mCache[mapId] = m.nome;
          }
        } catch(e) {}
      }
      setModalidadesCache(mCache);

      const eCache: Record<number, any> = {};
      if (resE.status === "fulfilled" && resE.value.ok) {
        try {
          const eData = await resE.value.json();
          for (const e of flattenArray(eData)) {
            if (e.id) eCache[Number(e.id)] = e;
          }
        } catch(e) {}
      }
      setEspacosCache(eCache);

      const nList: NucleoInfo[] = [];
      if (resN.status === "fulfilled" && resN.value.ok) {
        const nData = await resN.value.json();
        for (const n of flattenArray(nData)) {
          const id = String(n.id || n.id_nucleo || n.nucleo_id || "");
          if (id) {
            nList.push({
              id,
              nome: n.nome || n.nucleo_nome || `Núcleo ${id}`,
              bairro: n.bairro || "",
              cidade: n.cidade || n.cidade_nome || "",
              projeto_id: n.projeto_id || "",
              modalidade_id: n.modalidade_id || n.espacos?.modalidade_id || "",
              espaco_id: n.espaco_id || n.espacos?.id || ""
            });
          }
        }
      }
      setNucleosList(nList);

      if (resM.status === "fulfilled" && resM.value.ok) {
        const text = await resM.value.text();
        const data = JSON.parse(text);
        if (data && !data.error && data.message !== "Workflow was started") {
          const rawList = flattenArray(data);
          const parsed: MatriculaItem[] = rawList.map((item: any, idx: number) => {
            return {
              id: item.id || idx + 1,
              aluno_nome: item.aluno_nome || item.nome || `Aluno #${item.id || idx + 1}`,
              aluno_cpf: item.aluno_cpf || item.cpf || "",
              nucleo_id: item.nucleo_id || item.id_nucleo || item.espaco_id || "",
              turma: item.turma || "—",
              sexo: item.sexo || "Não informado",
              idade: item.idade || "",
              telefone_conta: item.telefone_conta || item.whatsapp || "",
              status: item.status || "Aprovada",
            };
          });
          setMatriculas(parsed);
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar dados de relatórios:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredNucleos = useMemo(() => {
    return nucleosList.filter((n) => {
      // Filtros Globais
      if (globalNucleo !== "all" && String(n.id) !== globalNucleo) return false;
      if (globalProjeto !== "all" && String(n.projeto_id) !== globalProjeto) return false;
      if (globalCidade !== "all" && n.cidade?.toLowerCase() !== globalCidade.toLowerCase()) return false;

      // Busca por nome do núcleo
      if (searchTerm && !n.nome.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    }).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [nucleosList, globalNucleo, globalProjeto, globalCidade, searchTerm]);

  const sanitizeName = (name: string) => {
    // Remove qualquer coisa que não seja letra, número, espaço ou hífen
    return name.replace(/[^a-zA-Z0-9 \-]/g, '').trim();
  };



  const handleGerarRelatorioExcel = async (nucleo: NucleoInfo) => {
    console.log("Iniciando geração de Excel para o núcleo:", nucleo.nome);
    setIsGeneratingExcel(true);
    setNucleoGerando(nucleo.nome);

    try {
      const alunos = matriculas.filter(m => {
        if (String(m.nucleo_id) !== String(nucleo.id)) return false;
        const st = (m.status || "").toLowerCase().trim();
        return st === "aprovada" || st === "aprovado" || st === "ativo" || st === "validada" || st === "validado";
      });
      alunos.sort((a, b) => (a.aluno_nome || "").localeCompare(b.aluno_nome || ""));

      // Buscar o arquivo base da pasta public/templates
      const response = await fetch('/templates/template_beneficiarios.xlsx');
      if (!response.ok) {
        throw new Error("Não foi possível carregar o arquivo BASE de modelo.");
      }
      const arrayBuffer = await response.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.getWorksheet('Planilha1') || workbook.worksheets[0];

      // Extrair informações de Projeto e Modalidade
      const projeto = projetosCache[Number(nucleo.projeto_id)];
      const projetoNome = projeto?.nome || "Não informado";
      const termoFomento = projeto?.termo_fomento || projeto?.termoFomento || projeto?.termo || "Não informado";
      const modalidadeNome = modalidadesCache[Number(nucleo.modalidade_id)] || "Funcional";

      // Pegar os dados do espaço físico para endereço e horário
      const espaco = espacosCache[Number(nucleo.espaco_id)];
      let enderecoCompleto = `Endereço do núcleo: ${nucleo.bairro || ''}, ${nucleo.cidade || ''}`;
      let horarioStr = "Dia e horário de funcionamento: Não informado.";
      
      if (espaco) {
         enderecoCompleto = `Endereço do núcleo: ${espaco.rua || ''}, ${espaco.numero || 'S/N'} - ${espaco.bairro || ''}, ${espaco.cidade || ''} - ${espaco.uf || ''}, ${espaco.cep || ''}`;
         
         if (espaco.horarios) {
            try {
               const h = typeof espaco.horarios === 'string' ? JSON.parse(espaco.horarios) : espaco.horarios;
               let activeDays = [];
               let timeStr = "";
               const daysMap: Record<string, string> = { "1": "Segunda", "2": "Terça", "3": "Quarta", "4": "Quinta", "5": "Sexta", "6": "Sábado", "7": "Domingo" };
               for (const [d, v] of Object.entries(h)) {
                  const val: any = v;
                  if (val && val.ativo && val.abertura) {
                     activeDays.push(daysMap[d] || d);
                     timeStr = `das ${val.abertura} às ${val.fechamento}`;
                  }
               }
               if (activeDays.length > 0) {
                  horarioStr = `Dia e horário de funcionamento: ${activeDays.join(' e ')}, ${timeStr}.`;
               }
            } catch(e) {}
         }
      }

            // Definir nome da Entidade com base no Instituto logado
      let entidadeNome = "Entidade não informada";
      const instLower = currentInstitute.toLowerCase();
      if (instLower === "ibrase") entidadeNome = "Instituto Brasileiro de Sociologia e Estatística (IBRASE)";
      else if (instLower === "gasctpna") entidadeNome = "Grupo de Apoio Social aos Cultivadores da Terra e Preservação da Natureza (GASCTPNA)";
      else if (instLower === "auni") entidadeNome = "AUNI – Associação Nacional União";
      else if (instLower === "ivem") entidadeNome = "Instituto Viver em Movimento (ivem)";
      
      // No template original:
      // A5 é Entidade, B5 é Programa, D5 é Termo de Fomento
      const cellA5 = worksheet.getCell('A5');
      cellA5.value = `Entidade: ${entidadeNome}`;
      cellA5.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' };
      worksheet.getRow(5).height = 45;

      worksheet.getCell('B5').value = `Programa: ${projetoNome}`;
      worksheet.getCell('D5').value = `Termo de Fomento: ${termoFomento}`;
      worksheet.getCell('A6').value = nucleo.nome;
      worksheet.getCell('A7').value = `Nome do Núcleo/Subnúcleo:                         ${nucleo.nome}`;
      worksheet.getCell('B7').value = horarioStr;
      worksheet.getCell('D7').value = enderecoCompleto;

      // Limpar valores de Recursos Humanos nas linhas do modelo base
      [9, 10, 11, 12, 13].forEach((rNum) => {
        const r = worksheet.getRow(rNum);
        const valA = r.getCell(1).text || '';
        if (valA.includes('Coordenador(a):')) r.getCell(1).value = 'Coordenador(a): ';
        else if (valA.includes('Supervisor(a):')) r.getCell(1).value = 'Supervisor(a): ';
        else if (valA.includes('Instrutor(a):')) r.getCell(1).value = 'Instrutor(a): ';
        else if (valA.includes('Auxiliar:')) r.getCell(1).value = 'Auxiliar: ';
        
        if (valA) {
          r.getCell(2).value = '';
          r.getCell(3).value = '';
          r.getCell(4).value = '';
        }
      });

      // LER E SALVAR A ASSINATURA PARA NÃO DEPENDER DE SPLICE_ROWS BUGADOS DO EXCELJS
      let headerRowIndex = 14;
      let presidenteNome = "Marcelo Vivório Alves";
      if (instLower === "gasctpna") presidenteNome = "Valdinei Mendes Correa";
      else if (instLower === "auni") presidenteNome = "Ingrid Rosa Velasco";
      else if (instLower === "ivem") presidenteNome = "Joao Andre Riscado Barreto";

      let sigValue = `______________________________________________\n${presidenteNome} - Presidente \nCampos dos Goytacazes, 28 do fevereiro de 2026`;
      let sigStyle = null;

      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell) => {
          const text = String(cell.value || "");
          if (text.includes('Nome do Beneficiário')) {
            headerRowIndex = rowNumber;
          }
          if (text.includes('_____') || text.includes('Presidente')) {
             sigValue = String(cell.value);
             sigStyle = cell.style;
          }
        });
      });

      // Pegar os estilos da primeira linha de dados dummy (se existir e for logo abaixo do cabeçalho)
      let styleA, styleB, styleC, styleD;
      const dummyRow = worksheet.getRow(headerRowIndex + 1);
      if (dummyRow) {
         styleA = dummyRow.getCell(1).style;
         styleB = dummyRow.getCell(2).style;
         styleC = dummyRow.getCell(3).style;
         styleD = dummyRow.getCell(4).style;
      }

      // APAGAR ABSOLUTAMENTE TUDO ABAIXO DO HEADER!
      // Correção: exceljs tem bugs graves ao deletar linhas e causa atrasos e dados fantasmas.
      // Vamos desmesclar as células e apagar o conteúdo e estilo de todas as linhas uma a uma.
      const totalRows = worksheet.rowCount;
      if (totalRows > headerRowIndex) {
          const mergesToUnmerge = new Set<string>();
          worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
             if (rowNumber > headerRowIndex) {
                row.eachCell({ includeEmpty: true }, (cell: any) => {
                   if (cell.isMerged && cell.master) {
                      mergesToUnmerge.add(cell.master.address);
                   }
                });
             }
          });
          
          mergesToUnmerge.forEach(address => {
             try { worksheet.unMergeCells(address); } catch(e) {}
          });

          // Limpar conteúdo e estilo das linhas antigas em vez de tentar deletá-las
          for (let i = headerRowIndex + 1; i <= totalRows + 5; i++) {
              const r = worksheet.getRow(i);
              r.values = [];
              r.height = undefined;
              r.eachCell({ includeEmpty: true }, c => {
                 c.value = null;
                 c.style = {};
              });
          }
      }

      // Preparar os novos dados
      const rowsToInsert = alunos.length > 0 ? alunos : [{ id: '-', aluno_nome: 'Nenhum aluno cadastrado', aluno_cpf: '-', idade: '-', turma: '-' }];
      
      const newRows = rowsToInsert.map(m => {
        return [
          m.aluno_nome, // Coluna A (Nome)
          m.aluno_cpf || "-", // Coluna B (CPF)
          m.idade || "-", // Coluna C (Idade)
          modalidadeNome // Coluna D (Modalidade)
        ];
      });

      // Sobrescrever as linhas limpas com os dados dos alunos reais
      for (let i = 0; i < newRows.length; i++) {
        const row = worksheet.getRow(headerRowIndex + 1 + i);
        row.getCell(1).value = newRows[i][0];
        row.getCell(2).value = newRows[i][1];
        row.getCell(3).value = newRows[i][2];
        row.getCell(4).value = newRows[i][3];
        row.height = 15;
        if (styleA) row.getCell(1).style = styleA;
        if (styleB) row.getCell(2).style = styleB;
        if (styleC) row.getCell(3).style = styleC;
        if (styleD) row.getCell(4).style = styleD;
      }

      // RECRIAR A ASSINATURA NO FINAL
      const newSigRow = headerRowIndex + newRows.length + 2;
      worksheet.mergeCells(`A${newSigRow}:D${newSigRow + 1}`);
      const newSigCell = worksheet.getCell(`A${newSigRow}`);
      newSigCell.value = sigValue;
      if (sigStyle) {
          newSigCell.style = sigStyle;
      } else {
          newSigCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          newSigCell.font = { name: 'Arial', size: 10 };
      }
      worksheet.getRow(newSigRow).height = 30;
      worksheet.getRow(newSigRow + 1).height = 30;

      // Baixar o arquivo modificado preservando os estilos
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Beneficiarios_${sanitizeName(nucleo.nome)}.xlsx`);

      console.log("writeFile executado com sucesso.");
    } catch (e: any) {
      console.error("Erro CRÍTICO ao gerar Excel:", e);
      alert("Erro ao gerar Excel: " + e.message);
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-100 dark:border-blue-800">
              <FileText size={14} /> Módulo Pedagógico
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Relatórios e Exportações
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gere listas de beneficiários e relatórios gerenciais por núcleo.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar núcleo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-2xs"
            />
          </div>
          <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-slate-200 dark:border-slate-700">
            <Users size={14} />
            {filteredNucleos.length} Núcleos
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-sm font-medium">Carregando dados dos relatórios...</span>
            </div>
          ) : filteredNucleos.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-base font-semibold">Nenhum núcleo encontrado</p>
              <p className="text-sm text-slate-400">Tente ajustar seus filtros ou busca.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNucleos.map((nucleo) => {
                const totalAlunos = matriculas.filter(m => String(m.nucleo_id) === String(nucleo.id)).length;
                return (
                  <div key={nucleo.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {nucleo.nome}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {nucleo.cidade && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {nucleo.cidade}
                          </span>
                        )}
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-semibold">
                          {totalAlunos} alunos
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGerarRelatorioExcel(nucleo)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/60 transition-colors rounded-xl font-bold text-sm border border-green-200 dark:border-green-800/50 shadow-sm"
                        title="Baixar Planilha Excel"
                      >
                        <Download size={16} className="pointer-events-none" />
                        <span className="pointer-events-none">Gerar Excel</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Loading do Excel */}
      {isGeneratingExcel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-slate-200 dark:border-slate-800 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Gerando Relatório</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Preparando a planilha do núcleo<br/>
                <strong className="text-blue-600 dark:text-blue-400">{nucleoGerando}</strong>...
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
