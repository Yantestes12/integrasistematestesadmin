import React, { useState, useEffect } from "react";
import { Users, X, Check } from "lucide-react";

interface CargoItem {
  id: string;
  nome: string;
}

interface CargoSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedCargos: string[]) => void;
}

export const CargoSelectionModal: React.FC<CargoSelectionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [cargosDisponiveis, setCargosDisponiveis] = useState<CargoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) fetchCargos();
  }, [isOpen]);

  const fetchCargos = async () => {
    setIsLoading(true);
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const res = await fetch(`https://w.ibrase.com.br/webhook/cargos-get?instituto=${authInstitute}`);
      if (res.ok) {
        const data = await res.json();
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.data)) list = data.data;
        setCargosDisponiveis(
          list.map((c: any) => ({
            id: String(c.id),
            nome: c.label || c.nome || c.cargo || c.name || "Cargo Sem Nome",
          }))
        );
      }
    } catch (e) {
      console.warn("Erro ao buscar cargos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (nome: string) => {
    const next = new Set(selectedNames);
    if (next.has(nome)) next.delete(nome);
    else next.add(nome);
    setSelectedNames(next);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedNames));
    onClose();
    setSelectedNames(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Selecionar Cargos
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400 text-sm italic">Carregando cargos...</div>
          ) : cargosDisponiveis.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50 rounded-lg border border-slate-200">
              Nenhum cargo encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cargosDisponiveis.map((cargo) => {
                const isSelected = selectedNames.has(cargo.nome);
                return (
                  <div
                    key={cargo.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => toggleSelection(cargo.nome)}
                  >
                    <label className="flex items-center gap-3 flex-1 cursor-pointer pointer-events-none">
                      <input type="checkbox" readOnly checked={isSelected} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      <span className={`font-semibold text-sm ${isSelected ? "text-blue-900" : "text-slate-700"}`}>{cargo.nome}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold rounded-lg text-sm transition-colors shadow-sm">
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50" disabled={selectedNames.size === 0}>
            <Check className="w-4 h-4" /> Confirmar ({selectedNames.size})
          </button>
        </div>
      </div>
    </div>
  );
};
