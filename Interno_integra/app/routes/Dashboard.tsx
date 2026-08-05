import type { Route } from "./+types/Dashboard";
import { Activity, CalendarDays, GraduationCap, ArrowRight, Sparkles, Layers, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Sistema Integra" },
    { name: "description", content: "Painel de Controle e Seleção de Iniciativas" },
  ];
}

export default function Dashboard() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto pt-4 pb-12">
      
      {/* Banner / Header Principal com Estilo Premium */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -top-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Painel de Controle Unificado
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Iniciativas
            </h1>
            <p className="text-slate-300 mt-2 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
              Selecione o módulo de gestão que deseja operar para acompanhar núcleos, matrículas, equipes e registros.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 px-5 py-3.5 rounded-2xl shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sistema Integra</p>
              <p className="text-sm font-semibold text-slate-200">Ambiente Seguro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Escolha da Aplicação (Cards Ampliados & UI/UX Avançado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card Grande: Iniciativa de Aula */}
        <Link 
          to="/admin/iniciativas" 
          className="group relative bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          {/* Efeito Glow de Fundo no Hover */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div>
            {/* Top Badge & Icon */}
            <div className="flex items-center justify-between mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100/80 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <GraduationCap className="w-10 h-10 transition-transform duration-300" />
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider group-hover:bg-blue-100 transition-colors">
                Módulo Principal
              </span>
            </div>

            {/* Título & Descrição */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
              Iniciativa de Aula
            </h2>
            <p className="text-slate-600 text-base leading-relaxed mb-6 font-normal">
              Gerenciamento completo dos núcleos educacionais e esportivos regulares. Controle de matrículas, alunos, turmas, diários de presenças e laudos pedagógicos.
            </p>

            {/* Tags de Recursos */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/50">Matrículas</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/50">Núcleos Ativos</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/50">Diários de Classe</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/50">Captação</span>
            </div>
          </div>

          {/* Botão de Ação Inferior */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Acessar Iniciativa
            </span>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm group-hover:translate-x-1">
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        </Link>

        {/* Card Grande: Iniciativa de Eventos */}
        <Link 
          to="/admin/iniciativas" 
          className="group relative bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)] hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          {/* Efeito Glow de Fundo no Hover */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div>
            {/* Top Badge & Icon */}
            <div className="flex items-center justify-between mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100/80 text-orange-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <CalendarDays className="w-10 h-10 transition-transform duration-300" />
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200/60 uppercase tracking-wider group-hover:bg-orange-100 transition-colors">
                Eventos & Torneios
              </span>
            </div>

            {/* Título & Descrição */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors mb-3">
              Iniciativa de Eventos
            </h2>
            <p className="text-slate-600 text-base leading-relaxed mb-6 font-normal">
              Gestão de eventos esportivos, festivais comunitários, inscrições por equipe, tabela de jogos, chaves de competição e relatórios estatísticos.
            </p>

            {/* Tags de Recursos */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/50">Competições</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/50">Inscrição de Equipes</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/50">Tabela de Jogos</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/50">Estatísticas</span>
            </div>
          </div>

          {/* Botão de Ação Inferior */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
              Acessar Iniciativa
            </span>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-orange-600 text-slate-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm group-hover:translate-x-1">
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        </Link>

      </div>
      
    </div>
  );
}