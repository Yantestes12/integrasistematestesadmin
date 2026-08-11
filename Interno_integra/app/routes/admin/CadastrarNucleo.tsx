import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router";
import * as z from "zod";
import { ArrowLeft, Save, MapPin, Building2, Loader2, Award } from "lucide-react";

// Schemas de Validação (Zod)
const cadastrarNucleoSchema = z.object({
  // Identificação
  nomeNucleo: z.string().optional(),
  espacoId: z.string().min(1, "Selecione o espaço físico"),
  projetoId: z.string().min(1, "Selecione o projeto de aula/evento"),
  modalidadeId: z.string().optional(),
  cidadeId: z.string().optional(),
  uf: z.string().optional(),
  bairroId: z.string().optional(),
  numeroVaga: z.string().optional(),
  vagas: z.string().optional(),
  
  // Vigência e Status
  ativo: z.boolean().default(true),
  aceitandoVagas: z.boolean().default(true),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

type CadastrarNucleoFormData = z.infer<typeof cadastrarNucleoSchema>;

// Resolver customizado
const customZodResolver = (schema: z.ZodSchema) => async (values: any) => {
  const result = schema.safeParse(values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errors: Record<string, any> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = {
      type: issue.code,
      message: issue.message,
    };
  });

  return { values: {}, errors };
};

export default function CadastrarNucleo() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");
  const [isLoadingData, setIsLoadingData] = useState(!!editId);

  const [espacos, setEspacos] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [modalidades, setModalidades] = useState<any[]>([]);
  const [nucleosExistentes, setNucleosExistentes] = useState<any[]>([]);

  useEffect(() => {
    const savedInst = localStorage.getItem("auth_institute") || "IBRASE";
    fetchEspacos(savedInst);
    fetchProjetos(savedInst);
    fetchModalidades(savedInst);
    fetchNucleos(savedInst);
  }, []);

  const fetchEspacos = async (inst: string) => {
    try {
      const [resE, resN] = await Promise.all([
        fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${inst.toUpperCase()}`, { cache: "no-store" }),
        fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst.toUpperCase()}`, { cache: "no-store" }).catch(() => null)
      ]);
      let nMap: Record<string, string> = {};
      if (resN && resN.ok) {
        try {
          const nText = await resN.text();
          if (nText) {
            const nData = JSON.parse(nText);
            const list = Array.isArray(nData) ? nData : nData.data || [nData];
            list.forEach((n: any) => { if (n.espaco_id) nMap[String(n.espaco_id)] = n.nome; });
          }
        } catch (e) {
          console.warn("Erro ao fazer parse dos núcleos no fetchEspacos:", e);
        }
      }
      if (resE.ok) {
        const data = await resE.json();
        const list = Array.isArray(data) ? data : data.data || [data];
        setEspacos(list.map((e: any) => ({ ...e, nucleo_nome: nMap[String(e.id)] })));
      }
    } catch (e) { console.warn("Erro espacos:", e); }
  };

  const fetchProjetos = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst.toUpperCase()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [data];
        setProjetos(list);
      }
    } catch (e) { console.warn("Erro projetos:", e); }
  };

  const fetchModalidades = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${inst.toUpperCase()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [data];
        setModalidades(list);
      }
    } catch (e) { console.warn("Erro modalidades:", e); }
  };

  const fetchNucleos = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst.toUpperCase()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.message === "Workflow was started" || data.error) {
           setNucleosExistentes([]);
           return;
        }
        let list = Array.isArray(data) ? data : data.data || data.items || (data.json ? (Array.isArray(data.json) ? data.json : [data.json]) : [data]);
        let flatList: any[] = [];
        list.forEach((entry: any) => {
          if (!entry) return;
          if (entry && entry.json) {
            if (Array.isArray(entry.json)) flatList.push(...entry.json);
            else flatList.push(entry.json);
          } else flatList.push(entry);
        });
        setNucleosExistentes(flatList.filter(n => n !== null && n !== undefined));
      }
    } catch (e) { console.warn("Erro nucleos:", e); }
  };

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setValue: setFormValue, reset } = useForm<CadastrarNucleoFormData>({
    resolver: customZodResolver(cadastrarNucleoSchema),
    defaultValues: {
      ativo: true,
      numeroVaga: "1",
      vagas: "100",
    },
  });

  const projetoIdWatch = watch("projetoId");
  const espacoIdWatch = watch("espacoId");

  // Vagas ocupadas do projeto selecionado
  const vagasOcupadasNoProjeto = useMemo(() => {
    if (!projetoIdWatch) return {};
    const map: Record<number, string> = {};
    nucleosExistentes.forEach((n: any) => {
      if (String(n.projeto_id) === String(projetoIdWatch) && String(n.id) !== editId) {
        const vagaNumStr = n.numero_vaga ?? n.vaga_numero ?? n.vaga_alocada;
        if (vagaNumStr !== undefined && vagaNumStr !== null && vagaNumStr !== "") {
          const vagaNum = Number(vagaNumStr);
          if (!isNaN(vagaNum) && vagaNum > 0) {
            map[vagaNum] = n.nome || n.nome_nucleo || `Núcleo ID ${n.id}`;
          }
        }
      }
    });
    return map;
  }, [projetoIdWatch, nucleosExistentes, editId]);

  const filteredEspacos = useMemo(() => {
    // Apenas Espaços APROVADOS (não pendentes) podem ser selecionados para virar Núcleo, documentos pendentes agora são permitidos
    const apenasAprovados = espacos.filter(e => e.status_aprovacao !== "pendente");
    if (!projetoIdWatch) return apenasAprovados;
    return apenasAprovados.filter(e => String(e.projeto_id) === String(projetoIdWatch));
  }, [espacos, projetoIdWatch]);

  const selectedEspaco = useMemo(() => {
    if (!espacoIdWatch) return null;
    return espacos.find(e => String(e.id) === String(espacoIdWatch));
  }, [espacos, espacoIdWatch]);

  const getModalidadeNome = (espaco: any) => {
    if (!espaco) return "—";
    if (espaco.modalidade_nome && espaco.modalidade_nome !== "—") return espaco.modalidade_nome;
    if (espaco.modalidades?.nome) return espaco.modalidades.nome;
    if (espaco.modalidade) return espaco.modalidade;
    if (espaco.modalidade_id) {
      const mod = modalidades.find(m => String(m.id) === String(espaco.modalidade_id));
      if (mod?.nome) return mod.nome;
      return `Modalidade ID ${espaco.modalidade_id}`;
    }
    return "—";
  };

  useEffect(() => {
    if (selectedEspaco?.nome) {
      setFormValue("nomeNucleo", selectedEspaco.nome);
    }
  }, [selectedEspaco, setFormValue]);

  // Auto-seleciona a menor vaga (slot) de núcleo livre no projeto
  useEffect(() => {
    if (editId) return;
    let firstFree = 1;
    while (vagasOcupadasNoProjeto[firstFree]) {
      firstFree++;
    }
    setValue("numeroVaga", String(firstFree));
  }, [projetoIdWatch, vagasOcupadasNoProjeto, editId, setValue]);

  useEffect(() => {
    if (editId) {
      const fetchNucleo = async () => {
        try {
          const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
          const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${authInstitute}`, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            let list = Array.isArray(data) ? data : data.data || data.items || (Array.isArray(data.json) ? data.json : [data.json]);
            
            let flatList: any[] = [];
            list.forEach((entry: any) => {
              if (entry && entry.json) {
                if (Array.isArray(entry.json)) flatList.push(...entry.json);
                else flatList.push(entry.json);
              } else flatList.push(entry);
            });

            const nucleo = flatList.find(n => String(n.id || n.id_nucleo) === editId);

            if (nucleo) {
              reset({
                nomeNucleo: nucleo.nome || nucleo.nome_nucleo || "",
                espacoId: String(nucleo.espaco_id || ""),
                projetoId: String(nucleo.projeto_id || ""),
                modalidadeId: String(nucleo.modalidade_id || ""),
                cidadeId: String(nucleo.cidade_id || ""),
                uf: nucleo.uf || "",
                bairroId: String(nucleo.bairro_id || ""),
                numeroVaga: (nucleo.numero_vaga ?? nucleo.vaga_numero ?? nucleo.vaga_alocada ?? "") !== "" 
                              ? String(nucleo.numero_vaga ?? nucleo.vaga_numero ?? nucleo.vaga_alocada) 
                              : "1",
                vagas: String(nucleo.vagas || "100"),
                dataInicio: nucleo.data_inicio || "",
                dataFim: nucleo.data_fim || "",
                ativo: nucleo.ativo !== false && nucleo.ativo !== 0 && nucleo.ativo !== "0",
              });
            }
          }
        } catch (e) {
          console.error("Erro ao carregar dados do núcleo", e);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchNucleo();
    }
  }, [editId, reset]);

  const onSubmit = async (data: CadastrarNucleoFormData) => {
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      
      // Validação de Vaga de Núcleo Ocupada
      if (data.numeroVaga && vagasOcupadasNoProjeto[Number(data.numeroVaga)]) {
        alert(`A Vaga de Núcleo Nº ${data.numeroVaga} já está ocupada por "${vagasOcupadasNoProjeto[Number(data.numeroVaga)]}". Escolha uma vaga livre.`);
        return;
      }

      const webhookUrl = editId 
        ? `https://w.ibrase.com.br/webhook/nucleos-put?instituto=${authInstitute}`
        : `https://w.ibrase.com.br/webhook/nucleos-post?instituto=${authInstitute}`;

      const formData = new FormData();
      if (editId) formData.append("id", editId);

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Passa os campos específicos explícitos para o N8N
      if (data.numeroVaga) {
        formData.append("numero_vaga", data.numeroVaga);
      }
      if (data.vagas) {
        formData.append("vagas", data.vagas);
      }

      const response = await fetch(webhookUrl, {
        method: editId ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar dados.");
      }
      
      alert(editId ? "Núcleo atualizado com sucesso!" : "Núcleo cadastrado com sucesso!");
      navigate("/admin/nucleos");
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor para salvar núcleo.");
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Carregando dados do núcleo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      
      {/* Banner de Topo */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {editId ? "Editar Núcleo Operacional" : "Cadastrar Novo Núcleo Operacional"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Vincule um Espaço Físico Aprovado a uma Iniciativa para ativar um Núcleo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/nucleos")}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a lista
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* IDENTIFICAÇÃO E LOCALIZAÇÃO GERAL */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">Identificação e Localização do Núcleo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Projeto de Aula ou Evento <span className="text-red-500">*</span>
              </label>
              <select
                {...register("projetoId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">Selecione o projeto de aula/evento</option>
                {projetos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              {errors.projetoId && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.projetoId.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selecione o Espaço (Local Físico Aprovado) <span className="text-red-500">*</span>
              </label>
              <select
                {...register("espacoId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {!projetoIdWatch ? (
                  <option value="">Selecione primeiro o Projeto acima...</option>
                ) : filteredEspacos.length === 0 ? (
                  <option value="">Nenhum espaço aprovado disponível para este projeto</option>
                ) : (
                  <option value="">Selecione um espaço físico para este projeto...</option>
                )}
                {filteredEspacos.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nome} {e.bairro ? `(${e.bairro})` : ""} {e.nucleo_nome ? "— 🟢 Em Uso" : "— ⚪ Disponível"}
                  </option>
                ))}
              </select>
              {errors.espacoId && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.espacoId.message}</span>
              )}
            </div>
          </div>

          {/* SELETOR DE VAGA DO NÚCLEO (SLOT NO PROJETO) */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Número da Vaga do Núcleo (Alocação no Projeto)</span>
            </label>
            <select
              {...register("numeroVaga")}
              className="w-full bg-indigo-50/50 border border-indigo-200 rounded-lg p-2.5 text-sm font-extrabold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {(() => {
                const proj = projetos.find(p => String(p.id) === String(projetoIdWatch));
                let totalSlots = 20;
                if (proj) {
                  const limStr = proj.limites_modalidades || proj.limitesModalidades || proj.limites_modalidade;
                  if (limStr && limStr !== '[]') {
                    try {
                      const limArr = typeof limStr === 'string' ? JSON.parse(limStr) : limStr;
                      if (Array.isArray(limArr) && limArr.length > 0) {
                        totalSlots = limArr.reduce((acc, curr) => acc + (Number(curr.limite) || 0), 0);
                      }
                    } catch (e) { console.warn("Erro ao ler limites_modalidades:", e); }
                  }
                }
                const options = Array.from({ length: totalSlots > 0 ? totalSlots : 20 }, (_, i) => i + 1);
                
                return options.map(vaga => {
                  const ocupadoPor = vagasOcupadasNoProjeto[vaga];
                  return (
                    <option key={vaga} value={vaga} disabled={!!ocupadoPor}>
                      Vaga Nº {vaga} {ocupadoPor ? `— 🔴 Ocupada (${ocupadoPor})` : "— 🟢 Livre"}
                    </option>
                  );
                });
              })()}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Cada núcleo ocupa uma posição de Vaga única no projeto. Vagas já alocadas ficam bloqueadas para evitar duplicidade.
            </span>
          </div>



          {/* CARD DE INFORMAÇÕES AUTOMÁTICAS HERDADAS DO ESPAÇO */}
          {selectedEspaco && (
            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 space-y-3 mt-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Informações Herdadas do Espaço Físico</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Nome do Núcleo:</span>
                  <span className="font-extrabold text-indigo-700 text-sm">{selectedEspaco.nome}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Modalidade:</span>
                  <span className="font-extrabold text-slate-800 text-sm">{getModalidadeNome(selectedEspaco)}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Local / Bairro:</span>
                  <span className="font-extrabold text-slate-800 text-sm">{[selectedEspaco.bairro, selectedEspaco.cidade].filter(Boolean).join(" · ") || "—"}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Responsável Cedente:</span>
                  <span className="font-extrabold text-slate-800 text-sm">{selectedEspaco.resp_nome || "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* VIGÊNCIA E STATUS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Vigência e Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Início da Atividade</label>
              <input
                type="date"
                {...register("dataInicio")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              


              <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Encerramento</label>
              <input
                type="date"
                {...register("dataFim")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Opcional — deixe vazio para alocação em aberto.</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 p-3 border-1.5 border border-slate-200 rounded-lg bg-white cursor-pointer w-fit select-none hover:bg-slate-50 transition-colors">
              <input type="checkbox" {...register("ativo")} className="w-4 h-4 cursor-pointer text-indigo-600 focus:ring-indigo-500 rounded border-slate-300" />
              <span className="text-sm font-bold text-slate-800">Núcleo Ativo</span>
            </label>
          </div>
        </div>

        {/* BOTOES DE AÇÃO */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Salvar Núcleo
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/nucleos")}
            className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}