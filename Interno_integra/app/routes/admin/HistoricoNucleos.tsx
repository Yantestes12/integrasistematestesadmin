import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Search, Layers, Loader2, Plus,
  Trash2, Edit2, RotateCcw, AlertCircle, CheckCircle2, X, Check,
  FileSpreadsheet, Building2, Tag, Lock, FolderKanban,
  CheckCircle, ChevronRight, RefreshCw
} from "lucide-react";
import ExcelJS from "exceljs";
import fileSaver from "file-saver";
const { saveAs } = fileSaver;

export interface HistoricoVagaItem {
  id: number;
  numero_vaga: number | string;
  nucleo_anterior: string | null;
  nucleo_atual: string;
  modalidade_nome: string;
  data_modificacao: string;
  acao: string;
  projeto_id?: number | string;
  projeto_nome?: string;
  observacao?: string;
}

// Configuração visual de cores por Instituto
const THEMES: Record<string, {
  name: string;
  badgeBg: string;
  badgeText: string;
  btnPrimary: string;
  btnPrimaryHover: string;
  textPrimary: string;
  lightBg: string;
  borderLight: string;
  hexColor: string;
}> = {
  IBRASE: {
    name: "IBRASE",
    badgeBg: "bg-orange-100 dark:bg-orange-950/70",
    badgeText: "text-orange-800 dark:text-orange-200",
    btnPrimary: "bg-orange-600 hover:bg-orange-700",
    btnPrimaryHover: "hover:bg-orange-700",
    textPrimary: "text-orange-600 dark:text-orange-400",
    lightBg: "bg-orange-50/70 dark:bg-orange-950/30",
    borderLight: "border-orange-200 dark:border-orange-800/60",
    hexColor: "FFEA580C",
  },
  GASCTPNA: {
    name: "GASCTPNA",
    badgeBg: "bg-blue-100 dark:bg-blue-950/70",
    badgeText: "text-blue-800 dark:text-blue-200",
    btnPrimary: "bg-blue-600 hover:bg-blue-700",
    btnPrimaryHover: "hover:bg-blue-700",
    textPrimary: "text-blue-600 dark:text-blue-400",
    lightBg: "bg-blue-50/70 dark:bg-blue-950/30",
    borderLight: "border-blue-200 dark:border-blue-800/60",
    hexColor: "FF1D4ED8",
  },
  AUNI: {
    name: "AUNI",
    badgeBg: "bg-violet-100 dark:bg-violet-950/70",
    badgeText: "text-violet-800 dark:text-violet-200",
    btnPrimary: "bg-violet-600 hover:bg-violet-700",
    btnPrimaryHover: "hover:bg-violet-700",
    textPrimary: "text-violet-600 dark:text-violet-400",
    lightBg: "bg-violet-50/70 dark:bg-violet-950/30",
    borderLight: "border-violet-200 dark:border-violet-800/60",
    hexColor: "FF7C3AED",
  },
  IVEM: {
    name: "IVEM",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/70",
    badgeText: "text-emerald-800 dark:text-emerald-200",
    btnPrimary: "bg-emerald-600 hover:bg-emerald-700",
    btnPrimaryHover: "hover:bg-emerald-700",
    textPrimary: "text-emerald-600 dark:text-emerald-400",
    lightBg: "bg-emerald-50/70 dark:bg-emerald-950/30",
    borderLight: "border-emerald-200 dark:border-emerald-800/60",
    hexColor: "FF059669",
  },
};

// Estrutura de Vaga Oficial do Projeto
export interface ProjetoVagaSlot {
  numero: number;
  modalidadeNome: string;
}

// Helper: Extrai todos os slots oficiais e modalidades configuradas na proposta
export function getProjetoVagas(proj: any): ProjetoVagaSlot[] {
  if (!proj) return [];

  // 1. Tenta extrair de vagas_nucleo (lista oficial de slots da proposta)
  let vn: any[] = [];
  if (proj.vagas_nucleo) {
    if (typeof proj.vagas_nucleo === 'string') {
      try {
        vn = JSON.parse(proj.vagas_nucleo);
      } catch (e) {
        vn = [];
      }
    } else if (Array.isArray(proj.vagas_nucleo)) {
      vn = proj.vagas_nucleo;
    }
  }

  if (Array.isArray(vn) && vn.length > 0) {
    return vn.map((item, idx) => ({
      numero: Number(item.numero) || (idx + 1),
      modalidadeNome: (item.modalidadeNome || item.modalidade || item.nome || "Geral").trim()
    })).sort((a, b) => a.numero - b.numero);
  }

  // 2. Fallback: limites_modalidades (gera sequência de slots por modalidade)
  let limites: any[] = [];
  if (proj.limites_modalidades) {
    if (typeof proj.limites_modalidades === 'string') {
      try {
        limites = JSON.parse(proj.limites_modalidades);
      } catch (e) {
        limites = [];
      }
    } else if (Array.isArray(proj.limites_modalidades)) {
      limites = proj.limites_modalidades;
    }
  }

  if (Array.isArray(limites) && limites.length > 0) {
    const generated: ProjetoVagaSlot[] = [];
    let currentNum = 1;
    limites.forEach((lim: any) => {
      const qtd = Number(lim.limite) || 0;
      const modNome = (lim.nome || lim.modalidadeNome || "Geral").trim();
      for (let i = 0; i < qtd; i++) {
        generated.push({
          numero: currentNum++,
          modalidadeNome: modNome
        });
      }
    });
    if (generated.length > 0) return generated;
  }

  return [];
}

export interface VagaRowGroup {
  numero_vaga: number;
  modalidade_nome: string;
  anteriores: { id?: number; nome: string; data?: string; obs?: string }[];
  atual: { id?: number | string; nome: string; data?: string; obs?: string } | null;
  projeto_id?: number | string;
  projeto_nome?: string;
  allRecords: HistoricoVagaItem[];
}

