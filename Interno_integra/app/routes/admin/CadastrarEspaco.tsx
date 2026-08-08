import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  ArrowLeft, ArrowRight, Check, Loader2, Search,
  Home, User, MapPin, Clock, FileUp, CheckCircle2, ChevronRight
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HorarioDia {
  ativo: boolean;
  abertura: string;
  fechamento: string;
}

interface FormData {
  // Passo 1 — Identificação
  projetoId: string;
  modalidadeId: string;
  nomeEspaco: string;

  // Passo 2 — Responsável / Cedente
  respCpf: string;
  respCnpj: string;
  possuiCnpj: "S" | "N";
  respNome: string;
  respEmail: string;
  respTelefone: string;

  // Passo 3 — Endereço
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  pontoReferencia: string;

  // Passo 4 — Horários
  horarios: Record<string, HorarioDia>;

  // Passo 5 — Documentos
  fotoUrl: string;
  termoUrl: string;
  fotoFile: File | null;
  termoFile: File | null;
}

const DIAS = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

const DEFAULT_HORARIOS: Record<string, HorarioDia> = Object.fromEntries(
  DIAS.map(d => [d.key, { ativo: false, abertura: "08:00", fechamento: "17:00" }])
);

const INITIAL_FORM: FormData = {
  projetoId: "", modalidadeId: "", nomeEspaco: "",
  respCpf: "", respCnpj: "", possuiCnpj: "N", respNome: "", respEmail: "", respTelefone: "",
  cep: "", rua: "", numero: "", bairro: "", cidade: "", uf: "", pontoReferencia: "",
  horarios: DEFAULT_HORARIOS,
  fotoUrl: "", termoUrl: "", fotoFile: null, termoFile: null,
};

const STEPS = [
  { label: "Identificação", icon: Home },
  { label: "Responsável", icon: User },
  { label: "Endereço", icon: MapPin },
  { label: "Horários", icon: Clock },
  { label: "Documentos", icon: FileUp },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const flattenResponse = (data: any): any[] => {
  if (!data) return [];
  let list: any[] = Array.isArray(data) ? data : data.data || data.items || (Array.isArray(data.json) ? data.json : data.json ? [data.json] : [data]);
  let flat: any[] = [];
  list.forEach((entry: any) => {
    if (entry?.json) Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
    else if (Array.isArray(entry)) flat.push(...entry);
    else flat.push(entry);
  });
  return flat;
};

const formatCpf = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
          .replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3")
          .replace(/(\d{3})(\d{0,3})/, "$1.$2");
};

