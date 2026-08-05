import type { Route } from "./+types/Dashboard";
import { GraduationCap, ArrowRight, Layers } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Sistema Integra" },
    { name: "description", content: "Painel de Controle e Gestão de Iniciativas" },
  ];
}

export default function Dashboard() {
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");

  useEffect(() => {
    const saved = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(saved);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pt-2 pb-12">
      
      {/* Título de Página Limpo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-[var(--theme-primary)]" />
            Módulo de Gestão
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Selecione a área para gerenciar os núcleos, matrículas, equipes e registros do instituto <strong className="text-slate-700">{currentInstitute}</strong>.
          </p>
        </div>
      </div>

      {/* Caixa Única e Direta de Iniciativas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-[var(--theme-primary)] flex items-center justify-center shrink-0 border border-blue-100">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Iniciativas</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Gerenciamento completo dos núcleos educacionais e esportivos, controle de matrículas, turmas, presenças e registros.
              </p>
            </div>
          </div>
        </div>

        {/* Resumo de Funcionalidades */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 text-center">
            Matrículas &amp; Vagas
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 text-center">
            Núcleos Ativos
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 text-center">
            Diários de Presença
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 text-center">
            Equipes &amp; Relatórios
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Link 
            to="/admin/iniciativas"
            className="inline-flex items-center gap-2 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all text-sm"
          >
            <span>Acessar Iniciativas</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

    </div>
  );
}