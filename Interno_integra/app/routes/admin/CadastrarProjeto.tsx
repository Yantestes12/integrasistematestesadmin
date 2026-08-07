import React, { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, ArrowLeft, Check, AlertTriangle } from "lucide-react";

import { projetoSchema } from "./projetos/schema";
import type { ProjetoFormData } from "./projetos/schema";
import { useProjetoWebhook } from "./projetos/hooks/useProjetoWebhook";

import { IdentificacaoSection } from "./projetos/components/IdentificacaoSection";
import { VigenciaSection } from "./projetos/components/VigenciaSection";
import { PeriodosSection } from "./projetos/components/PeriodosSection";
import { LimitesSection } from "./projetos/components/LimitesSection";
import { FaixaEtariaSection } from "./projetos/components/FaixaEtariaSection";
import { ModalidadesSection } from "./projetos/components/ModalidadesSection";

import { isRouteErrorResponse } from "react-router";

export function ErrorBoundary({ error }: { error: unknown }) {
  console.error("ErrorBoundary caught:", error);
  let msg = "Unknown Error";
  if (error instanceof Error) msg = error.message;
  else if (isRouteErrorResponse(error)) msg = `${error.status} ${error.statusText}`;
  return (
    <div className="p-8 bg-red-50 text-red-700 rounded-lg shadow-sm border border-red-200">
      <h1 className="text-xl font-bold mb-2">Erro ao renderizar a página!</h1>
      <pre className="text-sm overflow-auto whitespace-pre-wrap">{msg}</pre>
    </div>
  );
}

export default function CadastrarProjeto() {
  const [searchParams] = useSearchParams();
  
  let editModeId = searchParams.get("edit");
  if (!editModeId && typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    editModeId = urlParams.get("edit");
  }

  const methods = useForm<ProjetoFormData>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      status: { ativo: true },
      periodos: [
        { id: Date.now() + 1, tipo: "planejamento", rotulo: "Iniciação", inicio: "", fim: "" },
        { id: Date.now() + 2, tipo: "avaliacao", rotulo: "1º Trimestre", inicio: "", fim: "" },
        { id: Date.now() + 3, tipo: "avaliacao", rotulo: "2º Trimestre", inicio: "", fim: "" },
        { id: Date.now() + 4, tipo: "avaliacao", rotulo: "3º Trimestre", inicio: "", fim: "" },
        { id: Date.now() + 5, tipo: "avaliacao", rotulo: "4º Trimestre", inicio: "", fim: "" }
      ],
      limites: {
        instrutoresPorNucleo: 0,
        auxiliaresPorNucleo: 0,
        coordGeral: 0,
        coordNucleo: 0,
        coordPedagogico: 0,
        supervisores: 0,
        vagasPorNucleo: 0,
        vagasPorAluno: 0,
      },
      limitesModalidade: [],
    }
  });

  const { isLoading, saveProjeto } = useProjetoWebhook(editModeId, methods.reset);

  const onSubmit = async (data: ProjetoFormData) => {
    try {
      await saveProjeto(editModeId, data);
      alert(editModeId ? "Iniciativa atualizada com sucesso!" : "Iniciativa cadastrada com sucesso!");
    } catch (error) {
      alert("Erro ao enviar para o N8N.");
    }
  };

  const vagasPorAluno = methods.watch("limites.vagasPorAluno");
  useEffect(() => {
    if (!vagasPorAluno || vagasPorAluno <= 0) {
      if (methods.getValues("status.ativo")) {
        methods.setValue("status.ativo", false, { shouldDirty: true });
      }
    }
  }, [vagasPorAluno, methods]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600 font-medium">Carregando dados da iniciativa...</span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
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

        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <IdentificacaoSection />
          <VigenciaSection />
          <PeriodosSection />
          <ModalidadesSection />
          <LimitesSection />
          <FaixaEtariaSection />

          {/* Status Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">Status</h2>
            
            {(!vagasPorAluno || vagasPorAluno <= 0) && (
              <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Para ativar a iniciativa, é necessário definir o limite de <strong>Vagas por Aluno</strong> na seção Aluno.</span>
              </div>
            )}
            
            <label className={`flex items-center justify-between w-full sm:max-w-xs p-4 border border-slate-200 rounded-xl bg-slate-50 transition-colors ${(!vagasPorAluno || vagasPorAluno <= 0) ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100"}`}>
              <span className="text-sm font-bold text-slate-700">
                {methods.watch("status.ativo") ? "Iniciativa Ativa" : "Iniciativa Inativa"}
              </span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  {...methods.register("status.ativo")} 
                  disabled={!vagasPorAluno || vagasPorAluno <= 0}
                  className="sr-only" 
                />
                <div 
                  className={`block w-14 h-8 rounded-full transition-colors ${methods.watch("status.ativo") ? "" : "bg-slate-300"}`}
                  style={methods.watch("status.ativo") ? { backgroundColor: "var(--theme-primary)" } : {}}
                ></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform shadow-sm ${methods.watch("status.ativo") ? "translate-x-6" : ""}`}></div>
              </div>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editModeId ? "Atualizar" : "Cadastrar Iniciativa"}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm border border-slate-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
