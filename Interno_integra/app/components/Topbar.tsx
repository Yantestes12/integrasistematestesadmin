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
  
  const [projetos, setProjetos] = useState<any[]>([]);
  const [selectedProjeto, setSelectedProjeto] = useState<string>("all");

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

    // Fetch projetos para o filtro
    const fetchProjetos = async (inst: string) => {
      try {
        const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}`, { cache: "no-store" });
        if (res.ok) {
          const text = await res.text();
          let data = JSON.parse(text);
          if (data && data.message !== "Workflow was started" && !data.error) {
            let list = Array.isArray(data) ? data : data.data || data.items || [];
            let flat: any[] = [];
            list.forEach((entry: any) => {
              if (entry?.json) Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
              else if (Array.isArray(entry)) flat.push(...entry);
              else flat.push(entry);
            });
            setProjetos(flat);
          }
        }
      } catch (e) {}
    };
    fetchProjetos(savedInstitute || "IBRASE");

    const savedFilter = localStorage.getItem("global_projeto_filter");
    if (savedFilter) setSelectedProjeto(savedFilter);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProjeto(val);
    localStorage.setItem("global_projeto_filter", val);
    window.dispatchEvent(new Event("globalFilterChanged"));
  };

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
    <header className="bg-white text-slate-800 lg:bg-[var(--theme-topbar)] lg:text-white pl-14 sm:pl-16 lg:pl-6 pr-4 sm:pr-6 py-3 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] sticky top-0 z-30 lg:z-30 w-full select-none min-h-[64px] border-b border-slate-100 lg:border-white/10 transition-colors duration-200">

      {/* Lado Esquerdo: Logo / Marca e Contexto do Instituto */}
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        
        {/* Integra Logo */}
        <div className="flex items-center justify-center lg:bg-white/10 lg:p-1.5 lg:rounded-lg lg:border lg:border-white/15">
          <img 
            src="/logo_integra_simbolo.gif" 
            onError={(e) => { (e.target as any).style.display = 'none'; }} 
            alt="Integra" 
            className="h-7 w-auto object-contain lg:brightness-0 lg:invert" 
          />
        </div>

        <div className="w-px h-8 bg-slate-200 lg:bg-white/20 hidden sm:block"></div>

        {/* Info do Instituto Selecionado & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => allowedInstitutes.length > 1 && setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all ${
              allowedInstitutes.length > 1 
                ? 'hover:bg-slate-50 lg:hover:bg-white/15 cursor-pointer border-slate-200 lg:border-white/20 lg:bg-white/10' 
                : 'cursor-default border-transparent lg:bg-white/10'
            }`}
          >
            {/* Wrapper da Logo com fundo escuro exclusivo para a logo da AUNI */}
            <div className={`flex items-center justify-center p-1 rounded-md transition-colors ${
              institute.toUpperCase() === 'AUNI' 
                ? 'bg-slate-900 border border-slate-700 shadow-sm' 
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
                className="h-8 w-auto object-contain" 
              />
              {/* Fallback de texto se a imagem não carregar */}
              <div className="hidden items-center gap-1.5 text-slate-700 lg:text-white font-bold">
                <Building2 size={18} className="text-blue-600 lg:text-white" />
                <span>{institute}</span>
              </div>
            </div>

            {allowedInstitutes.length > 1 && (
              <ChevronDown size={16} className={`text-slate-400 lg:text-white/70 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Menu Dropdown de Múltiplos Institutos (Sobrepõe a barra lateral com z-[100]) */}
          {isDropdownOpen && allowedInstitutes.length > 1 && (
            <div className="absolute top-full left-0 mt-2 w-60 bg-white text-slate-800 border border-slate-200 shadow-2xl rounded-xl py-2 z-[100] animate-in fade-in slide-in-from-top-2">
              <div className="px-3 pb-2 mb-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Trocar Instituto
              </div>
              {allowedInstitutes.map((inst) => (
                <button
                  key={inst}
                  onClick={() => handleSwitchInstitute(inst)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                    inst === institute ? 'text-blue-700 font-bold bg-blue-50/50' : 'text-slate-700 font-medium'
                  }`}
                >
                  {/* Container da logo no dropdown com fundo escuro exclusivo para AUNI */}
                  <div className={`p-1 rounded-md flex items-center justify-center ${
                    inst.toUpperCase() === 'AUNI' ? 'bg-slate-900 border border-slate-700' : 'bg-transparent'
                  }`}>
                    <img 
                      src={`/logo_${inst.toLowerCase()}.png`} 
                      onError={(e) => { (e.target as any).style.display = 'none'; }} 
                      alt={inst} 
                      className="h-5 w-auto object-contain" 
                    />
                  </div>
                  <span className="flex-1">{inst}</span>
                  {inst === institute && <Check size={16} className="text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Filtro Global de Projeto */}
        <div className="hidden lg:flex items-center gap-2 ml-4 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/15 transition-colors">
          <span className="text-xs font-bold text-slate-500 lg:text-white/80 uppercase tracking-wider">Iniciativa:</span>
          <select 
            value={selectedProjeto}
            onChange={handleFilterChange}
            className="bg-transparent text-slate-800 lg:text-white text-sm font-bold outline-none cursor-pointer appearance-none pr-6 custom-select-arrow"
            style={{ 
              WebkitAppearance: 'none', 
              MozAppearance: 'none', 
              background: 'transparent',
              backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'white\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>")',
              backgroundRepeat: 'no-repeat',
              backgroundPositionX: '100%',
              backgroundPositionY: '50%'
            }}
          >
            <option value="all" className="text-slate-800 font-bold">Todas</option>
            {projetos.map(p => (
              <option key={p.id} value={p.id} className="text-slate-800 font-bold">{p.nome || p.iniciativa}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Lado Direito: Perfil e Botões de Utilidade */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        
        {/* User Info */}
        <div className="flex flex-col items-end mr-2 hidden sm:flex">
          <span className="text-sm font-bold text-slate-800 lg:text-white truncate">Olá, {userName}</span>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 lg:bg-white/20 lg:text-white px-2 py-0.5 rounded uppercase tracking-wider">
            {userRole}
          </span>
        </div>

        <button
          aria-label="Ajuda"
          className="p-2 rounded-xl text-slate-400 lg:text-white/80 hover:text-blue-600 lg:hover:text-white hover:bg-blue-50 lg:hover:bg-white/10 transition-colors hidden sm:block"
        >
          <HelpCircle size={18} />
        </button>

        <div className="w-px h-6 bg-slate-200 lg:bg-white/20 mx-1 hidden sm:block"></div>

        <button
          onClick={handleLogout}
          aria-label="Sair / Fechar"
          className="p-2 rounded-xl text-slate-400 lg:text-white/80 hover:text-red-600 lg:hover:text-red-300 hover:bg-red-50 lg:hover:bg-red-500/20 transition-colors flex items-center gap-2"
          title="Sair"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium hidden lg:block">Sair</span>
        </button>
      </div>

    </header>
  );
}
