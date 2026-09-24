import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  MoveUp, 
  MoveDown, 
  Save, 
  Eye, 
  EyeOff,
  Layers, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ListOrdered, 
  FolderPlus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Search,
  Filter,
  Trophy,
  PartyPopper,
  Calendar
} from "lucide-react";
import ToastContainer, { type ToastMessage } from "../../components/Toast";

export interface PerguntaPersonalizada {
  id: string;
  titulo: string;
  tipo: "select" | "radio" | "text" | "number";
  modalidade_id?: string | number | null; // null ou 'todas' = geral
  modalidade_nome?: string;
  opcoes: string[];
  obrigatorio: boolean;
  ajuda?: string;
  ordem?: number;
  oculto?: boolean; // Se true, não aparece no formulário da matrícula/inscrição
}

export interface ModalidadeItem {
  id: string | number;
  nome: string;
}

export interface ProjetoItem {
  id: string | number;
  nome: string;
  numero_proposta?: string;
  termo_fomento?: string;
  aplicabilidade?: string;
  ativo?: boolean;
  limites_modalidades?: string | any[];
  perguntas_extras?: string | any[];
}

export const PERGUNTAS_NATIVAS_DEFINICAO = [
  {
    key: "uso_medicacao",
    alias: "med",
    num: "1",
    titulo: "Medicamento Contínuo",
    pergunta: "Faz uso de algum medicamento contínuo?",
    detalhe: "Qual(is) medicamento(s)?"
  },
  {
    key: "possui_alergias",
    alias: "alerg",
    num: "2",
    titulo: "Alergias",
    pergunta: "Possui alguma alergia diagnosticada?",
    detalhe: "Quais alergias?"
  },
  {
    key: "plano_saude",
    alias: "plano",
    num: "3",
    titulo: "Plano de Saúde",
    pergunta: "Possui convênio ou plano de saúde?",
    detalhe: "Qual o convênio?"
  },
  {
    key: "acompan_medico",
    alias: "trat",
    num: "4",
    titulo: "Tratamento Médico",
    pergunta: "Está em acompanhamento / tratamento médico?",
    detalhe: "Motivo do tratamento?"
  },
  {
    key: "restricao_fisica",
    alias: "rest",
    num: "5",
    titulo: "Restrição Física",
    pergunta: "Possui restrição para atividades físicas?",
    detalhe: "Qual a restrição?"
  },
  {
    key: "necessidade_especial",
    alias: "esp",
    num: "6",
    titulo: "Necessidade Especial / PcD",
    pergunta: "Possui alguma necessidade especial ou PCD?",
    detalhe: "Especifique a necessidade:"
  },
  {
    key: "laudo_medico",
    alias: "docs",
    num: "7",
    titulo: "Laudo Médico (Opcional)",
    pergunta: "Deseja enviar laudo médico agora? (Aceita até 6 anexos PDF/Fotos).",
    detalhe: "Upload de atestado, laudo PcD ou declaração médica."
  }
];

