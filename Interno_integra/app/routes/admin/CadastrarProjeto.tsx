import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
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
  let focusPendenciasStr = searchParams.get("focus_pendencias");
  if (!editModeId && typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    editModeId = urlParams.get("edit");
    focusPendenciasStr = urlParams.get("focus_pendencias");
  }
  
  const focusList = focusPendenciasStr ? focusPendenciasStr.split(',') : [];

  const mapLabelToSection = (label: string) => {
    if (['Nº Proposta', 'Termo de Fomento', 'Processo Adm', 'Transfere.gov', 'Aplicabilidade'].includes(label)) return 'identificacao';
    if (label === 'Início da Vigência') return 'vigencia';
    if (label === 'Períodos') return 'periodos';
    if (label === 'Equipe') return 'equipe';
    return '';
  };

  const sectionsToHighlight = Array.from(new Set(focusList.map(mapLabelToSection).filter(Boolean)));

  const methods = useForm<ProjetoFormData>({
    resolver: zodResolver(projetoSchema) as any,
    defaultValues: {
      status: { ativo: true },
      periodos: [],
      limites: {
        vagasPorNucleo: 0,
        vagasPorAluno: 0,
      },
      vagasNucleo: [],
    }
  });

  const { isLoading, saveProjeto } = useProjetoWebhook(editModeId, methods.reset);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      await saveProjeto(editModeId, data);
      alert(editModeId ? "Proposta atualizada com sucesso!" : "Proposta cadastrada com sucesso!");
      navigate("/admin/propostas");
    } catch (error) {
      alert("Erro ao enviar para o N8N.");
    }
  };

  const vagasPorAluno = methods.watch("limites.vagasPorAluno");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600 font-medium">Carregando dados da proposta...</span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FolderPlus className="w-7 h-7 text-blue-600" />
              {editModeId ? "Atualizar Proposta" : "Cadastrar Proposta"}
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
          <div id="section-identificacao">
            <IdentificacaoSection />
          </div>
          
          <div id="section-vigencia">
            <VigenciaSection />
          </div>
          
          <div id="section-periodos">
            <PeriodosSection />
          </div>
          
          <ModalidadesSection />
          
          <div id="section-equipe">
            <LimitesSection />
          </div>
          
          <FaixaEtariaSection />

          {/* Status Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">Status da Proposta</h2>
            
            <label className="flex items-center justify-between w-full sm:max-w-xs p-4 border border-slate-200 rounded-xl bg-slate-50 transition-colors cursor-pointer hover:bg-slate-100">
              <span className="text-sm font-bold text-slate-700">
                {methods.watch("status.ativo") ? "Proposta Ativa" : "Proposta Inativa"}
              </span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  {...methods.register("status.ativo")} 
                  className="sr-only" 
                />
                <div 
                  className={`block w-14 h-8 rounded-full transition-colors ${methods.watch("status.ativo") ? "" : "bg-slate-300"}`}
                  style={methods.watch("status.ativo") ? { backgroundColor: "var(--theme-primary)" } : {}}
                ></div>
                <div className={`dot absolute left-1 top-1 bg-white dark:bg-slate-800 w-6 h-6 rounded-full transition-transform shadow-sm ${methods.watch("status.ativo") ? "translate-x-6" : ""}`}></div>
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
              {editModeId ? "Atualizar" : "Cadastrar Proposta"}
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

      {/* Barra Fixa de Pendências (Guia Rápido) */}
      {focusList.length > 0 && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-white dark:bg-slate-900 border-2 border-red-500 rounded-2xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Pendências Detectadas</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            Clique nos botões abaixo para rolar até as seções que precisam ser corrigidas:
          </p>
          <div className="flex flex-wrap gap-2">
            {sectionsToHighlight.map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  const el = document.getElementById(`section-${sec}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Adiciona um piscar extra
                    el.classList.add('bg-red-50');
                    setTimeout(() => el.classList.remove('bg-red-50'), 1000);
                  }
                }}
                className="text-xs font-bold px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-300 rounded-lg transition-colors capitalize"
              >
                {sec === 'identificacao' ? 'Identificação' : sec === 'vigencia' ? 'Vigência' : sec === 'periodos' ? 'Períodos' : 'Equipe'}
              </button>
            ))}
          </div>
        </div>
      )}
    </FormProvider>
  );
}
