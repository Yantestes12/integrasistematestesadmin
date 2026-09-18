import { GraduationCap } from "lucide-react";

export default function InstrutorDashboard() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8 group cursor-default">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105">
          <GraduationCap className="w-5 h-5 md:w-6 md:h-6 anim-cap-context" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Portal do Instrutor</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">Gestão de turmas e alunos</p>
        </div>
      </div>

      <div className="group bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-sm p-8 md:p-16 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
          <GraduationCap className="w-10 h-10 text-slate-300 anim-cap-context" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Em Construção</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          O portal do Instrutor está sendo desenvolvido. Em breve você terá acesso às suas turmas, alunos matriculados, lista de presenças e histórico de avaliações.
        </p>
      </div>
    </div>
  );
}