const formatCnpj = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
          .replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4")
          .replace(/(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3")
          .replace(/(\d{2})(\d{0,3})/, "$1.$2");
};

const formatCep = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d{0,3})/, "$1-$2");
};

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/(\d{2})(\d{0,4})/, "($1) $2");
  return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CadastrarEspaco() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | string, string>>>({});
  const [projetos, setProjetos] = useState<{ id: string; nome: string }[]>([]);
  const [modalidades, setModalidades] = useState<{ id: string; nome: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(!!editId);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isSearchingCpf, setIsSearchingCpf] = useState(false);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [isUploadingTermo, setIsUploadingTermo] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const termoInputRef = useRef<HTMLInputElement>(null);

  const institute = localStorage.getItem("auth_institute") || "IBRASE";

  // ─── Load projetos + modalidades ─────────────────────────────────────────
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [rProjetos, rModal] = await Promise.all([
          fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${institute.toUpperCase()}`),
          fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${institute.toUpperCase()}`),
        ]);
        if (rProjetos.ok) {
          const d = await rProjetos.json();
          setProjetos(flattenResponse(d).map((p: any) => ({ id: String(p.id), nome: p.nome || "" })).filter(p => p.nome));
        }
        if (rModal.ok) {
          const d = await rModal.json();
          setModalidades(flattenResponse(d).map((m: any) => ({ id: String(m.id), nome: m.nome || "" })).filter(m => m.nome));
        }
      } catch (e) { console.warn("Erro ao carregar opções:", e); }
    };
    loadOptions();
  }, []);

  // ─── Load edit data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!editId) return;
    const load = async () => {
      try {
        const res = await fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${institute.toUpperCase()}`);
        if (res.ok) {
          const data = await res.json();
          const espaco = flattenResponse(data).find((e: any) => String(e.id) === editId);
          if (espaco) {
            setForm({
              projetoId: String(espaco.projeto_id || ""),
              modalidadeId: String(espaco.modalidade_id || ""),
              nomeEspaco: espaco.nome || "",
              respCpf: espaco.resp_cpf || "",
              respCnpj: espaco.resp_cnpj || "",
              possuiCnpj: espaco.resp_cnpj ? "S" : "N",
              respNome: espaco.resp_nome || "",
              respEmail: espaco.resp_email || "",
              respTelefone: espaco.resp_telefone || "",
              cep: espaco.cep || "",
              rua: espaco.rua || "",
              numero: espaco.numero || "",
              bairro: espaco.bairro || "",
              cidade: espaco.cidade || "",
              uf: espaco.uf || "",
              pontoReferencia: espaco.ponto_referencia || "",
              horarios: { ...DEFAULT_HORARIOS, ...(espaco.horarios || {}) },
              fotoUrl: espaco.foto_url || "",
              termoUrl: espaco.termo_url || "",
              fotoFile: null,
              termoFile: null,
            });
          }
        }
      } catch (e) { console.error(e); }
      finally { setIsLoadingData(false); }
    };
    load();
  }, [editId]);

  // ─── Form field update ────────────────────────────────────────────────────
  const set = (field: keyof FormData, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  // ─── APIs ─────────────────────────────────────────────────────────────────
  const buscarCep = async () => {
    const clean = form.cep.replace(/\D/g, "");
    if (clean.length !== 8) { setErrors(e => ({ ...e, cep: "CEP deve ter 8 dígitos" })); return; }
    setIsSearchingCep(true);
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/consultarcep?cep=${clean}`);
      if (res.ok) {
        const d = await res.json();
        const addr = d.result || d;
        if (addr && !addr.erro) {
          setForm(f => ({
            ...f,
            rua: addr.logradouro || f.rua,
            bairro: addr.bairro || f.bairro,
            cidade: addr.localidade || addr.cidade || f.cidade,
            uf: addr.uf || f.uf,
          }));
          setErrors(e => { const n = { ...e }; delete n.cep; return n; });
        } else { setErrors(e => ({ ...e, cep: "CEP não encontrado" })); }
      }
    } catch { setErrors(e => ({ ...e, cep: "Erro ao buscar CEP" })); }
    finally { setIsSearchingCep(false); }
  };

  const buscarCpf = async () => {
    const clean = form.respCpf.replace(/\D/g, "");
    if (clean.length !== 11) { setErrors(e => ({ ...e, respCpf: "CPF deve ter 11 dígitos" })); return; }
    setIsSearchingCpf(true);
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/api-hub-cpf?cpf=${clean}&token=193160880WeLPJqFrMT348746112`);
      if (res.ok) {
        const d = await res.json();
        const nome = d?.nome || d?.result?.nome || d?.data?.nome || "";
        if (nome) { set("respNome", nome); }
      }
    } catch { console.warn("Erro CPF"); }
    finally { setIsSearchingCpf(false); }
  };

  const buscarCnpj = async () => {
    const clean = form.respCnpj.replace(/\D/g, "");
    if (clean.length !== 14) { setErrors(e => ({ ...e, respCnpj: "CNPJ deve ter 14 dígitos" })); return; }
    setIsSearchingCnpj(true);
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/consultarcnpj?cnpj=${clean}`);
      if (res.ok) {
        const d = await res.json();
        const info = d?.result || d;
        if (info?.nome || info?.razao_social) {
          set("respNome", info.nome || info.razao_social || form.respNome);
        }
      }
    } catch { console.warn("Erro CNPJ"); }
    finally { setIsSearchingCnpj(false); }
  };

  // ─── Convert File to Base64 ───────────────────────────────────────────────
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    const errs: typeof errors = {};

    if (step === 0) {
      if (!form.projetoId) errs.projetoId = "Selecione uma iniciativa";
      if (!form.nomeEspaco.trim()) errs.nomeEspaco = "Nome do espaço é obrigatório";
    }

    if (step === 1) {
      if (!form.respCpf.replace(/\D/g, "").length) errs.respCpf = "CPF é obrigatório";
      if (!form.respNome.trim()) errs.respNome = "Nome do responsável é obrigatório";
      if (!form.respEmail.trim() || !form.respEmail.includes("@")) errs.respEmail = "E-mail inválido";
      if (!form.respTelefone.trim()) errs.respTelefone = "Telefone é obrigatório";
      if (form.possuiCnpj === "S" && !form.respCnpj.replace(/\D/g, "").length) errs.respCnpj = "CNPJ é obrigatório";
    }

    if (step === 2) {
      if (!form.cep.replace(/\D/g, "").length) errs.cep = "CEP é obrigatório";
      if (!form.rua.trim()) errs.rua = "Rua/Logradouro é obrigatório";
      if (!form.bairro.trim()) errs.bairro = "Bairro é obrigatório";
      if (!form.numero.trim() && !form.pontoReferencia.trim()) {
        errs.numero = "Informe o número OU o ponto de referência";
        errs.pontoReferencia = "Informe o número OU o ponto de referência";
      }
    }

    if (step === 3) {
      const algumDia = DIAS.some(d => form.horarios[d.key]?.ativo);
      if (!algumDia) errs.horarios = "Selecione pelo menos um dia de funcionamento";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSaving(true);

    try {
      let fotoUrl = form.fotoUrl;
      let termoUrl = form.termoUrl;

      // Converte arquivos para Base64 se houver
      if (form.fotoFile) {
        setIsUploadingFoto(true);
        try { fotoUrl = await fileToBase64(form.fotoFile); } catch (e) { console.warn("Erro ao converter foto"); }
        setIsUploadingFoto(false);
      }
      if (form.termoFile) {
        setIsUploadingTermo(true);
        try { termoUrl = await fileToBase64(form.termoFile); } catch (e) { console.warn("Erro ao converter termo"); }
        setIsUploadingTermo(false);
      }

      const payload = {
        instituto: institute,
        projeto_id: form.projetoId ? Number(form.projetoId) : null,
        modalidade_id: form.modalidadeId ? Number(form.modalidadeId) : null,
        nome: form.nomeEspaco,
        resp_cpf: form.respCpf.replace(/\D/g, ""),
        resp_cnpj: form.possuiCnpj === "S" ? form.respCnpj.replace(/\D/g, "") : null,
        resp_nome: form.respNome,
        resp_email: form.respEmail,
        resp_telefone: form.respTelefone.replace(/\D/g, ""),
        cep: form.cep.replace(/\D/g, ""),
        rua: form.rua,
        numero: form.numero,
        bairro: form.bairro,
        cidade: form.cidade,
        uf: form.uf,
        ponto_referencia: form.pontoReferencia,
        horarios: form.horarios,
        foto_url: fotoUrl,
        termo_url: termoUrl,
        ativo: true,
        created_by: localStorage.getItem("auth_user") || "sistema",
        ...(editId ? { id: Number(editId), updated_by: localStorage.getItem("auth_user") || "sistema" } : {}),
      };

      const endpoint = editId ? "espacos-put" : "espacos-post";
      const res = await fetch(`https://w.ibrase.com.br/webhook/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => navigate("/admin/espacos"), 2000);
      } else {
        alert("Erro ao salvar espaço. Verifique os dados e tente novamente.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Loading / Success states ─────────────────────────────────────────────
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-slate-500 font-sans">
        <Loader2 className="animate-spin w-6 h-6" />
        <span className="text-sm font-medium">Carregando dados do espaço...</span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 font-sans">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Espaço {editId ? "atualizado" : "cadastrado"} com sucesso!</h2>
        <p className="text-slate-500 text-sm">Redirecionando...</p>
      </div>
    );
  }

  // ─── Field helper ─────────────────────────────────────────────────────────
  const Field = ({ label, error, children, required }: { label: React.ReactNode; error?: string; children: React.ReactNode; required?: boolean }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors ${
      err ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-[var(--theme-primary)]/25 focus:border-[var(--theme-primary)]"
    }`;

  // ─── Step content ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── PASSO 1: Identificação ────────────────────────────────────────────
      case 0:
        return (
          <div className="space-y-5">
            <Field 
              label={
                <span>
                  Qual Projeto/Evento? <span className="text-slate-400 font-normal text-xs opacity-70 ml-1.5">* Iniciativa</span>
                </span>
              } 
              error={errors.projetoId} 
              required
            >
              <select className={inputCls(errors.projetoId)} value={form.projetoId} onChange={e => set("projetoId", e.target.value)}>
                <option value="">Selecione um projeto/evento...</option>
                {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </Field>

            <Field label="Qual modalidade?" error={errors.modalidadeId}>
              <select className={inputCls(errors.modalidadeId)} value={form.modalidadeId} onChange={e => set("modalidadeId", e.target.value)}>
                <option value="">Selecione uma modalidade... (opcional)</option>
                {modalidades.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </Field>

            <Field label="Nome do Espaço" error={errors.nomeEspaco} required>
              <input
                type="text"
                placeholder="Ex: Casa de Cultura do Bairro, Quadra Municipal..."
                className={inputCls(errors.nomeEspaco)}
                value={form.nomeEspaco}
                onChange={e => set("nomeEspaco", e.target.value)}
              />
            </Field>
          </div>
        );

      // ── PASSO 2: Responsável ──────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5">
            {/* CPF */}
            <Field label="CPF do Responsável" error={errors.respCpf} required>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  className={inputCls(errors.respCpf) + " flex-1"}
                  value={form.respCpf}
                  onChange={e => set("respCpf", formatCpf(e.target.value))}
                  maxLength={14}
                />
                <button
                  type="button"
                  onClick={buscarCpf}
                  disabled={isSearchingCpf}
                  className="px-4 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
                >
                  {isSearchingCpf ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
            </Field>

            {/* CNPJ toggle */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700">Possui CNPJ?</label>
              <div className="flex gap-2">
                {(["S", "N"] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("possuiCnpj", v)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      form.possuiCnpj === v
                        ? "bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {v === "S" ? "Sim" : "Não"}
                  </button>
                ))}
              </div>
            </div>

            {/* CNPJ field */}
            {form.possuiCnpj === "S" && (
              <Field label="CNPJ" error={errors.respCnpj} required>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    className={inputCls(errors.respCnpj) + " flex-1"}
                    value={form.respCnpj}
                    onChange={e => set("respCnpj", formatCnpj(e.target.value))}
                    maxLength={18}
                  />
                  <button
                    type="button"
                    onClick={buscarCnpj}
                    disabled={isSearchingCnpj}
                    className="px-4 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
                  >
                    {isSearchingCnpj ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  </button>
                </div>
              </Field>
            )}

            <Field label="Nome completo" error={errors.respNome} required>
              <input
                type="text"
                placeholder="Nome do responsável pelo espaço"
                className={inputCls(errors.respNome)}
                value={form.respNome}
                onChange={e => set("respNome", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="E-mail" error={errors.respEmail} required>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  className={inputCls(errors.respEmail)}
                  value={form.respEmail}
                  onChange={e => set("respEmail", e.target.value)}
                />
              </Field>
              <Field label="Telefone / WhatsApp" error={errors.respTelefone} required>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  className={inputCls(errors.respTelefone)}
                  value={form.respTelefone}
                  onChange={e => set("respTelefone", formatPhone(e.target.value))}
                  maxLength={15}
                />
              </Field>
            </div>
          </div>
        );

      // ── PASSO 3: Endereço ─────────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-5">
            <Field label="CEP" error={errors.cep} required>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  className={inputCls(errors.cep) + " flex-1"}
                  value={form.cep}
                  onChange={e => set("cep", formatCep(e.target.value))}
                  maxLength={9}
                />
                <button
                  type="button"
                  onClick={buscarCep}
                  disabled={isSearchingCep}
                  className="px-4 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
                >
                  {isSearchingCep ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Rua / Logradouro" error={errors.rua} required>
                <input type="text" placeholder="Nome da rua" className={inputCls(errors.rua)} value={form.rua} onChange={e => set("rua", e.target.value)} />
              </Field>
              <Field label="Número" error={errors.numero}>
                <input type="text" placeholder="S/N ou número" className={inputCls(errors.numero)} value={form.numero} onChange={e => set("numero", e.target.value)} />
              </Field>
              <Field label="Bairro" error={errors.bairro} required>
                <input type="text" placeholder="Bairro" className={inputCls(errors.bairro)} value={form.bairro} onChange={e => set("bairro", e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Cidade" error={errors.cidade}>
                <input type="text" placeholder="Cidade" className={inputCls(errors.cidade)} value={form.cidade} onChange={e => set("cidade", e.target.value)} />
              </Field>
              <Field label="UF" error={errors.uf}>
                <input type="text" placeholder="UF" className={inputCls(errors.uf)} value={form.uf} onChange={e => set("uf", e.target.value.toUpperCase().slice(0, 2))} maxLength={2} />
              </Field>
            </div>

            <Field label="Ponto de Referência" error={errors.pontoReferencia}>
              <input
                type="text"
                placeholder="Obrigatório se não houver número"
                className={inputCls(errors.pontoReferencia)}
                value={form.pontoReferencia}
                onChange={e => set("pontoReferencia", e.target.value)}
              />
            </Field>

            {(errors.numero || errors.pontoReferencia) && (
              <p className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ Se não houver número, preencha o Ponto de Referência
              </p>
            )}
          </div>
        );

      // ── PASSO 4: Horários ─────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-4">
            {errors.horarios && (
              <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errors.horarios}
              </p>
            )}
            <p className="text-sm text-slate-500">Selecione os dias e horários em que o espaço está disponível:</p>
            <div className="space-y-3">
              {DIAS.map(({ key, label }) => {
                const h = form.horarios[key];
                return (
                  <div
                    key={key}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-colors ${
                      h.ativo ? "border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/5" : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer min-w-[120px]">
                      <input
                        type="checkbox"
                        checked={h.ativo}
                        onChange={e => setForm(f => ({
                          ...f,
                          horarios: { ...f.horarios, [key]: { ...f.horarios[key], ativo: e.target.checked } }
                        }))}
                        className="w-4 h-4 accent-[var(--theme-primary)] cursor-pointer"
                      />
                      <span className={`text-sm font-semibold ${h.ativo ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
                    </label>

                    {h.ativo && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500 font-medium">Abre</label>
                          <input
                            type="time"
                            value={h.abertura}
                            onChange={e => setForm(f => ({
                              ...f,
                              horarios: { ...f.horarios, [key]: { ...f.horarios[key], abertura: e.target.value } }
                            }))}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/25"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500 font-medium">Fecha</label>
                          <input
                            type="time"
                            value={h.fechamento}
                            onChange={e => setForm(f => ({
                              ...f,
                              horarios: { ...f.horarios, [key]: { ...f.horarios[key], fechamento: e.target.value } }
                            }))}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/25"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ── PASSO 5: Documentos ───────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-6">
            <p className="text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              ℹ️ <strong>Obs:</strong> Somente o arquivo mais recente é mantido. Enviar um novo arquivo substitui o anterior.
            </p>

            {/* Foto georeferenciada */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Foto georeferenciada <span className="text-slate-400 font-normal">(opcional)</span></label>
              <div
                onClick={() => fotoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-[var(--theme-primary)]/50 hover:bg-slate-50 transition-colors"
              >
                {form.fotoFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <p className="text-sm font-medium text-slate-700">{form.fotoFile.name}</p>
                    <p className="text-xs text-slate-400">{(form.fotoFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                ) : form.fotoUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <p className="text-sm text-slate-600">Foto já enviada — clique para substituir</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileUp className="w-8 h-8 text-slate-300" />
                    <p className="text-sm text-slate-500">Clique para selecionar a foto</p>
                    <p className="text-xs text-slate-400">JPG, PNG, HEIC — máx. 10MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) set("fotoFile", e.target.files[0]); }}
              />
            </div>

            {/* Termo de Uso */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Termo de Uso assinado (PDF) <span className="text-slate-400 font-normal">(opcional)</span></label>
              <div
                onClick={() => termoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-[var(--theme-primary)]/50 hover:bg-slate-50 transition-colors"
              >
                {form.termoFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <p className="text-sm font-medium text-slate-700">{form.termoFile.name}</p>
                    <p className="text-xs text-slate-400">{(form.termoFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                ) : form.termoUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <p className="text-sm text-slate-600">Termo já enviado — clique para substituir</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileUp className="w-8 h-8 text-slate-300" />
                    <p className="text-sm text-slate-500">Clique para selecionar o PDF</p>
                    <p className="text-xs text-slate-400">Somente PDF — máx. 20MB</p>
                  </div>
                )}
              </div>
              <input
                ref={termoInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) set("termoFile", e.target.files[0]); }}
              />
            </div>
          </div>
        );

      default: return null;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/espacos")}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            {editId ? "Editar Espaço" : "Cadastrar Espaço"}
          </h1>
          <p className="text-slate-500 text-sm">Passo {step + 1} de {STEPS.length}</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <React.Fragment key={i}>
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex flex-col items-center gap-1 min-w-0 ${i < step ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  done ? "bg-[var(--theme-primary)] text-white" :
                  active ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-2 border-[var(--theme-primary)]" :
                  "bg-slate-100 text-slate-400"
                }`}>
                  {done ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-[10px] font-bold hidden sm:block ${active ? "text-[var(--theme-primary)]" : done ? "text-slate-600" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-[var(--theme-primary)]" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          {(() => { const Icon = STEPS[step].icon; return <Icon className="w-5 h-5 text-[var(--theme-primary)]" />; })()}
          <h2 className="text-lg font-bold text-slate-800">{STEPS[step].label}</h2>
        </div>
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4 pb-8">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} /> Anterior
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--theme-primary)] text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Próximo <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--theme-primary)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isUploadingFoto ? "Enviando foto..." : isUploadingTermo ? "Enviando termo..." : "Salvando..."}
              </>
            ) : (
              <><Check size={16} /> {editId ? "Atualizar" : "Cadastrar"}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
