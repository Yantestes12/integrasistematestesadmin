import React, { useEffect, useState, useRef } from 'react';
import { Network, ArrowLeftRight, LogOut, Sun, Moon, Building2, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router';

export const Topbar = () => {
  const navigate = useNavigate();
  const [institute, setInstitute] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_institute") || "IBRASE";
    }
    return "IBRASE";
  });
  const [allowedInstitutes, setAllowedInstitutes] = useState<string[]>([]);
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Colaborador");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute");
    if (savedInstitute) setInstitute(savedInstitute);

    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) setUserName(savedUser.split(' ')[0]);

    const savedRole = localStorage.getItem("auth_cargo");
    if (savedRole) setUserRole(savedRole);

    try {
      const allowed = JSON.parse(localStorage.getItem("auth_institutos_permitidos") || "[]");
      if (Array.isArray(allowed) && allowed.length > 0) {
        const list = savedInstitute && !allowed.includes(savedInstitute) ? [...allowed, savedInstitute] : allowed;
        setAllowedInstitutes(list);
      } else if (savedInstitute) {
        setAllowedInstitutes([savedInstitute]);
      }
    } catch(e) {
      if (savedInstitute) setAllowedInstitutes([savedInstitute]);
    }

    // Fechar dropdown ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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
    // IMPORTANTE: Limpar os filtros globais para que os IDs de outro instituto não causem dados vazios
    localStorage.removeItem("global_projeto_filter");
    localStorage.removeItem("global_cidade_filter");
    localStorage.removeItem("global_nucleo_filter");
    // Recarrega a página para atualizar todo o contexto do app
    window.location.reload();
  };

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("integra_dark_mode");
    const isDark = savedMode === "true" || (savedMode === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem("integra_dark_mode", String(next));
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="bg-white dark:bg-[var(--theme-topbar-dark)] text-slate-800 dark:text-white lg:bg-[var(--theme-topbar)] lg:text-white pl-14 sm:pl-16 lg:pl-6 pr-4 sm:pr-6 py-1.5 flex items-center justify-between shadow-xs sticky top-0 z-30 lg:z-30 w-full select-none min-h-[52px] h-[52px] border-b border-slate-200 dark:border-white/10 lg:border-white/10 transition-colors duration-300">

      {/* Lado Esquerdo: Logo / Marca e Contexto do Instituto */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        
        {/* Integra Logo (Clique para Minimizar / Expandir a Barra no PC) */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("toggleSidebarPC"));
          }}
          className="flex items-center justify-center p-1.5 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hover:bg-white/20 transition-all cursor-pointer group focus:outline-none"
          title="Clique para abrir ou recolher o menu lateral"
          aria-label="Recolher / Expandir Menu Lateral"
        >
          <img 
            src="/logo_integra_simbolo.gif" 
            onError={(e) => { (e.target as any).style.display = 'none'; }} 
            alt="Integra" 
            className="h-5 w-auto object-contain lg:brightness-0 lg:invert transition-transform duration-200 group-hover:scale-110 active:scale-95" 
          />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 lg:bg-white/20 hidden sm:block"></div>

        {/* Info do Instituto Selecionado & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => allowedInstitutes.length > 1 && setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all ${
              allowedInstitutes.length > 1 
                ? 'hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer border-slate-200 dark:border-slate-700/80 lg:border-white/20 lg:bg-white/10' 
                : 'cursor-default border-transparent lg:bg-white/10'
            }`}
          >
            {/* Wrapper da Logo com fundo escuro exclusivo para a logo da AUNI */}
            <div className={`flex items-center justify-center p-0.5 rounded transition-colors ${
              institute.toUpperCase() === 'AUNI' 
                ? 'bg-slate-900 border border-slate-700 shadow-sm' 
                : institute.toUpperCase() === 'IVEM'
                ? 'bg-white border border-slate-200 shadow-sm'
                : 'bg-transparent'
            }`}>
              <img 
                src={`/logo_${institute.toLowerCase()}.png`} 
                onError={(e) => { 
                  (e.target as any).style.display = 'none'; 
                  if ((e.target as any).nextElementSibling) {
                    (e.target as any).nextElementSibling.style.display = 'flex';
                  }
                }} 
                alt={institute} 
                className="h-6 w-auto object-contain" 
              />
              {/* Fallback de texto se a imagem não carregar */}
              <div className="hidden items-center gap-1.5 text-slate-700 dark:text-slate-200 lg:text-white font-bold text-xs">
                <Building2 size={16} className="text-blue-600 lg:text-white" />
                <span>{institute}</span>
              </div>
            </div>

            {allowedInstitutes.length > 1 && (
              <ChevronDown size={14} className={`text-slate-400 dark:text-slate-500 lg:text-white/70 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Menu Dropdown de Múltiplos Institutos (Sobrepõe a barra lateral com z-[100]) */}
          {isDropdownOpen && allowedInstitutes.length > 1 && (
            <div className="absolute top-full left-0 mt-2 w-60 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl py-2 z-[100] animate-in fade-in slide-in-from-top-2">
              <div className="px-3 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Trocar Instituto
              </div>
              {allowedInstitutes.map((inst) => (
                <button
                  key={inst}
                  onClick={() => handleSwitchInstitute(inst)}
                  className={`w-full text-left px-4 py-2 text-xs sm:text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                    inst === institute ? 'text-blue-700 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/40' : 'text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                >
                  {/* Container da logo no dropdown com fundo escuro exclusivo para AUNI */}
                  <div className={`p-1 rounded-md flex items-center justify-center ${
                    inst.toUpperCase() === 'AUNI' ? 'bg-slate-900 border border-slate-700' : inst.toUpperCase() === 'IVEM' ? 'bg-white border border-slate-200' : 'bg-transparent'
                  }`}>
                    <img 
                      src={`/logo_${inst.toLowerCase()}.png`} 
                      onError={(e) => { (e.target as any).style.display = 'none'; }} 
                      alt={inst} 
                      className="h-4 w-auto object-contain" 
                    />
                  </div>
                  <span className="flex-1">{inst}</span>
                  {inst === institute && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lado Direito: Perfil e Botões de Utilidade */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* User Info */}
        <div className="flex flex-col items-end mr-1 hidden sm:flex">
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 lg:text-white truncate">Olá, {userName}</span>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 lg:bg-white/15 lg:text-white/90 px-2 py-0.5 rounded-full tracking-wide">
            {userRole}
          </span>
        </div>

        {/* Botão de Alternância Dark Mode / Light Mode */}
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 lg:text-white/80 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 lg:hover:bg-white/10 transition-all cursor-pointer group flex items-center justify-center"
          title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
        >
          {isDarkMode ? (
            <Sun size={17} className="text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={17} className="group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 lg:bg-white/20 mx-0.5 hidden sm:block"></div>

        <button
          onClick={handleLogout}
          aria-label="Sair / Fechar"
          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 lg:text-white/80 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 lg:hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
          title="Sair"
        >
          <LogOut size={16} />
          <span className="text-xs font-semibold hidden lg:block">Sair</span>
        </button>
      </div>

    </header>
  );
}
