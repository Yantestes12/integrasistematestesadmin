import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { ProjetoFormData } from "../schema";
import { Layers, Plus, Trash2, Settings, AlertTriangle, X, Check } from "lucide-react";

export function ModalidadesSection() {
  const { register, control } = useFormContext<ProjetoFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "limitesModalidade"
  });

  const [modalidadesDisponiveis, setModalidadesDisponiveis] = useState<any[]>([]);
  const [institutoColor, setInstitutoColor] = useState("bg-slate-100 text-slate-800 border-slate-200");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Delete confirmation states
  const [deleteModId, setDeleteModId] = useState<string | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(0);

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

  useEffect(() => {
    if (deleteCountdown > 0) {
      const timer = setTimeout(() => setDeleteCountdown(deleteCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [deleteCountdown]);

  const openModal = () => {
    setSelectedIds(new Set(fields.map(f => String(f.id))));
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    const currentIds = fields.map(f => String(f.id));
    
    // Remove as desmarcadas (de trás pra frente para não bagunçar os índices)
    for (let i = currentIds.length - 1; i >= 0; i--) {
      if (!selectedIds.has(currentIds[i])) {
        remove(i);
      }
    }
    
    // Adiciona as recém marcadas
    selectedIds.forEach(idStr => {
      if (!currentIds.includes(idStr)) {
        const mod = modalidadesDisponiveis.find(m => String(m.id) === idStr);
        if (mod) append({ id: mod.id, nome: mod.nome, limite: 0 });
      }
    });
    
    setIsModalOpen(false);
  };

  const toggleSelection = (idStr: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(idStr)) {
      newSet.delete(idStr);
    } else {
      newSet.add(idStr);
    }
    setSelectedIds(newSet);
  };

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
      // Já seleciona automaticamente a nova modalidade
      setSelectedIds(prev => new Set(prev).add(String(newMod.id)));
      alert("Modalidade criada com sucesso!");
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao criar modalidade");
    });
  };

  const triggerDelete = (idStr: string) => {
    setDeleteModId(idStr);
    setDeleteCountdown(10);
  };

  const cancelDelete = () => {
    setDeleteModId(null);
    setDeleteCountdown(0);
  };

  const confirmDelete = async () => {
    if (!deleteModId || deleteCountdown > 0) return;
    
    try {
      const delUrl = `https://w.ibrase.com.br/webhook/modalidades-delete?instituto=${localStorage.getItem("auth_institute") || "IBRASE"}`;
      fetch(delUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteModId })
      }).catch(console.error); // Ignora erros de CORS ou se o webhook não existir
      
      setModalidadesDisponiveis(prev => prev.filter(m => String(m.id) !== deleteModId));
      
      const newSet = new Set(selectedIds);
      if (newSet.has(deleteModId)) {
        newSet.delete(deleteModId);
        setSelectedIds(newSet);
      }
      
      setDeleteModId(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir modalidade.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Limites de Núcleos por Modalidade
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Defina o máximo de núcleos ativos de cada modalidade neste projeto. A soma destes limites determina a quantidade de <strong>Vagas Globais</strong> do projeto.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
        >
          <Settings className="w-4 h-4" />
          Gerenciar Modalidades
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
              <th className="p-3">Modalidade</th>
              <th className="p-3 text-right">Máximo de núcleos ativos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {fields.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-8 text-center text-slate-500 text-sm italic border-dashed border-2 border-slate-100 m-2 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <Layers className="w-8 h-8 text-slate-300" />
                    <p>Nenhuma modalidade configurada no projeto.</p>
                    <button type="button" onClick={openModal} className="text-blue-600 font-semibold hover:underline mt-1">
                      Clique aqui para adicionar
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              fields.map((field, index) => (
                <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    {field.nome}
                  </td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      min="0"
                      {...register(`limitesModalidade.${index}.limite`, { valueAsNumber: true })}
                      className="w-24 bg-white border border-slate-200 rounded-lg p-1.5 text-right font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto shadow-sm"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <div className={`px-4 py-2 rounded-full border shadow-sm flex items-center gap-2 font-bold text-sm ${institutoColor}`}>
          <span>Vagas de Núcleo Totais:</span>
          <span className="text-lg">
            {(useFormContext().watch("limitesModalidade") || []).reduce((acc: number, curr: any) => acc + (Number(curr.limite) || 0), 0)}
          </span>
        </div>
      </div>

      {/* MODAL DE GERENCIAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Gerenciar Modalidades do Projeto
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-600 font-medium">Selecione as modalidades que farão parte deste projeto:</p>
                <button
                  type="button"
                  onClick={handleCreateModalidade}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Criar Nova
                </button>
              </div>

              {/* Delete Warning Box */}
              {deleteModId && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-red-800">Cuidado! Ação destrutiva.</h4>
                      <p className="text-xs text-red-600 mt-1">
                        Se algum projeto estiver usando esta modalidade, você poderá causar erros no sistema. 
                        Tem certeza que deseja apagar a modalidade permanentemente do banco de dados?
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={confirmDelete}
                          disabled={deleteCountdown > 0}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            deleteCountdown > 0 
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                              : "bg-red-600 text-white hover:bg-red-700 shadow-sm"
                          }`}
                        >
                          {deleteCountdown > 0 ? `Aguarde ${deleteCountdown}s para confirmar` : "Sim, excluir modalidade"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelDelete}
                          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalidadesDisponiveis.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                  Carregando modalidades ou nenhuma encontrada...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {modalidadesDisponiveis.map(mod => {
                    const idStr = String(mod.id);
                    const isSelected = selectedIds.has(idStr);
                    const isDeletingThis = deleteModId === idStr;
                    
                    return (
                      <div 
                        key={idStr} 
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isSelected 
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                        } ${isDeletingThis ? "opacity-50 grayscale pointer-events-none" : ""}`}
                      >
                        <label className="flex items-center gap-3 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(idStr)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={`font-semibold text-sm ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                            {mod.nome}
                          </span>
                        </label>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerDelete(idStr);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Excluir modalidade do sistema"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg text-sm transition-colors shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirmar Seleção ({selectedIds.size})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
