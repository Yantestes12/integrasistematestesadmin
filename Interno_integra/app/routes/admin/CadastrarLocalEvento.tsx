import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  ArrowLeft, ArrowRight, Check, Loader2, Search,
  MapPin, FileUp, CheckCircle2, ChevronRight, Calendar,
  Plus, X, FileText, Upload, Image
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocItem {
  nome: string;
  url: string; // URL pública do Supabase Storage
  isUploading?: boolean;
}

interface FormData {
  // Passo 1 — Identificação
  projetoId: string;
  nomeLocal: string;

  // Passo 2 — Endereço
  cep: string;
  rua: string;
  numero: string;
  semNumero: boolean;
  bairro: string;
  cidade: string;
  uf: string;
  pontoReferencia: string;

  // Passo 3 — Foto & Documentos
  fotoUrl: string;
  fotoFile: File | null;
  documentos: DocItem[];
}

const INITIAL_FORM: FormData = {
  projetoId: "", nomeLocal: "",
  cep: "", rua: "", numero: "", semNumero: false,
  bairro: "", cidade: "", uf: "", pontoReferencia: "",
  fotoUrl: "", fotoFile: null, documentos: [],
};

const STEPS = [
  { label: "Identificação", icon: Calendar },
  { label: "Endereço", icon: MapPin },
  { label: "Foto e Documentos", icon: FileUp },
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
  return flat.filter(item => item !== null && item !== undefined);
};

const formatCep = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
};

