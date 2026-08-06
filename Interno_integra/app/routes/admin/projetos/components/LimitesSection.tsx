import { useFormContext } from "react-hook-form";
import type { ProjetoFormData } from "../schema";
import { Users, Layers } from "lucide-react";

export function LimitesSection() {
  const { register } = useFormContext<ProjetoFormData>();

  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Configurações de Limites de Membros da Equipe
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aqui devem ser definidas as quantidade máximas de colaboradores para cada cargo dentro do projeto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Limite de Instrutores por Núcleo</label>
            <input
              type="number"
              min="0"
              {...register("limites.instrutoresPorNucleo", { valueAsNumber: true })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Limite de Auxiliares por Núcleo</label>
            <input
              type="number"
              min="0"
              {...register("limites.auxiliaresPorNucleo", { valueAsNumber: true })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Limite de Coord. Geral</label>
            <input
              type="number"
              min="0"
              {...register("limites.coordGeral", { valueAsNumber: true })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Limite de Coord. Núcleo</label>
            <input
              type="number"
              min="0"
              {...register("limites.coordNucleo", { valueAsNumber: true })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Limite de Coord. Pedagogicos</label>
            <input
              type="number"
              min="0"
              {...register("limites.coordPedagogico", { valueAsNumber: true })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Limite de Supervisores</label>
            <input
              type="number"
              min="0"
              {...register("limites.supervisores", { valueAsNumber: true })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Configurações de Vagas e Núcleos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Defina a quantidade máxima de núcleos e a capacidade de alunos para esta iniciativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 pt-2">
          <div className="bg-blue-50/50 p-3 rounded-lg border-2 border-blue-200">
            <label className="block text-xs font-bold text-blue-800 mb-1">Vagas de Núcleo</label>
            <input
              type="number"
              min="0"
              {...register("limites.nucleosMaximos", { valueAsNumber: true })}
              className="w-full bg-white border border-blue-300 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[10px] font-medium text-blue-600 mt-1 block leading-tight">
              * quantidade de núcleos máximos que podem ser criados
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
