import React, { useEffect, useState, useRef } from 'react';
import { Network, ArrowLeftRight, LogOut, HelpCircle, Building2, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router';

export const Topbar = () => {
  const navigate = useNavigate();
  const [institute, setInstitute] = useState("IBRASE");
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
        setAllowedInstitutes(allowed);
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
    // Recarrega a página para atualizar todo o contexto do app
    window.location.reload();
  };

  return (
    <header className="bg-white text-slate-800 pl-14 sm:pl-16 lg:pl-6 pr-4 sm:pr-6 py-3 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] sticky top-0 z-30 w-full select-none min-h-[64px] border-b border-slate-100">

      {/* Lado Esquerdo: Logo / Marca e Contexto do Instituto */}
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        
        {/* Integra Logo */}
        <div className="flex items-center justify-center">
          <img src="/logo_integra_simbolo.gif" onError={(e) => { (e.target as any).style.display = 'none'; }} alt="Integra" className="h-7 w-auto object-contain" />
        </div>

        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

        {/* Info do Instituto Selecionado & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => allowedInstitutes.length > 1 && setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${allowedInstitutes.length > 1 ? 'hover:bg-slate-50 cursor-pointer border-slate-200' : 'cursor-default border-transparent'}`}
          >
            <img 
              src={`/logo_${institute.toLowerCase()}.png`} 
              onError={(e) => { 
                (e.target as any).style.display = 'none'; 
                (e.target as any).nextElementSibling.style.display = 'flex';
              }} 
              alt={institute} 
              className="h-8 w-auto object-contain" 
            />
            {/* Fallback de texto se a imagem não carregar */}
            <div className="hidden items-center gap-1.5 text-slate-700 font-bold">
              <Building2 size={18} className="text-blue-600" />
              <span>{institute}</span>
            </div>
            
            {allowedInstitutes.length > 1 && (
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Menu Dropdown de Múltiplos Institutos */}
          {isDropdownOpen && allowedInstitutes.length > 1 && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-100 shadow-xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 pb-2 mb-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Trocar Instituto
              </div>
              {allowedInstitutes.map((inst) => (
                <button
                  key={inst}
                  onClick={() => handleSwitchInstitute(inst)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${inst === institute ? 'text-blue-700 font-bold bg-blue-50/50' : 'text-slate-700 font-medium'}`}
                >
                  {inst}
                  {inst === institute && <Check size={16} className="text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lado Direito: Perfil e Botões de Utilidade */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        
        {/* User Info */}
        <div className="flex flex-col items-end mr-2 hidden sm:flex">
          <span className="text-sm font-bold text-slate-800 truncate">Olá, {userName}</span>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">
            {userRole}
          </span>
        </div>

        <button
          aria-label="Ajuda"
          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors hidden sm:block"
        >
          <HelpCircle size={18} />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

        <button
          onClick={handleLogout}
          aria-label="Sair / Fechar"
          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          title="Sair"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium hidden lg:block">Sair</span>
        </button>
      </div>

    </header>
  );
}
