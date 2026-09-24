import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Sun, Moon, Building2, ChevronDown, Check, Crown, Users, Briefcase, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AdminBookIcon, MarketingPaintIcon } from './SidebarIcons';

const ROLE_OPTIONS = [
  { id: 'admin', label: 'Administrativo', shortLabel: 'Administrativo', icon: AdminBookIcon },
  { id: 'pedagogico', label: 'Pedagógico', shortLabel: 'Pedagógico', icon: Users },
  { id: 'marketing', label: 'Marketing', shortLabel: 'Marketing', icon: MarketingPaintIcon },
  { id: 'instrutor', label: 'Instrutor', shortLabel: 'Instrutor', icon: GraduationCap },
  { id: 'rh', label: 'RH', shortLabel: 'RH', icon: Briefcase },
];

const normalizeRole = (raw: string): string => {
  const r = (raw || '').toLowerCase().trim();
  if (r.includes('master')) return 'admin';
  if (r.includes('admin') || r.includes('geral') || r.includes('gestão') || r.includes('gestao')) return 'admin';
  if (r.includes('pedagog') || r.includes('pedagóg')) return 'pedagogico';
  if (r.includes('market')) return 'marketing';
  if (r.includes('instrut') || r.includes('prof')) return 'instrutor';
  if (r.includes('rh') || r.includes('recursos')) return 'rh';
  return 'admin';
};

const getRoleDisplayLabel = (roleId: string, originalRole: string): string => {
  switch (roleId) {
    case 'admin': return 'Administrativo';
    case 'pedagogico': return 'Pedagógico';
    case 'marketing': return 'Marketing';
    case 'instrutor': return 'Instrutor';
    case 'rh': return 'RH';
    default: return 'Administrativo';
  }
};

