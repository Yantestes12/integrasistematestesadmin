import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router";
import * as z from "zod";
import { ArrowLeft, Save, MapPin, User, FileText, Building2, Search, Loader2 } from "lucide-react";

// 1. Schemas de Validação (Zod)
const cadastrarNucleoSchema = z.object({
  // Identificação
  nomeNucleo: z.string().min(1, "Nome do núcleo é obrigatório"),
  espacoId: z.string().optional(),
  projetoId: z.string().min(1, "Selecione uma iniciativa"),
  modalidadeId: z.string().optional(),
  cidadeId: z.string().optional(),
  uf: z.string().optional(),
  bairroId: z.string().optional(),
  numeroVaga: z.string().optional(),
  
  // Vigência e Status
  ativo: z.boolean().default(true),
  aceitandoVagas: z.boolean().default(true),

  // Vínculos da Equipe
  coordenadorId: z.string().optional(),
  instrutorId: z.string().optional(),
  auxiliaresIds: z.array(z.string()).optional(),
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

  useEffect(() => {
    const savedInst = localStorage.getItem("auth_institute") || "IBRASE";
    fetchEspacos(savedInst);
    fetchProjetos(savedInst);
    fetchModalidades(savedInst);
  }, []);

  const fetchEspacos = async (inst: string) => {
    try {
      const [resE, resN] = await Promise.all([
        fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${inst.toUpperCase()}`),
        fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst.toUpperCase()}`).catch(() => null)
      ]);
      let nMap: Record<string, string> = {};
      if (resN && resN.ok) {
        const nData = await resN.json();
        const list = Array.isArray(nData) ? nData : nData.data || [nData];
        list.forEach((n: any) => { if (n.espaco_id) nMap[String(n.espaco_id)] = n.nome; });
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
      const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [data];
        setProjetos(list);
      }
    } catch (e) { console.warn("Erro projetos:", e); }
  };

  const fetchModalidades = async (inst: string) => {
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${inst.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [data];
        setModalidades(list);
      }
    } catch (e) { console.warn("Erro modalidades:", e); }
  };

  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [isSearchingCpf, setIsSearchingCpf] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setValue: setFormValue, getValues: getFormValues, reset } = useForm<CadastrarNucleoFormData>({
    resolver: customZodResolver(cadastrarNucleoSchema),
    defaultValues: {
      ativo: true,
      possuiCnpj: "N",
    },
  });

  const possuiCnpjWatch = watch("possuiCnpj");

  useEffect(() => {
    if (editId) {
      const fetchNucleo = async () => {
        try {
          const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
          const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${authInstitute}`);
          if (res.ok) {
            const data = await res.json();
            let list = Array.isArray(data) ? data : data.data || data.items || (Array.isArray(data.json) ? data.json : [data.json]);
            
            // Tratamento extra caso retorne { json: [...] } aninhado
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
                projetoId: String(nucleo.projeto_id || ""),
                modalidadeId: String(nucleo.modalidade_id || ""),
                cidadeId: String(nucleo.cidade_id || ""),
                uf: nucleo.uf || "",
                bairroId: String(nucleo.bairro_id || ""),
                numeroVaga: String(nucleo.numero_vaga || "1"),
                dataInicio: nucleo.data_inicio || "",
                dataFim: nucleo.data_fim || "",
                ativo: nucleo.ativo !== false && nucleo.ativo !== 0 && nucleo.ativo !== "0",
                respNome: nucleo.coordenador_nome_real || nucleo.coordenador || nucleo.resp_nome || "",
                respCpf: nucleo.coordenador_cpf || nucleo.resp_cpf || "",
                respEmail: nucleo.coordenador_email || nucleo.resp_email || "",
                respTelefone: nucleo.telefone || nucleo.resp_telefone || "",
                possuiCnpj: nucleo.cnpj ? "S" : "N",
                cnpj: nucleo.cnpj || "",
                cep: nucleo.cep || "",
                rua: nucleo.rua || nucleo.logradouro || (nucleo.endereco ? nucleo.endereco.split(",")[0] : ""),
                numero: nucleo.numero || "",
                bairroEnd: nucleo.bairro_end || nucleo.bairro_nome || "",
                referencia: nucleo.referencia || "",
                coordenadorId: String(nucleo.coordenador_id || ""),
                instrutorId: String(nucleo.instrutor_id || ""),
                // auxiliaresIds viriam como array, o n8n ou PHP legado salva no nucleo_colaboradores, se o get trouxer:
                auxiliaresIds: Array.isArray(nucleo.auxiliares_ids) ? nucleo.auxiliares_ids.map(String) : [],
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

  const handleBuscarCep = async () => {
    const cepAtual = getFormValues("cep");
    if (!cepAtual || cepAtual.replace(/\D/g, '').length !== 8) {
      alert("Por favor, digite um CEP válido com 8 dígitos.");
      return;
    }

    setIsSearchingCep(true);
    try {
      const cleanCep = cepAtual.replace(/\D/g, '');
      const res = await fetch(`https://w.ibrase.com.br/webhook/consultarcep?cep=${cleanCep}`);
      
      if (res.ok) {
        const data = await res.json();
        
        // Tratar formato Hub do Desenvolvedor ou ViaCEP
        const address = data.result || data;

        if (address && !address.erro) {
          if (address.logradouro) setFormValue("rua", address.logradouro);
          if (address.bairro) setFormValue("bairroEnd", address.bairro);
          // Podemos expandir se quisermos preencher cidade e estado globais aqui
        } else {
          alert("CEP não encontrado.");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao buscar o CEP.");
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleBuscarCnpj = async () => {
    const cnpj = getFormValues("cnpj");
    if (!cnpj || cnpj.length < 14) {
      alert("Por favor, digite um CNPJ válido.");
      return;
    }

    setIsSearchingCnpj(true);
    try {
      const cleanCnpj = cnpj.replace(/\D/g, "");
      const res = await fetch(`https://w.ibrase.com.br/webhook/consultarcnpj?cnpj=${cleanCnpj}`);
      
      if (res.ok) {
        const data = await res.json();
        const result = data.result || data;

        if (result && result.nome) {
          // Preenche o nome do núcleo com a Razão Social
          setFormValue("nomeNucleo", result.nome);
        } else {
          alert("CNPJ não encontrado ou sem razão social.");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao buscar o CNPJ.");
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleBuscarCpf = async () => {
    const cpf = getFormValues("respCpf");
    if (!cpf || cpf.length < 11) {
      alert("Por favor, digite um CPF válido.");
      return;
    }

    setIsSearchingCpf(true);
    try {
      const cleanCpf = cpf.replace(/\D/g, "");
      const res = await fetch(`https://w.ibrase.com.br/webhook/api-hub-cpf?cpf=${cleanCpf}`);
      
      if (res.ok) {
        const data = await res.json();
        const result = data.result || data;

        if (result && result.nome) {
          // Preenche o nome do responsável com o nome retornado
          setFormValue("respNome", result.nome);
        } else {
          alert("CPF não encontrado.");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao buscar o CPF.");
    } finally {
      setIsSearchingCpf(false);
    }
  };

  const onSubmit = async (data: CadastrarNucleoFormData) => {
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      
      // Define a URL correta com base se é Edição ou Criação
      const webhookUrl = editId 
        ? `https://w.ibrase.com.br/webhook/nucleos-put?instituto=${authInstitute}`
        : `https://w.ibrase.com.br/webhook/nucleos-post?instituto=${authInstitute}`;

      const formData = new FormData();
      if (editId) formData.append("id", editId); // Envia o ID para o update

      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof FileList) {
          if (value.length > 0) {
            formData.append(key, value[0]); 
          }
        } else if (Array.isArray(value)) {
          // Se for array (ex: auxiliaresIds), envia como JSON string
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(webhookUrl, {
        method: editId ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar dados.");
      }
      
      const responseData = await response.json();
      if (responseData.message === "Workflow was started" || responseData[0]?.message === "Workflow was started") {
         // Silencioso
      }
      
      alert(editId ? "Núcleo atualizado com sucesso!" : "Núcleo cadastrado com sucesso!");
      navigate("/admin/nucleos");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar para o N8N.");
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
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{editId ? "Editar Núcleo" : "Novo Núcleo"}</h1>
          <p className="text-slate-500 text-sm mt-1">
            Preencha os dados abaixo para {editId ? "editar" : "registrar"} um núcleo. Campos com{" "}
            <span className="text-red-500">*</span> são obrigatórios.
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
            <h2 className="text-base font-bold text-slate-800">Identificação e Localização Geral</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Núcleo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("nomeNucleo")}
                placeholder="Ex.: Núcleo Esperança"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.nomeNucleo && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.nomeNucleo.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Iniciativa (filtra modalidade e vagas) <span className="text-red-500">*</span>
              </label>
              <select
                {...register("projetoId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione uma iniciativa...</option>
                {projetos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              {errors.projetoId && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.projetoId.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selecione o Espaço (Local Físico Cadastrado) <span className="text-red-500">*</span>
              </label>
              <select
                {...register("espacoId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione um espaço físico...</option>
                {espacos.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nome} {e.bairro ? `(${e.bairro})` : ""} {e.nucleo_nome ? "— 🟢 Em Uso" : "— ⚪ Disponível"}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                O endereço, CEP e responsável são vinculados automaticamente a partir do Espaço.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modalidade (Opcional)
              </label>
              <select
                {...register("modalidadeId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione uma modalidade...</option>
                {modalidades.map(m => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* EQUIPE DO NÚCLEO */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">Equipe do Núcleo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coordenador(a) do Núcleo
              </label>
              <select
                {...register("coordenadorId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione um coordenador...</option>
                <option value="1">João Silva (Coordenador)</option>
                <option value="2">Maria Oliveira (Coordenadora)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instrutor(a)
              </label>
              <select
                {...register("instrutorId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione um instrutor...</option>
                <option value="3">Carlos Santos (Instrutor)</option>
                <option value="4">Ana Paula (Instrutora)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Auxiliares (Múltipla escolha)
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { id: "5", nome: "Pedro Alves", cargo: "Auxiliar Administrativo" },
                  { id: "6", nome: "Fernanda Costa", cargo: "Auxiliar de Campo" },
                  { id: "7", nome: "Roberto Mendes", cargo: "Auxiliar Geral" },
                ].map(aux => (
                  <label key={aux.id} className="flex items-start gap-2 p-2 bg-white border border-slate-100 rounded-md cursor-pointer hover:border-indigo-300 transition-colors">
                    <input 
                      type="checkbox" 
                      value={aux.id}
                      {...register("auxiliaresIds")}
                      className="mt-0.5 w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 leading-tight">{aux.nome}</span>
                      <span className="text-[10px] text-slate-500 leading-tight">{aux.cargo}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Selecione os auxiliares que estarão vinculados a este núcleo. (A lista vem do N8N).</span>
          </div>
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

        {/* DADOS DO RESPONSÁVEL */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">Dados do Responsável</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("respNome")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.respNome && <span className="text-[11px] text-red-500 mt-1 block">{errors.respNome.message}</span>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CPF <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("respCpf")}
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-12 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="button" 
                  onClick={handleBuscarCpf}
                  disabled={isSearchingCpf}
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
                  title="Buscar Nome pelo CPF"
                >
                  {isSearchingCpf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
              {errors.respCpf && <span className="text-[11px] text-red-500 mt-1 block">{errors.respCpf.message}</span>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("respEmail")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.respEmail && <span className="text-[11px] text-red-500 mt-1 block">{errors.respEmail.message}</span>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("respTelefone")}
                placeholder="(00) 00000-0000"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.respTelefone && <span className="text-[11px] text-red-500 mt-1 block">{errors.respTelefone.message}</span>}
            </div>
          </div>
        </div>

        {/* LOCAL DE EXECUÇÃO */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">Local de Execução (Endereço)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">O espaço possui CNPJ?</label>
              <select
                {...register("possuiCnpj")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="S">Sim</option>
                <option value="N">Não</option>
              </select>
            </div>
            
            {possuiCnpjWatch === "S" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CNPJ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("cnpj")}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-12 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    type="button" 
                    onClick={handleBuscarCnpj}
                    disabled={isSearchingCnpj}
                    className="absolute right-1 top-1 bottom-1 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
                    title="Buscar Razão Social"
                  >
                    {isSearchingCnpj ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CEP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("cep")}
                  placeholder="00000-000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-12 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="button" 
                  onClick={handleBuscarCep}
                  disabled={isSearchingCep}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-md transition-colors disabled:opacity-50"
                  title="Buscar CEP"
                >
                  {isSearchingCep ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
              {errors.cep && <span className="text-[11px] text-red-500 mt-1 block">{errors.cep.message}</span>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rua / Logradouro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("rua")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.rua && <span className="text-[11px] text-red-500 mt-1 block">{errors.rua.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("numero")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.numero && <span className="text-[11px] text-red-500 mt-1 block">{errors.numero.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bairro (endereço) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("bairroEnd")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.bairroEnd && <span className="text-[11px] text-red-500 mt-1 block">{errors.bairroEnd.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ponto de Referência (opcional)</label>
            <input
              type="text"
              {...register("referencia")}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* DOCUMENTOS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">Documentos e Fotos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Foto com Localização (GPS)</label>
              <input
                type="file"
                accept="image/*"
                {...register("fotoLocalizacao")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Termo de Uso (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                {...register("termoUso")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* BOTOES */}
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
            onClick={() => window.history.back()}
            className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}