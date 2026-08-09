import { useFormContext, useFieldArray } from "react-hook-form";
import type { ProjetoFormData } from "../schema";
import { Plus, Trash2 } from "lucide-react";

export function PeriodosSection() {
  const { register, control, formState: { errors } } = useFormContext<ProjetoFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "periodos"
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-800">Períodos da Iniciativa</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure as janelas de <strong>Iniciação</strong> e <strong>Trimestre</strong>. 
          Elas serão utilizadas para construir o histórico e a linha do tempo da ocupação das vagas.
        </p>
      </div>

      {fields.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                <th className="p-3">Tipo</th>
                <th className="p-3">Rótulo</th>
                <th className="p-3">Início</th>
                <th className="p-3">Fim</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td className="p-2 w-44">
                    <select
                      {...register(`periodos.${index}.tipo`)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="planejamento">Iniciação</option>
                      <option value="avaliacao">Trimestre</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="Nome do período..."
                      {...register(`periodos.${index}.rotulo`)}
                      className={`w-full bg-slate-50 border ${errors.periodos?.[index]?.rotulo ? 'border-red-500' : 'border-slate-200'} rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </td>
                  <td className="p-2 w-44">
                    <input
                      type="date"
                      {...register(`periodos.${index}.inicio`)}
                      className={`w-full bg-slate-50 border ${errors.periodos?.[index]?.inicio ? 'border-red-500' : 'border-slate-200'} rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </td>
                  <td className="p-2 w-44">
                    <input
                      type="date"
                      {...register(`periodos.${index}.fim`)}
                      className={`w-full bg-slate-50 border ${errors.periodos?.[index]?.fim ? 'border-red-500' : 'border-slate-200'} rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </td>
                  <td className="p-2 text-center w-12">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Remover período"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic py-1">
          Nenhum período adicionado ainda. Clique abaixo caso deseje incluir um período.
        </p>
      )}

      <button
        type="button"
        onClick={() => append({ id: Date.now(), tipo: "planejamento", rotulo: "", inicio: "", fim: "" })}
        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-xs border border-dashed border-blue-300 px-3 py-2 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Adicionar período
      </button>
    </div>
  );
}
