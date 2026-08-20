import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { ProjetoFormData } from "../schema";
import { Layers, Plus, Trash2, CheckCircle2 } from "lucide-react";

export function ModalidadesSection() {
  const { register, control, watch, setValue } = useFormContext<ProjetoFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "vagasNucleo",
    keyName: "_rhfId"
  });

  const [modalidadesDisponiveis, setModalidadesDisponiveis] = useState<any[]>([]);
  const [institutoColor, setInstitutoColor] = useState("bg-slate-100 text-slate-800 border-slate-200");

  useEffect(() => {
    const inst = localStorage.getItem("auth_institute") || "IBRASE";
    if (inst === "IBRASE") {
      setInstitutoColor("bg-orange-100 text-orange-800 border-orange-200");
    } else if (inst === "GASCTPNA") {
      setInstitutoColor("bg-emerald-100 text-emerald-800 border-emerald-200");
    } else if (inst === "AUNI") {
      setInstitutoColor("bg-blue-100 text-blue-800 border-blue-200");
    } else if (inst === "IVEM") {
      setInstitutoColor("bg-red-100 text-red-800 border-red-200");
    }
  }, []);

  useEffect(() => {
    const fetchUrl = `https://w.ibrase.com.br/webhook/modalidades-get?instituto=${localStorage.getItem("auth_institute") || "IBRASE"}`;
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Workflow was started" || (Array.isArray(data) && data[0]?.message === "Workflow was started")) return;
        const flatList: any[] = [];
        const list = Array.isArray(data) ? data : (data.json ? (Array.isArray(data.json) ? data.json : [data.json]) : [data]);
        list.forEach((entry: any) => {
          if (entry && entry.json) {
            if (Array.isArray(entry.json)) flatList.push(...entry.json);
            else flatList.push(entry.json);
          } else if (Array.isArray(entry)) {
            flatList.push(...entry);
          } else {
            flatList.push(entry);
          }
        });
        setModalidadesDisponiveis(flatList);
      })
      .catch(console.error);
  }, []);

  const handleAddVaga = () => {
    // Encontra o próximo número disponível
    const currentVagas = watch("vagasNucleo") || [];
    const maxNumber = currentVagas.reduce((max, vaga) => Math.max(max, vaga.numero || 0), 0);
    
    append({
      numero: maxNumber + 1,
      modalidadeId: "",
      modalidadeNome: "",
      espacoVinculadoId: null
    });
  };

  const handleModalidadeChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const mod = modalidadesDisponiveis.find(m => String(m.id) === String(selectedId));
    if (mod) {
      setValue(`vagasNucleo.${index}.modalidadeId`, mod.id);
      setValue(`vagasNucleo.${index}.modalidadeNome`, mod.nome);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Vagas de Núcleos (Enumeradas)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Adicione os "slots" (vagas) físicos de núcleos para esta proposta e atrele uma modalidade a cada um.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddVaga}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar Vaga
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
              <th className="p-3 w-32">Número</th>
              <th className="p-3">Modalidade Atrelada</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 w-16 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {fields.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 text-sm italic border-dashed border-2 border-slate-100 m-2 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <Layers className="w-8 h-8 text-slate-300" />
                    <p>Nenhuma vaga criada nesta proposta.</p>
                    <button type="button" onClick={handleAddVaga} className="text-blue-600 font-semibold hover:underline mt-1">
                      Clique aqui para adicionar a 1ª Vaga
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              fields.map((field, index) => {
                // Necessário watch para ver valor atual do select
                const currentVagas = watch("vagasNucleo");
                const currentModId = currentVagas?.[index]?.modalidadeId || "";
                const estaOcupada = !!currentVagas?.[index]?.espacoVinculadoId;

                return (
                  <tr key={field._rhfId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-700">
                      Vaga {field.numero}
                    </td>
                    <td className="p-3">
                      <select
                        value={currentModId}
                        onChange={(e) => handleModalidadeChange(index, e)}
                        disabled={estaOcupada}
                        className={`w-full max-w-sm bg-white dark:bg-slate-800 border ${!currentModId ? 'border-red-300 dark:border-red-700 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-slate-200 dark:border-slate-700'} rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:bg-slate-100 dark:disabled:bg-slate-900`}
                      >
                        <option value="" disabled>Selecione uma modalidade...</option>
                        {modalidadesDisponiveis.map(m => (
                          <option key={m.id} value={m.id}>{m.nome}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      {estaOcupada ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-wide">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ocupada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px] uppercase tracking-wide">
                          Livre
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={estaOcupada}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title={estaOcupada ? "Não é possível remover vaga ocupada por um núcleo" : "Remover Vaga"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <div className={`px-4 py-2 rounded-full border shadow-sm flex items-center gap-2 font-bold text-sm ${institutoColor}`}>
          <span>Total de Vagas da Proposta:</span>
          <span className="text-lg">
            {(watch("vagasNucleo") || []).length}
          </span>
        </div>
      </div>

    </div>
  );
}
