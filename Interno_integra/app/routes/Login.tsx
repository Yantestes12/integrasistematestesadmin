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
          const id = Array.isArray(resData) ? resData[0].id : resData.id;
          const account_type = Array.isArray(resData) ? resData[0].account_type : resData.account_type;
          
          if (inst) {
            localStorage.setItem("auth_institute", inst);
            localStorage.setItem("auth_user", nome);
            localStorage.setItem("auth_cargo", cargo);
            localStorage.setItem("auth_account_type", account_type || "colaborador");
            localStorage.setItem("auth_id", String(id));
          }
          if (resData.institutos_permitidos) {
            localStorage.setItem("auth_institutos_permitidos", JSON.stringify(resData.institutos_permitidos));
          }

          setIsSuccess(true);
          setTimeout(() => { window.location.href = "/"; }, 800);
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
      localStorage.setItem("auth_cargo", foundUser.cargo || "Colaborador");
      localStorage.setItem("auth_account_type", foundUser.account_type || "colaborador");
      localStorage.setItem("auth_id", String(foundUser.id));

      setIsSuccess(true);
      setTimeout(() => { window.location.href = "/"; }, 800);
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
            className="h-20 lg:h-24 w-auto object-contain mb-8 block drop-shadow-2xl transition-all duration-700" 
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
        Celular: Fundo suave e um card centralizado bonito
        PC: Fundo cinza suave com card flutuante
        ------------------------------------------------------------- 
      */}
      <div className="relative w-full md:w-7/12 lg:w-8/12 min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 sm:p-8 md:p-12 lg:p-16 overflow-hidden">
        
        {/* Luzes decorativas sutis de fundo (Apenas Mobile) */}
        <div className="md:hidden absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />
        <div className="md:hidden absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-blue-500/15 blur-[100px] pointer-events-none rounded-full transition-opacity duration-700" style={{ opacity: isSuccess ? 0 : 1 }} />
        <div className="md:hidden absolute bottom-[-10%] right-[-20%] w-[70vw] h-[70vw] bg-indigo-500/15 blur-[100px] pointer-events-none rounded-full transition-opacity duration-700" style={{ opacity: isSuccess ? 0 : 1 }} />

        {/* Card Principal */}
        <div className="w-full max-w-[400px] md:max-w-[480px] bg-white rounded-[2rem] border border-slate-100 md:border-slate-200 shadow-2xl shadow-slate-200/60 md:shadow-xl p-8 sm:p-10 md:p-12 relative z-10 transition-all duration-500 flex flex-col justify-center" style={{ transform: isSuccess ? 'translateY(-10px)' : 'translateY(0)' }}>
          
          {/* Cabeçalho da Marca (Mobile) */}
          <div className="md:hidden flex flex-col items-center justify-center text-center mb-8 transition-all duration-700" style={{ opacity: isSuccess ? 0.3 : 1 }}>
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 flex items-center justify-center mb-6 p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/50 opacity-50"></div>
              <img 
                className="w-full h-full object-contain relative z-10 drop-shadow-md transition-transform hover:scale-105" 
                src="/_prod_simbolo.gif" 
                onError={(e) => { (e.target as any).src='/logo_integra_simbolo.gif'; }} 
                alt="INTEGRA Símbolo" 
              />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 leading-tight">
              Olá de novo!
            </h1>
            <p className="text-[15px] text-slate-500 font-semibold px-2">
              Acesse a plataforma de gestão
            </p>
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
                <label className="block text-[13px] md:text-sm font-bold text-slate-700 md:text-slate-700 ml-1">
                  Usuário ou E-mail Institucional
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 text-slate-400 w-5 h-5" style={{ position: 'absolute', left: '16px', zIndex: 10, pointerEvents: 'none' }} />
                  <input 
                    type="text" 
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 md:bg-white text-slate-900 text-[15px] md:text-base font-semibold placeholder:text-slate-400 placeholder:font-medium focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none" 
                    style={{ paddingLeft: '48px', paddingRight: '16px', height: '56px' }}
                    placeholder="Digite seu usuário ou e-mail" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] md:text-sm font-bold text-slate-700 md:text-slate-700 ml-1">
                  Senha de Acesso
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-slate-400 w-5 h-5" style={{ position: 'absolute', left: '16px', zIndex: 10, pointerEvents: 'none' }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 md:bg-white text-slate-900 text-[15px] md:text-base font-semibold placeholder:text-slate-400 placeholder:font-medium focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none" 
                    style={{ paddingLeft: '48px', paddingRight: '60px', height: '56px' }}
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-[13px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                    style={{ position: 'absolute', right: '8px', zIndex: 10 }}
                    title={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 pb-1 text-[13px] md:text-sm font-semibold ml-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-500 hover:text-slate-900 select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20" />
                  <span>Lembrar acesso</span>
                </label>
                <a 
                  href="#" 
                  className="font-bold text-slate-700 hover:text-slate-900 hover:underline transition-colors" 
                  onClick={(e) => { e.preventDefault(); alert('Solicite a redefinição de senha ao administrador do seu instituto.'); }}
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || isSuccess}
              className={`relative w-full h-14 mt-6 rounded-2xl font-bold text-[15px] md:text-base flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer overflow-hidden ${
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
