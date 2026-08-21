import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router";
import * as z from "zod";
import { ArrowLeft, Save, MapPin, Building2, Loader2, Award, User, AlertCircle } from "lucide-react";

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
  instrutor: z.string().optional(),
  
  // Vigência e Status
  ativo: z.boolean().default(false),
  aceitandoVagas: z.boolean().default(false),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

type CadastrarNucleoFormData = z.infer<typeof cadastrarNucleoSchema>;

import type { Resolver } from "react-hook-form";

// Resolver customizado
const customZodResolver = (schema: z.ZodSchema): Resolver<any> => async (values: any) => {
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

  const flattenResponse = (data: any): any[] => {
    if (!data) return [];
    let list: any[] = Array.isArray(data) ? data : data.data || data.items || (data.json ? (Array.isArray(data.json) ? data.json : [data.json]) : [data]);
    if (!Array.isArray(list)) list = [list];
    let flat: any[] = [];
    list.forEach((entry: any) => {
      if (!entry) return;
      if (entry?.json) Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
      else flat.push(entry);
    });
    return flat.filter(item => item !== null && item !== undefined);
  };

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
            const flatN = flattenResponse(nData);
            flatN.forEach((n: any) => { 
              if (n && n.espaco_id && String(n.id) !== editId) {
                nMap[String(n.espaco_id)] = n.nome || n.nome_nucleo || `Núcleo ${n.id}`; 
              } 
            });
          }
        } catch (e) {
          console.warn("Erro ao fazer parse dos núcleos no fetchEspacos:", e);
        }
      }
      if (resE.ok) {
        const textE = await resE.text();
        if (textE) {
          try {
            const data = JSON.parse(textE);
            setEspacos(flattenResponse(data).map((e: any) => ({ ...e, nucleo_nome: nMap[String(e.id)] })));
          } catch(e) {
            console.warn("Erro json espacos:", e);
          }
        }
      }
    } catch (e) { console.warn("Erro espacos:", e); }
  };

  const fetchProjetos = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst.toUpperCase()}`, { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setProjetos(flattenResponse(data));
        }
      }
    } catch (e) { console.warn("Erro projetos:", e); }
  };

  const fetchModalidades = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${inst.toUpperCase()}`, { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setModalidades(flattenResponse(data));
        }
      }
    } catch (e) { console.warn("Erro modalidades:", e); }
  };

  const fetchNucleos = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst.toUpperCase()}`, { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          if (data.message === "Workflow was started" || data.error) {
             setNucleosExistentes([]);
             return;
          }
          const flatList = flattenResponse(data);
          setNucleosExistentes(flatList.filter(n => n !== null && n !== undefined));
        }
      }
    } catch (e) { console.warn("Erro nucleos:", e); }
  };

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setValue: setFormValue, reset } = useForm<CadastrarNucleoFormData>({
    resolver: customZodResolver(cadastrarNucleoSchema),
    defaultValues: {
      ativo: false,
      aceitandoVagas: false,
      numeroVaga: "1",
      vagas: "100",
    },
  });

  const projetoIdWatch = watch("projetoId");
  const espacoIdWatch = watch("espacoId");
  const numeroVagaWatch = watch("numeroVaga");

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
    // Apenas Espaços APROVADOS (não pendentes) podem ser selecionados para virar Núcleo
    const apenasAprovados = espacos.filter(e => e && e.status_aprovacao !== "pendente");
    if (!projetoIdWatch) return apenasAprovados;
    return apenasAprovados.filter(e => 
      e && (String(e.projeto_id) === String(projetoIdWatch) || String(e.id) === String(espacoIdWatch))
    );
  }, [espacos, projetoIdWatch, espacoIdWatch]);

  const selectedEspaco = useMemo(() => {
    if (!espacoIdWatch) return null;
    return espacos.find(e => e && String(e.id) === String(espacoIdWatch));
  }, [espacos, espacoIdWatch]);

  const getModalidadeNome = (espaco: any) => {
    if (!espaco) return "—";
    if (espaco.modalidade_nome && espaco.modalidade_nome !== "—") return espaco.modalidade_nome;
    if (espaco.modalidades?.nome) return espaco.modalidades.nome;
    if (espaco.modalidade) return espaco.modalidade;
    if (espaco.modalidade_id) {
      const mod = modalidades.find(m => m && String(m.id) === String(espaco.modalidade_id));
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

  const getProjVagas = (proj: any) => {
    if (!proj) return [];
    try {
      const rawNew = proj.vagas_nucleo || proj.vagasNucleo;
      let parsed = typeof rawNew === 'string' ? JSON.parse(rawNew) : (Array.isArray(rawNew) ? rawNew : []);
      if (parsed.length > 0 && parsed[0].numero !== undefined) return parsed;
      
      const rawOld = proj.limites_modalidades || proj.limitesModalidades || proj.limites_modalidade;
      let legacy = typeof rawOld === 'string' ? JSON.parse(rawOld) : (Array.isArray(rawOld) ? rawOld : []);
      const converted: any[] = [];
      let slot = 1;
      legacy.forEach((item: any) => {
        const lim = Number(item.limite) || 0;
        for (let i = 0; i < lim; i++) converted.push({ numero: slot++, modalidadeId: String(item.id || ""), modalidadeNome: item.nome || "Modalidade Legada" });
      });
      return converted;
    } catch(e) { return []; }
  };

  // Auto-seleciona a menor vaga (slot) de núcleo livre no projeto
  useEffect(() => {
    if (editId) return;
    const proj = projetos.find(p => p && String(p.id) === String(projetoIdWatch));
    if (proj) {
      const projVagas = getProjVagas(proj);
      const firstFree = projVagas.find((v: any) => !vagasOcupadasNoProjeto[v.numero]);
      if (firstFree) {
        setFormValue("numeroVaga", String(firstFree.numero));
        setFormValue("modalidadeId", String(firstFree.modalidadeId));
      }
    }
  }, [projetoIdWatch, vagasOcupadasNoProjeto, editId, setFormValue, projetos]);

  useEffect(() => {
    if (editId) {
      const fetchNucleo = async () => {
        try {
          const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
          const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${authInstitute}`, { cache: "no-store" });
          if (res.ok) {
            const text = await res.text();
            if (!text) return;
            const data = JSON.parse(text);
            if (data.message === "Workflow was started" || data.error) return;

            const flatList = flattenResponse(data);

            const nucleo = flatList.find(n => n && String(n.id || n.id_nucleo) === editId);

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
                instrutor: nucleo.instrutor || nucleo.resp_nome || "",
                dataInicio: nucleo.data_inicio || "",
                dataFim: nucleo.data_fim || "",
                ativo: nucleo.ativo !== false && nucleo.ativo !== 0 && nucleo.ativo !== "0",
                aceitandoVagas: nucleo.aceitando_vagas === true || nucleo.aceitando_vagas === "true" || nucleo.aceitando_vagas === 1,
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

  const onSubmit = async (data: any) => {
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
      if (data.modalidadeId) {
        formData.append("modalidade_id", data.modalidadeId);
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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {editId ? "Editar Núcleo Operacional" : "Cadastrar Novo Núcleo Operacional"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Vincule um Espaço Físico Aprovado a uma Proposta para ativar um Núcleo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/nucleos")}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a lista
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* IDENTIFICAÇÃO E LOCALIZAÇÃO GERAL */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Alocação do Núcleo</h2>
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
                {filteredEspacos.map(e => {
                  const isCurrent = editId && String(espacoIdWatch) === String(e.id);
                  return (
                    <option key={e.id} value={e.id} disabled={!!e.nucleo_nome}>
                      {e.nome} {e.bairro ? `(${e.bairro})` : ""} {e.nucleo_nome ? `— 🔴 Ocupado (${e.nucleo_nome})` : (isCurrent ? "— 🔵 Em Uso (Atual)" : "— 🟢 Disponível")}
                    </option>
                  );
                })}
              </select>
              {errors.espacoId && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.espacoId.message}</span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Selecione a Vaga da Proposta <span className="text-red-500">*</span></span>
              </label>
              <input type="hidden" {...register("numeroVaga")} />
              <input type="hidden" {...register("modalidadeId")} />
              <select
                value={numeroVagaWatch || ""}
                onChange={e => {
                  const val = e.target.value;
                  setFormValue("numeroVaga", val);
                  if (val) {
                    const proj = projetos.find(p => p && String(p.id) === String(projetoIdWatch));
                    const projVagas = getProjVagas(proj);
                    const selectedVaga = projVagas.find((v: any) => String(v.numero) === val);
                    if (selectedVaga) {
                      setFormValue("modalidadeId", String(selectedVaga.modalidadeId));
                    }
                  }
                }}
                disabled={!projetoIdWatch}
                className="w-full bg-indigo-50/50 border border-indigo-200 rounded-lg p-2.5 text-sm font-extrabold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {!projetoIdWatch ? (
                  <option value="">Selecione primeiro o Projeto acima...</option>
                ) : (
                  <>
                    <option value="">Selecione uma vaga...</option>
                    {(() => {
                      const proj = projetos.find(p => p && String(p.id) === String(projetoIdWatch));
                      if (!proj) return null;
                      const projVagas = getProjVagas(proj);
                      
                      return projVagas.map((v: any) => {
                        const ocupadoPor = vagasOcupadasNoProjeto[v.numero];
                        const isCurrent = editId && String(numeroVagaWatch) === String(v.numero);
                        return (
                          <option key={v.numero} value={v.numero} disabled={!!ocupadoPor}>
                            Vaga Nº {v.numero} — {v.modalidadeNome} {ocupadoPor ? `(🔴 Ocupada por: ${ocupadoPor})` : (isCurrent ? "(🔵 Em Uso - Atual)" : "(🟢 Livre)")}
                          </option>
                        );
                      });
                    })()}
                  </>
                )}
              </select>
              {errors.numeroVaga && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.numeroVaga.message}</span>
              )}
              {projetoIdWatch && (() => {
                const proj = projetos.find(p => p && String(p.id) === String(projetoIdWatch));
                const projVagas = getProjVagas(proj);
                if (projVagas.length === 0) {
                  return (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-red-700 font-medium">
                        Esta proposta não possui vagas configuradas. Configure as vagas na aba de Propostas.
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

          {/* INSTRUTOR DO NÚCLEO */}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5 mt-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Nome do Instrutor Responsável</span>
            </label>
            <input
              type="text"
              {...register("instrutor")}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              placeholder="Ex: João da Silva (Opcional)"
            />
          </div>



          {/* CARD DE INFORMAÇÕES AUTOMÁTICAS HERDADAS DO ESPAÇO */}
          {selectedEspaco && (
            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 space-y-3 mt-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Informações Herdadas do Espaço Físico</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-slate-700 shadow-2xs">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Nome do Núcleo:</span>
                  <span className="font-extrabold text-indigo-700 text-sm">{selectedEspaco.nome}</span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-slate-700 shadow-2xs">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Local / Bairro:</span>
                  <span className="font-extrabold text-slate-800 text-sm">{[selectedEspaco.bairro, selectedEspaco.cidade].filter(Boolean).join(" · ") || "—"}</span>
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
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg w-full flex items-start gap-3">
              <input type="hidden" {...register("ativo")} />
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                <AlertCircle size={18} />
              </div>
              <div>
                <span className="text-sm font-extrabold text-amber-900 block mb-0.5">Núcleo Iniciará Pausado</span>
                <span className="text-xs text-amber-700 font-medium">Por padrão, todo novo núcleo começa desativado. Apenas o setor Pedagógico tem a permissão de iniciar (dar play) nas inscrições deste núcleo no painel de gestão.</span>
              </div>
            </div>
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