import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { ProjetoFormData } from "../schema";
import { Layers, Plus, Trash2 } from "lucide-react";

export function ModalidadesSection() {
  const { register, control } = useFormContext<ProjetoFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "limitesModalidade"
  });

  const [modalidadesDisponiveis, setModalidadesDisponiveis] = useState<any[]>([]);
  const [selectedModalidadeId, setSelectedModalidadeId] = useState("");

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

  const handleCreateModalidade = () => {
    const nome = prompt("Digite o nome da nova modalidade:");
    if (!nome) return;
    
    const postUrl = `https://w.ibrase.com.br/webhook/modalidades-post?instituto=${localStorage.getItem("auth_institute") || "IBRASE"}`;
    fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, ativo: 1 })
    })
    .then(res => res.json())
    .then(data => {
      const newMod = { id: Date.now(), nome }; // Id provisório ou da resposta
      setModalidadesDisponiveis([...modalidadesDisponiveis, newMod]);
      setSelectedModalidadeId(String(newMod.id));
      alert("Modalidade criada com sucesso!");
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao criar modalidade");
    });
  };

  const handleAddModalidade = () => {
    if (!selectedModalidadeId) return;
    const mod = modalidadesDisponiveis.find((m) => String(m.id) === selectedModalidadeId);
    if (mod) {
      if (fields.find((m) => String(m.id) === String(mod.id) || m.nome === mod.nome)) {
        alert("Esta modalidade já foi adicionada!");
        return;
      }
      append({ id: mod.id, nome: mod.nome, limite: 0 });
      setSelectedModalidadeId("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          Limites de Núcleos por Modalidade
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Defina o máximo de núcleos ativos de cada modalidade neste projeto. Informe <strong>0</strong> (ou deixe em branco) para não impor limite à modalidade. A soma destes limites determina a quantidade de <strong>Vagas Globais</strong> do projeto.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Selecionar Modalidade</label>
            <select
              value={selectedModalidadeId}
              onChange={(e) => setSelectedModalidadeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Escolha uma modalidade --</option>
              {modalidadesDisponiveis.map((mod: any) => (
                <option key={mod.id} value={mod.id}>{mod.nome}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddModalidade}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Adicionar
          </button>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleCreateModalidade}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar Nova
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
              <th className="p-3">Modalidade</th>
              <th className="p-3 text-right">Máximo de núcleos ativos</th>
              <th className="p-3 w-16 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {fields.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500 text-sm italic">
                  Nenhuma modalidade adicionada ainda.
                </td>
              </tr>
            ) : (
              fields.map((field, index) => (
                <tr key={field.id}>
                  <td className="p-3 font-semibold text-slate-700">{field.nome}</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      min="0"
                      {...register(`limitesModalidade.${index}.limite`, { valueAsNumber: true })}
                      className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-right font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
