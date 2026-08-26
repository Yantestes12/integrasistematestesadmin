import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, CheckCircle2,
  Calendar, Clock, AlertTriangle, CalendarDays
} from "lucide-react";

interface Ocorrencia {
  id?: number;
  local_evento_id: number;
  projeto_id?: number;
  data_evento: string;   // "YYYY-MM-DD"
  hora_inicio: string;   // "HH:MM"
  hora_fim: string;      // "HH:MM"
  status?: string;
}

interface OcorrenciaForm {
  data_evento: string;
  hora_inicio: string;
  hora_fim: string;
}

const EMPTY_FORM: OcorrenciaForm = { data_evento: "", hora_inicio: "", hora_fim: "" };

const flattenResponse = (data: any): any[] => {
  if (!data) return [];
  let list: any[] = Array.isArray(data) ? data : data.data || data.items || (Array.isArray(data.json) ? data.json : data.json ? [data.json] : [data]);
  let flat: any[] = [];
  list.forEach((entry: any) => {
    if (entry?.json) Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
    else if (Array.isArray(entry)) flat.push(...entry);
    else flat.push(entry);
  });
  return flat.filter(item => item !== null && item !== undefined);
};

const formatDateBR = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
};

export default function OcorrenciasEvento() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const localId = searchParams.get("localId");
  const localNome = decodeURIComponent(searchParams.get("nome") || "Local de Evento");

  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Formulário para nova ocorrência
  const [newForm, setNewForm] = useState<OcorrenciaForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<OcorrenciaForm>>({});
  const [addingNew, setAddingNew] = useState(false);

  const institute = localStorage.getItem("auth_institute") || "IBRASE";

  useEffect(() => {
    if (!localId) return;
    fetchOcorrencias();
  }, [localId]);

  const fetchOcorrencias = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://w.ibrase.com.br/webhook/ocorrencias-evento-get?instituto=${institute.toUpperCase()}&local_evento_id=${localId}`
      );
      if (res.ok) {
        const t = await res.text();
        if (t && t.trim()) {
          try {
            const d = JSON.parse(t);
            const items = flattenResponse(d);
            setOcorrencias(items.sort((a: any, b: any) => a.data_evento > b.data_evento ? 1 : -1));
          } catch (_) { setOcorrencias([]); }
        } else { setOcorrencias([]); }
      }
    } catch (e) { console.warn("Erro ao carregar ocorrências:", e); setOcorrencias([]); }
    finally { setLoading(false); }
  };

  const validateForm = (): boolean => {
    const errs: Partial<OcorrenciaForm> = {};
    if (!newForm.data_evento) errs.data_evento = "Data é obrigatória";
    if (!newForm.hora_inicio) errs.hora_inicio = "Hora de início é obrigatória";
    if (!newForm.hora_fim) errs.hora_fim = "Hora de fim é obrigatória";
    if (newForm.hora_inicio && newForm.hora_fim && newForm.hora_inicio >= newForm.hora_fim) {
      errs.hora_fim = "Hora de fim deve ser após a hora de início";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        instituto: institute.toUpperCase(),
        local_evento_id: Number(localId),
        data_evento: newForm.data_evento,
        hora_inicio: newForm.hora_inicio,
        hora_fim: newForm.hora_fim,
        status: "agendado",
      };
      const res = await fetch("https://w.ibrase.com.br/webhook/ocorrencias-evento-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewForm(EMPTY_FORM);
        setAddingNew(false);
        setStatusMsg({ type: "success", text: "Data adicionada com sucesso!" });
        setTimeout(() => setStatusMsg(null), 3000);
        fetchOcorrencias();
      } else {
        setStatusMsg({ type: "error", text: "Erro ao salvar. Verifique o endpoint N8N." });
      }
    } catch (e) {
      setStatusMsg({ type: "error", text: "Erro ao conectar com o servidor." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch("https://w.ibrase.com.br/webhook/ocorrencias-evento-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, instituto: institute.toUpperCase() }),
      });
      if (res.ok) {
        setOcorrencias(prev => prev.filter(o => o.id !== id));
        setStatusMsg({ type: "success", text: "Data removida." });
        setTimeout(() => setStatusMsg(null), 2000);
      } else {
        setStatusMsg({ type: "error", text: "Erro ao remover data." });
      }
    } catch (e) {
      setStatusMsg({ type: "error", text: "Erro ao conectar." });
    } finally {
      setDeletingId(null);
    }
  };

  const inputCls = (err?: string) =>
    `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
      err ? "border-red-300 focus:ring-red-200" : "border-slate-200 dark:border-slate-700 focus:ring-purple-500/25 focus:border-purple-500"
    }`;

  if (!localId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle size={40} className="text-amber-400" />
        <p className="text-slate-600 font-semibold">Local de evento não especificado.</p>
        <button onClick={() => navigate("/admin/locais-evento")} className="text-purple-600 font-bold hover:underline text-sm">
          Voltar para Locais de Evento
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 font-sans">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => navigate("/admin/locais-evento")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-3"
        >
          <ArrowLeft size={16} /> Voltar para Locais de Evento
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 flex items-center justify-center shrink-0">
            <CalendarDays size={20} className="text-purple-500" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 dark:text-white">Datas do Evento</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{localNome}</p>
          </div>
        </div>
      </div>

      {/* Mensagem de status */}
      {statusMsg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold ${
          statusMsg.type === "success"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
        }`}>
          {statusMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {statusMsg.text}
        </div>
      )}

      {/* Lista de datas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white text-base">Datas Cadastradas</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {ocorrencias.length === 0 ? "Nenhuma data cadastrada" : `${ocorrencias.length} data${ocorrencias.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => { setAddingNew(true); setNewForm(EMPTY_FORM); setFormErrors({}); }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} /> Adicionar Data
          </button>
        </div>

        {/* Formulário para nova data */}
        {addingNew && (
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-900/10">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-purple-500" /> Nova Data
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newForm.data_evento}
                  onChange={e => setNewForm(f => ({ ...f, data_evento: e.target.value }))}
                  className={inputCls(formErrors.data_evento)}
                />
                {formErrors.data_evento && <p className="text-xs text-red-500 mt-1">{formErrors.data_evento}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Hora início <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={newForm.hora_inicio}
                  onChange={e => setNewForm(f => ({ ...f, hora_inicio: e.target.value }))}
                  className={inputCls(formErrors.hora_inicio)}
                />
                {formErrors.hora_inicio && <p className="text-xs text-red-500 mt-1">{formErrors.hora_inicio}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Hora fim <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={newForm.hora_fim}
                  onChange={e => setNewForm(f => ({ ...f, hora_fim: e.target.value }))}
                  className={inputCls(formErrors.hora_fim)}
                />
                {formErrors.hora_fim && <p className="text-xs text-red-500 mt-1">{formErrors.hora_fim}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setAddingNew(false); setNewForm(EMPTY_FORM); setFormErrors({}); }}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-70"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Salvar Data
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-slate-500 text-sm">Carregando datas...</p>
          </div>
        ) : ocorrencias.length === 0 && !addingNew ? (
          <div className="py-14 flex flex-col items-center gap-3 text-center px-4">
            <Calendar size={40} className="text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 font-semibold">Nenhuma data cadastrada ainda</p>
            <p className="text-slate-400 text-sm">Clique em "Adicionar Data" para incluir as datas em que o evento ocorrerá neste local.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {ocorrencias.map((oc, i) => (
              <div key={oc.id || i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 leading-none">{oc.data_evento?.split("-")[2]}</span>
                  <span className="text-xs text-purple-400 leading-none">{["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][Number(oc.data_evento?.split("-")[1])] || ""}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{formatDateBR(oc.data_evento)}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Clock size={11} />
                    <span>{oc.hora_inicio} — {oc.hora_fim}</span>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  oc.status === "realizado" ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" :
                  oc.status === "cancelado" ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" :
                  "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                }`}>
                  {oc.status === "realizado" ? "Realizado" : oc.status === "cancelado" ? "Cancelado" : "Agendado"}
                </span>
                <button
                  onClick={() => oc.id && handleDelete(oc.id)}
                  disabled={deletingId === oc.id}
                  className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Remover data"
                >
                  {deletingId === oc.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