export default function HistoricoNucleos() {
  const navigate = useNavigate();
  const [historico, setHistorico] = useState<HistoricoVagaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");
  const [projetosList, setProjetosList] = useState<any[]>([]);
  const [nucleosList, setNucleosList] = useState<any[]>([]);
  const [selectedProjeto, setSelectedProjeto] = useState<string>("all");
  const [selectedModalidade, setSelectedModalidade] = useState<string>("all");
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modais de ação
  const [modalEditItem, setModalEditItem] = useState<HistoricoVagaItem | null>(null);
  const [modalEditGroup, setModalEditGroup] = useState<VagaRowGroup | null>(null);
  const [modalDeleteItem, setModalDeleteItem] = useState<HistoricoVagaItem | null>(null);
  const [modalResetVaga, setModalResetVaga] = useState<number | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulário de Edição / Adição (com múltiplos núcleos anteriores)
  const [formVaga, setFormVaga] = useState("");
  const [formNucleosAnteriores, setFormNucleosAnteriores] = useState<{ id?: number; nome: string; obs?: string; isCustom?: boolean }[]>([]);
  const [formNucleoAtual, setFormNucleoAtual] = useState("");
  const [formModalidade, setFormModalidade] = useState("");
  const [formProjetoId, setFormProjetoId] = useState("");
  const [formObservacao, setFormObservacao] = useState("");
  const [isCustomAtual, setIsCustomAtual] = useState(false);

  const theme = THEMES[currentInstitute.toUpperCase()] || THEMES.IBRASE;

  useEffect(() => {
    const inst = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(inst);
    fetchData(inst);
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedbackToast({ type, message });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const fetchData = async (inst: string) => {
    setLoading(true);
    const IN = inst.toUpperCase();

    // 1. Fetch Projetos
    try {
      const resP = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${IN}`, { cache: 'no-store' });
      if (resP.ok) {
        const textP = await resP.text();
        if (textP) {
          try {
            const dataP = JSON.parse(textP);
            const flatP = Array.isArray(dataP) ? dataP : (dataP.data || []);
            setProjetosList(flatP);
          } catch(e) {}
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar projetos:", e);
    }

    // 2. Fetch Histórico de Vagas
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/historico-vagas-get?instituto=${IN}`, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        if (text) {
          try {
            const data = JSON.parse(text);
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
          } catch(e) {}
        }
      }
    } catch (error) {
      console.warn("Erro ao buscar histórico de vagas:", error);
    }

    // 3. Fetch Núcleos
    try {
      const resN = await fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${IN}`, { cache: 'no-store' });
      if (resN.ok) {
        const textN = await resN.text();
        if (textN) {
          try {
            const dataN = JSON.parse(textN);
            const flatN = Array.isArray(dataN) ? dataN : (dataN.data || []);
            setNucleosList(flatN);
          } catch(e) {}
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar núcleos:", e);
    } finally {
      setLoading(false);
    }
  };

  // Projeto selecionado atualmente
  const selectedProjObj = useMemo(() => {
    if (selectedProjeto === "all") return null;
    return projetosList.find(p => String(p.id) === selectedProjeto) || null;
  }, [projetosList, selectedProjeto]);

  // Lista de modalidades para o filtro (específicas da proposta selecionada, ou gerais)
  const modalidadesList = useMemo(() => {
    if (!selectedProjObj) {
      const set = new Set<string>();
      historico.forEach(h => {
        if (h.modalidade_nome && h.modalidade_nome.trim() !== "" && h.modalidade_nome !== "—") {
          set.add(h.modalidade_nome.trim());
        }
      });
      return Array.from(set).sort();
    }
    const slots = getProjetoVagas(selectedProjObj);
    const set = new Set<string>();
    slots.forEach(s => {
      if (s.modalidadeNome && s.modalidadeNome.trim() !== "" && s.modalidadeNome !== "—") {
        set.add(s.modalidadeNome.trim());
      }
    });
    return Array.from(set).sort();
  }, [selectedProjObj, historico]);

  // Lista de nomes de núcleos distintos para os seletores (dropdowns)
  const distinctNucleos = useMemo(() => {
    const projSet = new Set<string>();
    const otherSet = new Set<string>();

    nucleosList.forEach((n: any) => {
      const name = n.nome || n.nome_nucleo || n.nucleo_nome || n.identificacao?.nomeNucleo;
      if (name && String(name).trim() !== "" && String(name).trim() !== "—") {
        const trimmed = String(name).trim();
        if (selectedProjeto !== "all" && String(n.projeto_id) === selectedProjeto) {
          projSet.add(trimmed);
        } else {
          otherSet.add(trimmed);
        }
      }
    });

    historico.forEach((h: any) => {
      if (h.nucleo_atual && h.nucleo_atual.trim() !== "" && h.nucleo_atual.trim() !== "—") {
        otherSet.add(h.nucleo_atual.trim());
      }
      if (h.nucleo_anterior && h.nucleo_anterior.trim() !== "" && h.nucleo_anterior.trim() !== "—") {
        otherSet.add(h.nucleo_anterior.trim());
      }
    });

    const projList = Array.from(projSet).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    const otherList = Array.from(otherSet).filter(x => !projSet.has(x)).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    return [...projList, ...otherList];
  }, [nucleosList, historico, selectedProjeto]);

  // Estatísticas resumidas de cada proposta para o Hub de Seleção
  const projetosStats = useMemo(() => {
    return projetosList.map((p: any) => {
      const slots = getProjetoVagas(p);
      const projNucleos = nucleosList.filter(n => String(n.projeto_id) === String(p.id));
      const activeNucleos = projNucleos.filter(n => n.ativo !== false);
      const allocatedVagas = new Set(activeNucleos.map(n => Number(n.numero_vaga)).filter(v => v > 0));

      const modalidadeCounts: Record<string, number> = {};
      slots.forEach(s => {
        modalidadeCounts[s.modalidadeNome] = (modalidadeCounts[s.modalidadeNome] || 0) + 1;
      });

      return {
        ...p,
        totalVagas: slots.length,
        allocatedCount: allocatedVagas.size,
        modalidades: Object.entries(modalidadeCounts).map(([nome, count]) => ({ nome, count })),
      };
    });
  }, [projetosList, nucleosList]);

  // ─── GERAÇÃO COMPLETA DE TODAS AS VAGAS DA PROPOSTA (1..N) ──────────────────
  const getProjectVagasList = (proj: any, nucleos: any[], hist: any[]): VagaRowGroup[] => {
    if (!proj) return [];
    let slots = getProjetoVagas(proj);
    const projId = String(proj.id);

    // Núcleos ativos deste projeto em nucleosList
    const activeNucleos = nucleos.filter(n =>
      String(n.projeto_id) === projId && n.ativo !== false
    );
    const activeNucleosByVaga = new Map<number, any>();
    activeNucleos.forEach(n => {
      const vNum = Number(n.numero_vaga);
      if (vNum > 0) activeNucleosByVaga.set(vNum, n);
    });

    // Nomes de núcleos deste projeto (ativos ou inativos) para cruzamento inteligente
    const allProjNucleos = nucleos.filter(n => String(n.projeto_id) === projId);
    const projNucleoNames = new Set(
      allProjNucleos.map(n => (n.nome || n.nome_nucleo || '').trim().toLowerCase()).filter(Boolean)
    );

    // Se a proposta não tem slots em vagas_nucleo nem limites, usa o histórico e núcleos para detectar
    if (slots.length === 0) {
      const detectedVagas = new Set<number>();
      allProjNucleos.forEach(n => {
        const v = Number(n.numero_vaga);
        if (v > 0) detectedVagas.add(v);
      });
      hist.forEach(h => {
        if (String(h.projeto_id) === projId ||
            projNucleoNames.has((h.nucleo_atual || '').trim().toLowerCase()) ||
            projNucleoNames.has((h.nucleo_anterior || '').trim().toLowerCase())) {
          const v = Number(h.numero_vaga);
          if (v > 0) detectedVagas.add(v);
        }
      });
      const sortedNums = Array.from(detectedVagas).sort((a, b) => a - b);
      slots = sortedNums.map(n => ({ numero: n, modalidadeNome: "Geral" }));
    }

    // Histórico pertencente a este projeto
    const projHistorico = hist.filter(h => {
      if (h.projeto_id && String(h.projeto_id) === projId) return true;
      const natual = (h.nucleo_atual || '').trim().toLowerCase();
      const nant = (h.nucleo_anterior || '').trim().toLowerCase();
      if (natual && projNucleoNames.has(natual)) return true;
      if (nant && projNucleoNames.has(nant)) return true;
      return false;
    });

    // Ordena histórico cronologicamente (mais antigo para mais recente)
    projHistorico.sort((a, b) => {
      const da = new Date(a.data_modificacao).getTime() || 0;
      const db = new Date(b.data_modificacao).getTime() || 0;
      return da - db;
    });

    // Monta o quadro de TODAS as vagas (1..N) da proposta
    return slots.map(slot => {
      const numVaga = slot.numero;
      const recordsForVaga = projHistorico.filter(h => Number(h.numero_vaga) === numVaga);

      const anteriores: { id?: number; nome: string; data?: string; obs?: string }[] = [];
      recordsForVaga.forEach(item => {
        if (item.nucleo_anterior && item.nucleo_anterior !== "—" && item.nucleo_anterior.trim() !== "") {
          const antNome = item.nucleo_anterior.trim();
          if (!anteriores.some(a => a.nome.toLowerCase() === antNome.toLowerCase())) {
            anteriores.push({
              id: item.id,
              nome: antNome,
              data: item.data_modificacao,
              obs: item.observacao
            });
          }
        }
      });

      let atual: { id?: number | string; nome: string; data?: string; obs?: string } | null = null;
      if (activeNucleosByVaga.has(numVaga)) {
        const n = activeNucleosByVaga.get(numVaga)!;
        atual = {
          id: n.id,
          nome: n.nome || n.nome_nucleo,
          data: n.created_at || new Date().toISOString(),
          obs: n.bairro || n.cidade || undefined
        };
      } else {
        for (let i = recordsForVaga.length - 1; i >= 0; i--) {
          const rec = recordsForVaga[i];
          if (rec.nucleo_atual && rec.nucleo_atual !== "—" && rec.nucleo_atual.trim() !== "") {
            atual = {
              id: rec.id,
              nome: rec.nucleo_atual.trim(),
              data: rec.data_modificacao,
              obs: rec.observacao
            };
            break;
          }
        }
      }

      return {
        numero_vaga: numVaga,
        modalidade_nome: slot.modalidadeNome,
        anteriores,
        atual,
        projeto_id: proj.id,
        projeto_nome: proj.nome,
        allRecords: recordsForVaga
      };
    }).sort((a, b) => a.numero_vaga - b.numero_vaga);
  };

  const vagasAgrupadas = useMemo(() => {
    if (!selectedProjObj) return [];
    const allRows = getProjectVagasList(selectedProjObj, nucleosList, historico);

    return allRows.filter(row => {
      if (selectedModalidade !== "all") {
        if (row.modalidade_nome.toLowerCase() !== selectedModalidade.toLowerCase()) return false;
      }
      if (searchTerm) {
        const st = searchTerm.toLowerCase();
        const matchNum = String(row.numero_vaga).includes(st);
        const matchMod = row.modalidade_nome.toLowerCase().includes(st);
        const matchAtual = (row.atual?.nome || "").toLowerCase().includes(st);
        const matchObs = (row.atual?.obs || "").toLowerCase().includes(st);
        const matchAnt = row.anteriores.some(a => a.nome.toLowerCase().includes(st) || (a.obs || "").toLowerCase().includes(st));
        if (!matchNum && !matchMod && !matchAtual && !matchObs && !matchAnt) return false;
      }
      return true;
    });
  }, [selectedProjObj, nucleosList, historico, selectedModalidade, searchTerm]);

  // ─── Ações de Gestão de Núcleos Anteriores ──────────────────────────────
  const handleAddAnterior = () => {
    setFormNucleosAnteriores(prev => [
      ...prev,
      { nome: "", obs: "", isCustom: false }
    ]);
  };

  const handleRemoveAnterior = (index: number) => {
    setFormNucleosAnteriores(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateAnteriorNome = (index: number, val: string) => {
    setFormNucleosAnteriores(prev => prev.map((ant, i) => i === index ? { ...ant, nome: val } : ant));
  };

  const handleToggleCustomAnterior = (index: number) => {
    setFormNucleosAnteriores(prev => prev.map((ant, i) => {
      if (i === index) {
        const nextCustom = !ant.isCustom;
        return {
          ...ant,
          isCustom: nextCustom,
          nome: nextCustom && ant.nome === "—" ? "" : ant.nome,
        };
      }
      return ant;
    }));
  };

  // Abrir Modal de Edição (carrega os dados do grupo e todos os anteriores)
  const handleOpenEdit = (group: VagaRowGroup) => {
    const item: HistoricoVagaItem = group.allRecords[0] || {
      id: 0,
      numero_vaga: group.numero_vaga,
      nucleo_anterior: null,
      nucleo_atual: group.atual?.nome || "",
      modalidade_nome: group.modalidade_nome,
      data_modificacao: new Date().toISOString(),
      acao: "MANUAL",
      projeto_id: group.projeto_id,
      projeto_nome: group.projeto_nome,
      observacao: group.atual?.obs || ""
    };

    setModalEditItem(item);
    setModalEditGroup(group);
    setFormVaga(String(group.numero_vaga));

    const atualVal = group.atual?.nome || item.nucleo_atual || "";
    setFormNucleoAtual(atualVal === "—" ? "" : atualVal);
    const isAtualInList = atualVal === "" || atualVal === "—" || distinctNucleos.includes(atualVal);
    setIsCustomAtual(!isAtualInList);

    setFormModalidade(group.modalidade_nome || item.modalidade_nome || "");
    setFormProjetoId(group.projeto_id ? String(group.projeto_id) : (selectedProjeto !== "all" ? selectedProjeto : ""));
    setFormObservacao(item.observacao || group.atual?.obs || "");

    let initialAnteriores: { id?: number; nome: string; obs?: string; isCustom?: boolean }[] = [];
    if (group.anteriores.length > 0) {
      initialAnteriores = group.anteriores.map(ant => ({
        id: ant.id,
        nome: ant.nome === "—" ? "" : ant.nome,
        obs: ant.obs || "",
        isCustom: ant.nome !== "" && ant.nome !== "—" && !distinctNucleos.includes(ant.nome),
      }));
    }
    setFormNucleosAnteriores(initialAnteriores);
  };

  // Salvar Edição (sincroniza registro principal, novos slots e núcleos anteriores)
  const handleSaveEdit = async () => {
    if (!modalEditItem) return;
    setIsSubmitting(true);
    const IN = currentInstitute.toUpperCase();
    const grp = modalEditGroup || vagasAgrupadas.find(g => Number(g.numero_vaga) === Number(modalEditItem.numero_vaga));

    try {
      const numVagaFinal = formVaga ? parseInt(formVaga, 10) : Number(modalEditItem.numero_vaga);
      const atualFinal = formNucleoAtual.trim() || "—";
      const modalidadeFinal = modalEditItem.modalidade_nome || formModalidade.trim() || null;
      const obsFinal = formObservacao.trim() || null;
      const projIdFinal = formProjetoId ? Number(formProjetoId) : (modalEditItem.projeto_id || grp?.projeto_id || (selectedProjeto !== "all" ? Number(selectedProjeto) : null));

      // Filtra anteriores válidos
      const validAnteriores = formNucleosAnteriores
        .map(a => ({ ...a, nome: a.nome.trim() }))
        .filter(a => a.nome !== "" && a.nome !== "—");

      // IDs originais da vaga
      const originalAnteriorIds = new Set((grp?.anteriores || []).map((a: any) => a.id).filter(Boolean));
      const retainedIds = new Set(validAnteriores.filter(a => a.id).map(a => a.id!));

      // 1. Deleta do banco registros de anteriores que foram excluídos
      const deletedIds = Array.from(originalAnteriorIds).filter(id => !retainedIds.has(id));
      for (const delId of deletedIds) {
        if (delId !== modalEditItem.id) {
          try {
            await fetch(`https://w.ibrase.com.br/webhook/historico-vagas-delete?instituto=${IN}&id=${delId}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: delId, instituto: IN }),
            });
          } catch (e) {
            console.warn(`Erro ao excluir anterior ${delId}:`, e);
          }
        }
      }

      // 2. Primeiro anterior fica no registro principal
      const mainRecordAnterior = validAnteriores.length > 0 ? validAnteriores[0].nome : null;
      const extraAnteriores = validAnteriores.length > 1 ? validAnteriores.slice(1) : [];

      // 3. Atualiza (PUT) se já existia registro, ou Cria (POST) se era uma vaga sem histórico prévio
      if (modalEditItem.id && modalEditItem.id > 0) {
        const mainPayload = {
          id: modalEditItem.id,
          numero_vaga: numVagaFinal,
          nucleo_anterior: mainRecordAnterior,
          nucleo_atual: atualFinal,
          modalidade_nome: modalidadeFinal,
          projeto_id: projIdFinal,
          observacao: obsFinal,
          instituto: IN,
        };

        await fetch(`https://w.ibrase.com.br/webhook/historico-vagas-put?instituto=${IN}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mainPayload),
        });
      } else {
        const postPayload = {
          numero_vaga: numVagaFinal,
          nucleo_anterior: mainRecordAnterior,
          nucleo_atual: atualFinal,
          modalidade_nome: modalidadeFinal,
          projeto_id: projIdFinal,
          acao: "MANUAL",
          observacao: obsFinal,
          instituto: IN,
        };

        await fetch(`https://w.ibrase.com.br/webhook/historico-vagas-post?instituto=${IN}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postPayload),
        });
      }

      // 4. Salva ou atualiza anteriores adicionais (índices 1+)
      for (const extra of extraAnteriores) {
        if (extra.id && extra.id > 0 && extra.id !== modalEditItem.id) {
          const putPayload = {
            id: extra.id,
            numero_vaga: numVagaFinal,
            nucleo_anterior: extra.nome,
            nucleo_atual: "—",
            modalidade_nome: modalidadeFinal,
            projeto_id: projIdFinal,
            observacao: extra.obs || null,
            instituto: IN,
          };
          await fetch(`https://w.ibrase.com.br/webhook/historico-vagas-put?instituto=${IN}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(putPayload),
          });
        } else {
          const postPayload = {
            numero_vaga: numVagaFinal,
            nucleo_anterior: extra.nome,
            nucleo_atual: "—",
            modalidade_nome: modalidadeFinal,
            projeto_id: projIdFinal,
            acao: "MANUAL",
            observacao: extra.obs || null,
            instituto: IN,
          };
          await fetch(`https://w.ibrase.com.br/webhook/historico-vagas-post?instituto=${IN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postPayload),
          });
        }
      }

      // 5. Se o núcleo atual selecionado pertence a nucleosList, vincula sua vaga
      if (atualFinal && atualFinal !== "—") {
        const matchingNucleo = nucleosList.find(n =>
          (n.nome || n.nome_nucleo || '').trim().toLowerCase() === atualFinal.toLowerCase() &&
          (!projIdFinal || String(n.projeto_id) === String(projIdFinal))
        );
        if (matchingNucleo && matchingNucleo.id) {
          try {
            await fetch(`https://w.ibrase.com.br/webhook/nucleos-put?instituto=${IN}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: matchingNucleo.id,
                numero_vaga: numVagaFinal,
                projeto_id: projIdFinal,
                ativo: true,
                instituto: IN,
              }),
            });
          } catch(e) {
            console.warn("Erro ao vincular vaga no núcleo:", e);
          }
        }
      }

      await fetchData(currentInstitute);

      showToast('success', "Histórico da vaga e alocações salvos com sucesso!");
      setModalEditItem(null);
      setModalEditGroup(null);
    } catch (err) {
      console.error("Erro ao salvar histórico:", err);
      showToast('error', "Erro ao conectar com o servidor para editar o histórico.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir Registro Individual
  const handleConfirmDelete = async () => {
    if (!modalDeleteItem) return;
    setIsSubmitting(true);
    try {
      await fetch(`https://w.ibrase.com.br/webhook/historico-vagas-delete?instituto=${currentInstitute.toUpperCase()}&id=${modalDeleteItem.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: modalDeleteItem.id, instituto: currentInstitute.toUpperCase() }),
      });

      setHistorico(prev => prev.filter(h => h.id !== modalDeleteItem.id));
      showToast('success', "Registro histórico excluído com sucesso!");
      setModalDeleteItem(null);
    } catch (err) {
      console.error(err);
      showToast('error', "Erro ao excluir registro histórico.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetar Histórico da Vaga
  const handleConfirmResetVaga = async () => {
    if (modalResetVaga === null) return;
    setIsSubmitting(true);
    try {
      const IN = currentInstitute.toUpperCase();
      const recordsToDelete = historico.filter(h => {
        if (Number(h.numero_vaga) !== Number(modalResetVaga)) return false;
        if (selectedProjeto !== "all" && h.projeto_id && String(h.projeto_id) !== selectedProjeto) return false;
        return true;
      });

      for (const rec of recordsToDelete) {
        if (rec.id) {
          await fetch(`https://w.ibrase.com.br/webhook/historico-vagas-delete?instituto=${IN}&id=${rec.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: rec.id, instituto: IN }),
          });
        }
      }

      await fetchData(currentInstitute);
      showToast('success', `Histórico da Vaga ${modalResetVaga} resetado com sucesso!`);
      setModalResetVaga(null);
    } catch (err) {
      console.error(err);
      showToast('error', "Erro ao resetar histórico da vaga.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Exportação Excel Oficial (Idêntico ao Modelo Oficial CRESP / PROMOV) ──
  const populateWorksheetForProject = (worksheet: ExcelJS.Worksheet, vagas: VagaRowGroup[]) => {
    // Determina o número de núcleos anteriores (mínimo 3 como no modelo oficial)
    let maxAnteriores = 3;
    vagas.forEach(v => {
      if (v.anteriores.length > maxAnteriores) maxAnteriores = v.anteriores.length;
    });

    const columns: any[] = [
      { header: 'VAGA', key: 'vaga', width: 14 },
      { header: 'MODALIDADE', key: 'modalidade', width: 22 },
    ];

    for (let i = 1; i <= maxAnteriores; i++) {
      columns.push({
        header: 'NÚCLEO ANTERIOR',
        key: `anterior_${i}`,
        width: 38,
      });
    }

    columns.push({ header: 'NÚCLEO ATUAL', key: 'atual', width: 26 });
    worksheet.columns = columns;

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
    };

    // Estilo do Cabeçalho Oficial
    const headerRow = worksheet.getRow(1);
    headerRow.height = 29.25;

    // Col 1: VAGA (Amarelo FFFFFF00, Bold, Centro)
    const cellVaga = headerRow.getCell(1);
    cellVaga.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
    cellVaga.font = { name: 'Aptos Narrow', color: { argb: 'FF000000' }, bold: true, size: 11 };
    cellVaga.alignment = { vertical: 'middle', horizontal: 'center' };
    cellVaga.border = thinBorder;

    // Col 2: MODALIDADE (Salmão/Pêssego FFF1A983, Bold, Centro)
    const cellMod = headerRow.getCell(2);
    cellMod.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1A983' } };
    cellMod.font = { name: 'Aptos Narrow', color: { argb: 'FF000000' }, bold: true, size: 11 };
    cellMod.alignment = { vertical: 'middle', horizontal: 'center' };
    cellMod.border = thinBorder;

    // Col 3..maxAnteriores+2: NÚCLEO ANTERIOR (Cinza FFA5A5A5, Normal, Centro)
    for (let i = 0; i < maxAnteriores; i++) {
      const cellAnt = headerRow.getCell(3 + i);
      cellAnt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA5A5A5' } };
      cellAnt.font = { name: 'Aptos Narrow', color: { argb: 'FF000000' }, bold: false, size: 11 };
      cellAnt.alignment = { vertical: 'middle', horizontal: 'center' };
      cellAnt.border = thinBorder;
    }

    // Col maxAnteriores+3: NÚCLEO ATUAL (Cinza FFA5A5A5, Normal, Centro)
    const cellAtual = headerRow.getCell(maxAnteriores + 3);
    cellAtual.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA5A5A5' } };
    cellAtual.font = { name: 'Aptos Narrow', color: { argb: 'FF000000' }, bold: false, size: 11 };
    cellAtual.alignment = { vertical: 'middle', horizontal: 'center' };
    cellAtual.border = thinBorder;

    // Linhas de dados (com as cores e bordas oficiais)
    vagas.forEach((grp) => {
      const rowData: Record<string, any> = {
        vaga: grp.numero_vaga,
        modalidade: grp.modalidade_nome,
        atual: grp.atual?.nome ? grp.atual.nome.toUpperCase() : ''
      };

      for (let i = 0; i < maxAnteriores; i++) {
        rowData[`anterior_${i + 1}`] = grp.anteriores[i] ? grp.anteriores[i].nome : '';
      }

      const addedRow = worksheet.addRow(rowData);
      addedRow.height = 24;

      // Col 1: VAGA (Fundo amarelo FFFFFF00, centralizado)
      const dataVaga = addedRow.getCell(1);
      dataVaga.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
      dataVaga.font = { name: 'Aptos Narrow', color: { argb: 'FF000000' }, size: 11, bold: false };
      dataVaga.alignment = { vertical: 'middle', horizontal: 'center' };
      dataVaga.border = thinBorder;

      // Col 2: MODALIDADE (Fundo salmão/pêssego FFF1A983)
      const dataMod = addedRow.getCell(2);
      dataMod.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1A983' } };
      dataMod.font = { name: 'Aptos Narrow', color: { argb: 'FF000000' }, size: 11, bold: false };
      dataMod.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      dataMod.border = thinBorder;

      // Col 3..maxAnteriores+2: Células de Núcleos Anteriores (Cinza FFAEAEAE se vazio, sem fill se preenchido)
      for (let i = 0; i < maxAnteriores; i++) {
        const cell = addedRow.getCell(3 + i);
        cell.font = { name: 'Aptos Narrow', color: { argb: 'FF000000' }, size: 11, bold: false };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = thinBorder;
        if (!grp.anteriores[i] || !grp.anteriores[i].nome) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFAEAEAE' }
          };
        }
      }

      // Col maxAnteriores+3: Célula Núcleo Atual (Sem fill se preenchido, cinza se vazio)
      const dataAtual = addedRow.getCell(maxAnteriores + 3);
      dataAtual.font = { name: 'Aptos Narrow', color: { argb: 'FF000000' }, size: 11, bold: false };
      dataAtual.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      dataAtual.border = thinBorder;
      if (!grp.atual?.nome) {
        dataAtual.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFAEAEAE' }
        };
      }
    });
  };

  const handleGerarPlanilhaOficial = async (exportAll: boolean = false) => {
    setIsGeneratingExcel(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = `Sistema Integra - ${currentInstitute}`;
      workbook.created = new Date();

      if (exportAll || selectedProjeto === "all") {
        const projsToExport = projetosList.filter(p => {
          const slots = getProjetoVagas(p);
          const pNucleos = nucleosList.filter(n => String(n.projeto_id) === String(p.id));
          return slots.length > 0 || pNucleos.length > 0;
        });

        if (projsToExport.length === 0) {
          alert("Não há dados de propostas com vagas para exportar.");
          setIsGeneratingExcel(false);
          return;
        }

        projsToExport.forEach(p => {
          const sheetName = String(p.nome).replace(/[:\/?*\[\]]/g, '').slice(0, 30);
          const ws = workbook.addWorksheet(sheetName);
          const pVagas = getProjectVagasList(p, nucleosList, historico);
          populateWorksheetForProject(ws, pVagas);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = currentInstitute === 'IBRASE' 
          ? `Histórico de núcleos - PROMOV e CRESP.xlsx` 
          : `Histórico de núcleos - ${currentInstitute}.xlsx`;
        saveAs(blob, fileName);
        showToast('success', `Planilha oficial com todas as propostas gerada com sucesso!`);
      } else {
        if (!selectedProjObj) {
          alert("Nenhuma proposta selecionada.");
          setIsGeneratingExcel(false);
          return;
        }
        const projNome = selectedProjObj.nome;
        const sheetName = projNome.replace(/[:\/?*\[\]]/g, '').slice(0, 30);
        const ws = workbook.addWorksheet(sheetName);
        const pVagas = getProjectVagasList(selectedProjObj, nucleosList, historico);
        populateWorksheetForProject(ws, pVagas);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Histórico de núcleos - ${projNome} - ${currentInstitute}.xlsx`);
        showToast('success', `Planilha oficial do projeto ${projNome} gerada com sucesso!`);
      }
    } catch (e: any) {
      console.error("Erro ao gerar Excel:", e);
      showToast('error', "Erro ao gerar a planilha Excel: " + e.message);
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 font-sans">
      
      {/* ─── Top Banner ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
              {currentInstitute}
            </span>
            <span className="text-xs text-slate-400 font-bold">• Histórico Oficial de Vagas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Histórico de Núcleos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Registro cronológico das vagas e substituição de núcleos por proposta
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/nucleos")}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Núcleos
          </button>

          {selectedProjeto === "all" ? (
            <button
              type="button"
              onClick={() => handleGerarPlanilhaOficial(true)}
              disabled={isGeneratingExcel || projetosList.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Baixar planilha oficial com todas as propostas em abas separadas"
            >
              {isGeneratingExcel ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>Exportar Todas as Propostas</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleGerarPlanilhaOficial(false)}
              disabled={isGeneratingExcel || vagasAgrupadas.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Baixar planilha oficial formatada com todas as vagas desta proposta"
            >
              {isGeneratingExcel ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>Exportar Planilha Oficial</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── TELA 1: HUB DE SELEÇÃO DE PROPOSTA (Quando selectedProjeto === "all") ─── */}
      {selectedProjeto === "all" ? (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-4 sm:p-5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-blue-950 dark:text-blue-200">
                Selecione uma Proposta de Projeto
              </h3>
              <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
                Escolha a proposta abaixo para visualizar o quadro oficial completo de todas as suas vagas (1 a N), modalidades fixas e histórico de alocações.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <Loader2 className={`w-8 h-8 animate-spin ${theme.textPrimary}`} />
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-bold">
                Carregando propostas do instituto...
              </p>
            </div>
          ) : projetosStats.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Nenhum projeto encontrado</h3>
              <p className="text-xs text-slate-500 mt-1">Cadastre projetos no menu de Iniciativas para gerenciar suas vagas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projetosStats.map((p) => {
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProjeto(String(p.id))}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Proposta #{p.id}
                          </span>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {p.nome}
                          </h3>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs border border-slate-200 dark:border-slate-700">
                          {p.totalVagas} {p.totalVagas === 1 ? 'Vaga' : 'Vagas'}
                        </span>
                      </div>

                      {/* Modalidades da proposta */}
                      <div className="space-y-1.5 mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Modalidades Previstas
                        </span>
                        {p.modalidades.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">Geral / Não especificado</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {p.modalidades.map((m: any, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200/80 dark:border-slate-700/80"
                              >
                                <span>{m.nome}</span>
                                <span className="text-slate-400 font-semibold">({m.count})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-500" />
                        {p.allocatedCount} de {p.totalVagas} alocadas
                      </span>

                      <button
                        type="button"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1"
                      >
                        <span>Acessar Quadro</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ─── TELA 2: QUADRO OFICIAL DE VAGAS DA PROPOSTA SELECIONADA ────────── */
        <div className="space-y-4">
          
          {/* Barra de Navegação da Proposta Selecionada */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedProjeto("all");
                  setSelectedModalidade("all");
                  setSearchTerm("");
                }}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Trocar de Proposta
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline">Proposta:</span>
                <select
                  value={selectedProjeto}
                  onChange={(e) => {
                    setSelectedProjeto(e.target.value);
                    setSelectedModalidade("all");
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                >
                  {projetosList.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
                {vagasAgrupadas.length} Vagas
              </span>
            </div>

            {/* Filtros da Proposta */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Busca Textual */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Buscar vaga, núcleo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Filtro por Modalidade desta Proposta */}
              <div className="flex items-center gap-1.5">
                <Tag size={13} className="text-slate-400 shrink-0" />
                <select
                  value={selectedModalidade}
                  onChange={(e) => setSelectedModalidade(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todas as Modalidades ({modalidadesList.length})</option>
                  {modalidadesList.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ─── Tabela Oficial de Histórico (Tipografia Grande e Legível) ──────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
            
            {loading ? (
              <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
                <Loader2 className={`w-8 h-8 animate-spin ${theme.textPrimary}`} />
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-bold">
                  Carregando histórico de alocações...
                </p>
              </div>
            ) : vagasAgrupadas.length === 0 ? (
              <div className="py-16 text-center px-4">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Layers size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Nenhuma vaga corresponde aos filtros selecionados
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Tente alterar a modalidade selecionada ou termo de busca.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[980px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs md:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      <th className="py-4 px-4 text-center w-24">Vaga</th>
                      <th className="py-4 px-4 w-52">Modalidade</th>
                      <th className="py-4 px-4">Núcleos Anteriores</th>
                      <th className="py-4 px-4 w-72">Núcleo Atual</th>
                      <th className="py-4 px-4 text-center w-28">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm md:text-base">
                    {vagasAgrupadas.map((grp) => {
                      return (
                        <tr
                          key={grp.numero_vaga}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* VAGA */}
                          <td className="py-4 px-4 text-center align-top">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-base border border-slate-200 dark:border-slate-700 shadow-2xs">
                              {grp.numero_vaga}
                            </span>
                          </td>

                          {/* MODALIDADE */}
                          <td className="py-4 px-4 align-top">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base block">
                              {grp.modalidade_nome}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block mt-0.5">
                              {selectedProjObj?.nome}
                            </span>
                          </td>

                          {/* NÚCLEOS ANTERIORES */}
                          <td className="py-4 px-4 align-top">
                            {grp.anteriores.length === 0 ? (
                              <span className="text-slate-400 text-sm italic">
                                — Sem núcleos anteriores
                              </span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                {grp.anteriores.map((ant, idx) => (
                                  <div
                                    key={idx}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs md:text-sm group/item"
                                  >
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                      {ant.nome}
                                    </span>
                                    {ant.obs && (
                                      <span className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded font-medium">
                                        {ant.obs}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(grp)}
                                      className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity ml-0.5 p-1 cursor-pointer"
                                      title="Editar histórico desta vaga"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* NÚCLEO ATUAL */}
                          <td className="py-4 px-4 align-top">
                            {grp.atual && grp.atual.nome && grp.atual.nome !== "—" ? (
                              <div className="space-y-1">
                                <span className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base block tracking-tight">
                                  {grp.atual.nome}
                                </span>
                                {grp.atual.obs && (
                                  <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 block font-medium">
                                    ({grp.atual.obs})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-lg text-xs font-bold inline-block">
                                — Vaga Disponível / Não alocada
                              </span>
                            )}
                          </td>

                          {/* AÇÕES DA VAGA */}
                          <td className="py-4 px-4 text-center align-top">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(grp)}
                                className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Editar alocação e histórico desta vaga"
                              >
                                <Edit2 size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setModalResetVaga(grp.numero_vaga)}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Resetar histórico desta vaga"
                              >
                                <RotateCcw size={16} />
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
      )}

      {/* ─── Modal de Edição de Vaga e Histórico de Núcleos ──────────────────── */}
      {modalEditItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    Editar Vaga #{formVaga || modalEditItem.numero_vaga}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedProjObj?.nome ? `Proposta ${selectedProjObj.nome}` : "Alocação e Histórico"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setModalEditItem(null); setModalEditGroup(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Número da Vaga (Slot) *
                </label>
                <input
                  type="number"
                  value={formVaga}
                  onChange={(e) => setFormVaga(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none"
                />
              </div>

              {/* NÚCLEOS ANTERIORES - LISTA DINÂMICA COM OPÇÃO DE ADICIONAR MAIS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Núcleos Anteriores
                    </label>
                    {formNucleosAnteriores.length > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {formNucleosAnteriores.length}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAnterior}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus size={13} /> Adicionar núcleo anterior
                  </button>
                </div>

                {formNucleosAnteriores.length === 0 ? (
                  <div className="p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center bg-slate-50/50 dark:bg-slate-800/30">
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                      Nenhum núcleo anterior registrado para esta vaga.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddAnterior}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> Adicionar Núcleo Anterior
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {formNucleosAnteriores.map((ant, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[9px] font-black">
                              {idx + 1}
                            </span>
                            Núcleo Anterior #{idx + 1}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleCustomAnterior(idx)}
                              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              {ant.isCustom ? "← Escolher da lista" : "✏️ Digitar outro"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveAnterior(idx)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Remover este núcleo anterior"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {ant.isCustom ? (
                          <input
                            type="text"
                            placeholder="Ex: Aroeira, Wona 1..."
                            value={ant.nome === "—" ? "" : ant.nome}
                            onChange={(e) => handleUpdateAnteriorNome(idx, e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-blue-400 dark:border-blue-600 rounded-lg text-slate-900 dark:text-white font-semibold outline-none text-xs"
                            autoFocus
                          />
                        ) : (
                          <select
                            value={ant.nome === "" || ant.nome === "—" ? "" : ant.nome}
                            onChange={(e) => {
                              if (e.target.value === "__custom__") {
                                handleToggleCustomAnterior(idx);
                              } else {
                                handleUpdateAnteriorNome(idx, e.target.value);
                              }
                            }}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold outline-none text-xs cursor-pointer"
                          >
                            <option value="">Selecione o núcleo anterior...</option>
                            {distinctNucleos.map((nome) => (
                              <option key={nome} value={nome}>
                                {nome}
                              </option>
                            ))}
                            <option value="__custom__">✏️ Outro (Digitar manualmente)...</option>
                          </select>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddAnterior}
                      className="w-full py-2 px-3 border border-dashed border-blue-300 dark:border-blue-800/80 hover:border-blue-500 rounded-xl text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                    >
                      <Plus size={14} /> Adicionar Mais um Núcleo Anterior
                    </button>
                  </div>
                )}
              </div>

              {/* NÚCLEO ATUAL - SELECIONÁVEL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Nome do Núcleo Atual *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomAtual(!isCustomAtual)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {isCustomAtual ? "← Escolher da lista" : "✏️ Digitar outro"}
                  </button>
                </div>
                {isCustomAtual ? (
                  <input
                    type="text"
                    placeholder="Ex: MONSUABA, JARDIM LIMEIRA 1..."
                    value={formNucleoAtual}
                    onChange={(e) => setFormNucleoAtual(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-blue-400 dark:border-blue-600 rounded-xl text-slate-900 dark:text-white font-semibold outline-none"
                    autoFocus
                  />
                ) : (
                  <select
                    value={formNucleoAtual}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomAtual(true);
                        setFormNucleoAtual("");
                      } else {
                        setFormNucleoAtual(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none cursor-pointer"
                  >
                    <option value="">Selecione um núcleo...</option>
                    {distinctNucleos.map((nome) => (
                      <option key={nome} value={nome}>
                        {nome}
                      </option>
                    ))}
                    <option value="__custom__">✏️ Outro (Digitar manualmente)...</option>
                  </select>
                )}
              </div>

              {/* MODALIDADE - FIXA / BLOQUEADA */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Modalidade
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Lock size={10} /> Fixo da Proposta
                  </span>
                </div>
                <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-600 dark:text-slate-400 font-bold select-none cursor-not-allowed flex items-center justify-between">
                  <span>{formModalidade || "—"}</span>
                  <Lock size={13} className="text-slate-400" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Observações / Notas Históricas
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Substituição por encerramento de contrato com o proprietário anterior..."
                  value={formObservacao}
                  onChange={(e) => setFormObservacao(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setModalEditItem(null); setModalEditGroup(null); }}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal de Confirmação de Exclusão de Registro ────────────────────── */}
      {modalDeleteItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Excluir Registro do Histórico?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta ação removerá a movimentação #{modalDeleteItem.id} da Vaga {modalDeleteItem.numero_vaga}.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <p><strong>Núcleo Anterior:</strong> {modalDeleteItem.nucleo_anterior || "—"}</p>
              <p><strong>Núcleo Atual:</strong> {modalDeleteItem.nucleo_atual}</p>
              <p><strong>Data:</strong> {new Date(modalDeleteItem.data_modificacao).toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalDeleteItem(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>Excluir Registro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal de Confirmação de Reset de Histórico da Vaga ───────────────── */}
      {modalResetVaga !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Resetar Histórico da Vaga {modalResetVaga}?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Todas as entradas históricas passadas desta vaga serão apagadas, mantendo a vaga limpa.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Tem certeza que deseja apagar o registro de núcleos anteriores desta vaga? O núcleo atual continuará vinculado normalmente.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalResetVaga(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmResetVaga}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                <span>Sim, Resetar Histórico</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Feedback Toast ─────────────────────────────────────────────────── */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold border ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-red-600 text-white border-red-700'
          }`}>
            {feedbackToast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedbackToast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
