import React, { useState } from 'react';
import { ArrowRight, Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../supabaseClient';
import '../styles/login.css';

const INSTITUTES = ['IBRASE', 'GASCTPNA', 'AUNI', 'IVEM'];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!username || !password) {
      setErrorMsg("Preencha usuário/e-mail e senha.");
      return;
    }

    setIsLoading(true);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // 1. Tentar autenticação via Webhook n8n
    try {
      const webhookUrl = `https://w.ibrase.com.br/webhook/loginadmin?username=${encodeURIComponent(cleanUser)}&password=${encodeURIComponent(cleanPass)}`;
      
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUser,
          email: cleanUser,
          password: cleanPass,
          senha: cleanPass
        }),
      });

      if (res.ok) {
        const text = await res.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.warn("Erro ao converter JSON do n8n:", parseErr);
        }

        const resData = Array.isArray(data) ? data[0] : data;

        if (resData && (resData.status === "login aprovado" || resData.status_login === "APROVADO")) {
          const inst = resData.instituto_ativo || resData.instituto || "IBRASE";
          const nome = resData.nome || resData.username || cleanUser;
          const cargo = resData.cargo || resData.account_type || "Colaborador";
          const id = resData.id || "1";

          localStorage.setItem("auth_institute", inst);
          localStorage.setItem("auth_user", nome);
          localStorage.setItem("auth_cargo", cargo);
          localStorage.setItem("auth_id", String(id));
          if (resData.institutos_permitidos) {
            localStorage.setItem("auth_institutos_permitidos", JSON.stringify(resData.institutos_permitidos));
          }

          setIsSuccess(true);
          setTimeout(() => navigate("/"), 800);
          return;
        } else if (resData && (resData.status === "senha incorreta" || resData.status === "usuario nao encontrado" || resData.message)) {
          setErrorMsg(resData.message || resData.status || "Usuário ou senha incorretos.");
          setIsLoading(false);
          return;
        }
      }
    } catch (n8nErr) {
      console.warn("N8N Webhook indisponível ou bloqueado por CORS. Executando fallback Supabase...", n8nErr);
    }

    // 2. Fallback direto Supabase
    try {
      let foundUser: any = null;
      let foundInstitute = "IBRASE";

      try {
        const { data } = await supabase
          .from('admin_users')
          .select('*')
          .or(`email.eq.${cleanUser},username.eq.${cleanUser},name.ilike.%${cleanUser}%,nome.ilike.%${cleanUser}%`)
          .limit(10);

        if (data && data.length > 0) {
          const matched = data.find((u: any) => 
            (u.senha === cleanPass || u.password_hash === cleanPass)
          );
          if (matched) {
            foundUser = matched;
            foundInstitute = matched.instituto_ativo || matched.instituto || "IBRASE";
          }
        }
      } catch (err) {}

      if (!foundUser) {
        for (const inst of INSTITUTES) {
          const tableName = `${inst}_admin_users`;
          try {
            const { data } = await supabase
              .from(tableName)
              .select('*')
              .or(`email.eq.${cleanUser},username.eq.${cleanUser},nome.ilike.%${cleanUser}%,name.ilike.%${cleanUser}%`)
              .limit(10);

            if (data && data.length > 0) {
              const matched = data.find((u: any) => 
                (u.senha === cleanPass || u.password_hash === cleanPass)
              );
              if (matched) {
                foundUser = matched;
                foundInstitute = inst;
                break;
              }
            }
          } catch (e) {}
        }
      }

      if (!foundUser) {
        setErrorMsg("Credenciais inválidas. Verifique seus dados.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("auth_institute", foundInstitute);
      localStorage.setItem("auth_user", foundUser.nome || foundUser.name || cleanUser);
      localStorage.setItem("auth_cargo", foundUser.cargo || foundUser.account_type || "Colaborador");
      localStorage.setItem("auth_id", String(foundUser.id));

      setIsSuccess(true);
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error("Erro no login:", err);
      setErrorMsg("Erro ao conectar com o banco de dados.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans">
      
      {/* 
        -------------------------------------------------------------
        PAINEL ESQUERDO (Apenas PC)
        Estética minimalista, sólida e escura (bg-slate-900)
        ------------------------------------------------------------- 
      */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 bg-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Elemento de fundo ultra-sutil "pintado a lápis" / minimalista */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <img 
            className="h-32 lg:h-40 w-auto object-contain mb-8 block drop-shadow-2xl transition-all duration-700" 
            style={{ transform: isSuccess ? 'scale(1.05)' : 'scale(1)', opacity: isSuccess ? 0.8 : 1 }}
            src="/_prod_simbolo.gif" 
            onError={(e) => { (e.target as any).src='/logo_integra_simbolo.gif'; }} 
            alt="INTEGRA Símbolo" 
          />
          <img 
            className="h-10 lg:h-12 w-auto object-contain mb-6 block brightness-0 invert opacity-90 transition-all duration-700" 
            style={{ opacity: isSuccess ? 0.5 : 0.9 }}
            src="/_prod_texto.png" 
            onError={(e) => { (e.target as any).src='/logo_integra_texto.png'; }} 
            alt="INTEGRA" 
          />
          <p className="text-slate-400 text-sm lg:text-base max-w-md font-medium tracking-wide transition-all duration-700" style={{ opacity: isSuccess ? 0 : 1 }}>
            Plataforma centralizadaizada de gestão.
          </p>
        </div>
      </div>

      {/* 
        -------------------------------------------------------------
        PAINEL DIREITO (Formulário)
        Celular: Fundo com as luzes (antigo) e card
        PC: Fundo branco limpo, sem sombras exageradas, ocupando a altura toda
        ------------------------------------------------------------- 
      */}
      <div className="relative w-full md:w-1/2 lg:w-5/12 min-h-screen flex items-center justify-center bg-slate-50/70 md:bg-white p-4 sm:p-6 md:p-12 lg:p-16 overflow-hidden">
        
        {/* Luzes decorativas sutis de fundo (Apenas Mobile para manter a regra de não mexer no celular) */}
        <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full transition-opacity duration-700" style={{ opacity: isSuccess ? 0 : 1 }} />
        <div className="md:hidden absolute bottom-0 right-10 w-[400px] h-[300px] bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full transition-opacity duration-700" style={{ opacity: isSuccess ? 0 : 1 }} />

        {/* Card Principal */}
        <div className="w-full max-w-[450px] md:max-w-md bg-white rounded-3xl md:rounded-none border border-slate-200/80 md:border-none shadow-2xl shadow-slate-900/5 md:shadow-none p-7 sm:p-9 md:p-0 relative z-10 transition-all duration-500" style={{ transform: isSuccess ? 'translateY(-10px)' : 'translateY(0)' }}>
          
          {/* Cabeçalho da Marca (Visível apenas no mobile, pois no PC já está na esquerda) */}
          <div className="md:hidden flex flex-col items-center justify-center text-center mb-7 transition-all duration-700" style={{ opacity: isSuccess ? 0.3 : 1 }}>
            <img 
              className="h-16 sm:h-20 w-auto object-contain mb-2 block transition-transform hover:scale-105" 
              src="/_prod_simbolo.gif" 
              onError={(e) => { (e.target as any).src='/logo_integra_simbolo.gif'; }} 
              alt="INTEGRA Símbolo" 
            />
            <img 
              className="h-6 sm:h-7 w-auto max-w-[180px] object-contain mb-3 block" 
              src="/_prod_texto.png" 
              onError={(e) => { (e.target as any).src='/logo_integra_texto.png'; }} 
              alt="INTEGRA" 
            />
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-700 text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Portal de Administração</span>
            </div>
          </div>

          {/* Título PC */}
          <div className="hidden md:block mb-8 transition-all duration-700" style={{ opacity: isSuccess ? 0.2 : 1 }}>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2">Bem-vindo de volta</h2>
            <p className="text-sm text-slate-500 font-medium">Insira suas credenciais para acessar o painel de gestão.</p>
          </div>

          {/* Banner de Erro */}
          {errorMsg && !isSuccess && (
            <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-xs md:text-sm font-medium mb-6 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
            
            <div className="transition-all duration-500" style={{ opacity: (isLoading || isSuccess) ? 0.4 : 1, pointerEvents: (isLoading || isSuccess) ? 'none' : 'auto', filter: isSuccess ? 'blur(2px)' : 'none' }}>
              <div className="space-y-2 mb-5">
                <label className="block text-xs md:text-sm font-semibold text-slate-700">
                  Usuário ou E-mail Institucional
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 z-10 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input 
                    type="text" 
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 md:bg-white text-slate-900 text-sm md:text-base font-medium placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none" 
                    placeholder="Digite seu usuário ou e-mail corporativo" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-slate-700">
                  Senha de Acesso
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 z-10 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full h-14 pl-12 pr-20 rounded-xl border border-slate-200 bg-slate-50/50 md:bg-white text-slate-900 text-sm md:text-base font-medium placeholder:text-slate-400 focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="hidden sm:inline">{showPassword ? "Ocultar" : "Ver"}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 pb-1 text-xs md:text-sm font-medium">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20" />
                  <span>Lembrar acesso</span>
                </label>
                <a 
                  href="#" 
                  className="font-semibold text-slate-700 hover:text-slate-900 hover:underline transition-colors" 
                  onClick={(e) => { e.preventDefault(); alert('Solicite a redefinição de senha ao administrador do seu instituto.'); }}
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || isSuccess}
              className={`relative w-full h-14 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer mt-2 overflow-hidden ${
                isSuccess 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.01]" 
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 hover:shadow-lg hover:scale-[1.005] active:scale-[0.99]"
              }`}
            >
              {isSuccess ? (
                <div className="flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <Check className="w-5 h-5" />
                  <span>Conectado!</span>
                </div>
              ) : isLoading ? (
                <div className="flex items-center gap-2 animate-in fade-in duration-300">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Autenticando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Acessar Painel</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>
          
          {/* Rodapé dos Institutos Suportados Removido */}

        </div>
      </div>
    </div>
  );
}
