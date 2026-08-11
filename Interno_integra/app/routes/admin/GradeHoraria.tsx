import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { ArrowLeft, Save, Clock, CheckCircle2, AlertCircle, Loader2, Sparkles, Building2, AlertTriangle } from "lucide-react";

interface SlotData {
  inicio: string; // "08:00"
  fim: string;    // "10:00"
}

interface DiaGrade {
  ativo: boolean;
  slots: {
    A: SlotData;
    B: SlotData;
    C: SlotData;
    D: SlotData;
    P: SlotData;
  };
}

type DiasSemana = "1" | "2" | "3" | "4" | "5" | "6";

const DIAS_MAP: Record<DiasSemana, string> = {
  "1": "Segunda",
  "2": "Terça",
  "3": "Quarta",
  "4": "Quinta",
  "5": "Sexta",
  "6": "Sábado",
};

const DIA_KEY_MAP: Record<DiasSemana, string> = {
  "1": "seg",
  "2": "ter",
  "3": "qua",
  "4": "qui",
  "5": "sex",
  "6": "sab",
};

export default function GradeHoraria() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nucleoId = searchParams.get("nucleoId") || searchParams.get("nucleo_id");

  const [nucleoNome, setNucleoNome] = useState("Carregando...");
  const [espacoNome, setEspacoNome] = useState<string | null>(null);
  const [espacoHorarios, setEspacoHorarios] = useState<Record<string, { ativo: boolean; abertura: string; fechamento: string }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estado dos dias da semana e horários
  const [diasGrade, setDiasGrade] = useState<Record<DiasSemana, DiaGrade>>({
    "1": { ativo: false, slots: { A: { inicio: "", fim: "" }, B: { inicio: "", fim: "" }, C: { inicio: "", fim: "" }, D: { inicio: "", fim: "" }, P: { inicio: "", fim: "" } } },
    "2": { ativo: false, slots: { A: { inicio: "", fim: "" }, B: { inicio: "", fim: "" }, C: { inicio: "", fim: "" }, D: { inicio: "", fim: "" }, P: { inicio: "", fim: "" } } },
    "3": { ativo: false, slots: { A: { inicio: "", fim: "" }, B: { inicio: "", fim: "" }, C: { inicio: "", fim: "" }, D: { inicio: "", fim: "" }, P: { inicio: "", fim: "" } } },
    "4": { ativo: false, slots: { A: { inicio: "", fim: "" }, B: { inicio: "", fim: "" }, C: { inicio: "", fim: "" }, D: { inicio: "", fim: "" }, P: { inicio: "", fim: "" } } },
    "5": { ativo: false, slots: { A: { inicio: "", fim: "" }, B: { inicio: "", fim: "" }, C: { inicio: "", fim: "" }, D: { inicio: "", fim: "" }, P: { inicio: "", fim: "" } } },
    "6": { ativo: false, slots: { A: { inicio: "", fim: "" }, B: { inicio: "", fim: "" }, C: { inicio: "", fim: "" }, D: { inicio: "", fim: "" }, P: { inicio: "", fim: "" } } },
  });

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    if (nucleoId) {
      fetchNucleo(savedInstitute, nucleoId);
    } else {
      setNucleoNome("Núcleo Geral");
      setLoading(false);
    }
  }, [nucleoId]);

  const fetchNucleo = async (inst: string, id: string) => {
    setLoading(true);
    try {
      const [resNucleos, resEspacos] = await Promise.all([
        fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst.toUpperCase()}`),
        fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${inst.toUpperCase()}`).catch(() => null)
      ]);

      let espacosMap: Record<string, any> = {};
      if (resEspacos && resEspacos.ok) {
        const eData = await resEspacos.json();
        const eList = Array.isArray(eData) ? eData : eData.data || [eData];
        eList.forEach((e: any) => {
          const item = e?.json || e;
          if (item?.id) espacosMap[String(item.id)] = item;
        });
      }

      if (resNucleos.ok) {
        const data = await resNucleos.json();
        let list: any[] = Array.isArray(data) ? data : data.data || data.items || (Array.isArray(data.json) ? data.json : [data]);
        let flat: any[] = [];
        list.forEach((e: any) => {
          if (e?.json) {
            Array.isArray(e.json) ? flat.push(...e.json) : flat.push(e.json);
          } else {
            flat.push(e);
          }
        });

        const found = flat.find((n: any) => String(n.id || n.id_nucleo) === String(id));
        if (found) {
          setNucleoNome(found.nome || found.nome_nucleo || `Núcleo #${id}`);
          
          let parsedEspacoHorarios = null;
          // Carrega os horários do Espaço vinculado
          if (found.espaco_id && espacosMap[String(found.espaco_id)]) {
            const espaco = espacosMap[String(found.espaco_id)];
            setEspacoNome(espaco.nome);
            if (espaco.horarios) {
              try {
                parsedEspacoHorarios = typeof espaco.horarios === "string" ? JSON.parse(espaco.horarios) : espaco.horarios;
                setEspacoHorarios(parsedEspacoHorarios);
              } catch (e) {
                console.warn("Erro ao parsear horários do espaço:", e);
              }
            }
          }

          if (found.grade_horaria) {
            try {
              let parsedGrade = typeof found.grade_horaria === "string" ? JSON.parse(found.grade_horaria) : found.grade_horaria;
              
              // Sincroniza forçadamente com os limites do Espaço (corrige dados velhos)
              if (parsedGrade && parsedEspacoHorarios) {
                Object.entries(DIA_KEY_MAP).forEach(([dKey, eKey]) => {
                   const limite = parsedEspacoHorarios[eKey];
                   if (limite && !limite.ativo) {
                     parsedGrade[dKey].ativo = false; // Força fechar se no Espaço tá fechado
                   }
                });
              }
              if (parsedGrade) setDiasGrade(parsedGrade);
            } catch (e) { console.warn("Erro ao parsear grade:", e); }
          } else if (parsedEspacoHorarios) {
            // Se for um Núcleo virgem, pré-seleciona os dias baseados no Espaço
            setDiasGrade(prev => {
               const newGrade = JSON.parse(JSON.stringify(prev));
               Object.entries(DIA_KEY_MAP).forEach(([dKey, eKey]) => {
                  const limite = parsedEspacoHorarios[eKey];
                  if (limite && limite.ativo) {
                     newGrade[dKey].ativo = true;
                  }
               });
               return newGrade;
            });
          }
        }
      }
    } catch (e) {
      console.error("Erro ao carregar núcleo:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleHoraChange = (dia: DiasSemana, slotKey: "A" | "B" | "C" | "D" | "P", type: "inicio" | "fim", value: string) => {
    setDiasGrade(prev => {
      const prevSlot = prev[dia].slots[slotKey];
      let newInicio = type === "inicio" ? value : prevSlot.inicio;
      let newFim = type === "fim" ? value : prevSlot.fim;

      // Se mudou o INICIO e o valor é válido, auto-calcula o FIM para +2 horas
      if (type === "inicio" && value && value.includes(":")) {
        const [hStr, mStr] = value.split(":");
        let newH = parseInt(hStr, 10) + 2;
        if (newH > 22) newH = 22; // limite máximo
        newFim = `${String(newH).padStart(2, '0')}:${mStr}`;
      }

      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          slots: {
            ...prev[dia].slots,
            [slotKey]: { inicio: newInicio, fim: newFim }
          }
        }
      };
    });
  };

  const handleToggleDia = (dia: DiasSemana) => {
    const diaKey = DIA_KEY_MAP[dia];
    const limiteEspaco = espacoHorarios?.[diaKey];
    
    // Se o Espaço restringe o dia e ele está inativo no espaço, só bloqueia se tentar ATIVAR
    setDiasGrade(prev => {
      const isCurrentlyActive = prev[dia].ativo;
      if (!isCurrentlyActive && limiteEspaco && !limiteEspaco.ativo) {
        alert(`O dia ${DIAS_MAP[dia]} não possui horário de funcionamento cadastrado no Espaço Físico.`);
        return prev;
      }
      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          ativo: !isCurrentlyActive
        }
      };
    });
  };

  // Validador de horário dentro dos limites do Espaço Físico
  const isSlotValidInEspaco = (dia: DiasSemana, slot: SlotData): boolean => {
    if (!slot.inicio || !slot.fim) return true;
    const diaKey = DIA_KEY_MAP[dia];
    const limite = espacoHorarios?.[diaKey];
    if (!limite || !limite.ativo || !limite.abertura || !limite.fechamento) return true;

    return slot.inicio >= limite.abertura && slot.fim <= limite.fechamento;
  };

  // Turnos calculados
  const turnosSet = new Set<string>();
  Object.values(diasGrade).forEach(dia => {
    if (dia.ativo) {
      Object.values(dia.slots).forEach(slot => {
        if (slot.inicio) {
          const h = parseInt(slot.inicio.split(":")[0], 10);
          if (h >= 6 && h < 12) turnosSet.add("Manhã");
          else if (h >= 12 && h < 18) turnosSet.add("Tarde");
          else if (h >= 18) turnosSet.add("Noite");
        }
      });
    }
  });

  const turnosCalculados = Array.from(turnosSet);

  const handleSalvar = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      const res = await fetch("https://w.ibrase.com.br/webhook/nucleos-put", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: nucleoId,
          instituto: authInstitute.toUpperCase(),
          grade_horaria: JSON.stringify(diasGrade),
          turnos_calculados: turnosCalculados.join(", "),
        }),
      });

      if (res.ok) {
        setStatusMsg({ type: "success", text: "Grade horária salva com sucesso!" });
      } else {
        setStatusMsg({ type: "error", text: "Erro ao salvar grade horária via webhook N8N." });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: "error", text: "Erro de conexão ao salvar grade." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link to="/admin/nucleos" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[var(--theme-primary)] transition-colors mb-2">
            <ArrowLeft size={14} /> Voltar aos Núcleos
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              Grade Horária
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              OK
            </span>
            {turnosCalculados.map(t => (
              <span key={t} className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                t === "Manhã" ? "bg-amber-100 text-amber-800" :
                t === "Tarde" ? "bg-orange-100 text-orange-800" :
                "bg-indigo-100 text-indigo-800"
              }`}>
                {t}
              </span>
            ))}
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Núcleo: <strong className="text-slate-800">{nucleoNome}</strong>
            {espacoNome && <span className="ml-2 text-slate-600 font-semibold">• Espaço Físico: <strong>{espacoNome}</strong></span>}
          </p>
        </div>

        <button
          onClick={handleSalvar}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl shadow-sm transition-all text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar Grade
        </button>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl font-bold text-sm flex items-center gap-2 border ${
          statusMsg.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {statusMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {statusMsg.text}
        </div>
      )}

      {/* Alerta de limitação pelos Horários do Espaço Físico */}
      {espacoHorarios ? (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <Building2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Restrição do Espaço Físico ({espacoNome || "Local"}):</strong> A grade horária deste núcleo é estritamente limitada aos horários de funcionamento cadastrados no Espaço. Dias desativados no Espaço não podem ser selecionados.
          </div>
        </div>
      ) : (
        <div className="bg-indigo-50/80 border border-indigo-200/80 p-4 rounded-xl text-indigo-900 text-xs sm:text-sm flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong>Dica da Grade Horária:</strong> Selecione os dias de funcionamento. Cada dia possui 4 aulas de 2 horas (Turmas A, B, C, D) + 1 período de Planejamento (P).
          </div>
        </div>
      )}

      {/* Seletor dos Dias da Semana */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
          Selecione os Dias de Funcionamento do Núcleo:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {(["1", "2", "3", "4", "5", "6"] as DiasSemana[]).map(d => {
            const diaKey = DIA_KEY_MAP[d];
            const limiteEspaco = espacoHorarios?.[diaKey];
            const permitidoNoEspaco = !espacoHorarios || (limiteEspaco && limiteEspaco.ativo);
            const ativo = diasGrade[d]?.ativo;

            return (
              <label
                key={d}
                className={`py-3 px-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  !permitidoNoEspaco
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-70"
                    : ativo
                    ? "bg-emerald-50/50 border-emerald-300 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={ativo}
                  disabled={!permitidoNoEspaco}
                  onChange={() => handleToggleDia(d)}
                  className="w-4 h-4 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${!permitidoNoEspaco ? "text-slate-400" : ativo ? "text-emerald-900" : "text-slate-700"}`}>
                    {DIAS_MAP[d]}
                  </span>
                  {/* Exibe o horário cadastrado do Espaço */}
                  {limiteEspaco && (
                    <span className={`text-[10px] font-medium mt-0.5 ${!permitidoNoEspaco ? "text-red-400" : ativo ? "text-emerald-600" : "text-slate-400"}`}>
                      {limiteEspaco.ativo ? `${limiteEspaco.abertura} às ${limiteEspaco.fechamento}` : "Fechado no Espaço"}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tabela de Turmas por Dia */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="animate-spin w-5 h-5 text-[var(--theme-primary)]" />
          <span className="text-sm font-medium">Carregando dados da grade...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Bloco</th>
                  {(["1", "2", "3", "4", "5", "6"] as DiasSemana[]).map(d => (
                    <th key={d} className={`text-center px-3 py-3 ${!diasGrade[d]?.ativo ? "opacity-30" : ""}`}>
                      {DIAS_MAP[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { key: "A", name: "Turma A", desc: "Aula", badgeBg: "bg-blue-100 text-blue-800" },
                  { key: "B", name: "Turma B", desc: "Aula", badgeBg: "bg-emerald-100 text-emerald-800" },
                  { key: "C", name: "Turma C", desc: "Aula", badgeBg: "bg-amber-100 text-amber-800" },
                  { key: "D", name: "Turma D", desc: "Aula", badgeBg: "bg-rose-100 text-rose-800" },
                  { key: "P", name: "Planejamento", desc: "Sem Turma", badgeBg: "bg-purple-100 text-purple-800" },
                ].map(slot => (
                  <tr key={slot.key} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${slot.badgeBg}`}>
                          {slot.key}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800">{slot.name}</div>
                          <div className="text-[11px] text-slate-400">{slot.desc}</div>
                        </div>
                      </div>
                    </td>

                    {(["1", "2", "3", "4", "5", "6"] as DiasSemana[]).map(d => {
                      const diaAtivo = diasGrade[d]?.ativo;
                      const slotVal = diasGrade[d]?.slots[slot.key as "A" | "B" | "C" | "D" | "P"];
                      const validoNoEspaco = diaAtivo && slotVal ? isSlotValidInEspaco(d, slotVal) : true;

                      return (
                        <td key={d} className={`px-2 py-4 text-center ${!diaAtivo ? "bg-slate-50/50 opacity-40" : ""}`}>
                          {diaAtivo ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                <input
                                  type="time"
                                  min="06:00"
                                  max="22:00"
                                  className={`w-20 px-1 py-1 rounded text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 bg-white ${
                                    !validoNoEspaco
                                      ? "border-amber-300 text-amber-900 focus:ring-amber-300"
                                      : "border-slate-200 focus:ring-emerald-500"
                                  }`}
                                  value={slotVal?.inicio || ""}
                                  onChange={e => handleHoraChange(d, slot.key as "A" | "B" | "C" | "D" | "P", "inicio", e.target.value)}
                                />
                                <span className="text-[10px] text-slate-400 font-bold">às</span>
                                <input
                                  type="time"
                                  min="06:00"
                                  max="22:00"
                                  className={`w-20 px-1 py-1 rounded text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 bg-white ${
                                    !validoNoEspaco
                                      ? "border-amber-300 text-amber-900 focus:ring-amber-300"
                                      : "border-slate-200 focus:ring-emerald-500"
                                  }`}
                                  value={slotVal?.fim || ""}
                                  onChange={e => handleHoraChange(d, slot.key as "A" | "B" | "C" | "D" | "P", "fim", e.target.value)}
                                />
                              </div>
                              {!validoNoEspaco && (
                                <span className="text-[9px] font-bold text-amber-700 flex items-center gap-0.5 mt-0.5 leading-tight max-w-[100px] text-center" title="Fora da janela de funcionamento do Espaço Físico">
                                  <AlertTriangle size={10} className="text-amber-500 shrink-0" />
                                  Fora do horário do espaço
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-mono">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
