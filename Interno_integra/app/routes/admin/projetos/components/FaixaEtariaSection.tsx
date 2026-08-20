import { useFormContext } from "react-hook-form";
import type { ProjetoFormData } from "../schema";
import { UserCheck } from "lucide-react";

export function FaixaEtariaSection() {
  const { register } = useFormContext<ProjetoFormData>();

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-blue-600" />
        Aluno
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
          <label className="block text-xs font-bold text-emerald-800 mb-1">Vagas por Aluno</label>
          <input
            type="number"
            min="0"
            {...register("limites.vagasPorAluno", { valueAsNumber: true })}
            className="w-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-[10px] font-medium text-emerald-600 mt-1 block leading-tight">
            * quantidade de alunos que pode ter em cada núcleo
          </span>
        </div>

        <div className="p-3 border border-slate-100 rounded-lg">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Idade mínima</label>
          <input
            type="number"
            placeholder="Ex.: 7"
            {...register("faixaEtaria.idadeMinima", { 
              setValueAs: (v) => v === "" || v === null ? null : parseInt(v)
            })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="p-3 border border-slate-100 rounded-lg">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Idade máxima</label>
          <input
            type="number"
            placeholder="Ex.: 17"
            {...register("faixaEtaria.idadeMaxima", { 
              setValueAs: (v) => v === "" || v === null ? null : parseInt(v)
            })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Deixe em branco para sem limite.
          </span>
        </div>
      </div>
    </div>
  );
}
