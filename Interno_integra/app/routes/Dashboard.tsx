import type { Route } from "./+types/Dashboard";
import { GraduationCap, ArrowRight, Layers, Building2, Home } from "lucide-react";
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
    <div className="space-y-8 max-w-6xl mx-auto pt-2 pb-12 font-sans">
      
      {/* Banner / Cabeçalho da Página */}
      <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="bg-slate-100 text-slate-800 px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-bold uppercase tracking-wider border border-slate-200">
              {currentInstitute}
            </span>
            <span className="text-slate-400 text-xs lg:text-sm font-medium">• Módulo Principal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[var(--theme-primary)]" />
            Módulo de Gestão
          </h1>
          <p className="text-slate-500 text-sm lg:text-base mt-2">
            Selecione a área para gerenciar os núcleos, matrículas, equipes e registros do instituto <strong className="text-slate-800">{currentInstitute}</strong>.
          </p>
        </div>
      </div>

      {/* Grid de Cards: Celular = 1 col, md = 2 cols, lg (PC) = 3 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Card 01 - Iniciativas */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-7 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 group min-h-[320px] h-full">
          <div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[var(--theme-primary)] flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Módulo 01
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 group-hover:text-[var(--theme-primary)] transition-colors">
              Iniciativas
            </h2>
            <p className="text-slate-500 text-sm lg:text-base mt-2 leading-relaxed">
              Crie e gerencie projetos de aula, eventos e iniciativas educacionais ou esportivas da instituição.
            </p>
          </div>

          <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs lg:text-sm font-semibold text-slate-500 truncate">Projetos & Eventos</span>
            <Link 
              to="/admin/iniciativas"
              className="inline-flex items-center gap-2 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm shrink-0 group-hover:translate-x-1"
            >
              <span>Acessar</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Card 02 - Espaços */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-7 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 group min-h-[320px] h-full">
          <div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100 group-hover:scale-105 transition-transform">
                <Home className="w-7 h-7" />
              </div>
              <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Módulo 02
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 group-hover:text-violet-600 transition-colors">
              Espaços
            </h2>
            <p className="text-slate-500 text-sm lg:text-base mt-2 leading-relaxed">
              Mapeamento dos locais físicos nos bairros, dados do cedente/responsável e termos de uso.
            </p>
          </div>

          <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs lg:text-sm font-semibold text-slate-500 truncate">Locais Físicos</span>
            <Link
              to="/admin/espacos"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm shrink-0 group-hover:translate-x-1"
            >
              <span>Acessar</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Card 03 - Núcleos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-7 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 group min-h-[320px] h-full">
          <div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Módulo 03
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Núcleos
            </h2>
            <p className="text-slate-500 text-sm lg:text-base mt-2 leading-relaxed">
              Gestão das unidades operacionais, alocação de equipe (coordenadores/instrutores), vagas e grade horária.
            </p>
          </div>

          <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs lg:text-sm font-semibold text-slate-500 truncate">Unidades & Turmas</span>
            <Link 
              to="/admin/nucleos"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm shrink-0 group-hover:translate-x-1"
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