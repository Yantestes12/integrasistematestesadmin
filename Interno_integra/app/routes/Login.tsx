import React, { useState } from 'react';
import { ArrowRight, Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../supabaseClient';
import '../styles/login.css';

const INSTITUTES = ['IBRASE', 'GASCTPNA', 'AUNI', 'IVEM'];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

          navigate("/");
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

      navigate("/");
    } catch (err) {
      console.error("Erro no login:", err);
      setErrorMsg("Erro ao conectar com o banco de dados.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50/70 p-4 sm:p-6 md:p-8 font-sans overflow-hidden">
      
      {/* Luzes decorativas sutis de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Card Principal Centralizado */}
      <div className="w-full max-w-[450px] bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-900/5 p-7 sm:p-9 relative z-10 transition-all">
        
        {/* Cabeçalho da Marca */}
        <div className="flex flex-col items-center justify-center text-center mb-7">
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

          {/* Badge Elegante */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-700 text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Portal de Administração</span>
          </div>
        </div>

        {/* Banner de Erro */}
        {errorMsg && (
          <div className="flex items-center gap-2.5 bg-red-50 text-red-700 p-3.5 rounded-2xl border border-red-200 text-xs font-semibold mb-6 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Usuário ou E-mail Institucional
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input 
                type="text" 
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                placeholder="Digite seu usuário ou e-mail corporativo" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Senha de Acesso
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full h-12 pl-10 pr-24 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} 
                <span>{showPassword ? "Ocultar" : "Ver"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 pb-1 text-xs font-medium">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
              <span>Lembrar acesso</span>
            </label>
            <a 
              href="#" 
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors" 
              onClick={(e) => { e.preventDefault(); alert('Solicite a redefinição de senha ao administrador do seu instituto.'); }}
            >
              Esqueceu a senha?
            </a>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-slate-900/15 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
          >
            {isLoading ? "Autenticando..." : "Acessar Painel"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
        
        {/* Rodapé dos Institutos Suportados */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
            Institutos Integrados
          </p>
          <div className="flex items-center justify-center gap-2.5 text-xs font-bold text-slate-600 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200/60">IBRASE</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">GASCTPNA</span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60">AUNI</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">IVEM</span>
          </div>
        </div>

      </div>
    </div>
  );
}