// ─── Field helper ─────────────────────────────────────────────────────────────
const Field = ({ label, error, children, required }: { label: React.ReactNode; error?: string; children: React.ReactNode; required?: boolean }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

const inputCls = (err?: string) =>
  `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
    err ? "border-red-300 focus:ring-red-200" : "border-slate-200 dark:border-slate-700 focus:ring-purple-500/25 focus:border-purple-500"
  }`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function CadastrarLocalEvento() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [projetos, setProjetos] = useState<{ id: string; nome: string; aplicabilidade?: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(!!editId);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [newDocNome, setNewDocNome] = useState("");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const institute = localStorage.getItem("auth_institute") || "IBRASE";

  // ─── Load projetos filtrados por aplicabilidade ────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${institute.toUpperCase()}`);
        if (res.ok) {
          const t = await res.text();
          if (t) {
            const d = JSON.parse(t);
            const all = flattenResponse(d).map((p: any) => ({
              id: String(p.id),
              nome: p.nome || "",
              aplicabilidade: (p.aplicabilidade || "").toLowerCase(),
            })).filter(p => p.nome);
            // Mostrar apenas propostas com aplicabilidade "eventos" — se não houver nenhuma, mostrar todas para não travar o usuário
            const eventoPropostas = all.filter(p => p.aplicabilidade === "eventos" || p.aplicabilidade.includes("evento"));
            setProjetos(eventoPropostas.length > 0 ? eventoPropostas : all);
          }
        }
      } catch (e) { console.warn("Erro ao carregar projetos:", e); }
    };
    load();
  }, [institute]);

  // ─── Load edit data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editId) return;
    const load = async () => {
      try {
        const res = await fetch(`https://w.ibrase.com.br/webhook/locais-evento-get?instituto=${institute.toUpperCase()}`);
        if (res.ok) {
          const t = await res.text();
          if (!t) return;
          const data = JSON.parse(t);
          const local = flattenResponse(data).find((e: any) => String(e.id) === editId);
          if (local) {
            setForm({
              projetoId: String(local.projeto_id || ""),
              nomeLocal: local.nome || "",
              cep: local.cep || "",
              rua: local.rua || "",
              numero: local.numero || "",
              semNumero: Boolean(local.sem_numero),
              bairro: local.bairro || "",
              cidade: local.cidade || "",
              uf: local.uf || "",
              pontoReferencia: local.ponto_referencia || "",
              fotoUrl: local.foto_url || "",
              fotoFile: null,
              documentos: typeof local.documentos === "string" ? JSON.parse(local.documentos || "[]") : (local.documentos || []),
            });
          }
        }
      } catch (e) { console.error(e); }
      finally { setIsLoadingData(false); }
    };
    load();
  }, [editId]);

  // ─── Field update ──────────────────────────────────────────────────────────
  const set = (field: keyof FormData, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  // ─── Busca CEP ─────────────────────────────────────────────────────────────
  const buscarCep = async () => {
    const clean = form.cep.replace(/\D/g, "");
    if (clean.length !== 8) { setErrors(e => ({ ...e, cep: "CEP deve ter 8 dígitos" })); return; }
    setIsSearchingCep(true);
    try {
      const res = await fetch(`https://w.ibrase.com.br/webhook/consultar-cep?cep=${clean}`);
      if (res.ok) {
        const d = await res.json();
        const item = Array.isArray(d) ? d[0] : d;
        const addr = item?.result || item?.data || item;
        if (addr && !addr.erro) {
          setForm(f => ({
            ...f,
            rua: addr.logradouro || f.rua,
            bairro: addr.bairro || f.bairro,
            cidade: addr.localidade || addr.cidade || f.cidade,
            uf: addr.uf || f.uf,
          }));
          setErrors(e => { const n = { ...e }; delete n.cep; return n; });
        } else {
          setErrors(e => ({ ...e, cep: "CEP não encontrado. Preencha manualmente." }));
        }
      }
    } catch { setErrors(e => ({ ...e, cep: "Erro ao buscar CEP. Preencha manualmente." })); }
    finally { setIsSearchingCep(false); }
  };

  // ─── Upload via N8N → Supabase Storage ───────────────────────────────────
  const uploadToStorage = async (file: File, bucket: "eventos-fotos" | "eventos-documentos"): Promise<string> => {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]); // apenas o base64 puro, sem prefixo
      reader.onerror = reject;
    });
    const res = await fetch("https://w.ibrase.com.br/webhook/upload-storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket,
        fileName: `${institute.toLowerCase()}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`,
        mimeType: file.type,
        base64,
      }),
    });
    if (!res.ok) throw new Error("Erro no upload do arquivo");
    const data = await res.json();
    const result = Array.isArray(data) ? data[0] : data;
    const url = result?.url || result?.publicUrl || result?.data?.url || result?.data?.publicUrl;
    if (!url) throw new Error("URL pública não retornada pelo N8N");
    return url;
  };

  // ─── Adicionar documento ───────────────────────────────────────────────────
  const handleAddDoc = async (file: File) => {
    if (!file) return;
    const nome = newDocNome.trim() || file.name.replace(/\.[^.]+$/, "");
    // Adiciona placeholder enquanto faz upload
    const placeholderDoc: DocItem = { nome, url: "", isUploading: true };
    setForm(f => ({ ...f, documentos: [...f.documentos, placeholderDoc] }));
    setIsUploadingDoc(true);
    setNewDocNome("");
    try {
      const url = await uploadToStorage(file, "eventos-documentos");
      setForm(f => {
        const docs = [...f.documentos];
        // Substitui o último placeholder
        const idx = docs.map(d => d.isUploading).lastIndexOf(true);
        if (idx !== -1) docs[idx] = { nome, url };
        return { ...f, documentos: docs };
      });
    } catch (e) {
      console.warn("Erro ao fazer upload do documento:", e);
      // Remove o placeholder com erro
      setForm(f => ({ ...f, documentos: f.documentos.filter(d => !d.isUploading) }));
      alert("Erro ao enviar documento. Verifique se o endpoint N8N upload-storage está configurado.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleRemoveDoc = (idx: number) => {
    setForm(f => ({ ...f, documentos: f.documentos.filter((_, i) => i !== idx) }));
  };

  // ─── Validação ─────────────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    const errs: typeof errors = {};

    if (step === 0) {
      if (!form.projetoId) errs.projetoId = "Selecione o evento/proposta";
      if (!form.nomeLocal.trim()) errs.nomeLocal = "Nome do local é obrigatório";
    }

    if (step === 1) {
      if (!form.cep.replace(/\D/g, "").length) errs.cep = "CEP é obrigatório";
      if (!form.rua.trim()) errs.rua = "Rua/Logradouro é obrigatório";
      if (!form.bairro.trim()) errs.bairro = "Bairro é obrigatório";
      if (!form.semNumero && !form.numero.trim()) errs.numero = "Informe o número ou marque 'Sem número'";
      if (form.semNumero && !form.pontoReferencia.trim()) errs.pontoReferencia = "Ponto de referência obrigatório quando sem número";
    }

    if (step === 2) {
      if (!form.fotoUrl && !form.fotoFile) errs.foto = "Adicione uma foto do local";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSaving(true);

    try {
      let fotoUrl = form.fotoUrl;
      if (form.fotoFile) {
        setIsUploadingFoto(true);
        try {
          fotoUrl = await uploadToStorage(form.fotoFile, "eventos-fotos");
        } catch (e) {
          console.warn("Erro no upload da foto:", e);
          alert("Erro ao enviar a foto. Verifique se o endpoint N8N upload-storage está configurado.");
          setIsSaving(false);
          setIsUploadingFoto(false);
          return;
        }
        setIsUploadingFoto(false);
      }

      const payload = {
        instituto: institute.toUpperCase(),
        projeto_id: form.projetoId ? Number(form.projetoId) : null,
        nome: form.nomeLocal,
        cep: form.cep.replace(/\D/g, ""),
        rua: form.rua,
        numero: form.numero,
        sem_numero: form.semNumero,
        bairro: form.bairro,
        cidade: form.cidade,
        uf: form.uf,
        ponto_referencia: form.pontoReferencia,
        foto_url: fotoUrl,
        documentos: form.documentos,
        ativo: true,
        status_aprovacao: "pendente",
        created_by: localStorage.getItem("auth_user") || "sistema",
        ...(editId ? { id: editId, updated_by: localStorage.getItem("auth_user") || "sistema" } : {}),
      };

      const endpoint = editId ? "locais-evento-put" : "locais-evento-post";
      const res = await fetch(`https://w.ibrase.com.br/webhook/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSuccess(true);
        const responseData = await res.json();
        const result = Array.isArray(responseData) ? responseData[0] : responseData;
        const insertedId = result?.id || result?.data?.id || (Array.isArray(result) && result[0]?.id);

        setTimeout(() => {
          if (!editId && insertedId) {
            // Se for novo cadastro, manda direto pras datas (ocorrências)
            navigate(`/admin/ocorrencias-evento?localId=${insertedId}`);
          } else {
            navigate("/admin/locais-evento");
          }
        }, 2000);
      } else {
        alert("Erro ao salvar local de evento. Verifique os dados e tente novamente.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Loading / Success ─────────────────────────────────────────────────────
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-slate-500 font-sans">
        <Loader2 className="animate-spin w-6 h-6" />
        <span className="text-sm font-medium">Carregando dados do local...</span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 font-sans">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Local {editId ? "atualizado" : "cadastrado"} com sucesso!</h2>
        <p className="text-slate-500 text-sm">Redirecionando...</p>
      </div>
    );
  }

  // ─── Step content ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      // ── PASSO 1: Identificação ─────────────────────────────────────────────
      case 0:
        return (
          <div className="space-y-5">
            <Field label="Evento/Projeto Vinculado" error={errors.projetoId} required>
              <select
                value={form.projetoId}
                onChange={e => set("projetoId", e.target.value)}
                className={inputCls(errors.projetoId)}
              >
                <option value="">Selecione o evento/proposta...</option>
                {projetos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              {projetos.length === 0 && (
                <p className="text-xs text-amber-600 font-medium mt-1">Nenhuma proposta de evento encontrada. Verifique se há propostas com aplicabilidade "eventos" cadastradas.</p>
              )}
            </Field>

            <Field label="Nome do Local" error={errors.nomeLocal} required>
              <input
                type="text"
                value={form.nomeLocal}
                onChange={e => set("nomeLocal", e.target.value)}
                placeholder="Ex: Centro Cultural Municipal, Ginásio do Bairro..."
                className={inputCls(errors.nomeLocal)}
              />
            </Field>
          </div>
        );

      // ── PASSO 2: Endereço ──────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5">
            <Field label="CEP" error={errors.cep} required>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.cep}
                  onChange={e => set("cep", formatCep(e.target.value))}
                  placeholder="00000-000"
                  inputMode="numeric"
                  maxLength={9}
                  className={`${inputCls(errors.cep)} flex-1`}
                />
                <button
                  type="button"
                  onClick={buscarCep}
                  disabled={isSearchingCep}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
                >
                  {isSearchingCep ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  Buscar
                </button>
              </div>
            </Field>

            <Field label="Rua / Logradouro" error={errors.rua} required>
              <input type="text" value={form.rua} onChange={e => set("rua", e.target.value)} placeholder="Nome da rua..." className={inputCls(errors.rua)} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Número" error={errors.numero} required={!form.semNumero}>
                <input
                  type="text"
                  value={form.numero}
                  onChange={e => set("numero", e.target.value)}
                  disabled={form.semNumero}
                  placeholder={form.semNumero ? "S/N" : "Ex: 123"}
                  className={`${inputCls(errors.numero)} disabled:opacity-50`}
                />
              </Field>
              <Field label="Bairro" error={errors.bairro} required>
                <input type="text" value={form.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Bairro..." className={inputCls(errors.bairro)} />
              </Field>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.semNumero}
                onChange={e => set("semNumero", e.target.checked)}
                className="w-4 h-4 rounded accent-purple-600"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Sem número</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Cidade" error={errors.cidade}>
                <input type="text" value={form.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Cidade..." className={inputCls(errors.cidade)} />
              </Field>
              <Field label="UF" error={errors.uf}>
                <input type="text" value={form.uf} onChange={e => set("uf", e.target.value.toUpperCase().slice(0, 2))} placeholder="RJ" className={inputCls(errors.uf)} />
              </Field>
            </div>

            <Field label="Ponto de Referência" error={errors.pontoReferencia} required={form.semNumero}>
              <input type="text" value={form.pontoReferencia} onChange={e => set("pontoReferencia", e.target.value)} placeholder="Próximo a..." className={inputCls(errors.pontoReferencia)} />
            </Field>
          </div>
        );

      // ── PASSO 3: Foto e Documentos ─────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-6">

            {/* Foto */}
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Foto do Local <span className="text-red-500">*</span>
              </p>
              {errors.foto && <p className="text-xs text-red-500 font-medium mb-2">{errors.foto}</p>}
              <input ref={fotoInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                set("fotoFile", f);
                set("fotoUrl", "");
              }} />
              {form.fotoUrl || form.fotoFile ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                  <img
                    src={form.fotoFile ? URL.createObjectURL(form.fotoFile) : form.fotoUrl}
                    alt="Foto do local"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => fotoInputRef.current?.click()}
                      className="bg-white text-slate-800 text-xs font-bold px-3 py-2 rounded-lg shadow"
                    >
                      Trocar foto
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fotoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl py-10 flex flex-col items-center gap-3 text-slate-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
                >
                  <Image size={32} />
                  <span className="text-sm font-medium">Clique para adicionar uma foto do local</span>
                  <span className="text-xs">JPG, PNG, WEBP</span>
                </button>
              )}
            </div>

            {/* Documentos */}
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Documentos <span className="text-slate-400 font-normal text-xs">(opcional)</span></p>
              <p className="text-xs text-slate-400 mb-3">Adicione contratos, autorizações, plantas ou qualquer documento relevante ao local.</p>

              {form.documentos.length > 0 && (
                <div className="space-y-2 mb-4">
                                {form.documentos.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      {doc.isUploading ? (
                        <Loader2 size={16} className="text-blue-400 animate-spin shrink-0" />
                      ) : (
                        <FileText size={16} className="text-blue-500 shrink-0" />
                      )}
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">
                        {doc.nome || `Documento ${i + 1}`}
                        {doc.isUploading && <span className="text-xs text-blue-400 ml-2">Enviando...</span>}
                      </span>
                      {!doc.isUploading && (
                        <button onClick={() => handleRemoveDoc(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { handleAddDoc(f); e.target.value = ""; }
              }} />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDocNome}
                  onChange={e => setNewDocNome(e.target.value)}
                  placeholder="Nome do documento (opcional)..."
                  className="flex-1 px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500"
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); docInputRef.current?.click(); } }}
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={isUploadingDoc}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUploadingDoc ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Anexar
                </button>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  // ─── Layout Principal ──────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 font-sans">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate("/admin/locais-evento")} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <span className="text-slate-400 text-sm">Locais de Evento</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-700 dark:text-slate-200 font-semibold text-sm">{editId ? "Editar Local" : "Novo Local"}</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">
          {editId ? "Editar Local de Evento" : "Cadastrar Local de Evento"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Preencha as informações do local físico onde o evento será realizado.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 ${active ? "bg-purple-600 text-white shadow-sm" : done ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600" : "text-slate-400"}`}>
                {done ? <Check size={15} /> : <Icon size={15} />}
                <span className="text-xs font-semibold whitespace-nowrap">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${i < step ? "bg-purple-400" : "bg-slate-200 dark:bg-slate-700"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-5">
          {STEPS[step].label}
        </h2>
        {renderStep()}
      </div>

      {/* Navegação */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={prevStep} className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft size={16} /> Voltar
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={nextStep} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md">
            Próximo <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {editId ? "Salvar Alterações" : "Cadastrar Local"}
          </button>
        )}
      </div>
    </div>
  );
}
