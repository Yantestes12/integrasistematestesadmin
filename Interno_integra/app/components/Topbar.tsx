import React, { useEffect, useState, useRef } from 'react';
import { Network, ArrowLeftRight, LogOut, HelpCircle, Building2, ChevronDown, Check, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';

const ALL_INSTITUTES = ["GASCTPNA", "IBRASE", "AUNI", "IVEM"];

export const Topbar = () => {
  const navigate = useNavigate();
  const [institute, setInstitute] = useState("IBRASE");
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Colaborador");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute");
    if (savedInstitute) setInstitute(savedInstitute);

    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) setUserName(savedUser.split(' ')[0]);

    const savedRole = localStorage.getItem("auth_cargo");
    if (savedRole) setUserRole(savedRole);

    // Fechar dropdowns ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_institute");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_cargo");
    localStorage.removeItem("auth_id");
    localStorage.removeItem("auth_institutos_permitidos");
    navigate('/login');
  };

  const handleSwitchInstitute = (newInst: string) => {
    localStorage.setItem("auth_institute", newInst);
    setInstitute(newInst);
    setIsDropdownOpen(false);
    // Recarrega a página para atualizar todo o contexto do app com as cores do novo instituto
    window.location.reload();
  };

  return (
    <header className="bg-[var(--theme-topbar)] text-white pl-14 sm:pl-16 lg:pl-6 pr-4 sm:pr-6 py-3 flex items-center justify-between shadow-md sticky top-0 z-30 w-full select-none min-h-[64px] border-b border-white/10 transition-colors duration-300">

      {/* Lado Esquerdo: Logo / Marca e Contexto do Instituto */}
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        
        {/* Integra Logo */}
        <div className="flex items-center justify-center bg-white/10 p-2 rounded-xl border border-white/15 shadow-sm">
          <img 
            src="/logo_integra_simbolo.gif" 
            onError={(e) => { (e.target as any).style.display = 'none'; }} 
            alt="Integra" 
            className="h-8 sm:h-9 lg:h-10 w-auto object-contain brightness-0 invert" 
          />
        </div>

        <div className="w-px h-8 bg-white/15 hidden sm:block"></div>

        {/* Seletor de Instituto (Sempre clicável e trocável no PC) */}
        <div className="relative" ref={dropdownRef}>
          <button 
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer group shadow-sm"
            title="Clique para alternar de Instituto"
          >
            <div className="bg-white px-2 py-1.5 rounded-lg flex items-center justify-center shadow-md">
              <img 
                src={`/logo_${institute.toLowerCase()}.png`} 
                onError={(e) => { 
                  (e.target as any).style.display = 'none'; 
                  if ((e.target as any).nextElementSibling) {
                    (e.target as any).nextElementSibling.style.display = 'flex';
                  }
                }} 
                alt={institute} 
                className="h-8 sm:h-9 lg:h-10 w-auto object-contain max-w-[120px] sm:max-w-[160px]" 
              />
              <div className="hidden items-center gap-1.5 text-slate-800 font-extrabold text-sm">
                <Building2 size={16} className="text-blue-600" />
                <span>{institute}</span>
              </div>
            </div>
            
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-white/70 uppercase tracking-widest font-extrabold leading-none">Instituto Ativo</span>
              <span className="text-sm font-black text-white leading-tight flex items-center gap-1">
                {institute}
              </span>
            </div>

            <ChevronDown size={16} className={`text-white/70 transition-transform group-hover:text-white ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Dropdown de Alternância de Instituto no PC */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-slate-200 shadow-2xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
              <div className="px-3 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alternar Instituto</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">4 Opções</span>
              </div>

              {ALL_INSTITUTES.map((inst) => (
                <button
                  key={inst}
                  type="button"
                  onClick={() => handleSwitchInstitute(inst)}
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors ${inst === institute ? 'text-slate-900 font-bold bg-slate-100/80 border-l-4 border-slate-800' : 'text-slate-700 font-medium'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                    <img 
                      src={`/logo_${inst.toLowerCase()}.png`} 
                      onError={(e) => { (e.target as any).style.display = 'none'; }} 
                      alt={inst} 
                      className="h-5 w-auto object-contain" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold">{inst}</div>
                    <div className="text-[10px] text-slate-400">Painel Geral</div>
                  </div>
                  {inst === institute && <Check size={16} className="text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lado Direito: Perfil do Usuário e Alternar Usuário / Sair */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Dropdown de Usuário no PC (Trocar Usuário / Perfil) */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
              {userName.substring(0, 2)}
            </div>
            
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-white truncate max-w-[120px]">{userName}</span>
              <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">
                {userRole}
              </span>
            </div>

            <ChevronDown size={14} className={`text-white/70 transition-transform hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Dropdown de Usuário (Trocar Conta / Sair) */}
          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 shadow-2xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{userName}</p>
                <p className="text-[10px] text-slate-500">{userRole} • {institute}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors border-b border-slate-100"
              >
                <ArrowLeftRight size={14} />
                <span>Trocar de Usuário</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut size={14} />
                <span>Sair do Sistema</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          aria-label="Sair / Fechar"
          className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-200 text-white/80 transition-colors border border-white/10 hidden lg:flex items-center gap-1.5 text-xs font-medium"
          title="Sair do Sistema"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>

    </header>
  );
};
