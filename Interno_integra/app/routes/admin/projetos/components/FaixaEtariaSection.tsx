import { useFormContext } from "react-hook-form";
import type { ProjetoFormData } from "../schema";

export function FaixaEtariaSection() {
  const { register } = useFormContext<ProjetoFormData>();

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
        Faixa Etária
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
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
        <div>
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
