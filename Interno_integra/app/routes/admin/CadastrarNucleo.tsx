import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Save, MapPin, User, FileText, Building2 } from "lucide-react";

// 1. Schemas de Validação (Zod)
const cadastrarNucleoSchema = z.object({
  // Identificação
  nomeNucleo: z.string().min(1, "Nome do núcleo é obrigatório"),
  projetoId: z.string().min(1, "Selecione uma iniciativa"),
  modalidadeId: z.string().min(1, "Selecione uma modalidade"),
  cidadeId: z.string().min(1, "Selecione a cidade"),
  uf: z.string().min(1, "Selecione a UF"),
  bairroId: z.string().min(1, "Selecione o bairro"),
  numeroVaga: z.string().min(1, "Selecione o número da vaga global"),
  
  // Vigência e Status
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  ativo: z.boolean().default(true),

  // Dados do Responsável
  respNome: z.string().min(1, "Nome do responsável é obrigatório"),
  respCpf: z.string().min(1, "CPF do responsável é obrigatório"),
  respEmail: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  respTelefone: z.string().min(1, "Telefone é obrigatório"),

  // Local de Execução
  possuiCnpj: z.enum(["S", "N"]).default("N"),
  cnpj: z.string().optional(),
  cep: z.string().min(1, "CEP é obrigatório"),
  rua: z.string().min(1, "Rua/Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  bairroEnd: z.string().min(1, "Bairro (Endereço) é obrigatório"),
  referencia: z.string().optional(),

  // Documentos
  fotoLocalizacao: z.custom<FileList>().optional(),
  termoUso: z.custom<FileList>().optional(),
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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CadastrarNucleoFormData>({
    resolver: customZodResolver(cadastrarNucleoSchema),
    defaultValues: {
      ativo: true,
      possuiCnpj: "N",
    },
  });

  const possuiCnpjWatch = watch("possuiCnpj");

  const onSubmit = async (data: CadastrarNucleoFormData) => {
    console.log("PAYLOAD PRONTO PARA O N8N (NÚCLEO):", JSON.stringify(data, null, 2));

    try {
      // Mock da chamada para Webhook do N8N ou API Supabase
      /*
      const response = await fetch("SUA_URL_DO_WEBHOOK_NUCLEOS_AQUI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erro ao enviar dados.");
      */
      
      alert("Núcleo cadastrado com sucesso! (Payload gerado no Console)");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar para o N8N.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cadastrar Núcleo</h1>
          <p className="text-slate-500 text-sm mt-1">
            Preencha os dados abaixo para registrar um novo núcleo. Campos com{" "}
            <span className="text-red-500">*</span> são obrigatórios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
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
                <option value="">Selecione...</option>
                <option value="1">PROMOV 2026</option>
                <option value="2">Projeto Educar</option>
              </select>
              {errors.projetoId && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.projetoId.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modalidade <span className="text-red-500">*</span>
              </label>
              <select
                {...register("modalidadeId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione...</option>
                <option value="futebol">Futebol</option>
                <option value="funcional">Funcional</option>
                <option value="lutas">Lutas</option>
                <option value="projeto_aula">Projeto de Aula</option>
                <option value="eventos">Eventos</option>
              </select>
              {errors.modalidadeId && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.modalidadeId.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cidade <span className="text-red-500">*</span>
              </label>
              <select
                {...register("cidadeId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione...</option>
                <option value="1">Brasília</option>
                <option value="2">São Paulo</option>
              </select>
              {errors.cidadeId && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.cidadeId.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                UF da Nova Cidade <span className="text-red-500">*</span>
              </label>
              <select
                {...register("uf")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione...</option>
                <option value="DF">DF</option>
                <option value="SP">SP</option>
              </select>
              {errors.uf && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.uf.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bairro <span className="text-red-500">*</span>
              </label>
              <select
                {...register("bairroId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione...</option>
                <option value="1">Asa Norte</option>
                <option value="2">Taguatinga</option>
              </select>
              {errors.bairroId && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.bairroId.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número da Vaga Global na Iniciativa <span className="text-red-500">*</span>
              </label>
              <select
                {...register("numeroVaga")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione...</option>
                <option value="1">Vaga 01</option>
                <option value="2">Vaga 02</option>
              </select>
              {errors.numeroVaga && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.numeroVaga.message}</span>
              )}
            </div>
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
              <input
                type="text"
                {...register("respCpf")}
                placeholder="000.000.000-00"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
                <input
                  type="text"
                  {...register("cnpj")}
                  placeholder="00.000.000/0000-00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CEP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("cep")}
                placeholder="00000-000"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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