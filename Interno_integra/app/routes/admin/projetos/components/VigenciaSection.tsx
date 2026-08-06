import { useFormContext } from "react-hook-form";
import type { ProjetoFormData } from "../schema";
import { Calendar } from "lucide-react";

export function VigenciaSection() {
  const { register } = useFormContext<ProjetoFormData>();

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        Vigência da Iniciativa
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Data de Início da Vigência
          </label>
          <input
            type="date"
            {...register("vigencia.dataInicio")}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Data de Término da Vigência
          </label>
          <input
            type="date"
            {...register("vigencia.dataTermino")}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Deixe em branco para projeto sem prazo definido.
          </span>
        </div>
      </div>
    </div>
  );
}
