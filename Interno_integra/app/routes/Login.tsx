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
      console.log("Enviando requisição de login para n8n webhook https://w.ibrase.com.br/webhook/loginadmin ...");
      
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

      console.log("Status da resposta do n8n:", res.status, res.statusText);

      if (res.ok) {
        const text = await res.text();
        console.log("Resposta do n8n webhook:", text);

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

    // 2. Fallback direto Supabase (caso o webhook do n8n falhe ou não responda)
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
    <div className="login-container w-full h-screen overflow-hidden flex bg-[#f8fafc] text-[#0f172a]">
      {/* ==========================================================================
          LADO ESQUERDO: FOTOGRAFIA & MENSAGEM INSTITUCIONAL ADMINISTRATIVA
          ========================================================================== */}
      <div className="hero-viewport hidden lg:flex">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge-tag border-blue-400/40 bg-blue-950/60 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            PAINEL ADMINISTRATIVO &amp; GESTÃO
          </div>
          
          <h1 className="hero-title">
            Central Unificada de <br />
            <span>Gestão Institucional.</span>
          </h1>

          <p className="hero-description">
            <ShieldCheck className="hero-description-icon text-blue-400" />
            <span>Portal de acesso exclusivo para gestores, coordenadores e colaboradores autorizados.</span>
          </p>

          <div className="institutions-bar">
            <div className="inst-logo-badge badge-ibrase">IBRASE ADMIN</div>
            <div className="inst-logo-badge badge-ivem">IVEM ADMIN</div>
            <div className="inst-logo-badge badge-gasctpna">GASCTPNA ADMIN</div>
            <div className="inst-logo-badge badge-auni">AUNI ADMIN</div>
          </div>
        </div>
      </div>

      {/* ==========================================================================
          LADO DIREITO: FORMULÁRIO DE LOGIN COM IDENTIFICAÇÃO ADMIN CLARA
          ========================================================================== */}
      <div className="login-viewport w-full lg:w-[440px] shrink-0 h-full bg-white flex flex-col justify-center px-10 py-8 relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Logo GIF Oficial da Marca (_prod_simbolo.gif) + Badge Admin */}
        <div className="brand-header text-center mb-5 flex flex-col items-center justify-center w-full">
          <img 
            className="brand-symbol-gif h-[70px] w-auto object-contain mx-auto mb-1 block" 
            src="/_prod_simbolo.gif" 
            onError={(e) => { (e.target as any).src='/logo_integra_simbolo.gif'; }} 
            alt="INTEGRA Símbolo" 
          />
          <img 
            className="brand-text-logo h-[24px] w-auto max-w-[200px] object-contain mx-auto mb-2 block" 
            src="/_prod_texto.png" 
            onError={(e) => { (e.target as any).src='/logo_integra_texto.png'; }} 
            alt="INTEGRA" 
          />

          {/* Badge Distintiva do Admin */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-slate-100 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Portal de Administração
          </div>
        </div>

        {/* Barrinha Mobile das 4 Instituições (Exibida apenas em Celulares) */}
        <div className="mobile-institutions-bar lg:hidden flex flex-wrap gap-1.5 justify-center mb-5">
          <span className="mobile-inst-tag tag-ibrase">IBRASE ADMIN</span>
          <span className="mobile-inst-tag tag-ivem">IVEM ADMIN</span>
          <span className="mobile-inst-tag tag-gasctpna">GASCTPNA ADMIN</span>
          <span className="mobile-inst-tag tag-auni">AUNI ADMIN</span>
        </div>

        {/* Banner de Erro */}
        {errorMsg && (
          <div className="error-banner flex items-center gap-2 bg-[#fef2f2] text-[#ef4444] p-3 rounded-lg border border-[#fca5a5] text-sm font-medium mb-5 shadow-sm transform transition-all">
            <AlertCircle className="w-[18px] h-[18px] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} className="clean-form flex flex-col gap-4.5 w-full">
          <div className="form-group flex flex-col gap-[6px]">
            <label className="form-label text-[12px] font-bold text-[#1e293b] uppercase tracking-wider">Usuário ou E-mail Institucional</label>
            <div className="input-wrapper relative flex items-center">
              <User className="input-icon absolute left-3 text-[#94a3b8] w-[18px] h-[18px]" />
              <input 
                type="text" 
                className="clean-input w-full h-[46px] pl-10 pr-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] text-[14.5px] font-medium placeholder-[#94a3b8] focus:bg-white focus:border-[#1e40af] focus:ring-4 focus:ring-[#1e40af]/10 transition-all outline-none" 
                placeholder="Digite seu usuário ou e-mail corporativo" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group flex flex-col gap-[6px]">
            <label className="form-label text-[12px] font-bold text-[#1e293b] uppercase tracking-wider">Senha de Acesso</label>
            <div className="input-wrapper relative flex items-center">
              <Lock className="input-icon absolute left-3 text-[#94a3b8] w-[18px] h-[18px]" />
              <input 
                type={showPassword ? "text" : "password"} 
                className="clean-input w-full h-[46px] pl-10 pr-[70px] rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] text-[14.5px] font-medium placeholder-[#94a3b8] focus:bg-white focus:border-[#1e40af] focus:ring-4 focus:ring-[#1e40af]/10 transition-all outline-none" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="btn-toggle-pass absolute right-3 h-[28px] px-2 bg-white border border-[#e2e8f0] rounded-md text-[11px] font-bold text-[#64748b] uppercase tracking-wide flex items-center gap-[4px] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors"
              >
                {showPassword ? <EyeOff className="w-[14px] h-[14px]" /> : <Eye className="w-[14px] h-[14px]" />} 
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <div className="form-options flex items-center justify-between mt-1">
            <label className="remember-label flex items-center gap-2 cursor-pointer text-[13px] font-medium text-[#475569] hover:text-[#0f172a] select-none">
              <input type="checkbox" className="w-[15px] h-[15px] rounded-[4px] border-[#cbd5e1] text-[#1e40af] focus:ring-[#1e40af]/20" />
              Lembrar acesso neste computador
            </label>
            <a href="#" className="forgot-link text-[12.5px] font-bold text-[#1e40af] hover:text-[#1d4ed8] underline decoration-transparent hover:decoration-[#1d4ed8] transition-all" onClick={(e) => { e.preventDefault(); alert('Solicite a redefinição de senha ao administrador master do seu instituto.'); }}>Esqueceu a senha?</a>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary-login w-full h-[48px] mt-2 rounded-[14px] bg-slate-900 text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(15,23,42,0.25)] hover:bg-slate-800 hover:shadow-[0_8px_25px_rgba(15,23,42,0.35)] hover:-translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Autenticando Gestor..." : "Acessar Painel Administrativo"}
            {!isLoading && <ArrowRight className="w-5 h-5 ml-1" />}
          </button>
        </form>
        
        {/* Aviso de Privacidade e Segurança */}
        <p className="privacy-notice text-[11.5px] text-[#94a3b8] text-center mt-6 leading-[1.6]">
          🔒 <strong>Ambiente Corporativo Restrito</strong><br />
          Tentativas de acesso não autorizadas são registradas e auditadas.
        </p>

      </div>
    </div>
  );
}