export const Topbar = () => {
  const navigate = useNavigate();
  const [institute, setInstitute] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_institute") || "IBRASE";
    }
    return "IBRASE";
  });
  const [userName, setUserName] = useState("Admin");
  const [realRole, setRealRole] = useState("Colaborador");
  const [activeRole, setActiveRole] = useState("admin");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const isMaster = realRole.toLowerCase().trim().includes("master");

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute");
    if (savedInstitute) setInstitute(savedInstitute);

    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) setUserName(savedUser.split(' ')[0]);

    const savedRole = localStorage.getItem("auth_cargo") || "Colaborador";
    setRealRole(savedRole);

    const isMasterUser = savedRole.toLowerCase().trim().includes("master");
    if (isMasterUser) {
      const savedView = localStorage.getItem("integra_active_view") || "admin";
      setActiveRole(savedView);
    } else {
      setActiveRole(normalizeRole(savedRole));
    }

    // Fechar dropdown de cargo ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleActiveRoleChanged = (e: any) => {
      if (e.detail) setActiveRole(e.detail);
    };
    window.addEventListener("activeRoleChanged", handleActiveRoleChanged);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("activeRoleChanged", handleActiveRoleChanged);
    };
  }, []);

  const handleSwitchRole = (newRole: string) => {
    localStorage.setItem("integra_active_view", newRole);
    setActiveRole(newRole);
    setIsRoleDropdownOpen(false);
    window.dispatchEvent(new CustomEvent("activeRoleChanged", { detail: newRole }));

    if (newRole === "pedagogico") {
      navigate("/?view=pedagogico");
    } else if (newRole === "admin" || newRole === "master") {
      navigate("/?view=geral");
    } else if (newRole === "marketing") {
      navigate("/marketing");
    } else if (newRole === "instrutor") {
      navigate("/instrutor");
    } else if (newRole === "rh") {
      navigate("/rh");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_institute");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_cargo");
    localStorage.removeItem("auth_account_type");
    localStorage.removeItem("auth_id");
    localStorage.removeItem("auth_institutos_permitidos");
    localStorage.removeItem("auth_login_timestamp");
    localStorage.removeItem("integra_active_view");
    navigate('/login');
  };

  const getGreeting = (name: string) => {
    const hour = new Date().getHours();
    const day = new Date().getDay(); // 0 is Sunday, 1 is Monday, 5 is Friday
    
    let timeGreeting = "Olá";
    if (hour >= 5 && hour < 12) timeGreeting = "Bom dia";
    else if (hour >= 12 && hour < 18) timeGreeting = "Boa tarde";
    else timeGreeting = "Boa noite";

    // Recompensas emocionais baseadas no dia
    if (day === 5) return `Sextou, ${name}! 🎉`;
    if (day === 1 && hour < 12) return `${timeGreeting}, ${name}! ☕ Boa semana!`;
    
    // Padrão
    return `${timeGreeting}, ${name}!`;
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
    <header className="bg-white dark:bg-[var(--theme-topbar-dark)] text-slate-800 dark:text-white lg:bg-[var(--theme-topbar)] lg:text-white pl-14 sm:pl-16 lg:pl-6 pr-4 sm:pr-6 py-1.5 flex items-center justify-between shadow-xs sticky top-0 z-50 lg:z-50 w-full select-none min-h-[52px] h-[52px] border-b border-slate-200 dark:border-white/10 lg:border-white/10 transition-colors duration-300 relative">
      
      {/* Centro: Cargo do Usuário / Seletor Interativo de Perfil para Master */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center">
        {isMaster ? (
          <div className="relative" ref={roleDropdownRef}>
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-[11px] font-black tracking-[0.12em] uppercase transition-all shadow-inner cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 lg:bg-white/15 lg:text-white lg:hover:bg-white/25 lg:border lg:border-white/20 backdrop-blur-sm focus:outline-none"
              title="Clique para alternar o acesso entre perfis (Master)"
              aria-label="Alternar Cargo"
            >
              <Crown size={12} className="text-amber-400 shrink-0" />
              <span>{getRoleDisplayLabel(activeRole, realRole)}</span>
              <ChevronDown size={12} className={`text-slate-400 dark:text-slate-400 lg:text-white/80 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl py-2 z-[100] animate-in fade-in slide-in-from-top-2">
                <div className="px-3 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Alternar Setor</span>
                  <span className="text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                    <Crown size={10} /> MASTER
                  </span>
                </div>
                {ROLE_OPTIONS.map((opt) => {
                  const isSelected = activeRole === opt.id;
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSwitchRole(opt.id)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComp className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <span className="text-[10px] md:text-[11px] font-black bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 lg:bg-white/15 lg:text-white/90 lg:border lg:border-white/20 px-4 md:px-5 py-1 md:py-1.5 rounded-full tracking-[0.15em] uppercase shadow-inner backdrop-blur-sm pointer-events-none">
            {getRoleDisplayLabel(activeRole, realRole)}
          </span>
        )}
      </div>


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
            src="/_prod_simbolo.gif" 
            onError={(e) => { (e.target as any).src='/logo_integra_simbolo.gif'; }} 
            alt="Integra" 
            className="h-6 w-auto object-contain transition-transform duration-200 group-hover:scale-110 active:scale-95 brightness-0 dark:invert lg:invert" 
          />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 lg:bg-white/20 hidden sm:block"></div>

        {/* Info do Instituto Selecionado (Fixo - troca somente ao sair e logar) */}
        <div 
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-transparent lg:border-white/10 lg:bg-white/10 select-none"
          title={`Instituto ativo: ${institute}`}
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
        </div>
      </div>

      {/* Lado Direito: Perfil e Botões de Utilidade */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* User Info */}
        <div className="flex flex-col justify-center items-end mr-1 hidden sm:flex">
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 lg:text-white truncate">{getGreeting(userName)}</span>
        </div>

        {/* Botão de Alternância Dark Mode / Light Mode */}
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white lg:text-white/80 lg:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 lg:hover:bg-white/10 transition-colors cursor-pointer"
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Botão Sair */}
        <button 
          onClick={handleLogout}
          title="Encerrar Sessão"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 lg:text-white lg:hover:bg-red-500/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border border-rose-200 dark:border-rose-900/50 lg:border-white/20 cursor-pointer"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>

    </header>
  );
};
