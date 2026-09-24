import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Users, X, Plus, AlertTriangle, Check, Settings, Trash2 } from "lucide-react";
import type { ProjetoFormData } from "../schema";

interface CargoItem {
  id: string;
  nome: string;
}

export const CARGO_NORMALIZATION: Record<string, string> = {
  "Assistente Administrativo": "Assist. Administrativo",
  "Auxiliar Administrativo": "Assist. Administrativo",
  "Administrativo": "Assist. Administrativo",
  "Assist. Administrativo (Secretário)": "Assist. Administrativo",
  "Assistente Social": "Assist. Social",
  "Coordenador Geral": "Coord. Geral",
  "Coordenador(a) Geral": "Coord. Geral",
  "Coordenador Pedagógico": "Coord. Pedagógico",
  "coordenador_pedaggico": "Coord. Pedagógico",
  "Coordenador de Núcleo": "Coord. de Núcleo",
  "Coordenador(a) de Núcleo": "Coord. de Núcleo",
  "Coordenador Setorial": "Coord. Setorial",
  "Coord. de Núcleo (Setorial)": "Coord. Setorial",
  "Instrutor": "Instrutor (Educador)",
  "Instrutor Esportivo": "Instrutor (Educador)",
  "Instrutor de Educação Física": "Instrutor (Educador)",
  "Educador": "Instrutor (Educador)",
  "Educador Social": "Instrutor (Educador)",
  "Professor(a) de Artes Marciais": "Instrutor (Educador)",
  "Professor(a) de Futebol": "Instrutor (Educador)",
  "Auxiliar": "Auxiliar (Monitor)",
  "Monitor": "Auxiliar (Monitor)",
  "Monitor Esportivo": "Auxiliar (Monitor)",
  "Técnico de Informática": "Téc. de Informática",
  "Téc. Informática": "Téc. de Informática",
  "Técnico em Informática": "Téc. de Informática",
  "TECNICO": "Téc. de Informática",
  "TI": "Téc. de Informática",
  "Animador cultural": "Animador Cultural",
  "Agente de contratação": "Agente de Contratação",
  "Recursos Humanos": "Assist. de Departamento Pessoal",
  "RH": "Assist. de Departamento Pessoal",
  "Auxiliar de DP": "Assist. de Departamento Pessoal",
  "Financeiro": "Contador",
  "Marketing": "Agente de Marketing",
  "Web Designer": "Web Design",
  "Despachante": "Assist. Administrativo",
  "Engenheiro": "Analista de Projetos",
};

export const normalizeCargoName = (name: string): string => {
  if (!name) return "";
  const trimmed = name.trim();
  return CARGO_NORMALIZATION[trimmed] || trimmed;
};