export default function Formularios() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determina se está no modo "projetos" ou "eventos" com base na rota
  const isModoEventos = location.pathname.includes('/eventos');
  const activeTipo: "projetos" | "eventos" = isModoEventos ? "eventos" : "projetos";

  const [currentInstitute, setCurrentInstitute] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
    }
    return "IBRASE";
  });

  const [projetos, setProjetos] = useState<ProjetoItem[]>([]);
  const [selectedProjetoId, setSelectedProjetoId] = useState<string | number>("");
  const [searchProjeto, setSearchProjeto] = useState("");
  const [loadingProjetos, setLoadingProjetos] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Perguntas Nativas de Saúde que o colaborador pode Ocultar / Reativar na Matrícula
  const [nativasOcultas, setNativasOcultas] = useState<string[]>([]);

  // Modalidades disponíveis para o projeto selecionado
  const [modalidadesDisponiveis, setModalidadesDisponiveis] = useState<ModalidadeItem[]>([]);

  // Lista de Perguntas Extras do Projeto Selecionado
  const [perguntas, setPerguntas] = useState<PerguntaPersonalizada[]>([]);

  // Filtro de status da lista de perguntas (Todas, Ativas, Ocultas)
  const [filtroStatusPergunta, setFiltroStatusPergunta] = useState<"todas" | "ativas" | "ocultas">("todas");

  // Estado para Criar/Editar Pergunta
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPergunta, setEditingPergunta] = useState<PerguntaPersonalizada | null>(null);

  // Campos do formulário do modal
  const [formTitulo, setFormTitulo] = useState("");
  const [formTipo, setFormTipo] = useState<"select" | "radio" | "text" | "number">("select");
  const [formModalidade, setFormModalidade] = useState<string>("todas");
  const [formObrigatorio, setFormObrigatorio] = useState(true);
  const [formOculto, setFormOculto] = useState(false);
  const [formAjuda, setFormAjuda] = useState("");
  const [formOpcoes, setFormOpcoes] = useState<string[]>([]);
  const [novaOpcaoInput, setNovaOpcaoInput] = useState("");

  // Visualização / Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewModalidadeFiltro, setPreviewModalidadeFiltro] = useState<string>("todas");
  const [previewRespostas, setPreviewRespostas] = useState<Record<string, any>>({});

  // Accordion de perguntas nativas
  const [showNativas, setShowNativas] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "warning" | "error" | "info", title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper para identificar se um item é Evento
  const isEvento = (p: ProjetoItem) => {
    const ap = (p.aplicabilidade || "").toLowerCase().trim();
    return ap === "evento" || ap === "eventos";
  };

  // Listas separadas
  const listaProjetosSociais = useMemo(() => projetos.filter(p => !isEvento(p)), [projetos]);
  const listaEventos = useMemo(() => projetos.filter(p => isEvento(p)), [projetos]);

  // Itens atualmente correspondentes ao modo ativo (Projetos ou Eventos)
  const itensDoModo = activeTipo === "eventos" ? listaEventos : listaProjetosSociais;

  const totalProjetosCount = listaProjetosSociais.length;
  const totalEventosCount = listaEventos.length;

  // Carrega propostas do instituto atual
  useEffect(() => {
    const inst = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
    setCurrentInstitute(inst);
    setLoadingProjetos(true);

    fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        const list: ProjetoItem[] = Array.isArray(data) ? data : (data?.data || []);
        setProjetos(list);
      })
      .catch(err => {
        console.error("Erro ao carregar propostas:", err);
        addToast("error", "Falha de Conexão", "Não foi possível carregar a lista de propostas.");
      })
      .finally(() => setLoadingProjetos(false));
  }, []);

  // Quando o modo ativo ou a lista de propostas mudar, seleciona um item padrão
  useEffect(() => {
    if (itensDoModo.length > 0) {
      const atualPertence = itensDoModo.some(p => String(p.id) === String(selectedProjetoId));
      if (!atualPertence) {
        const first = itensDoModo.find(p => p.ativo !== false) || itensDoModo[0];
        setSelectedProjetoId(first.id);
      }
    } else {
      setSelectedProjetoId("");
      setPerguntas([]);
      setModalidadesDisponiveis([]);
    }
  }, [itensDoModo, activeTipo]);

  // Quando o projeto selecionado muda, carrega suas perguntas extras e modalidades
  useEffect(() => {
    if (!selectedProjetoId) {
      setPerguntas([]);
      setModalidadesDisponiveis([]);
      return;
    }

    const proj = projetos.find(p => String(p.id) === String(selectedProjetoId));
    if (!proj) return;

    // 1. Extrai perguntas extras e configurações de perguntas nativas de saúde
    let rawPerguntas: any = proj.perguntas_extras;
    if (typeof rawPerguntas === "string") {
      try { rawPerguntas = JSON.parse(rawPerguntas); } catch(e) { rawPerguntas = []; }
    }
    const arr: any[] = Array.isArray(rawPerguntas) ? rawPerguntas : [];

    // Extrai lista de perguntas nativas de saúde que foram ocultadas
    const cfgNativas = arr.find((p: any) => p && (p.is_config_nativas === true || p.id === "config_nativas_ocultas"));
    if (cfgNativas && Array.isArray(cfgNativas.nativas_ocultas)) {
      setNativasOcultas(cfgNativas.nativas_ocultas);
    } else {
      setNativasOcultas([]);
    }

    // Perguntas extras customizadas (exclui o registro de configuração nativa)
    const customList = arr.filter((p: any) => p && !p.is_config_nativas && p.id !== "config_nativas_ocultas");
    setPerguntas(customList);
    setHasUnsavedChanges(false);

    // 2. Extrai modalidades vinculadas a este projeto (suporta limites_modalidades e vagas_nucleo)
    const mods = extrairModalidadesDoProjeto(proj);
    setModalidadesDisponiveis(mods);
  }, [selectedProjetoId, projetos]);

  // Função para extrair modalidades disponíveis em qualquer formato suportado (limites_modalidades, limites_modalidade ou vagas_nucleo)
  const extrairModalidadesDoProjeto = (proj: ProjetoItem): ModalidadeItem[] => {
    if (!proj) return [];
    const map = new Map<string, string>();

    // 1. Tenta extrair de limites_modalidades / limites_modalidade
    const fontesLimites = [
      proj.limites_modalidades,
      (proj as any).limites_modalidade,
      (proj as any).limitesModalidades,
      (proj as any).limitesModalidade
    ];

    for (const raw of fontesLimites) {
      if (!raw) continue;
      let parsed: any = raw;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch(e) { parsed = []; }
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((m: any) => {
          const id = String(m.id || m.modalidade_id || m.modalidadeId || "").trim();
          const nome = String(m.nome || m.modalidade_nome || m.modalidadeNome || "").trim();
          if (id && nome && !map.has(id)) {
            map.set(id, nome);
          }
        });
      }
    }

    // 2. Complementa com vagas_nucleo (caso limites_modalidades esteja vazio ou incompleto)
    const fontesVagas = [
      (proj as any).vagas_nucleo,
      (proj as any).vagasNucleo
    ];

    for (const raw of fontesVagas) {
      if (!raw) continue;
      let parsed: any = raw;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch(e) { parsed = []; }
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((v: any) => {
          const id = String(v.modalidadeId || v.modalidade_id || v.id || "").trim();
          const nome = String(v.modalidadeNome || v.modalidade_nome || v.nome || "").trim();
          if (id && nome && !map.has(id)) {
            map.set(id, nome);
          }
        });
      }
    }

    return Array.from(map.entries()).map(([id, nome]) => ({
      id,
      nome
    }));
  };

  // Função auxiliar para obter contagem de perguntas e modalidades de um projeto
  const getInfoPerguntasProjeto = (p: ProjetoItem, currentPerguntasOverride?: PerguntaPersonalizada[]) => {
    let list: any[] = [];
    if (currentPerguntasOverride) {
      list = currentPerguntasOverride;
    } else if (p.perguntas_extras) {
      if (Array.isArray(p.perguntas_extras)) {
        list = p.perguntas_extras;
      } else if (typeof p.perguntas_extras === "string") {
        try {
          list = JSON.parse(p.perguntas_extras);
        } catch (e) {
          list = [];
        }
      }
    }

    const cfgNativas = list.find((item: any) => item && (item.is_config_nativas === true || item.id === "config_nativas_ocultas"));
    const nativasOcultasCount = (cfgNativas && Array.isArray(cfgNativas.nativas_ocultas)) ? cfgNativas.nativas_ocultas.length : 0;

    const customList = list.filter((item: any) => item && !item.is_config_nativas && item.id !== "config_nativas_ocultas");
    const totalCustom = customList.length;
    const customOcultas = customList.filter((item: any) => item.oculto === true).length;
    const totalOcultas = customOcultas + nativasOcultasCount;
    const total = totalCustom + 7;
    const ativas = (totalCustom - customOcultas) + (7 - nativasOcultasCount);

    const modCount = extrairModalidadesDoProjeto(p).length;

    return { total, ativas, ocultas: totalOcultas, modalidadesCount: modCount, nativasOcultasCount };
  };

  // Alterna entre Projetos e Eventos
  const handleSwitchTipo = (novoTipo: "projetos" | "eventos") => {
    if (hasUnsavedChanges && !window.confirm("Você possui alterações não salvas no formulário atual. Deseja trocar de aba assim mesmo?")) {
      return;
    }
    navigate(novoTipo === "eventos" ? "/admin/eventos/formularios" : "/admin/projetos/formularios");
  };

  // Projetos filtrados pela barra de busca
  const projetosFiltrados = useMemo(() => {
    if (!searchProjeto.trim()) return itensDoModo;
    const q = searchProjeto.toLowerCase();
    return itensDoModo.filter(p => 
      (p.nome && p.nome.toLowerCase().includes(q)) ||
      (p.numero_proposta && String(p.numero_proposta).toLowerCase().includes(q)) ||
      (p.termo_fomento && String(p.termo_fomento).toLowerCase().includes(q)) ||
      (String(p.id) === q)
    );
  }, [itensDoModo, searchProjeto]);

  // Abre modal para criação
  const handleOpenCreateModal = () => {
    setEditingPergunta(null);
    setFormTitulo("");
    setFormTipo("select");
    setFormModalidade("todas");
    setFormObrigatorio(true);
    setFormOculto(false);
    setFormAjuda("");
    setFormOpcoes(["Opção 1", "Opção 2"]);
    setNovaOpcaoInput("");
    setModalOpen(true);
  };

  // Abre modal para edição
  const handleOpenEditModal = (p: PerguntaPersonalizada) => {
    setEditingPergunta(p);
    setFormTitulo(p.titulo);
    setFormTipo(p.tipo);
    setFormModalidade(p.modalidade_id ? String(p.modalidade_id) : "todas");
    setFormObrigatorio(p.obrigatorio);
    setFormOculto(p.oculto === true);
    setFormAjuda(p.ajuda || "");
    setFormOpcoes(p.opcoes || []);
    setNovaOpcaoInput("");
    setModalOpen(true);
  };

  // Alterna o estado de ocultar / reativar pergunta
  const handleToggleOcultar = (id: string) => {
    setPerguntas(prev => prev.map(p => {
      if (p.id === id) {
        const novoOculto = !p.oculto;
        addToast(
          "info", 
          novoOculto ? "Pergunta Ocultada" : "Pergunta Reativada", 
          novoOculto 
            ? `"${p.titulo}" foi ocultada e não aparecerá na inscrição/matrícula. Salve para confirmar!` 
            : `"${p.titulo}" foi reativada e voltará a aparecer na inscrição/matrícula.`
        );
        return { ...p, oculto: novoOculto };
      }
      return p;
    }));
    setHasUnsavedChanges(true);
  };

  // Alterna o estado de ocultar / reativar uma pergunta nativa de saúde (1 a 7)
  const handleToggleOcultarNativa = (key: string) => {
    setNativasOcultas(prev => {
      const isOculta = prev.includes(key);
      const next = isOculta ? prev.filter(k => k !== key) : [...prev, key];
      const itemDef = PERGUNTAS_NATIVAS_DEFINICAO.find(d => d.key === key);
      addToast(
        "info", 
        isOculta ? "Pergunta de Saúde Reativada" : "Pergunta de Saúde Ocultada", 
        isOculta 
          ? `"${itemDef?.titulo || key}" voltará a ser exibida na ficha de matrícula. Salve para confirmar!` 
          : `"${itemDef?.titulo || key}" foi ocultada e não aparecerá na ficha de matrícula. Salve para confirmar!`
      );
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleOcultarTodasNativas = () => {
    const todasKeys = PERGUNTAS_NATIVAS_DEFINICAO.map(d => d.key);
    setNativasOcultas(todasKeys);
    setHasUnsavedChanges(true);
    addToast("warning", "Todas as Perguntas Nativas Ocultadas", "Nenhum dos 7 itens de saúde será exibido na ficha. Salve para confirmar!");
  };

  const handleReativarTodasNativas = () => {
    setNativasOcultas([]);
    setHasUnsavedChanges(true);
    addToast("success", "Todas as Perguntas Nativas Reativadas", "Todas as 7 perguntas de saúde voltarão a aparecer na ficha. Salve para confirmar!");
  };

  // Presets rápidos para acelerar o preenchimento do colaborador
  const aplicarPreset = (tipoPreset: "luta" | "corrida" | "nivel" | "clube" | "camisa_kit") => {
    if (tipoPreset === "luta") {
      setFormTitulo("Categoria de Peso / Luta");
      setFormTipo("select");
      setFormOpcoes(["Galo (até 57 kg)", "Pena (até 65 kg)", "Leve (até 70 kg)", "Médio (até 84 kg)", "Meio-Pesado (até 93 kg)", "Pesado (+93 kg)"]);
      setFormAjuda("Selecione a categoria conforme a pesagem oficial no dia.");
    } else if (tipoPreset === "corrida") {
      setFormTitulo("Percurso / Distância da Prova");
      setFormTipo("select");
      setFormOpcoes(["3 km (Caminhada)", "5 km (Corrida Individual)", "10 km (Corrida Principal)", "21 km (Meia Maratona)", "42 km (Maratona)"]);
      setFormAjuda("Escolha a quilometragem que irá disputar.");
    } else if (tipoPreset === "nivel") {
      setFormTitulo("Nível de Experiência / Categoria");
      setFormTipo("radio");
      setFormOpcoes(["Iniciante", "Intermediário", "Avançado", "Competidor / Federado"]);
      setFormAjuda("Indique seu nível atual de prática.");
    } else if (tipoPreset === "clube") {
      setFormTitulo("Equipe / Assessoria Esportiva / Clube");
      setFormTipo("text");
      setFormOpcoes([]);
      setFormAjuda("Informe o nome da sua equipe, academia ou clube de treino.");
    } else if (tipoPreset === "camisa_kit") {
      setFormTitulo("Tamanho da Camiseta do Kit Oficial");
      setFormTipo("select");
      setFormOpcoes(["PP (Adulto)", "P (Adulto)", "M (Adulto)", "G (Adulto)", "GG (Adulto)", "XG (Adulto)"]);
      setFormAjuda("Tamanho da camiseta inclusa no kit do participante.");
    }
  };

  const handleAddOpcao = () => {
    const val = novaOpcaoInput.trim();
    if (!val) return;
    if (formOpcoes.includes(val)) {
      addToast("warning", "Opção Duplicada", "Essa opção já foi adicionada na lista.");
      return;
    }
    setFormOpcoes([...formOpcoes, val]);
    setNovaOpcaoInput("");
  };

  const handleRemoveOpcao = (index: number) => {
    setFormOpcoes(formOpcoes.filter((_, i) => i !== index));
  };

  const handleSavePerguntaModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) {
      addToast("warning", "Campo Obrigatório", "Por favor, digite o título da pergunta.");
      return;
    }

    if ((formTipo === "select" || formTipo === "radio") && formOpcoes.length === 0) {
      addToast("warning", "Opções Necessárias", "Adicione ao menos uma opção para perguntas de seleção.");
      return;
    }

    const modNome = formModalidade === "todas" 
      ? undefined 
      : modalidadesDisponiveis.find(m => String(m.id) === String(formModalidade))?.nome;

    const novaPergunta: PerguntaPersonalizada = {
      id: editingPergunta ? editingPergunta.id : `campo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      titulo: formTitulo.trim(),
      tipo: formTipo,
      modalidade_id: formModalidade === "todas" ? null : formModalidade,
      modalidade_nome: modNome,
      opcoes: (formTipo === "select" || formTipo === "radio") ? formOpcoes : [],
      obrigatorio: formObrigatorio,
      ajuda: formAjuda.trim() || undefined,
      oculto: formOculto
    };

    if (editingPergunta) {
      setPerguntas(prev => prev.map(item => item.id === editingPergunta.id ? novaPergunta : item));
      addToast("info", "Pergunta Atualizada", `"${novaPergunta.titulo}" foi atualizada.`);
    } else {
      setPerguntas(prev => [...prev, novaPergunta]);
      addToast("success", "Pergunta Adicionada", `"${novaPergunta.titulo}" foi adicionada.`);
    }

    setHasUnsavedChanges(true);
    setModalOpen(false);
  };

  const handleDeletePergunta = (id: string, titulo: string) => {
    if (window.confirm(`Deseja realmente remover permanentemente a pergunta "${titulo}"? (Dica: você também pode apenas Ocultar para não perder o histórico).`)) {
      setPerguntas(prev => prev.filter(p => p.id !== id));
      setHasUnsavedChanges(true);
      addToast("info", "Pergunta Removida", `"${titulo}" foi excluída.`);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= perguntas.length) return;

    const copy = [...perguntas];
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;
    setPerguntas(copy);
    setHasUnsavedChanges(true);
  };

  // Salvar alterações no Supabase via Webhook
  const handleSaveToDatabase = async () => {
    if (!selectedProjetoId) return;
    const proj = projetos.find(p => String(p.id) === String(selectedProjetoId));
    if (!proj) return;

    setSaving(true);
    try {
      const payloadPerguntas = [
        ...perguntas,
        {
          id: "config_nativas_ocultas",
          is_config_nativas: true,
          nativas_ocultas: nativasOcultas
        }
      ];

      // Constrói lista de limites para preservar caso o webhook execute recriação de limites
      let limitesArray: any[] = [];
      if (Array.isArray(proj.limites_modalidades)) {
        limitesArray = proj.limites_modalidades;
      } else if (typeof proj.limites_modalidades === "string") {
        try { limitesArray = JSON.parse(proj.limites_modalidades); } catch(e) {}
      } else if (Array.isArray((proj as any).limites_modalidade)) {
        limitesArray = (proj as any).limites_modalidade;
      }

      // Se limitesArray estiver vazio, extrai as modalidades de vagas_nucleo para preservar
      if (limitesArray.length === 0) {
        const extraidas = extrairModalidadesDoProjeto(proj);
        if (extraidas.length > 0) {
          limitesArray = extraidas.map(m => ({ id: m.id, nome: m.nome, limite: 1 }));
        }
      }

      const payload: any = {
        ...proj,
        id: proj.id,
        instituto: currentInstitute,
        nome_projeto: proj.nome,
        limites_modalidade: limitesArray,
        limites_modalidades: limitesArray,
        perguntas_extras: JSON.stringify(payloadPerguntas)
      };

      const resp = await fetch(`https://w.ibrase.com.br/webhook/projetos-put?instituto=${currentInstitute}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error(`Servidor respondeu com código ${resp.status}`);
      }

      // Atualiza o estado local do projeto
      setProjetos(prev => prev.map(p => {
        if (String(p.id) === String(selectedProjetoId)) {
          return { ...p, perguntas_extras: payloadPerguntas };
        }
        return p;
      }));

      setHasUnsavedChanges(false);
      addToast("success", "Formulário Salvo!", "As perguntas e regras de saúde foram sincronizadas com o banco de dados.");
    } catch (err: any) {
      console.error("Erro ao salvar perguntas:", err);
      addToast("error", "Erro ao Salvar", err?.message || "Ocorreu uma falha ao salvar as perguntas extras.");
    } finally {
      setSaving(false);
    }
  };

  const selectedProjeto = projetos.find(p => String(p.id) === String(selectedProjetoId));

  // Perguntas filtradas por status na lista administrativa
  const perguntasExibidas = useMemo(() => {
    return perguntas.filter(p => {
      if (filtroStatusPergunta === "ativas") return !p.oculto;
      if (filtroStatusPergunta === "ocultas") return !!p.oculto;
      return true;
    });
  }, [perguntas, filtroStatusPergunta]);

  // Contagens
  const totalPerguntas = perguntas.length;
  const totalOcultas = perguntas.filter(p => p.oculto === true).length;
  const totalAtivas = totalPerguntas - totalOcultas;

  // Perguntas filtradas no Preview (apenas as ativas)
  const perguntasFiltradasPreview = perguntas.filter(p => {
    if (p.oculto === true) return false;
    if (previewModalidadeFiltro === "todas") return true;
    if (!p.modalidade_id || String(p.modalidade_id) === "todas") return true;
    return String(p.modalidade_id) === String(previewModalidadeFiltro);
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── SELETOR DE MODO SUPERIOR (PROJETOS VS EVENTOS) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              activeTipo === "eventos" 
                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}>
              <ClipboardList size={14} /> Módulo Formulários • {activeTipo === "eventos" ? "Eventos" : "Projetos"}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Instituto: {currentInstitute}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeTipo === "eventos" ? "Formulários de Eventos & Torneios" : "Formulários de Projetos Sociais"}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            {activeTipo === "eventos" 
              ? "Configure perguntas específicas para a ficha de inscrição em eventos (ex: categoria de peso, percurso da corrida, clube ou kit oficial)."
              : "Configure perguntas complementares para a matrícula regular dos participantes em projetos esportivos e sociais."}
          </p>
        </div>

        {/* Ações do Topo */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
            activeTipo === "eventos"
              ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
          }`}>
            {activeTipo === "eventos" ? <PartyPopper size={14} /> : <Trophy size={14} />}
            <span>{activeTipo === "eventos" ? `Eventos Cadastrados (${totalEventosCount})` : `Projetos Cadastrados (${totalProjetosCount})`}</span>
          </span>

          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={!selectedProjetoId}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Eye size={16} />
            <span>Pré-visualizar</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={saving || !selectedProjetoId || !hasUnsavedChanges}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all cursor-pointer ${
              hasUnsavedChanges 
                ? activeTipo === "eventos" ? "bg-purple-600 hover:bg-purple-700 animate-pulse" : "bg-emerald-600 hover:bg-emerald-700 animate-pulse"
                : "bg-slate-700 hover:bg-slate-800 opacity-80"
            } disabled:opacity-50 disabled:animate-none`}
          >
            <Save size={16} />
            <span>{saving ? "Salvando..." : hasUnsavedChanges ? "Salvar Alterações *" : "Salvo"}</span>
          </button>
        </div>
      </div>

      {/* ── SEÇÃO: BLOQUINHOS DO MODO ATIVO (PROJETOS OU EVENTOS) ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers size={16} className={activeTipo === "eventos" ? "text-purple-600" : "text-emerald-600"} />
              <span>{activeTipo === "eventos" ? "Eventos Cadastrados:" : "Projetos Sociais Disponíveis:"}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clique no bloquinho correspondente para carregar e gerenciar as perguntas deste {activeTipo === "eventos" ? "evento" : "projeto"}.
            </p>
          </div>

          {/* Busca Rápida */}
          {itensDoModo.length > 3 && (
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchProjeto}
                onChange={(e) => setSearchProjeto(e.target.value)}
                placeholder={`Buscar ${activeTipo === "eventos" ? "evento..." : "projeto..."}`}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {loadingProjetos ? (
          <div className="flex items-center justify-center gap-3 py-10 text-sm text-slate-500">
            <span className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></span>
            Carregando do instituto {currentInstitute}...
          </div>
        ) : itensDoModo.length === 0 ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              {activeTipo === "eventos" ? <PartyPopper size={24} /> : <Trophy size={24} />}
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {activeTipo === "eventos" 
                ? "Nenhuma proposta de Evento cadastrada neste instituto"
                : "Nenhum projeto social cadastrado neste instituto"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {activeTipo === "eventos"
                ? "Para configurar o formulário de um evento, cadastre uma proposta com aplicabilidade 'Eventos' na aba Administrativo > Propostas."
                : "Cadastre um projeto na aba Administrativo > Propostas para poder adicionar perguntas ao formulário."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/cadastrar-projeto")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Cadastrar Nova Proposta</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {projetosFiltrados.map((p) => {
              const isSelected = String(p.id) === String(selectedProjetoId);
              const info = getInfoPerguntasProjeto(p, isSelected ? perguntas : undefined);

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (hasUnsavedChanges && !window.confirm("Você tem alterações não salvas no item atual. Deseja trocar assim mesmo?")) {
                      return;
                    }
                    setSelectedProjetoId(p.id);
                  }}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-3 text-left ${
                    isSelected
                      ? activeTipo === "eventos"
                        ? "border-2 border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-500/20"
                        : "border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  {/* Topo do Bloquinho */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        #{p.id}
                      </span>
                      {p.numero_proposta && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 truncate max-w-[130px]">
                          Prop: {p.numero_proposta}
                        </span>
                      )}
                    </div>

                    {isSelected ? (
                      <span className={`w-5 h-5 rounded-full ${activeTipo === "eventos" ? "bg-purple-600" : "bg-emerald-600"} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"></span>
                    )}
                  </div>

                  {/* Nome da Proposta */}
                  <div>
                    <h3 className={`text-sm font-extrabold line-clamp-2 ${
                      isSelected 
                        ? activeTipo === "eventos" ? "text-purple-950 dark:text-purple-200" : "text-emerald-950 dark:text-emerald-200"
                        : "text-slate-800 dark:text-slate-200"
                    }`}>
                      {p.nome}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {p.termo_fomento ? `Termo: ${p.termo_fomento}` : (p.aplicabilidade || (activeTipo === "eventos" ? "Evento Esportivo" : "Projeto Social"))}
                    </p>
                  </div>

                  {/* Rodapé do Bloquinho: Contagem de Perguntas e Modalidades */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className={`font-semibold flex items-center gap-1 ${
                      info.total > 0 
                        ? activeTipo === "eventos" ? "text-purple-700 dark:text-purple-300" : "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-400"
                    }`}>
                      <ClipboardList size={12} />
                      {info.total === 0 
                        ? "Sem extras" 
                        : `${info.ativas} ativa${info.ativas !== 1 ? "s" : ""}`}
                      {info.ocultas > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-bold ml-0.5">
                          ({info.ocultas} oculta{info.ocultas !== 1 ? "s" : ""})
                        </span>
                      )}
                    </span>

                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {info.modalidadesCount} modalidade(s)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PERGUNTAS NATIVAS DE SAÚDE DA FICHA (1 A 7: OCULTAR / REATIVAR) ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Perguntas Médicas & de Saúde da Ficha de Matrícula (Nativas)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize a ficha cadastral deste projeto/evento ocultando qualquer um dos 7 itens de saúde abaixo se não for aplicável.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {7 - nativasOcultas.length} ativas / {nativasOcultas.length} ocultas
            </span>
            {nativasOcultas.length > 0 ? (
              <button
                type="button"
                onClick={handleReativarTodasNativas}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline cursor-pointer"
              >
                Reativar Todas
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOcultarTodasNativas}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 underline cursor-pointer"
              >
                Ocultar Todas
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PERGUNTAS_NATIVAS_DEFINICAO.map((nat) => {
            const isOculta = nativasOcultas.includes(nat.key) || nativasOcultas.includes(nat.alias);
            return (
              <div
                key={nat.key}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isOculta
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 border-dashed"
                    : "bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                        {nat.num}
                      </span>
                      {nat.titulo}
                    </span>

                    {isOculta ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                        <EyeOff size={11} /> Oculta na Ficha
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> Ativa na Ficha
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {nat.pergunta}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Detalhe: {nat.detalhe}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">campo: {nat.key}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleOcultarNativa(nat.key)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isOculta
                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                        : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {isOculta ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{isOculta ? "Reativar na Ficha" : "Ocultar da Ficha"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CONSTRUTOR DE PERGUNTAS EXTRAS DO ITEM SELECIONADO ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Perguntas Complementares: {selectedProjeto ? selectedProjeto.nome : "Nenhum item selecionado"}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeTipo === "eventos"
                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
              }`}>
                {totalAtivas} ativas
              </span>
              {totalOcultas > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  {totalOcultas} ocultas
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Campos adicionais que serão solicitados aos inscritos deste {activeTipo === "eventos" ? "evento" : "projeto"}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtro de Status das Perguntas */}
            {totalPerguntas > 0 && (
              <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100/70 dark:bg-slate-800/70 text-xs">
                <button
                  type="button"
                  onClick={() => setFiltroStatusPergunta("todas")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filtroStatusPergunta === "todas"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Todas ({totalPerguntas})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroStatusPergunta("ativas")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filtroStatusPergunta === "ativas"
                      ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Ativas ({totalAtivas})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroStatusPergunta("ocultas")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filtroStatusPergunta === "ocultas"
                      ? "bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Ocultas ({totalOcultas})
                </button>
              </div>
            )}

            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleSaveToDatabase}
                disabled={saving || !selectedProjetoId}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition-all cursor-pointer ${
                  activeTipo === "eventos" ? "bg-purple-600 hover:bg-purple-700 animate-pulse" : "bg-emerald-600 hover:bg-emerald-700 animate-pulse"
                } disabled:opacity-50`}
              >
                <Save size={16} />
                <span>{saving ? "Salvando..." : "Salvar Alterações *"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenCreateModal}
              disabled={!selectedProjetoId}
              className={`inline-flex items-center gap-2 px-4 py-2.5 ${
                activeTipo === "eventos" ? "bg-purple-600 hover:bg-purple-700" : "bg-emerald-600 hover:bg-emerald-700"
              } text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer`}
            >
              <Plus size={16} />
              <span>Nova Pergunta</span>
            </button>
          </div>
        </div>

        {/* Lista de Perguntas Extras */}
        {perguntas.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <ClipboardList size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Nenhuma pergunta complementar cadastrada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {activeTipo === "eventos"
                ? 'Clique no botão "Nova Pergunta" para adicionar campos de evento como Distância da Prova (Km), Categoria de Peso, Clube/Assessoria ou Tamanho da Camiseta do Kit.'
                : 'Clique no botão "Nova Pergunta" para criar campos específicos como Categoria de Peso/Luta, Km de Corrida, Posição de Jogo ou Nível de Experiência.'}
            </p>
          </div>
        ) : perguntasExibidas.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Nenhuma pergunta corresponde ao filtro selecionado ({filtroStatusPergunta}).
          </div>
        ) : (
          <div className="space-y-3">
            {perguntasExibidas.map((p, index) => {
              const isOculta = p.oculto === true;

              return (
                <div 
                  key={p.id}
                  className={`border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isOculta
                      ? "bg-amber-50/20 dark:bg-amber-950/10 border-dashed border-amber-300 dark:border-amber-800/80 opacity-80"
                      : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {/* Informações da Pergunta */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {p.titulo}
                      </h4>

                      {/* Badge de Modalidade */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                        <Tag size={11} />
                        {p.modalidade_nome ? `Modalidade: ${p.modalidade_nome}` : "Todas as Modalidades"}
                      </span>

                      {/* Badge de Tipo */}
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                        {p.tipo === "select" ? "Lista Suspensa" : p.tipo === "radio" ? "Múltipla Escolha" : p.tipo === "number" ? "Numérico" : "Texto Livre"}
                      </span>

                      {/* Badge de Obrigatoriedade */}
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        p.obrigatorio 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50" 
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {p.obrigatorio ? "Obrigatória" : "Opcional"}
                      </span>

                      {/* Badge de Visibilidade / Oculto */}
                      {isOculta ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          <EyeOff size={11} /> Oculta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          <Eye size={11} /> Visível
                        </span>
                      )}
                    </div>

                    {p.ajuda && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
                        💡 <em>{p.ajuda}</em>
                      </p>
                    )}

                    {/* Visualização das Opções */}
                    {(p.tipo === "select" || p.tipo === "radio") && p.opcoes && p.opcoes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-8 pt-1">
                        {p.opcoes.map((op, i) => (
                          <span key={i} className="text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            • {op}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações: Ocultar / Reativar, Reordenar, Editar e Excluir */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 dark:border-slate-700">
                    {/* Botão Ocultar / Reativar */}
                    <button
                      type="button"
                      onClick={() => handleToggleOcultar(p.id)}
                      title={isOculta ? "Reativar pergunta (tornar visível)" : "Ocultar pergunta"}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        isOculta
                          ? "border-amber-300 bg-amber-100/70 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200 hover:bg-amber-200"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {isOculta ? <Eye size={13} className="text-amber-700 dark:text-amber-300" /> : <EyeOff size={13} />}
                      <span>{isOculta ? "Reativar" : "Ocultar"}</span>
                    </button>

                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    {/* Mover para cima */}
                    <button
                      type="button"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      title="Mover para cima"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      <MoveUp size={14} />
                    </button>

                    {/* Mover para baixo */}
                    <button
                      type="button"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === perguntas.length - 1}
                      title="Mover para baixo"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      <MoveDown size={14} />
                    </button>

                    {/* Editar */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(p)}
                      title="Editar pergunta"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>

                    {/* Excluir permanente */}
                    <button
                      type="button"
                      onClick={() => handleDeletePergunta(p.id, p.titulo)}
                      title="Excluir pergunta definitivamente"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL: CRIAR / EDITAR PERGUNTA PERSONALIZADA ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList size={18} className={activeTipo === "eventos" ? "text-purple-600" : "text-emerald-600"} />
                <span>{editingPergunta ? "Editar Pergunta Complementar" : "Nova Pergunta Complementar"}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePerguntaModal} className="p-6 space-y-5">
              {/* Presets Rápidos */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  ⚡ Modelos Rápidos para {activeTipo === "eventos" ? "Eventos" : "Projetos"}:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => aplicarPreset("luta")}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 hover:brightness-95 transition-all cursor-pointer"
                  >
                    🥋 Categoria de Peso
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarPreset("corrida")}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 hover:brightness-95 transition-all cursor-pointer"
                  >
                    🏃 Distância da Prova (Km)
                  </button>
                  {activeTipo === "eventos" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => aplicarPreset("clube")}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 hover:brightness-95 transition-all cursor-pointer"
                      >
                        🏢 Equipe / Clube
                      </button>
                      <button
                        type="button"
                        onClick={() => aplicarPreset("camisa_kit")}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 hover:brightness-95 transition-all cursor-pointer"
                      >
                        🎽 Camiseta do Kit
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => aplicarPreset("nivel")}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 hover:brightness-95 transition-all cursor-pointer"
                    >
                      ⭐ Nível de Prática
                    </button>
                  )}
                </div>
              </div>

              {/* Título da Pergunta */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Título da Pergunta: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder={activeTipo === "eventos" ? "Ex.: Categoria de Peso / Faixa, Distância ou Equipe" : "Ex.: Categoria, Faixa, Posição de Jogo ou Modalidade"}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              {/* Modalidade Alvo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Aparece em qual Modalidade?
                </label>
                <select
                  value={formModalidade}
                  onChange={(e) => setFormModalidade(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="todas">🌐 Todas as modalidades deste {activeTipo === "eventos" ? "evento" : "projeto"}</option>
                  {modalidadesDisponiveis.map(m => (
                    <option key={m.id} value={m.id}>
                      🎯 Apenas na modalidade: {m.nome}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Selecione uma modalidade se a pergunta for específica (ex: categoria de luta, km de corrida).
                </p>
              </div>

              {/* Tipo de Campo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Formato de Resposta:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "select", label: "Lista (Select)", desc: "Menu suspenso" },
                    { id: "radio", label: "Botões (Rádio)", desc: "Múltipla escolha" },
                    { id: "text", label: "Texto Livre", desc: "Campo aberto" },
                    { id: "number", label: "Numérico", desc: "Apenas números" },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormTipo(t.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        formTipo === t.id
                          ? activeTipo === "eventos"
                            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500"
                            : "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opções de Resposta (Aparece se for Select ou Radio) */}
              {(formTipo === "select" || formTipo === "radio") && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Opções de Escolha: <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={novaOpcaoInput}
                      onChange={(e) => setNovaOpcaoInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddOpcao(); }}}
                      placeholder="Digite a opção (ex: 5 km, Até 70kg, etc.)"
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddOpcao}
                      className={`px-3 py-2 ${activeTipo === "eventos" ? "bg-purple-600 hover:bg-purple-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer`}
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>

                  {/* Lista de Opções Adicionadas */}
                  {formOpcoes.length === 0 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Nenhuma opção adicionada ainda.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formOpcoes.map((op, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-lg text-slate-800 dark:text-slate-200 shadow-2xs">
                          <span>{op}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOpcao(i)}
                            className="text-slate-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Texto de Ajuda (Hint) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Texto de Ajuda / Exemplo (Opcional):
                </label>
                <input
                  type="text"
                  value={formAjuda}
                  onChange={(e) => setFormAjuda(e.target.value)}
                  placeholder="Ex.: Selecione a categoria conforme a pesagem oficial no dia."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Configurações: Obrigatória e Ocultar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Preenchimento Obrigatório</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Inscrito deve responder.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formObrigatorio}
                    onChange={(e) => setFormObrigatorio(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                      <EyeOff size={12} /> Ocultar da Ficha
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">Não exibir aos inscritos agora.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formOculto}
                    onChange={(e) => setFormOculto(e.target.checked)}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white ${
                    activeTipo === "eventos" ? "bg-purple-600 hover:bg-purple-700" : "bg-emerald-600 hover:bg-emerald-700"
                  } shadow-sm cursor-pointer`}
                >
                  {editingPergunta ? "Atualizar Pergunta" : "Adicionar Pergunta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PRÉ-VISUALIZAÇÃO AO VIVO NA MATRÍCULA / INSCRIÇÃO ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye size={18} className={activeTipo === "eventos" ? "text-purple-600" : "text-emerald-600"} />
                  <span>Simulador: Visão do Participante ({activeTipo === "eventos" ? "Inscrição no Evento" : "Matrícula"})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Veja exatamente como as perguntas adicionais ativas aparecerão na tela do participante.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Simulador de Modalidade Escolhida */}
              <div className={`p-3 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                activeTipo === "eventos"
                  ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60"
                  : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60"
              }`}>
                <div>
                  <span className="font-bold block">Simular escolha da modalidade:</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Altere para testar o filtro por modalidade.</span>
                </div>
                <select
                  value={previewModalidadeFiltro}
                  onChange={(e) => setPreviewModalidadeFiltro(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 font-bold text-xs"
                >
                  <option value="todas">🌐 Todas as Modalidades</option>
                  {modalidadesDisponiveis.map(m => (
                    <option key={m.id} value={m.id}>
                      🎯 {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bloco Renderizado como na Ficha */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-700/60 pb-2 flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <span>Informações Complementares da Modalidade</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      {perguntasFiltradasPreview.length} campo(s) visíveis
                    </span>
                  </h4>

                  {totalOcultas > 0 && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <EyeOff size={12} /> {totalOcultas} oculta(s) no momento
                    </span>
                  )}
                </div>

                {perguntasFiltradasPreview.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    Nenhuma pergunta complementar visível para esta modalidade.
                  </p>
                ) : (
                  perguntasFiltradasPreview.map((p) => (
                    <div key={p.id} className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        {p.titulo} {p.obrigatorio && <span className="text-red-500">*</span>}
                      </label>
                      {p.ajuda && <div className="text-[11px] text-slate-500 dark:text-slate-400">💡 {p.ajuda}</div>}

                      {p.tipo === "select" && (
                        <select
                          value={previewRespostas[p.id] || ""}
                          onChange={(e) => setPreviewRespostas({ ...previewRespostas, [p.id]: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                        >
                          <option value="">Selecione uma opção...</option>
                          {p.opcoes.map((op, i) => (
                            <option key={i} value={op}>{op}</option>
                          ))}
                        </select>
                      )}

                      {p.tipo === "radio" && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {p.opcoes.map((op, i) => {
                            const isChecked = previewRespostas[p.id] === op;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setPreviewRespostas({ ...previewRespostas, [p.id]: op })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                  isChecked
                                    ? activeTipo === "eventos"
                                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                      : "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-500"
                                }`}
                              >
                                {op}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {p.tipo === "text" && (
                        <input
                          type="text"
                          value={previewRespostas[p.id] || ""}
                          onChange={(e) => setPreviewRespostas({ ...previewRespostas, [p.id]: e.target.value })}
                          placeholder="Digite sua resposta..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                        />
                      )}

                      {p.tipo === "number" && (
                        <input
                          type="number"
                          value={previewRespostas[p.id] || ""}
                          onChange={(e) => setPreviewRespostas({ ...previewRespostas, [p.id]: e.target.value })}
                          placeholder="0"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 cursor-pointer"
              >
                Fechar Simulador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTÃO LATERAL FIXO FLUTUANTE NO PC AO MODIFICAR ALGO ── */}
      {hasUnsavedChanges && (
        <div className="hidden md:flex fixed bottom-8 right-8 z-50 items-center gap-3.5 bg-slate-950/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl p-3.5 text-white animate-in fade-in slide-in-from-bottom-5 duration-300 ring-2 ring-emerald-500/30">
          <div className="flex items-center gap-2.5 pl-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div className="text-left pr-2">
              <p className="text-xs font-black tracking-tight text-white">Alterações não salvas</p>
              <p className="text-[11px] text-slate-300 font-medium">Lembre-se de salvar suas modificações</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={saving || !selectedProjetoId}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition-all cursor-pointer ${
              activeTipo === "eventos"
                ? "bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-purple-900/30"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-900/30"
            } disabled:opacity-50`}
          >
            <Save size={15} />
            <span>{saving ? "Salvando..." : "Salvar Alterações *"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
