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

    </>
  );
}
