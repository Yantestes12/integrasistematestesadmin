import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLoaderData, useSubmit, useNavigation, useActionData } from 'react-router';
import { MapPin, CheckCircle2, ArrowRight, User, Ticket, CheckCircle } from 'lucide-react';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

// ==========================================
// CONFIGURAÇÕES
// ==========================================
const N8N_URL = "https://w.ibrase.com.br/webhook";

const maskCPF = (value: string) =>
  value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');

const maskTelefone = (value: string) =>
  value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');

const getLogo = (instituto: string) => {
  const i = (instituto || '').toLowerCase();
  if (i === 'gasctpna') return '/logo_gasctpna.png';
  if (i === 'ibrase') return '/logo_ibrase.png';
  if (i === 'auni') return '/logo_auni.png';
  if (i === 'ivem') return '/logo_ivem.png';
  return '/logo_integra.png';
};

// ==========================================
// SHADER BACKGROUND (WEBGL)
// ==========================================
const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId: number;
    const syncSize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    };
    window.addEventListener('resize', syncSize);
    syncSize();
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return;
    const vs = `attribute vec2 a_position; varying vec2 v_uv; void main() { v_uv = a_position * 0.5 + 0.5; gl_Position = vec4(a_position, 0.0, 1.0); }`;
    const fs = `precision highp float; varying vec2 v_uv; uniform float u_time;
void main() {
  vec2 uv = v_uv;
  vec3 c1 = vec3(0.08, 0.0, 0.0); vec3 c2 = vec3(0.22, 0.0, 0.0); vec3 c3 = vec3(0.4, 0.0, 0.0);
  float n1 = sin(uv.x*3.0+u_time*0.5)*cos(uv.y*2.0-u_time*0.3);
  float n2 = cos(uv.x*4.0-u_time*0.4)*sin(uv.y*5.0+u_time*0.2);
  float m = (n1+n2+1.0)*0.5;
  vec3 col = mix(c1, mix(c2, c3, m), uv.y);
  col *= 1.0 - distance(uv, vec2(0.5))*0.5;
  gl_FragColor = vec4(col, 1.0);
}`;
    const cs = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const render = (t: number) => { syncSize(); gl.viewport(0,0,canvas.width,canvas.height); if(uTime) gl.uniform1f(uTime, t*0.001); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); animId = requestAnimationFrame(render); };
    render(0);
    return () => { window.removeEventListener('resize', syncSize); cancelAnimationFrame(animId); };
  }, []);
  return <div className="fixed top-0 left-0 w-[100vw] h-[100vh] -z-10 pointer-events-none opacity-80"><canvas ref={canvasRef} className="block w-full h-full" /></div>;
};

// ==========================================
// HELPERS UI
// ==========================================
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-widest">{children}</label>
);
const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`custom-input w-full rounded-xl py-3.5 px-4 text-white ${props.className || ''}`} />
);
const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="custom-input w-full rounded-xl py-3.5 px-4 text-white appearance-none">
    {children}
  </select>
);

const FichaRow = ({ label, value, mono, highlight }: { label: string; value: React.ReactNode; mono?: boolean; highlight?: boolean; }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-white/5 last:border-0 gap-1 sm:gap-4">
    <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{label}</span>
    <span className={`text-sm ${mono ? 'font-mono text-gray-300' : highlight ? 'text-[#ffb3ac] font-bold' : 'text-white'} text-left sm:text-right font-medium`}>
      {value}
    </span>
  </div>
);

type SimNaoField = { value: 'Sim' | 'Nao'; detalhe: string; };

interface FormData {
  cpf: string; nome: string; data_nascimento: string; sexo: string;
  altura: string; peso: string; escolaridade: string;
  cep: string; endereco: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string;
  faixa_salarial: string; whatsapp: string; profissao: string; email: string;
  instagram: string; tamanho_camisa: string;
  resp_cpf: string; resp_nome: string; grau_parentesco: string; resp_data_nasc: string;
  resp_sexo: string; resp_email: string; resp_whatsapp: string;
  uso_medicacao: SimNaoField; possui_alergias: SimNaoField; plano_saude: SimNaoField;
  acompan_medico: SimNaoField; restricao_fisica: SimNaoField; necessidade_especial: SimNaoField; deseja_laudo: 'Sim' | 'Nao';
}

const initialForm: FormData = {
  cpf: '', nome: '', data_nascimento: '', sexo: '',
  altura: '', peso: '', escolaridade: '',
  cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  faixa_salarial: '', whatsapp: '', profissao: '', email: '',
  instagram: '', tamanho_camisa: '',
  resp_cpf: '', resp_nome: '', grau_parentesco: '', resp_data_nasc: '',
  resp_sexo: '', resp_email: '', resp_whatsapp: '',
  uso_medicacao: { value: 'Nao', detalhe: '' },
  possui_alergias: { value: 'Nao', detalhe: '' },
  plano_saude: { value: 'Nao', detalhe: '' },
  acompan_medico: { value: 'Nao', detalhe: '' },
  restricao_fisica: { value: 'Nao', detalhe: '' },
  necessidade_especial: { value: 'Nao', detalhe: '' },
  deseja_laudo: 'Nao',
};

// ==========================================
// LOADER & ACTION
// ==========================================
export async function loader({ params }: any) {
  const instituto = params.instituto?.toUpperCase();
  try {
    const [projRes, locaisRes] = await Promise.all([
      fetch(`${N8N_URL}/projetos-get?instituto=${instituto}`),
      fetch(`${N8N_URL}/locais-evento-get?instituto=${instituto}`),
    ]);
    const projData = await projRes.json();
    const locaisData = await locaisRes.json();

    const eventos = Array.isArray(projData)
      ? projData.filter(p => ['eventos','evento'].includes((p.aplicabilidade||'').toLowerCase()))
      : [];

    const locais = (Array.isArray(locaisData) ? locaisData : (locaisData?.value || [])).filter((l: any) => l.ativo !== false);

    const nucleosComEnderecos = locais.map((l: any) => {
      const partes = [
        l.rua && l.numero ? `${l.rua}, ${l.numero}` : (l.rua || ''),
        l.bairro || '',
        l.cidade ? `${l.cidade}/${l.uf || ''}` : '',
      ].filter(Boolean);
      return { ...l, endereco_completo: partes.join(' — ') };
    });

    return { eventos, nucleos: nucleosComEnderecos, instituto };
  } catch {
    return { eventos: [], nucleos: [], instituto };
  }
}

