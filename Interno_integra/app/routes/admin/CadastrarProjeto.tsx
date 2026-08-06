import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { 
  FolderPlus, ArrowLeft, Calendar, Users, Layers, ShieldAlert, Plus, Trash2, Check, GripVertical, Settings2, X
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


function SortableModItem({ id, nome, isAtivo, onToggle, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm mb-2 group">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 font-medium text-slate-700 text-sm">{nome}</div>
      {children}
      <button type="button" onClick={onToggle} className={"p-1.5 rounded-md transition-colors " + (isAtivo ? "text-red-500 hover:bg-red-50" : "text-emerald-500 hover:bg-emerald-50")}>
        {isAtivo ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>
    </div>
  );
}

const getInitialEditId = () => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("edit");
  }
  return null;
};

export default function CadastrarProjeto() {
  // 1. Identificação e Documentação
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [numeroProposta, setNumeroProposta] = useState("");
  const [termoFomento, setTermoFomento] = useState("");
  const [numeroProcessoAdm, setNumeroProcessoAdm] = useState("");
  const [numeroTransfereGov, setNumeroTransfereGov] = useState("");
  const [aplicabilidade, setAplicabilidade] = useState("");
  const [descricao, setDescricao] = useState("");

  // 2. Vigência
  const [dataInicioVigencia, setDataInicioVigencia] = useState("");
  const [dataTerminoVigencia, setDataTerminoVigencia] = useState("");

  // 3. Limites de Integrantes e Vagas
  const [limites, setLimites] = useState({
    instrutoresPorNucleo: 0,
    auxiliaresPorNucleo: 0,
    coordGeral: 0,
    coordNucleo: 0,
    coordPedagogico: 0,
    supervisores: 0,
    vagasPorNucleo: 0,
    nucleosMaximos: 0,
    vagasPorAluno: 0,
  });

  // 4. Faixa Etária
  const [idadeMinima, setIdadeMinima] = useState("");
  const [idadeMaxima, setIdadeMaxima] = useState("");

  // 5. Limites de Núcleos por Modalidade
  const [limitesModalidade, setLimitesModalidade] = useState<any[]>([]);
  const [modalidadesDisponiveis, setModalidadesDisponiveis] = useState<any[]>([]);
  const [selectedModalidadeId, setSelectedModalidadeId] = useState("");
  const [isModManagerOpen, setIsModManagerOpen] = useState(false);
  const [editingModId, setEditingModId] = useState<any>(null);
  const [newModName, setNewModName] = useState("");
  const [searchParams] = useSearchParams();
  const editModeId = searchParams.get("edit");

  // 6. Períodos do Projeto
  const [periodos, setPeriodos] = useState([
    { id: 1, tipo: "Iniciação", rotulo: "", inicio: "", fim: "" },
  ]);

  // 7. Status
  const [projetoAtivo, setProjetoAtivo] = useState(true);

  // Helper para formatar qualquer formato de data (ISO, BR DD/MM/YYYY, etc) para YYYY-MM-DD exigido pelo <input type="date">
  const formatDateForInput = (val: any) => {
    if (!val) return "";
    let str = String(val).trim();
    if (str.includes("T")) str = str.split("T")[0];
    if (str.includes(" ")) str = str.split(" ")[0];
    
    // Se vier no formato brasileiro DD/MM/YYYY ou DD-MM-YYYY
    if (str.includes("/")) {
      const parts = str.split("/");
      if (parts.length === 3 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    if (str.includes("-")) {
      const parts = str.split("-");
      if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return str;
  };

  // Carregar dados se for edição
  useEffect(() => {
    const editId = editModeId;
    if (!editId) return;

    const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    const n8nEndpoint = `https://w.ibrase.com.br/webhook/projetos-get?instituto=${authInstitute}&_t=${new Date().getTime()}`;

    fetch(n8nEndpoint, { cache: "no-store", headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" } })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Workflow was started" || (Array.isArray(data) && data[0]?.message === "Workflow was started")) {
          return; // ignora se não retornou os dados reais
        }
        
        // Pega todos os itens e encontra o correto
        let flatList: any[] = [];
        let list = Array.isArray(data) ? data : (data.json ? (Array.isArray(data.json) ? data.json : [data.json]) : [data]);
        list.forEach((entry: any) => {
          if (entry && entry.json) {
            if (Array.isArray(entry.json)) flatList.push(...entry.json);
            else flatList.push(entry.json);
          } else if (Array.isArray(entry)) {
            flatList.push(...entry);
          } else {
            flatList.push(entry);
          }
        });

        const item = flatList.find(i => String(i.id || i.id_projeto || i.id_iniciativa) === String(editId));
        if (item) {
          // Preencher campos de identificação
          setNomeProjeto(item.identificacao?.nomeProjeto || item.nome || item.nome_projeto || item.nomeProjeto || item.name || item.titulo || "");
          setNumeroProposta(item.identificacao?.numeroProposta || item.numero_proposta || item.numeroProposta || "");
          setTermoFomento(item.identificacao?.termoFomento || item.termo_fomento || item.termoFomento || "");
          setNumeroProcessoAdm(item.identificacao?.numeroProcessoAdm || item.numero_processo_adm || item.numeroProcessoAdm || "");
          setNumeroTransfereGov(item.identificacao?.numeroTransfereGov || item.numero_transferegov || item.numeroTransfereGov || "");
          setAplicabilidade(item.identificacao?.aplicabilidade || item.aplicabilidade || "");
          setDescricao(item.identificacao?.descricao || item.descricao || "");

          // Datas de vigência devidamente formatadas para input date (testando todas as variações possíveis de chave)
          const rawInicio = item.vigencia_inicio || item.vigenciainicio || item.data_inicio_vigencia || item.data_inicio || item.dataInicioVigencia || item.vigencia?.dataInicio || item.vigencia?.inicio || "";
          const rawTermino = item.vigencia_fim || item.vigencia_termino || item.vigenciatermino || item.data_termino_vigencia || item.data_fim || item.dataTerminoVigencia || item.vigencia?.dataTermino || item.vigencia?.fim || "";
          setDataInicioVigencia(formatDateForInput(rawInicio));
          setDataTerminoVigencia(formatDateForInput(rawTermino));

          // Limites e Vagas (mapeando colunas reais do Supabase: qtd_instrutor, qtd_coord_geral, qtd_coord_nucleo, etc)
          if (item.limitesMembros) {
            setLimites(item.limitesMembros);
          } else {
            setLimites({
              instrutoresPorNucleo: item.qtd_instrutor || item.instrutores_por_nucleo || item.instrutoresPorNucleo || 0,
              auxiliaresPorNucleo: item.limite_auxiliares || item.auxiliares_por_nucleo || item.auxiliaresPorNucleo || 0,
              coordGeral: item.qtd_coord_geral || item.coord_geral || item.coordGeral || 0,
              coordNucleo: item.qtd_coord_nucleo || item.coord_nucleo || item.coordNucleo || 0,
              coordPedagogico: item.qtd_coord_pedagogico || item.coord_pedagogico || item.coordPedagogico || 0,
              supervisores: item.qtd_supervisores || item.supervisores || 0,
              vagasPorNucleo: item.vagas_de_nucleo || item.vagas_por_nucleo || item.vagasPorNucleo || 0,
              nucleosMaximos: item.nucleos_maximos || item.nucleosMaximos || 0,
              vagasPorAluno: item.vagas_por_aluno || item.vagas_de_aluno || item.vagasPorAluno || 0,
            });
          }

          setIdadeMinima(item.faixaEtaria?.idadeMinima || item.idade_min || item.idade_minima || item.idadeMinima || "");
          setIdadeMaxima(item.faixaEtaria?.idadeMaxima || item.idade_max || item.idade_maxima || item.idadeMaxima || "");

          const parseModalidades = (raw: any) => {
            if (!raw) return null;
            if (Array.isArray(raw)) return raw;
            if (typeof raw === 'string') {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
              } catch(e) {}
            }
            return null;
          };

          const loadedModalidades = 
            parseModalidades(item.limites_modalidade) || 
            parseModalidades(item.limites_modalidades) || 
            parseModalidades(item.limitesModalidade) || 
            parseModalidades(item.limitesModalidades);

          if (loadedModalidades) {
            setLimitesModalidade(loadedModalidades);
          } else {
            const legacy: any[] = [];
            if (item.modalidade_funcional) legacy.push({ id: "legacy_1", nome: "Funcional", limite: item.modalidade_funcional });
            if (item.modalidade_futebol) legacy.push({ id: "legacy_2", nome: "Futebol", limite: item.modalidade_futebol });
            if (item.modalidade_luta) legacy.push({ id: "legacy_3", nome: "Luta", limite: item.modalidade_luta });
            if (item.modalidade_projeto_de_aula) legacy.push({ id: "legacy_4", nome: "Projeto de Aula", limite: item.modalidade_projeto_de_aula });
            if (item.modalidade_eventos) legacy.push({ id: "legacy_5", nome: "Eventos", limite: item.modalidade_eventos });
            setLimitesModalidade(legacy);
          }

          if (item.periodos && Array.isArray(item.periodos) && item.periodos.length > 0) {
            setPeriodos(item.periodos);
          } else if (item.periodos_json) {
            try {
              const parsed = typeof item.periodos_json === 'string' ? JSON.parse(item.periodos_json) : item.periodos_json;
              if (Array.isArray(parsed) && parsed.length > 0) setPeriodos(parsed);
            } catch(e) {}
          }

          if (item.status?.ativo !== undefined) {
            setProjetoAtivo(item.status.ativo);
          } else if (item.ativo !== undefined) {
            // Conversão caso ativo venha como 0/1, false/true, etc
            setProjetoAtivo(item.ativo === 1 || item.ativo === "1" || item.ativo === true || item.ativo === "true");
          }
        }
      })
      .catch((err) => console.error("Erro ao buscar dados do projeto:", err));
  }, [editModeId]);

  // Carregar modalidades disponíveis
  useEffect(() => {
    const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    const modEndpoint = `https://w.ibrase.com.br/webhook/modalidades-get?instituto=${authInstitute}`;
    fetch(modEndpoint)
      .then(res => res.json())
      .then(data => {
        if (data.message === "Workflow was started" || (Array.isArray(data) && data[0]?.message === "Workflow was started")) return;
        let flatList: any[] = [];
        let list = Array.isArray(data) ? data : (data.json ? (Array.isArray(data.json) ? data.json : [data.json]) : [data]);
        list.forEach((entry: any) => {
          if (entry && entry.json) {
            if (Array.isArray(entry.json)) flatList.push(...entry.json);
            else flatList.push(entry.json);
          } else if (Array.isArray(entry)) {
            flatList.push(...entry);
          } else {
            flatList.push(entry);
          }
        });
        setModalidadesDisponiveis(flatList);
      })
      .catch(console.error);
  }, []);

  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    const isActiveInAtivos = limitesModalidade.some((m: any) => String(m.id) === String(activeId));
    const isOverInAtivos = overId === 'droppable-ativos' || limitesModalidade.some((m: any) => String(m.id) === String(overId));

    if (!isActiveInAtivos && isOverInAtivos) {
      const mod = modalidadesDisponiveis.find((m: any) => String(m.id) === String(activeId));
      if (mod) {
        setLimitesModalidade([...limitesModalidade, { id: mod.id, nome: mod.nome, limite: 0 }]);
      }
    } else if (isActiveInAtivos && !isOverInAtivos && overId === 'droppable-disponiveis') {
      setLimitesModalidade(limitesModalidade.filter((m: any) => String(m.id) !== String(activeId)));
    }
  };

  const toggleModalidade = (mod: any) => {
    const isActive = limitesModalidade.some((m: any) => String(m.id) === String(mod.id));
    if (isActive) {
      setLimitesModalidade(limitesModalidade.filter((m: any) => String(m.id) !== String(mod.id)));
    } else {
      setLimitesModalidade([...limitesModalidade, { id: mod.id, nome: mod.nome, limite: 0 }]);
    }
  };

  const handleSaveModalidade = async () => {
    if (!newModName.trim()) return;
    const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    
    try {
      if (editingModId) {
        const putEndpoint = `https://w.ibrase.com.br/webhook/modalidades-put?instituto=${authInstitute}`;
        await fetch(putEndpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingModId, nome: newModName, ativo: 1 })
        });
        setModalidadesDisponiveis(modalidadesDisponiveis.map((m: any) => String(m.id) === String(editingModId) ? { ...m, nome: newModName } : m));
        setLimitesModalidade(limitesModalidade.map((m: any) => String(m.id) === String(editingModId) ? { ...m, nome: newModName } : m));
      } else {
        const postEndpoint = `https://w.ibrase.com.br/webhook/modalidades-post?instituto=${authInstitute}`;
        await fetch(postEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: newModName, ativo: 1 })
        });
        const getEndpoint = `https://w.ibrase.com.br/webhook/modalidades-get?instituto=${authInstitute}`;
        const res = await fetch(getEndpoint);
        const data = await res.json();
        let flatList: any[] = [];
        let list = Array.isArray(data) ? data : (data.json ? (Array.isArray(data.json) ? data.json : [data.json]) : [data]);
        list.forEach((entry: any) => {
          if (entry && entry.json) {
            if (Array.isArray(entry.json)) flatList.push(...entry.json);
            else flatList.push(entry.json);
          } else if (Array.isArray(entry)) {
            flatList.push(...entry);
          } else {
            flatList.push(entry);
          }
        });
        setModalidadesDisponiveis(flatList);
      }
      setEditingModId(null);
      setNewModName("");
    } catch(e) {
      alert("Erro ao salvar modalidade.");
    }
  };

  const handleDeleteModalidade = async (id: any) => {
    if (!confirm("Tem certeza que deseja deletar esta modalidade global?")) return;
    const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    const delEndpoint = `https://w.ibrase.com.br/webhook/modalidades-delete?instituto=${authInstitute}`;
    try {
      await fetch(delEndpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      setModalidadesDisponiveis(modalidadesDisponiveis.filter((m: any) => String(m.id) !== String(id)));
      setLimitesModalidade(limitesModalidade.filter((m: any) => String(m.id) !== String(id)));
    } catch(e) {
      alert("Erro ao deletar modalidade.");
    }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparando o Payload no padrão perfeito para N8N / Supabase (Campos Planos + Aninhados)
    const payload: any = {
      nome_projeto: nomeProjeto,
      numero_proposta: numeroProposta,
      termo_fomento: termoFomento,
      numero_processo_adm: numeroProcessoAdm,
      numero_transferegov: numeroTransfereGov,
      aplicabilidade: aplicabilidade,
      descricao: descricao,
      
      vigencia_inicio: dataInicioVigencia,
      vigencia_termino: dataTerminoVigencia,
      vigencia_fim: dataTerminoVigencia,
      
      instrutores_por_nucleo: limites.instrutoresPorNucleo,
      qtd_instrutor: limites.instrutoresPorNucleo,
      auxiliares_por_nucleo: limites.auxiliaresPorNucleo,
      limite_auxiliares: limites.auxiliaresPorNucleo,
      coord_geral: limites.coordGeral,
      qtd_coord_geral: limites.coordGeral,
      coord_nucleo: limites.coordNucleo,
      qtd_coord_nucleo: limites.coordNucleo,
      coord_pedagogico: limites.coordPedagogico,
      qtd_coord_pedagogico: limites.coordPedagogico,
      supervisores: limites.supervisores,
      qtd_supervisores: limites.supervisores,
      vagas_por_nucleo: limites.vagasPorNucleo,
      vagas_de_nucleo: limites.vagasPorNucleo,
      nucleos_maximos: limites.nucleosMaximos,
      vagas_por_aluno: limites.vagasPorAluno,
      vagas_de_aluno: limites.vagasPorAluno,
      
      idade_minima: idadeMinima ? Number(idadeMinima) : null,
      idade_maxima: idadeMaxima ? Number(idadeMaxima) : null,
      idade_min: idadeMinima ? Number(idadeMinima) : null,
      idade_max: idadeMaxima ? Number(idadeMaxima) : null,
      
      limites_modalidade: limitesModalidade,
      limites_modalidades: limitesModalidade,
      periodos_json: periodos,
      ativo: projetoAtivo ? 1 : 0,

      // Aninhados retrocompatíveis
      identificacao: {
        nomeProjeto,
        numeroProposta,
        termoFomento,
        numeroProcessoAdm,
        numeroTransfereGov,
        aplicabilidade,
        descricao,
      },
      vigencia: {
        dataInicio: dataInicioVigencia,
        dataTermino: dataTerminoVigencia,
      },
      limitesMembros: limites,
      faixaEtaria: {
        idadeMinima: idadeMinima ? Number(idadeMinima) : null,
        idadeMaxima: idadeMaxima ? Number(idadeMaxima) : null,
      },
      limitesModalidade,
      periodos,
      status: {
        ativo: projetoAtivo,
      }
    };

    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const editId = editModeId;
      
      const webhookUrl = editId 
        ? `https://w.ibrase.com.br/webhook/projetos-put?instituto=${authInstitute}` 
        : `https://w.ibrase.com.br/webhook/projetos-post?instituto=${authInstitute}`;
      
      if (editId) {
        payload.id = editId;
      }
      
      const response = await fetch(webhookUrl, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao enviar dados para o N8N.");
      
      alert(editId ? "Iniciativa atualizada com sucesso!" : "Iniciativa cadastrada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar para o N8N.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderPlus className="w-7 h-7 text-blue-600" />
            {editModeId ? "Atualizar Iniciativa" : "Cadastrar Iniciativa"}
          </h1>
          <p className="text-slate-500 text-sm">
            Campos marcados com <span className="text-red-500 font-bold">*</span> são obrigatórios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a lista
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Identificação e Documentação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Iniciativa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: PROMOV"
                value={nomeProjeto}
                onChange={(e) => setNomeProjeto(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Proposta
              </label>
              <input
                type="text"
                placeholder="Ex.: 12345/2026"
                value={numeroProposta}
                onChange={(e) => setNumeroProposta(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Termo de Fomento
              </label>
              <input
                type="text"
                placeholder="Ex.: Termo nº 805/2024"
                value={termoFomento}
                onChange={(e) => setTermoFomento(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número do Processo Administrativo
              </label>
              <input
                type="text"
                placeholder="Ex.: 48000.00123/2026"
                value={numeroProcessoAdm}
                onChange={(e) => setNumeroProcessoAdm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número do Transfere gov
              </label>
              <input
                type="text"
                placeholder="Ex.: 941234/2026"
                value={numeroTransfereGov}
                onChange={(e) => setNumeroTransfereGov(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qual aplicabilidade? <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={aplicabilidade}
                onChange={(e) => setAplicabilidade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="Projeto de aula">Projeto de aula</option>
                <option value="Evento">Evento</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              placeholder="Opcional..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* VIGÊNCIA DA INICIATIVA */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Vigência da Iniciativa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Início da Vigência
              </label>
              <input
                type="date"
                value={dataInicioVigencia}
                onChange={(e) => setDataInicioVigencia(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Término da Vigência
              </label>
              <input
                type="date"
                value={dataTerminoVigencia}
                onChange={(e) => setDataTerminoVigencia(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Deixe em branco para projeto sem prazo definido.
              </span>
            </div>
          </div>
        </div>

        {/* SEÇÃO 6: PERÍODOS DA INICIATIVA */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Períodos da Iniciativa</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure as janelas de <strong>Iniciação</strong> e <strong>Trimestre</strong>. Elas serão utilizadas para construir o histórico e a linha do tempo da ocupação das vagas. A ordem de exibição segue a sequência da tabela abaixo.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Rótulo *</th>
                  <th className="p-3">Início *</th>
                  <th className="p-3">Fim *</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {periodos.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 w-44">
                      <select
                        value={p.tipo}
                        onChange={(e) => handleUpdatePeriodo(p.id, "tipo", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Iniciação">Iniciação</option>
                        <option value="1º Trimestre">1º Trimestre</option>
                        <option value="2º Trimestre">2º Trimestre</option>
                        <option value="3º Trimestre">3º Trimestre</option>
                        <option value="4º Trimestre">4º Trimestre</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Nome do período..."
                        value={p.rotulo}
                        onChange={(e) => handleUpdatePeriodo(p.id, "rotulo", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 w-44">
                      <input
                        type="date"
                        value={p.inicio}
                        onChange={(e) => handleUpdatePeriodo(p.id, "inicio", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 w-44">
                      <input
                        type="date"
                        value={p.fim}
                        onChange={(e) => handleUpdatePeriodo(p.id, "fim", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 text-center w-12">
                      <button
                        type="button"
                        onClick={() => handleRemovePeriodo(p.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Remover período"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddPeriodo}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-xs border border-dashed border-blue-300 px-3 py-2 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar período
          </button>
        </div>

        {/* CONFIGURAÇÕES DE LIMITES DE MEMBROS DA EQUIPE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Configurações de Limites de Membros da Equipe
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aqui devem ser definidas as quantidade máximas de colaboradores para cada cargo dentro do projeto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Instrutores por Núcleo
              </label>
              <input
                type="number"
                min="0"
                value={limites.instrutoresPorNucleo}
                onChange={(e) => setLimites({ ...limites, instrutoresPorNucleo: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Auxiliares por Núcleo
              </label>
              <input
                type="number"
                min="0"
                value={limites.auxiliaresPorNucleo}
                onChange={(e) => setLimites({ ...limites, auxiliaresPorNucleo: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Coord. Geral
              </label>
              <input
                type="number"
                min="0"
                value={limites.coordGeral}
                onChange={(e) => setLimites({ ...limites, coordGeral: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Coord. Núcleo
              </label>
              <input
                type="number"
                min="0"
                value={limites.coordNucleo}
                onChange={(e) => setLimites({ ...limites, coordNucleo: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Coord. Pedagogicos
              </label>
              <input
                type="number"
                min="0"
                value={limites.coordPedagogico}
                onChange={(e) => setLimites({ ...limites, coordPedagogico: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Supervisores
              </label>
              <input
                type="number"
                min="0"
                value={limites.supervisores}
onChange={(e) => setLimites({ ...limites, supervisores: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>
        </div>

        {/* CONFIGURAÇÕES DE VAGAS E NÚCLEOS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Configurações de Vagas e Núcleos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina a quantidade máxima de núcleos e a capacidade de alunos para esta iniciativa.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-blue-50/50 p-3 rounded-lg border-2 border-blue-200">
              <label className="block text-xs font-bold text-blue-800 mb-1">
                Vagas de Núcleo
              </label>
              <input
                type="number"
                min="0"
                value={limites.nucleosMaximos}
                onChange={(e) => setLimites({ ...limites, nucleosMaximos: Number(e.target.value) })}
                className="w-full bg-white border border-blue-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] font-medium text-blue-600 mt-1 block leading-tight">
                * quantidade de núcleos máximos que podem ser criados
              </span>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-lg border-2 border-emerald-200">
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                Vagas por Aluno
              </label>
              <input
                type="number"
                min="0"
                value={limites.vagasPorAluno}
                onChange={(e) => setLimites({ ...limites, vagasPorAluno: Number(e.target.value) })}
                className="w-full bg-white border border-emerald-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] font-medium text-emerald-600 mt-1 block leading-tight">
                * coloque a quantidade de alunos que pode ter em cada núcleo
              </span>
            </div>
          </div>
        </div>

        {/* FAIXA ETÁRIA */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Faixa Etária
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Idade mínima
              </label>
              <input
                type="number"
                placeholder="Ex.: 7"
                value={idadeMinima}
                onChange={(e) => setIdadeMinima(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Idade máxima
              </label>
              <input
                type="number"
                placeholder="Ex.: 17"
                value={idadeMaxima}
                onChange={(e) => setIdadeMaxima(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Deixe em branco para sem limite.
              </span>
            </div>
          </div>
        </div>

        
        {/* LIMITES DE NÚCLEOS POR MODALIDADE (DRAG AND DROP) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Limites de Núcleos por Modalidade
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Arraste as modalidades ou clique em ➕/➖ para ativá-las neste projeto. Defina o <strong>Máximo de núcleos ativos</strong> para cada uma.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModManagerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors border border-slate-300"
            >
              <Settings2 className="w-4 h-4" />
              Gerenciar Modalidades
            </button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Disponíveis */}
              <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 min-h-[300px]">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  Modalidades Disponíveis
                  <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">
                    {modalidadesDisponiveis.filter((m: any) => !limitesModalidade.some((l: any) => String(l.id) === String(m.id))).length}
                  </span>
                </h3>
                <SortableContext id="droppable-disponiveis" items={modalidadesDisponiveis.map((m: any) => String(m.id))} strategy={verticalListSortingStrategy}>
                  {modalidadesDisponiveis
                    .filter((m: any) => !limitesModalidade.some((l: any) => String(l.id) === String(m.id)))
                    .map((m: any) => (
                      <SortableModItem key={m.id} id={String(m.id)} nome={m.nome} isAtivo={false} onToggle={() => toggleModalidade(m)} />
                    ))
                  }
                  {modalidadesDisponiveis.filter((m: any) => !limitesModalidade.some((l: any) => String(l.id) === String(m.id))).length === 0 && (
                    <div className="text-center p-6 text-sm text-slate-400 italic">Todas as modalidades já estão ativas.</div>
                  )}
                </SortableContext>
              </div>

              {/* Ativas */}
              <div className="bg-blue-50/30 p-4 rounded-xl border border-solid border-blue-200 min-h-[300px]">
                <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                  Modalidades Ativas no Projeto
                  <span className="bg-blue-200 text-blue-800 text-[10px] px-2 py-0.5 rounded-full">
                    {limitesModalidade.length}
                  </span>
                </h3>
                <SortableContext id="droppable-ativos" items={limitesModalidade.map((m: any) => String(m.id))} strategy={verticalListSortingStrategy}>
                  {limitesModalidade.map((m: any, index: number) => (
                    <SortableModItem key={m.id} id={String(m.id)} nome={m.nome} isAtivo={true} onToggle={() => toggleModalidade(m)}>
                      <div className="flex flex-col items-end mr-2">
                        <label className="text-[10px] font-bold text-blue-600 mb-0.5 uppercase tracking-wider">Máx Núcleos</label>
                        <input
                          type="number"
                          min="0"
                          value={m.limite}
                          onChange={(e) => handleUpdateLimiteModalidade(index, Number(e.target.value))}
                          className="w-20 text-center bg-white border border-blue-300 rounded-md p-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </SortableModItem>
                  ))}
                  {limitesModalidade.length === 0 && (
                    <div className="text-center p-6 text-sm text-slate-400 italic">Arraste modalidades para cá.</div>
                  )}
                </SortableContext>
              </div>
            </div>
          </DndContext>
        </div>


        <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2">
            <Check className="w-5 h-5" />
            {editModeId ? "Atualizar" : "Cadastrar Iniciativa"}
          </button>
        </div>

      </form>

      {/* MODAL DE GERENCIAR MODALIDADES */}
      {isModManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                Gerenciar Modalidades
              </h3>
              <button onClick={() => setIsModManagerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700">
                  {editingModId ? "Editar Modalidade" : "Nova Modalidade"}
                </h4>
                <input
                  type="text"
                  placeholder="Nome da Modalidade"
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2">
                  {editingModId && (
                    <button type="button" onClick={() => { setEditingModId(null); setNewModName(""); }} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium">
                      Cancelar Edição
                    </button>
                  )}
                  <button type="button" onClick={handleSaveModalidade} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                    {editingModId ? "Salvar" : "Criar Nova"}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Modalidades Existentes</h4>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {modalidadesDisponiveis.map((mod: any) => (
                    <div key={mod.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{mod.nome}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setEditingModId(mod.id); setNewModName(mod.nome || ""); }} className="text-blue-500 hover:text-blue-700 p-1">
                          Editar
                        </button>
                        <button type="button" onClick={() => {/* handle delete se tiver */}} className="text-red-500 hover:text-red-700 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