export function LimitesSection() {
  const { register, watch, setValue, getValues } = useFormContext<ProjetoFormData>();
  const [cargosDisponiveis, setCargosDisponiveis] = useState<CargoItem[]>([]);
  const [isLoadingCargos, setIsLoadingCargos] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  // Limites atuais salvos no form
  const rawLimitesCargos = watch("limitesCargos") || [];
  const limitesCargos = rawLimitesCargos.map(c => ({ ...c, nome: normalizeCargoName(c.nome) }));

  let focusPendenciasStr = "";
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    focusPendenciasStr = urlParams.get("focus_pendencias") || "";
  }
  const focusList = focusPendenciasStr ? focusPendenciasStr.split(',') : [];

  const getHighlightClass = (label: string) => {
    return focusList.includes(label) ? "ring-2 ring-red-500 ring-offset-1 bg-red-50 animate-pulse" : "";
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const fetchCargos = async () => {
    setIsLoadingCargos(true);
    try {
      const authInstitute = (typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("instituto") || localStorage.getItem("auth_institute")) : "IBRASE") || "IBRASE";
      const IN = authInstitute.toUpperCase();
      
      // 1. Tenta carregar do cache instantaneamente (0ms)
      try {
        const rawCached = sessionStorage.getItem(`cache_raw_cargos_${IN}`);
        if (rawCached) {
          const cData = JSON.parse(rawCached);
          const cList = Array.isArray(cData) ? cData : (cData.data || []);
          if (cList.length > 0) {
            setCargosDisponiveis(cList.map((c: any) => ({
              id: String(c.id),
              nome: normalizeCargoName(c.label || c.nome || c.cargo || c.name || "Cargo Sem Nome")
            })));
          }
        }
      } catch (e) {}

      // 2. Fetch de rede
      const res = await fetch(`https://w.ibrase.com.br/webhook/cargos-get?instituto=${IN}`);
      if (res.ok) {
        const data = await res.json();
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.data)) list = data.data;
        
        // Remove duplicatas de nomes após normalização
        const seenNames = new Set<string>();
        const uniqueCargos: CargoItem[] = [];
        
        list.forEach((c: any) => {
          const norm = normalizeCargoName(c.label || c.nome || c.cargo || c.name || "Cargo Sem Nome");
          if (!seenNames.has(norm)) {
            seenNames.add(norm);
            uniqueCargos.push({ id: String(c.id), nome: norm });
          }
        });

        setCargosDisponiveis(uniqueCargos);
      }
    } catch (e) {
      console.warn("Erro ao buscar cargos:", e);
    } finally {
      setIsLoadingCargos(false);
    }
  };

  const openManageModal = () => {
    const current = getValues("limitesCargos") || [];
    const names = new Set(current.map(c => normalizeCargoName(c.nome)));
    setSelectedNames(names);
    setIsModalOpen(true);
  };

  const toggleSelection = (nome: string) => {
    const norm = normalizeCargoName(nome);
    const next = new Set(selectedNames);
    if (next.has(norm)) next.delete(norm);
    else next.add(norm);
    setSelectedNames(next);
  };

  const handleSaveModal = () => {
    const currentLimites = getValues("limitesCargos") || [];
    const normalizedLimites = currentLimites.map(c => ({ ...c, nome: normalizeCargoName(c.nome) }));
    
    // Filtra quem foi removido
    let newLimites = normalizedLimites.filter(c => selectedNames.has(c.nome));
    
    // Adiciona quem é novo
    selectedNames.forEach(nome => {
      if (!newLimites.some(c => c.nome === nome)) {
        newLimites.push({ nome, limite: 0 });
      }
    });

    setValue("limitesCargos", newLimites, { shouldDirty: true });
    setIsModalOpen(false);
  };

  const removeCargo = (nome: string) => {
    const current = getValues("limitesCargos") || [];
    const norm = normalizeCargoName(nome);
    setValue("limitesCargos", current.filter(c => normalizeCargoName(c.nome) !== norm), { shouldDirty: true });
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Configurações de Limites de Membros da Equipe
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Aqui devem ser definidas as quantidades máximas de colaboradores para cada cargo.
            </p>
          </div>
          
          <button
            type="button"
            onClick={openManageModal}
            className={`px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg transition-colors border border-blue-200 flex items-center gap-2 shrink-0 shadow-sm ${getHighlightClass('Equipe')}`}
          >
            <Settings className="w-4 h-4" />
            Gerenciar Cargos
          </button>
        </div>

        {limitesCargos.length === 0 ? (
          <div className={`py-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl ${getHighlightClass('Equipe')}`}>
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Nenhum cargo configurado</p>
            <p className="text-xs text-slate-400 mt-1">Clique no botão acima para adicionar limites de equipe.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {limitesCargos.map((cargo, index) => (
              <div key={cargo.nome} className="relative group bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                <button
                  type="button"
                  onClick={() => removeCargo(cargo.nome)}
                  className="absolute right-2 top-2 p-1.5 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover cargo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <label className="block text-xs font-bold text-slate-700 mb-2 pr-6 line-clamp-1" title={cargo.nome}>
                  Limite de {cargo.nome}
                </label>
                <input
                  type="number"
                  min="0"
                  {...register(`limitesCargos.${index}.limite`, { valueAsNumber: true })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE GERENCIAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Cargos da Equipe
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
              <p className="text-sm text-slate-600 font-medium mb-4">
                Selecione os cargos que terão limites configurados para esta proposta:
              </p>

              {isLoadingCargos ? (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                  Carregando cargos do N8N...
                </div>
              ) : cargosDisponiveis.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50 rounded-lg border border-slate-200">
                  Nenhum cargo encontrado no sistema para este instituto.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cargosDisponiveis.map(cargo => {
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
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <span className={`font-semibold text-sm ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                            {cargo.nome}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold rounded-lg text-sm transition-colors shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirmar ({selectedNames.size})
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