export async function action({ request, params }: any) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const instituto = params.instituto?.toUpperCase();

  if (intent === 'inscrever') {
    const body: any = { instituto };
    for (const [k, v] of formData.entries()) { if (k !== 'intent') body[k] = v; }
    try {
      const res = await fetch(`${N8N_URL}/matriculas-eventos-post`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { success: true, result: data };
    } catch {
      return { success: false };
    }
  }
  return null;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function InscricaoEventoPublica() {
  const { instituto } = useParams();
  const { eventos, nucleos } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [step, setStep] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedNucleo, setSelectedNucleo] = useState<any>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [cpfFound, setCpfFound] = useState(false);
  const [hubFound, setHubFound] = useState(false);
  const [cpfSearching, setCpfSearching] = useState(false);
  const [jaMatriculado, setJaMatriculado] = useState(false);
  const [lgpdAceite, setLgpdAceite] = useState(false);
  const [existingTicket, setExistingTicket] = useState<any>(null);

  const isLoading = navigation.state !== 'idle';

  // Verifica se é menor de idade (menor que 18 anos)
  const isMenor = (() => {
    if (!form.data_nascimento) return false;
    const birthDate = new Date(form.data_nascimento + 'T12:00:00');
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  })();

  // Busca automática por CPF quando atinge 14 chars
  useEffect(() => {
    if (form.cpf.length !== 14) return;
    const cpfLimpo = form.cpf.replace(/\D/g, '');
    setCpfSearching(true);
    setCpfFound(false);
    setHubFound(false);
    setJaMatriculado(false);
    const institutoParam = window.location.pathname.split('/')[1]?.toUpperCase() || '';

    Promise.all([
      fetch(`${N8N_URL}/matriculas-get?instituto=${institutoParam}&cpf=${cpfLimpo}`).then(r => r.json()).catch(() => null),
      fetch(`${N8N_URL}/matriculas-eventos-get?instituto=${institutoParam}&cpf=${cpfLimpo}`).then(r => r.json()).catch(() => null),
      fetch(`${N8N_URL}/consultar-cpf?cpf=${cpfLimpo}`).then(r => r.json()).catch(() => null),
    ])
      .then(([matriculasData, eventosData, hubData]) => {
        // Verificar se já está inscrito neste evento específico
        const eventosRegistros = Array.isArray(eventosData) ? eventosData : (eventosData?.value || []);
        const registroExistente = eventosRegistros.find((r: any) => String(r.projeto_id) === String(selectedEvent?.id));
        if (registroExistente) {
          setForm(prev => ({
            ...prev,
            nome: registroExistente.aluno_nome || registroExistente.nome || prev.nome,
            data_nascimento: registroExistente.data_nascimento || registroExistente.nascimento || prev.data_nascimento,
            whatsapp: registroExistente.whatsapp || registroExistente.telefone_conta || prev.whatsapp,
            email: registroExistente.email || registroExistente.email_conta || prev.email,
            tamanho_camisa: registroExistente.tamanho_camisa || prev.tamanho_camisa,
          }));
          setExistingTicket(registroExistente);
          setCpfSearching(false);
          return;
        }

        // Preencher dados de matrículas anteriores
        const registros = Array.isArray(matriculasData) ? matriculasData : (matriculasData?.value || []);
        const m = registros.find((r: any) => String(r.aluno_cpf).replace(/\\D/g, '') === cpfLimpo) || (registros.length === 1 ? registros[0] : null);
        
        if (m) {
          setCpfFound(true);
          setForm(prev => ({
            ...prev,
            nome: m.aluno_nome || m.nome || '',
            data_nascimento: m.data_nascimento || m.nascimento || '',
            sexo: m.sexo || m.genero || '',
            altura: m.altura ? String(m.altura) : '',
            peso: m.peso ? String(m.peso) : '',
            escolaridade: m.escolaridade || '',
            cep: m.cep || '',
            endereco: m.endereco || '',
            numero: m.numero || '',
            complemento: m.complemento || '',
            bairro: m.bairro || '',
            cidade: m.cidade || m.localidade || '',
            uf: m.uf || '',
            faixa_salarial: m.faixa_salarial || m.renda || '',
            whatsapp: m.whatsapp || m.telefone || m.celular || '',
            profissao: m.profissao || '',
            email: m.email || m.email_conta || '',
            instagram: m.instagram || '',
            resp_cpf: m.resp_cpf || '',
            resp_nome: m.resp_nome || '',
            grau_parentesco: m.grau_parentesco || '',
            resp_data_nasc: m.resp_data_nasc || '',
            resp_sexo: m.resp_sexo || '',
            resp_email: m.resp_email || '',
            resp_whatsapp: m.resp_whatsapp || '',
            uso_medicacao: { value: m.uso_medicacao || 'Nao', detalhe: m.uso_medicacao_detalhes || '' },
            possui_alergias: { value: m.possui_alergias || 'Nao', detalhe: m.possui_alergias_detalhes || '' },
            plano_saude: { value: m.plano_saude || 'Nao', detalhe: m.plano_saude_detalhes || '' },
            acompan_medico: { value: m.acompan_medico || 'Nao', detalhe: m.acompan_medico_detalhes || '' },
            restricao_fisica: { value: m.restricao_fisica || 'Nao', detalhe: m.restricao_fisica_detalhes || '' },
            necessidade_especial: { value: m.necessidade_especial || 'Nao', detalhe: m.necessidade_especial_detalhes || '' },
            deseja_laudo: m.deseja_laudo || 'Nao',
          }));
        } else {
          setCpfFound(false);
          const hub = Array.isArray(hubData) ? hubData[0] : hubData;
          if (hub?.status === true && hub?.result) {
            setHubFound(true);
            const hubNome = hub.result.nome_da_pf || '';
            const parts = (hub.result.data_nascimento || '').split('/');
            const hubNasc = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : '';
            setForm(prev => ({
              ...prev,
              nome: hubNome,
              data_nascimento: hubNasc,
            }));
          } else {
            setHubFound(false);
          }
        }
      })
      .finally(() => { setCpfSearching(false); })
      .catch(() => { setCpfFound(false); setCpfSearching(false); });
  }, [form.cpf, selectedEvent?.id]);

  // Busca automática por CEP
  const handleCepChange = async (cepValue: string) => {
    // Apenas números
    const cleanCep = cepValue.replace(/\D/g, '');
    let formattedCep = cleanCep;
    if (cleanCep.length > 5) {
      formattedCep = cleanCep.substring(0, 5) + '-' + cleanCep.substring(5, 8);
    }
    set('cep', formattedCep);

    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://w.ibrase.com.br/webhook/consultar-cep?cep=${cleanCep}`);
        const data = await res.json();
        if (data && !data.erro) {
          const apiData = Array.isArray(data) ? data[0] : (data.value && Array.isArray(data.value) ? data.value[0] : data);
          const resultData = apiData?.result || apiData || {};
          
          if (resultData.logradouro || resultData.endereco || resultData.bairro) {
            setForm(prev => ({
              ...prev,
              endereco: resultData.logradouro || resultData.endereco || prev.endereco,
              bairro: resultData.bairro || prev.bairro,
              cidade: resultData.localidade || resultData.cidade || prev.cidade,
              uf: resultData.uf || prev.uf
            }));
          }
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };

  // Injetar estilos glass
  useEffect(() => {
    const s = document.createElement('style');
    s.innerHTML = `
      .glass-layer-1{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);}
      .glass-layer-2{background:rgba(255,255,255,0.08);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,0.18);}
      .glow-active{transition:all 0.3s ease;}
      .glow-active:hover{box-shadow:0 0 25px rgba(211,47,46,0.4);border-color:rgba(211,47,46,0.6);transform:translateY(-2px);}
      .btn-red{background:#d32f2f;box-shadow:0 0 15px rgba(211,47,46,0.3);transition:all 0.3s ease;}
      .btn-red:hover:not(:disabled){box-shadow:0 0 25px rgba(211,47,46,0.6);transform:translateY(-2px);}
      .btn-red:disabled{background:#333;box-shadow:none;opacity:0.5;}
      @keyframes pulse-red{0%{box-shadow:0 0 0 0 rgba(211,47,46,0.7);}70%{box-shadow:0 0 0 15px rgba(211,47,46,0);}100%{box-shadow:0 0 0 0 rgba(211,47,46,0);}}
      .pulse-submit{animation:pulse-red 2s infinite;}
      .custom-input{background-color:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.15);color:#e5e2e1;transition:all 0.3s ease;font-family:inherit;}
      .custom-input:focus{outline:none;border-color:#d32f2f;box-shadow:0 0 15px rgba(211,47,46,0.3);}
      .custom-input:disabled{opacity:0.5;cursor:not-allowed;}
      .step-anim{animation:fadeIn 0.5s cubic-bezier(0.4,0,0.2,1) forwards;}
      @keyframes fadeIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
      .radio-group label{display:flex;align-items:center;gap:8px;cursor:pointer;color:#ccc;font-size:14px;}
      .radio-group input[type=radio]{accent-color:#d32f2f;width:16px;height:16px;}
      select option{color:#000;}
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const set = (field: keyof FormData, value: any) => setForm(f => ({ ...f, [field]: value }));
  const setSimNao = (field: keyof FormData, key: 'value' | 'detalhe', value: string) =>
    setForm(f => ({ ...f, [field]: { ...(f[field] as SimNaoField), [key]: value } }));

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('intent', 'inscrever');
    data.append('projeto_id', selectedEvent?.id || '');
    data.append('local_evento_id', selectedNucleo?.id || '');
    const simples: (keyof FormData)[] = ['cpf','nome','data_nascimento','sexo','altura','peso','escolaridade','cep','endereco','numero','complemento','bairro','cidade','uf','faixa_salarial','whatsapp','profissao','email','instagram','tamanho_camisa','resp_cpf','resp_nome','grau_parentesco','resp_data_nasc','resp_sexo','resp_email','resp_whatsapp','deseja_laudo'];
    simples.forEach(k => data.append(k, form[k] as string));
    const simnao: (keyof FormData)[] = ['uso_medicacao','possui_alergias','plano_saude','acompan_medico','restricao_fisica','necessidade_especial'];
    simnao.forEach(k => {
      const f = form[k] as SimNaoField;
      data.append(k, f.value);
      data.append(`${k}_detalhes`, f.detalhe);
    });
    submit(data, { method: 'post' });
  };

  // Tela de sucesso — Ficha de Inscrição
  if (actionData?.success || existingTicket) {
    const resultObj = actionData?.result || existingTicket;
    const protocolo = resultObj?.protocolo || resultObj?.id || Math.random().toString(36).slice(2,10).toUpperCase();
    const dataHoje = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col relative overflow-hidden print:bg-white print:text-black">
        <div className="print:hidden"><ShaderBackground /></div>
        
        {/* === TELA DIGITAL (NÃO APARECE NA IMPRESSÃO) === */}
        <main className="flex-grow flex flex-col items-center justify-center p-4 z-10 w-full max-w-lg mx-auto print:hidden">
          {/* Ícone de sucesso */}
          <div className="w-16 h-16 rounded-full bg-[#d32f2f]/20 flex items-center justify-center mb-6 border border-[#d32f2f]/50 shadow-[0_0_30px_#d32f2f] step-anim">
            <CheckCircle className="text-[#ffb3ac] w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight text-center step-anim">Inscrição Confirmada!</h2>
          <p className="text-gray-400 text-sm mb-8 text-center step-anim">Guarde sua ficha de inscrição abaixo.</p>

          {/* FICHA */}
          <div className="w-full step-anim" style={{animation:'fadeIn 0.6s 0.2s both'}}>
            {/* Cabeçalho da ficha */}
            <div className="rounded-t-2xl bg-gradient-to-r from-[#d32f2f] to-[#8b0000] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={getLogo(instituto||'')} alt={instituto} className="h-10 w-auto object-contain bg-white/10 rounded-lg p-1" onError={e=>{(e.target as any).style.display='none'}} />
                <div>
                  <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Ficha de Inscrição</p>
                  <p className="text-white font-bold text-sm leading-tight">{selectedEvent?.nome || 'Evento'}</p>
                </div>
              </div>
              <Ticket className="w-8 h-8 text-white/30" />
            </div>

            {/* Corpo da ficha */}
            <div className="glass-layer-1 rounded-b-2xl border-t-0 divide-y divide-white/5">

              {/* Protocolo destaque */}
              <div className="p-5 text-center bg-white/[0.02]">
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1">Nº de Protocolo</p>
                <p className="text-2xl font-black text-white tracking-[0.15em] font-mono">{protocolo}</p>
              </div>

              {/* Dados principais */}
              <div className="p-5 grid grid-cols-1 gap-4">
                <FichaRow label="Nome" value={resultObj?.aluno_nome || resultObj?.nome || form.nome || '—'} />
                <FichaRow label="CPF" value={resultObj?.aluno_cpf || resultObj?.cpf || form.cpf || '—'} mono />
                {(resultObj?.data_nascimento || form.data_nascimento) && <FichaRow label="Data de Nascimento" value={new Date((resultObj?.data_nascimento || form.data_nascimento)+'T12:00:00').toLocaleDateString('pt-BR')} />}
                {(resultObj?.whatsapp || form.whatsapp) && <FichaRow label="WhatsApp" value={resultObj?.whatsapp || form.whatsapp} />}
                {(resultObj?.email || form.email) && <FichaRow label="E-mail" value={resultObj?.email || form.email} />}
              </div>

              {/* Evento e local */}
              <div className="p-5 grid grid-cols-1 gap-4">
                <FichaRow label="Evento" value={selectedEvent?.nome || 'Evento Exemplo'} highlight />
                <FichaRow label="Local" value={selectedNucleo?.nome || 'Núcleo Exemplo'} />
                <FichaRow label="Endereço" value={selectedNucleo?.endereco_completo || 'Endereço Exemplo'} />
                {(resultObj?.tamanho_camisa || form.tamanho_camisa) && <FichaRow label="Tamanho Camisa" value={resultObj?.tamanho_camisa || form.tamanho_camisa} />}
              </div>

              {/* Rodapé da ficha */}
              <div className="p-4 bg-white/[0.02] flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-[10px]">Data de inscrição</p>
                  <p className="text-gray-300 text-xs font-semibold">{dataHoje}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-[10px]">Instituto</p>
                  <p className="text-gray-300 text-xs font-semibold uppercase">{instituto}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="w-full mt-6 space-y-3 step-anim" style={{animation:'fadeIn 0.6s 0.4s both'}}>
            <button
              onClick={() => window.print()}
              className="w-full py-3.5 rounded-xl border border-white/20 text-white text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              🖨️ Imprimir / Salvar PDF
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full btn-red text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest"
            >
              Nova Inscrição
            </button>
          </div>
        </main>

        {/* === FICHA OFICIAL A4 PARA IMPRESSÃO/PDF === */}
        <div className="hidden print:block w-full bg-white text-black p-4 font-sans max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
            <img src={getLogo(instituto||'')} alt="Logo" className="h-16 object-contain" />
            <div className="text-center flex-1 px-4">
              <h1 className="text-2xl font-bold uppercase tracking-wider">Ficha de Inscrição Oficial</h1>
              <h2 className="text-lg font-semibold text-gray-800">{selectedEvent?.nome || 'Evento'}</h2>
            </div>
            <div className="text-right text-sm whitespace-nowrap">
              <p><strong>Nº Protocolo:</strong> <span className="font-mono">{protocolo}</span></p>
              <p><strong>Data:</strong> {dataHoje}</p>
            </div>
          </div>

          {/* Dados do Aluno */}
          <div className="mb-6">
            <h3 className="font-bold text-sm bg-gray-200 p-1.5 border border-black mb-2 uppercase text-center tracking-widest">Dados do Participante</h3>
            <table className="w-full text-sm border-collapse border border-black">
              <tbody>
                <tr>
                  <td className="border border-black p-2 bg-gray-100 font-bold w-1/4">Nome Completo</td>
                  <td className="border border-black p-2" colSpan={3}>{form.nome?.toUpperCase() || '—'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 bg-gray-100 font-bold w-1/4">CPF</td>
                  <td className="border border-black p-2 w-1/4 font-mono">{form.cpf || '—'}</td>
                  <td className="border border-black p-2 bg-gray-100 font-bold w-1/4">Data de Nasc.</td>
                  <td className="border border-black p-2 w-1/4">{form.data_nascimento ? new Date(form.data_nascimento+'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 bg-gray-100 font-bold">E-mail</td>
                  <td className="border border-black p-2" colSpan={3}>{form.email?.toLowerCase() || '—'}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 bg-gray-100 font-bold">WhatsApp</td>
                  <td className="border border-black p-2">{form.whatsapp || '—'}</td>
                  <td className="border border-black p-2 bg-gray-100 font-bold">Tam. Camisa</td>
                  <td className="border border-black p-2">{form.tamanho_camisa || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dados do Local e QR Code */}
          <div className="mb-6 grid grid-cols-[2fr_1fr] gap-4">
            <div>
              <h3 className="font-bold text-sm bg-gray-200 p-1.5 border border-black mb-2 uppercase text-center tracking-widest">Local do Evento</h3>
              <table className="w-full text-sm border-collapse border border-black">
                <tbody>
                  <tr>
                    <td className="border border-black p-2 bg-gray-100 font-bold w-1/4">Núcleo</td>
                    <td className="border border-black p-2">{selectedNucleo?.nome?.toUpperCase() || '—'}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 bg-gray-100 font-bold">Endereço</td>
                    <td className="border border-black p-2">{selectedNucleo?.endereco_completo || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* QR Banner */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded-md p-2">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`https://plataformaintegra.com.br/autenticador/${protocolo}/${instituto?.toLowerCase()||'instituto'}`)}`} alt="QR Code" className="w-16 h-16 rounded border border-slate-200" />
              <div>
                <div className="font-bold text-[10px] text-slate-900 leading-tight mb-1">QR CODE DE AUTENTICAÇÃO DIGITAL DA FICHA</div>
                <div className="text-[8px] text-slate-600 leading-tight">Escanear este código QR permite validar a autenticidade da ficha no sistema central.</div>
              </div>
            </div>
          </div>

          {/* Termos e Assinatura */}
          <div className="mb-16 mt-8">
            <h3 className="font-bold text-sm bg-gray-200 p-1.5 border border-black mb-2 uppercase text-center tracking-widest">Termos e Autorizações</h3>
            <div className="border border-black p-4 text-xs text-justify leading-relaxed">
              <p>O participante (ou seu responsável legal) declara que as informações prestadas nesta ficha são verdadeiras e assume total responsabilidade por elas.</p>
              <p className="mt-2">Autorizo o uso de imagem e voz para fins de divulgação do projeto e declaro estar ciente e de acordo com as normas, regulamentos e com a Política de Privacidade (LGPD) estabelecida pela instituição promotora.</p>
            </div>
          </div>

          {/* Assinaturas Digitais */}
          <div className="flex justify-between items-start mt-8 px-4 gap-8">
            <div className="flex-1 text-left">
              <div className="border-[1.5px] border-green-600 bg-green-50 rounded-md p-2 mb-2 shadow-sm">
                <div className="text-[10px] font-extrabold text-green-700 border-b border-green-200 pb-1 mb-1.5 uppercase flex items-center gap-1">
                  ✓ Responsável: — Status: Confirmado
                </div>
                <div className="text-[9px] font-mono text-green-900 leading-tight">
                  • <strong>LGPD ACEITO</strong>: {new Date().toLocaleString('pt-BR')}<br/>
                  • <strong>CPF</strong>: {form.cpf}<br/>
                  • <strong>Protocolo</strong>: {protocolo}<br/>
                  • <strong>Aceite eletrônico</strong>: {new Date().toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="border-t-[1.5px] border-slate-700 pt-1 text-center">
                <p className="font-extrabold text-xs text-slate-900 uppercase">Assinatura do Aluno / Responsável</p>
                <p className="text-[10px] text-slate-800 mt-0.5">{form.nome?.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex-1 text-left">
              <div className="border-[1.5px] border-sky-600 bg-sky-50 rounded-md p-2 mb-2 shadow-sm">
                <div className="text-[10px] font-extrabold text-sky-700 border-b border-sky-200 pb-1 mb-1.5 uppercase flex items-center gap-1">
                  ✓ Coordenação: — Deferido
                </div>
                <div className="text-[9px] font-mono text-sky-900 leading-tight">
                  • <strong>Triagem & Análise</strong>: Inscrição Deferida<br/>
                  • <strong>Evento</strong>: {selectedEvent?.nome}<br/>
                  • <strong>Protocolo</strong>: {protocolo}<br/>
                  • <strong>Data/Hora</strong>: {new Date().toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="border-t-[1.5px] border-slate-700 pt-1 text-center">
                <p className="font-extrabold text-xs text-slate-900 uppercase">Coordenação do Evento</p>
                <p className="text-[10px] text-slate-800 mt-0.5">Visto / Carimbo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estilos de impressão */}
        <style>{`
          @media print {
            @page { size: A4; margin: 15mm; }
            body { background: white !important; color: black !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
          @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    );
  }

  // Dots helper
  const Dot = ({ active }: { active: boolean }) => (
    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${active ? 'bg-[#d32f2f] shadow-[0_0_10px_#d32f2f]' : 'bg-white/20'}`} />
  );
  const Line = () => <div className="h-[2px] w-8 bg-white/10 rounded" />;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-sans flex flex-col relative overflow-hidden">
      <ShaderBackground />

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 shadow-[0_0_20px_rgba(211,47,46,0.15)] flex flex-col items-center justify-center py-3 px-6 min-h-[4.5rem]">
        <img src={getLogo(instituto||'')} alt={instituto} className="h-8 md:h-10 w-auto object-contain mb-1" onError={e => { (e.target as any).style.display='none'; }} />
        <h1 className="text-base md:text-xl font-bold text-white tracking-tight text-center leading-tight">
          Faça sua matrícula em um dos eventos abaixo
        </h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-28 pb-20 px-4 w-full max-w-lg mx-auto z-10">
        {/* Progress */}
        <div className="w-full max-w-sm mb-8 flex items-center justify-center space-x-2">
          <Dot active={step>=0}/><Line/><Dot active={step>=1}/><Line/><Dot active={step>=2}/><Line/><Dot active={step>=3}/>
        </div>

        {/* ===== STEP 0: EVENTOS ===== */}
        {step === 0 && (
          <div className="w-full space-y-5 step-anim">
            {eventos.length === 0 ? (
              <div className="glass-layer-1 rounded-2xl p-10 text-center">
                <Ticket className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <h3 className="text-xl font-bold text-white mb-2">Sem Eventos</h3>
                <p className="text-gray-400">Nenhum evento com inscrições abertas.</p>
              </div>
            ) : eventos.map((ev: any, i: number) => (
              <div key={ev.id||i} onClick={() => { setSelectedEvent(ev); setStep(1); }}
                className="glass-layer-1 rounded-2xl p-6 cursor-pointer group glow-active flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-[#ffb3ac] transition-colors mb-1">{ev.nome}</h2>
                  <p className="text-gray-400 text-xs">{ev.descricao || 'Vagas abertas'}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#d32f2f] transition-colors flex-shrink-0 ml-4" />
              </div>
            ))}
          </div>
        )}

        {/* ===== STEP 1: LOCAL (NÚCLEO) ===== */}
        {step === 1 && (
          <div className="w-full space-y-5 step-anim">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white">Selecione o Local</h2>
              <p className="text-gray-400 text-sm mt-1">Onde deseja participar de <strong className="text-[#ffb3ac]">{selectedEvent?.nome}</strong>?</p>
            </div>
            {nucleos.length === 0 ? (
              <div className="glass-layer-1 rounded-2xl p-10 text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-gray-400">Nenhum local cadastrado.</p>
              </div>
            ) : nucleos.map((n: any, i: number) => (
              <div key={n.id||i} onClick={() => { setSelectedNucleo(n); setStep(2); }}
                className="glass-layer-1 rounded-2xl p-5 cursor-pointer group glow-active">
                <h2 className="text-base font-bold text-white group-hover:text-[#ffb3ac] transition-colors mb-1">{n.nome}</h2>
                {n.endereco_completo && (
                  <div className="flex items-start text-gray-400 text-xs">
                    <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{n.endereco_completo}</span>
                  </div>
                )}
              </div>
            ))}
            <button onClick={() => setStep(0)} className="mt-4 text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold block mx-auto">← Voltar</button>
          </div>
        )}

        {/* ===== STEP 2: CPF ===== */}
        {step === 2 && (
          <div className="w-full step-anim">
            <div className="glass-layer-2 rounded-3xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#d32f2f]/10 flex items-center justify-center mb-5 border border-[#d32f2f]/30">
                <User className="text-[#ffb3ac] w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Identificação</h2>
              <p className="text-gray-400 mb-6 text-sm">Informe seu CPF para continuar.</p>
              <div className="w-full mb-4">
                <input
                  className="custom-input w-full rounded-xl py-4 px-4 text-center text-xl font-mono tracking-[0.2em] placeholder-gray-600"
                  maxLength={14} required placeholder="000.000.000-00" type="text"
                  value={form.cpf} onChange={e => { set('cpf', maskCPF(e.target.value)); setCpfFound(false); setJaMatriculado(false); }}
                />
              </div>

              {/* Status da busca */}
              {cpfSearching && (
                <p className="text-yellow-400 text-xs mb-4 animate-pulse">🔍 Verificando cadastro...</p>
              )}
              {!cpfSearching && jaMatriculado && (
                <div className="glass-layer-1 rounded-xl p-4 mb-4 border border-red-500/40 text-center">
                  <p className="text-red-400 font-bold text-sm mb-1">⚠️ Inscrição já realizada</p>
                  <p className="text-gray-400 text-xs">Este CPF já está inscrito no evento <strong className="text-white">{selectedEvent?.nome}</strong>.</p>
                </div>
              )}

              <button
                onClick={() => { if(form.cpf.length === 14 && !cpfSearching && !jaMatriculado) setStep(3); }}
                disabled={form.cpf.length !== 14 || cpfSearching || jaMatriculado}
                className="w-full btn-red text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex justify-center items-center"
              >
                {cpfSearching ? 'Verificando...' : jaMatriculado ? 'Inscrição Bloqueada' : 'Próximo'} {!jaMatriculado && <ArrowRight className="ml-2 w-5 h-5" />}
              </button>
              <button onClick={() => setStep(1)} className="mt-5 text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">← Voltar</button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: FORMULÁRIO ===== */}
        {step === 3 && (
          <div className="w-full step-anim">
            <div className="glass-layer-2 rounded-3xl p-6 md:p-8">
              {cpfFound ? (
                <>
                  <h2 className="text-xl font-bold text-white mb-6 text-center">Confirmar Inscrição</h2>
                  <form className="space-y-5" onSubmit={handleFinalSubmit}>
                    <div>
                      <Label>CPF</Label>
                      <Input disabled value={form.cpf} />
                    </div>
                    <div>
                      <Label>Nome</Label>
                      <Input disabled value={form.nome} />
                    </div>
                    {form.data_nascimento && (
                      <div>
                        <Label>Data de Nascimento</Label>
                        <Input disabled value={form.data_nascimento} />
                      </div>
                    )}
                    <div className="pt-4 border-t border-white/10">
                      <Label>Tamanho da Camisa *</Label>
                      <Select required value={form.tamanho_camisa} onChange={e => set('tamanho_camisa', e.target.value)}>
                        <option value="" disabled>Selecione</option>
                        <option value="10 anos - Infantil">10 anos - Infantil</option>
                        <option value="14 anos - Infantil">14 anos - Infantil</option>
                        <option value="M - Adulto">M - Adulto</option>
                        <option value="GG - Adulto">GG - Adulto</option>
                        <option value="G2 - Plus Adulto">G2 - Plus Adulto</option>
                        <option value="G4 - Plus Adulto">G4 - Plus Adulto</option>
                      </Select>
                    </div>
                    <div className="pt-4">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox" required checked={lgpdAceite} onChange={e => setLgpdAceite(e.target.checked)}
                          className="mt-1 w-4 h-4 flex-shrink-0" style={{accentColor:'#d32f2f'}} />
                        <span className="text-gray-400 text-xs leading-relaxed group-hover:text-gray-300 transition-colors">
                          Li e aceito os{' '}
                          <a href={`/${instituto}/lgpd`} target="_blank" rel="noreferrer" className="text-blue-400 underline hover:text-blue-300 transition-colors font-semibold" onClick={e => e.stopPropagation()}>
                            Termos de Uso e Política de Privacidade (LGPD)
                          </a>{' '}
                          e autorizo o tratamento dos meus dados pessoais pela instituição para fins de gestão de eventos.
                        </span>
                      </label>
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={isLoading || !lgpdAceite} className="w-full btn-red text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest pulse-submit flex justify-center items-center">
                        {isLoading ? 'Registrando...' : 'Finalizar Inscrição'} <CheckCircle2 className="ml-2 w-5 h-5" />
                      </button>
                    </div>
                  </form>
              <button type="button" onClick={() => setStep(2)} className="w-full mt-4 text-center text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold block">← Voltar</button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-1 text-center">Dados Pessoais</h2>
                  <p className="text-gray-400 text-xs text-center mb-6">Preencha todos os campos para concluir.</p>
                  <form className="space-y-5" onSubmit={handleFinalSubmit}>

                {/* === IDENTIFICAÇÃO === */}
                <div>
                  <Label>CPF</Label>
                  <Input disabled value={form.cpf} />
                </div>
                <div>
                  <Label>Nome Completo *</Label>
                  <Input required placeholder="Nome completo" value={form.nome} onChange={e => set('nome', e.target.value)} style={{textTransform:'uppercase'}} disabled={hubFound} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data de Nascimento *</Label>
                    <Input required type="date" value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} disabled={hubFound} />
                  </div>
                  <div>
                    <Label>Gênero *</Label>
                    <Select required value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                      <option value="" disabled>Selecione</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="Outro">Outro</option>
                    </Select>
                  </div>
                </div>

                {/* === BIOMETRIA === */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Altura (cm) *</Label>
                    <Input required type="number" min="50" max="250" placeholder="Ex: 170" value={form.altura} onChange={e => set('altura', e.target.value)} />
                  </div>
                  <div>
                    <Label>Peso (kg) *</Label>
                    <Input required type="number" min="15" max="300" step="0.1" placeholder="Ex: 65.5" value={form.peso} onChange={e => set('peso', e.target.value)} />
                  </div>
                </div>

                {/* === FORMAÇÃO === */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Escolaridade *</Label>
                    <Select required value={form.escolaridade} onChange={e => set('escolaridade', e.target.value)}>
                      <option value="" disabled>Selecione</option>
                      <option>Fundamental Incompleto</option>
                      <option>Fundamental Completo</option>
                      <option>Médio Incompleto</option>
                      <option>Médio Completo</option>
                      <option>Superior Incompleto</option>
                      <option>Superior Completo</option>
                      <option>Pós-graduação</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Tamanho da Camisa *</Label>
                    <Select required value={form.tamanho_camisa} onChange={e => set('tamanho_camisa', e.target.value)}>
                      <option value="" disabled>Selecione</option>
                      <option value="10 anos - Infantil">10 anos - Infantil</option>
                      <option value="14 anos - Infantil">14 anos - Infantil</option>
                      <option value="M - Adulto">M - Adulto</option>
                      <option value="GG - Adulto">GG - Adulto</option>
                      <option value="G2 - Plus Adulto">G2 - Plus Adulto</option>
                      <option value="G4 - Plus Adulto">G4 - Plus Adulto</option>
                    </Select>
                  </div>
                </div>

                {/* === ENDEREÇO === */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Endereço</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>CEP *</Label>
                        <Input required placeholder="00000-000" maxLength={9} value={form.cep} onChange={e => handleCepChange(e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <Label>Logradouro *</Label>
                        <Input required placeholder="Rua / Av." value={form.endereco} onChange={e => set('endereco', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Número *</Label>
                        <Input required placeholder="Nº" value={form.numero} onChange={e => set('numero', e.target.value)} />
                      </div>
                      <div>
                        <Label>Complemento</Label>
                        <Input placeholder="Apto, Bloco…" value={form.complemento} onChange={e => set('complemento', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Bairro *</Label>
                        <Input required value={form.bairro} onChange={e => set('bairro', e.target.value)} />
                      </div>
                      <div>
                        <Label>Cidade *</Label>
                        <Input required value={form.cidade} onChange={e => set('cidade', e.target.value)} />
                      </div>
                    </div>
                    <div className="w-1/3">
                      <Label>UF *</Label>
                      <Input required maxLength={2} placeholder="UF" value={form.uf} onChange={e => set('uf', e.target.value.toUpperCase())} />
                    </div>
                  </div>
                </div>

                {/* === RENDA & CONTATO === */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Renda & Contato</p>
                  <div className="space-y-4">
                    <div>
                      <Label>Faixa Salarial *</Label>
                      <div className="radio-group space-y-2">
                        {['Sem rendimento / Não remunerado(a)', 'Até 1 salário mínimo', 'Acima de 1 até 3 salários mínimos', 'Acima de 3 salários mínimos'].map(v => (
                          <label key={v}>
                            <input type="radio" name="faixa_salarial" value={v} required checked={form.faixa_salarial===v} onChange={() => set('faixa_salarial',v)} /> {v}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>WhatsApp *</Label>
                        <Input required type="tel" placeholder="(00) 00000-0000" maxLength={15} value={form.whatsapp} onChange={e => set('whatsapp', maskTelefone(e.target.value))} />
                      </div>
                      <div>
                        <Label>E-mail *</Label>
                        <Input required type="email" placeholder="email@exemplo.com" value={form.email} onChange={e => set('email', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Condição Profissional</Label>
                      <Select value={form.profissao} onChange={e => set('profissao', e.target.value)}>
                        <option value="">Selecione (opcional)</option>
                        <option>Estudante</option>
                        <option>Empregado(a) com carteira</option>
                        <option>Autônomo(a)</option>
                        <option>Desempregado(a)</option>
                        <option>Aposentado(a)</option>
                        <option>Outro</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Instagram (opcional)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><InstagramIcon /></span>
                        <input className="custom-input w-full rounded-xl py-3.5 pl-9 pr-4 text-white" placeholder="@seu_perfil" value={form.instagram} onChange={e => set('instagram', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* === RESPONSÁVEL === */}
                {isMenor && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Dados do Responsável</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>CPF do Responsável *</Label>
                          <Input required maxLength={14} placeholder="000.000.000-00" value={form.resp_cpf} onChange={e => set('resp_cpf', maskCPF(e.target.value))} />
                        </div>
                        <div>
                          <Label>Grau de Parentesco *</Label>
                          <Select required value={form.grau_parentesco} onChange={e => set('grau_parentesco', e.target.value)}>
                            <option value="">Selecione</option>
                            <option>Pai/Mãe</option>
                            <option>Avô/Avó</option>
                            <option>Tio/Tia</option>
                            <option>Irmão/Irmã</option>
                            <option>Cônjuge</option>
                            <option>Outro</option>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Nome do Responsável *</Label>
                        <Input required placeholder="Nome completo" value={form.resp_nome} onChange={e => set('resp_nome', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Data Nasc. Responsável</Label>
                          <Input type="date" value={form.resp_data_nasc} onChange={e => set('resp_data_nasc', e.target.value)} />
                        </div>
                        <div>
                          <Label>Sexo</Label>
                          <Select value={form.resp_sexo} onChange={e => set('resp_sexo', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="Outro">Outro</option>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>E-mail Responsável</Label>
                          <Input type="email" placeholder="email@exemplo.com" value={form.resp_email} onChange={e => set('resp_email', e.target.value)} />
                        </div>
                        <div>
                          <Label>WhatsApp Responsável *</Label>
                          <Input required type="tel" placeholder="(00) 00000-0000" maxLength={15} value={form.resp_whatsapp} onChange={e => set('resp_whatsapp', maskTelefone(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* === SAÚDE === */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Saúde</p>
                  <div className="space-y-5">
                    {([
                      ['uso_medicacao', 'Usa medicação contínua?'],
                      ['possui_alergias', 'Possui alergias?'],
                      ['plano_saude', 'Tem plano de saúde?'],
                      ['acompan_medico', 'Faz acompanhamento médico?'],
                      ['restricao_fisica', 'Tem restrição física?'],
                      ['necessidade_especial', 'Tem necessidade especial?'],
                    ] as [keyof FormData, string][]).map(([field, label]) => {
                      const f = form[field] as SimNaoField;
                      return (
                        <div key={field as string}>
                          <Label>{label} *</Label>
                          <div className="radio-group flex space-x-6 mb-2">
                            <label><input type="radio" required checked={f.value==='Sim'} onChange={() => setSimNao(field,'value','Sim')} /> Sim</label>
                            <label><input type="radio" required checked={f.value==='Nao'} onChange={() => setSimNao(field,'value','Nao')} /> Não</label>
                          </div>
                          {f.value === 'Sim' && (
                            <input className="custom-input w-full rounded-xl py-3 px-4 text-white text-sm" placeholder="Especifique…" value={f.detalhe} onChange={e => setSimNao(field,'detalhe',e.target.value)} />
                          )}
                        </div>
                      );
                    })}
                    <div>
                      <Label>Deseja emitir laudo?</Label>
                      <div className="radio-group flex space-x-6">
                        <label><input type="radio" checked={form.deseja_laudo==='Sim'} onChange={() => set('deseja_laudo','Sim')} /> Sim</label>
                        <label><input type="radio" checked={form.deseja_laudo==='Nao'} onChange={() => set('deseja_laudo','Nao')} /> Não</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LGPD */}
                <div className="pt-4 border-t border-white/10">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" required checked={lgpdAceite} onChange={e => setLgpdAceite(e.target.checked)}
                      className="mt-1 w-4 h-4 flex-shrink-0" style={{accentColor:'#d32f2f'}} />
                    <span className="text-gray-400 text-xs leading-relaxed group-hover:text-gray-300 transition-colors">
                      Li e aceito os <strong className="text-white">Termos de Uso e Política de Privacidade (LGPD)</strong> e autorizo o tratamento dos meus dados pessoais pela instituição para fins de gestão de eventos.
                    </span>
                  </label>
                </div>

                {/* === BOTÃO FINAL === */}
                <div className="pt-4">
                  <button type="submit" disabled={isLoading || !lgpdAceite} className="w-full btn-red text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest pulse-submit flex justify-center items-center">
                    {isLoading ? 'Registrando...' : 'Finalizar Inscrição'}
                    <CheckCircle2 className="ml-2 w-5 h-5" />
                  </button>
                </div>

                <button type="button" onClick={() => setStep(2)} className="w-full mt-2 text-center text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold block">
                  ← Voltar
                </button>
              </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* RODAPÉ */}
      <div className="fixed bottom-4 w-full flex flex-col items-center opacity-30 hover:opacity-80 transition-opacity z-10 pointer-events-none">
        <span className="text-[9px] font-bold text-gray-400 mb-1 tracking-[0.3em] uppercase">Tecnologia</span>
        <img src="/_prod_texto.png" alt="Integra" className="h-3" onError={e => { (e.target as any).style.display='none'; }} />
      </div>
    </div>
  );
}

// Componente auxiliar para linha da ficha
function FichaRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-0.5">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-[#ffb3ac]' : 'text-white'} ${mono ? 'font-mono tracking-wider' : ''}`}>
        {value}
      </span>
    </div>
  );
}
