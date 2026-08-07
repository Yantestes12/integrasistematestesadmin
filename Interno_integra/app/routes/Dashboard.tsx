import type { Route } from "./+types/Dashboard";
import { GraduationCap, ArrowRight, Layers, Building2, ChevronRight } from "lucide-react";
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
    <div className="space-y-6 max-w-6xl mx-auto pt-2 pb-12 font-sans">
      
      {/* Banner / Cabeçalho da Página */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-slate-200">
              {currentInstitute}
            </span>
            <span className="text-slate-400 text-xs">• Módulo Principal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[var(--theme-primary)]" />
            Módulo de Gestão
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Selecione a área para gerenciar os núcleos, matrículas, equipes e registros do instituto <strong className="text-slate-700">{currentInstitute}</strong>.
          </p>
        </div>
      </div>

      {/* Grid de Cards: No Celular é Retângulo (1 col), no PC vira Quadrados/Grid (2 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card Iniciativas (Quadrado no PC, Retângulo no Celular) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 group min-h-[260px]">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[var(--theme-primary)] flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Módulo 01
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 group-hover:text-[var(--theme-primary)] transition-colors">
              Iniciativas
            </h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Gerenciamento completo dos núcleos educacionais e esportivos, controle de matrículas, turmas, presenças e registros.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Projetos & Atividades</span>
            <Link 
              to="/admin/iniciativas"
              className="inline-flex items-center gap-2 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm group-hover:translate-x-1"
            >
              <span>Acessar</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Card Núcleos (Quadrado no PC, Retângulo no Celular) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 group min-h-[260px]">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Módulo 02
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Núcleos
            </h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Cadastro e manutenção das unidades físicas, locais de atendimento, endereços, coordenadores e instrutores vinculados.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Unidades de Atendimento</span>
            <Link 
              to="/admin/nucleos"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm group-hover:translate-x-1"
            >
              <span>Acessar</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}