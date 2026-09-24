import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Settings,
  Users,
  BookOpen,
  UserSquare2,
  Megaphone,
  Network,
  Crown,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { AdminBookIcon, MarketingPaintIcon } from './SidebarIcons';

const normalizeRole = (raw: string): string => {
  const r = (raw || '').toLowerCase().trim();
  if (r.includes('master')) return 'master';
  if (r.includes('admin') || r.includes('geral') || r.includes('gestão') || r.includes('gestao')) return 'admin';
  if (r.includes('pedagog') || r.includes('pedagóg')) return 'pedagogico';
  if (r.includes('market')) return 'marketing';
  if (r.includes('instrut') || r.includes('prof')) return 'instrutor';
  if (r.includes('rh') || r.includes('recursos')) return 'rh';
  return 'admin';
};

const getRoleDisplayLabel = (roleId: string, originalRole: string): string => {
  switch (roleId) {
    case 'master': return 'Master';
    case 'admin': return 'Administrador';
    case 'pedagogico': return 'Pedagógico';
    case 'marketing': return 'Marketing';
    case 'instrutor': return 'Instrutor';
    case 'rh': return 'RH';
    default: return originalRole || 'Colaborador';
  }
};

export const Sidebar = ({ onSelectMenu }: { onSelectMenu?: any }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isPcCollapsed, setIsPcCollapsed] = useState(false);

  // Mantém os submenus fechados por padrão, abrindo somente via clique do usuário
  const [openPaths, setOpenPaths] = useState<string[]>([]);
  const [hasEventos, setHasEventos] = useState(false);

  const [realRole, setRealRole] = useState("colaborador");
  const [activeRole, setActiveRole] = useState(() => {
    if (typeof window !== "undefined") {
      const cargo = (localStorage.getItem("auth_cargo") || "colaborador").toLowerCase().trim();
      const isMasterUser = cargo.includes("master");
      if (isMasterUser) {
        return localStorage.getItem("integra_active_view") || "admin";
      }
      return normalizeRole(cargo);
    }
    return "admin";
  });

  const isMaster = realRole.toLowerCase().includes("master");

  // Recupera o cargo do usuário para o RBAC e o estado recolhido do menu no PC
  useEffect(() => {
    const cargo = (localStorage.getItem("auth_cargo") || "colaborador").toLowerCase().trim();
    setRealRole(cargo);

    const isMasterUser = cargo.includes("master");
    if (isMasterUser) {
      const savedView = localStorage.getItem("integra_active_view") || "admin";
      setActiveRole(savedView);
    } else {
      setActiveRole(normalizeRole(cargo));
    }

    const savedPcCollapsed = localStorage.getItem("sidebar_collapsed_pc") === "true";
    setIsPcCollapsed(savedPcCollapsed);

    const checkEventos = async () => {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      if (!authInstitute) return;
      try {
        const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${authInstitute}`);
        if (res.ok) {
          const data = await res.json();
          const projetos = Array.isArray(data) ? data : (data.data || []);
          const temEventos = projetos.some((p: any) => p.aplicabilidade === "evento" || p.aplicabilidade === "eventos");
          setHasEventos(temEventos);
        }
      } catch (err) {
        console.error("Erro ao verificar eventos", err);
      }
    };
    checkEventos();

    const handleTogglePC = () => {
      setIsPcCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem("sidebar_collapsed_pc", String(next));
        return next;
      });
    };

    const handleActiveRoleChanged = (e: any) => {
      if (e.detail) {
        setActiveRole(e.detail);
      }
    };

    window.addEventListener("toggleSidebarPC", handleTogglePC);
    window.addEventListener("activeRoleChanged", handleActiveRoleChanged);

    return () => {
      window.removeEventListener("toggleSidebarPC", handleTogglePC);
      window.removeEventListener("activeRoleChanged", handleActiveRoleChanged);
    };
  }, []);

  useEffect(() => {
    // Sincroniza os menus abertos com base na URL atual (efeito sanfona automático)
    const newOpenPaths = [];
    if (location.pathname.startsWith('/admin/espacos') || location.pathname.startsWith('/admin/nucleos') || location.pathname.startsWith('/admin/grade-') || location.pathname.startsWith('/admin/projetos')) {
      newOpenPaths.push('Projetos');
    }
    if (location.pathname.startsWith('/admin/nucleos') || location.pathname.startsWith('/admin/grade-')) {
      newOpenPaths.push('Projetos>Núcleos');
    }
    if (location.pathname.startsWith('/admin/locais-evento') || location.pathname.startsWith('/admin/eventos')) {
      newOpenPaths.push('Eventos');
    }
    setOpenPaths(newOpenPaths);
  }, [location.pathname]);

  const togglePath = (itemPath: any, e: any, item: any) => {
    setOpenPaths((prev) => {
      if (prev.includes(itemPath)) {
        return prev.filter((path) => !path.startsWith(itemPath));
      } else {
        // Lógica de Acordeão: ao abrir um menu, fechar os irmãos
        const parentPath = itemPath.includes('>') ? itemPath.split('>').slice(0, -1).join('>') : '';
        const filteredPaths = prev.filter((path) => {
          // Mantém se não for do mesmo nível hierárquico
          const pathParent = path.includes('>') ? path.split('>').slice(0, -1).join('>') : '';
          return pathParent !== parentPath;
        });
        return [...filteredPaths, itemPath];
      }
    });

    // Se o item pai tiver uma rota (como o dashboard do setor), navega para ela
    if (item.path) {
      navigate(item.path);
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    } else {
      e.preventDefault();
    }
  };

  // 1. Itens do Administrativo (diretos, sem pasta Administrativo)
  const adminItems = [
    {
      name: 'Início',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/?view=geral"
    },
    {
      name: 'Propostas',
      icon: <AdminBookIcon className="w-5 h-5" />,
      path: "/admin/propostas"
    },
    { 
      name: 'Projetos', 
      icon: <Settings className="w-5 h-5" />,
      children: [
        { name: 'Espaços', path: "/admin/espacos" },
        { 
          name: 'Núcleos', 
          path: "/admin/nucleos",
          children: [
            { name: 'Grade Horária', isHeader: true },
            { name: 'Gestão', path: "/admin/grade-gestao" },
            { name: 'Estagiários', path: "/admin/grade-estagiarios" }
          ]
        },
        { name: 'Formulários', path: "/admin/projetos/formularios" },
        { name: 'Cronogramas', path: "/admin/projetos/cronogramas" }
      ]
    },
    ...(hasEventos ? [{
      name: 'Eventos', 
      icon: <Megaphone className="w-5 h-5" />,
      children: [
        { name: 'Local (Núcleo)', path: "/admin/locais-evento" },
        { name: 'Formulários', path: "/admin/eventos/formularios" },
        { name: 'Cronogramas', path: "/admin/eventos/cronogramas" }
      ]
    }] : [])
  ];

  // 2. Itens do Pedagógico (diretos, sem pasta Pedagógico)
  const pedagogicoItems = [
    {
      name: 'Início',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/?view=pedagogico"
    },
    {
      name: 'Inscrições',
      icon: <UserSquare2 className="w-5 h-5" />,
      path: "/pedagogico/inscricoes"
    },
    {
      name: 'Matrículas',
      icon: <BookOpen className="w-5 h-5" />,
      path: "/pedagogico/matriculas"
    },
    {
      name: 'Turmas',
      icon: <Network className="w-5 h-5" />,
      path: "/pedagogico/turmas"
    },
    {
      name: 'Relatórios',
      icon: <Briefcase className="w-5 h-5" />,
      path: "/pedagogico/relatorios"
    }
  ];

  // 3. Marketing
  const marketingItems = [
    {
      name: 'Início',
      icon: <MarketingPaintIcon className="w-5 h-5" />,
      path: "/marketing"
    }
  ];

  // 4. Instrutor
  const instrutorItems = [
    {
      name: 'Painel do Instrutor',
      icon: <GraduationCap className="w-5 h-5 anim-cap-context" />,
      path: "/instrutor"
    }
  ];

  // 5. RH
  const rhItems = [
    {
      name: 'Painel de RH',
      icon: <Briefcase className="w-5 h-5" />,
      path: "/rh"
    }
  ];

  // Montagem do menu dinâmico baseado no perfil ativo
  let filteredMenuTree: any[] = [];
  if (activeRole === 'pedagogico') {
    filteredMenuTree = pedagogicoItems;
  } else if (activeRole === 'admin') {
    filteredMenuTree = adminItems;
  } else if (activeRole === 'marketing') {
    filteredMenuTree = marketingItems;
  } else if (activeRole === 'instrutor') {
    filteredMenuTree = instrutorItems;
  } else if (activeRole === 'rh') {
    filteredMenuTree = rhItems;
  } else {
    filteredMenuTree = adminItems;
  }

  // Componente recursivo para renderizar N níveis de submenus
  const renderMenuItems = (items: any, level = 0, currentPath = '') => {
    return items.map((item: any, index: any) => {
      const itemKey = currentPath ? `${currentPath}>${item.name}` : item.name;
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = openPaths.includes(itemKey);

      // Estilos dinâmicos baseados na profundidade da árvore (level)
      const paddingLeft = level === 0 ? 'px-5' : level === 1 ? 'pl-8 pr-5' : level === 2 ? 'pl-12 pr-5' : 'pl-14 pr-5';

      if (item.isHeader) {
        return (
          <div key={index} className={`w-full pt-3.5 pb-1 mt-1 ${paddingLeft}`}>
            <div className="text-[10.5px] font-black text-blue-200/90 tracking-[0.2em] uppercase border-b border-blue-200/20 pb-1 mb-1 select-none pointer-events-none">
              {item.name}
            </div>
          </div>
        );
      }

      const isActiveParent = 
        (item.name === 'Projetos' && (location.pathname.startsWith('/admin/espacos') || location.pathname.startsWith('/admin/nucleos') || location.pathname.startsWith('/admin/grade-') || location.pathname.startsWith('/admin/projetos'))) ||
        (item.name === 'Núcleos' && (location.pathname.startsWith('/admin/nucleos') || location.pathname.startsWith('/admin/grade-'))) ||
        (item.name === 'Eventos' && (location.pathname.startsWith('/admin/locais-evento') || location.pathname.startsWith('/admin/eventos')));

      const levelBg =
        level === 0
          ? isActiveParent || isExpanded ? 'bg-[var(--theme-primary)]' : 'hover:bg-[var(--theme-primary-hover)]'
          : level === 1
            ? 'bg-[var(--theme-level-1)] hover:bg-[var(--theme-level-1-hover)] text-blue-50'
            : level === 2
              ? 'bg-[var(--theme-level-2)] hover:bg-[var(--theme-level-2-hover)] text-blue-100'
              : 'bg-[var(--theme-level-3)] hover:bg-[var(--theme-level-3-hover)] text-blue-100';

      if (hasChildren) {
        return (
          <div key={index} className="w-full">
            <div
              onClick={(e) => togglePath(itemKey, e, item)}
              className={`group flex items-center justify-between py-3 cursor-pointer ${paddingLeft} ${levelBg} ${isActiveParent && level === 0 ? 'border-l-4 border-white font-bold shadow-inner text-white' : (isActiveParent ? 'font-bold text-white' : '')}`}
            >
              <div className="flex items-center gap-3 min-w-0 w-full pointer-events-none">
                {item.icon && <span>{item.icon}</span>}
                <span className={`truncate ${level === 0 ? 'text-base md:text-lg font-bold' : 'text-sm md:text-base font-semibold'}`}>
                  {item.name}
                </span>
              </div>
              <span className="ml-2 shrink-0 pointer-events-none">
                {isExpanded ? <ChevronDown className="w-4 h-4 md:w-5 md:h-5" /> : <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />}
              </span>
            </div>

            {/* Renderiza os filhos de forma recursiva */}
            {isExpanded && (
              <div className="w-full">
                {renderMenuItems(item.children, level + 1, itemKey)}
              </div>
            )}
          </div>
        );
      }

      const isActive = Boolean(
        item.path && (
          item.path.includes('?') 
            ? location.pathname === item.path.split('?')[0] && location.search.includes(item.path.split('?')[1])
            : location.pathname === item.path
        )
      );

      return (
        <div key={index} className="w-full">
          <Link
            to={item.path || '#'}
            onClick={() => {
              if (onSelectMenu) onSelectMenu(item.name);
              setIsOpen(false);
            }}
            className={`group flex items-center justify-between py-3 cursor-pointer select-none ${paddingLeft} ${
              isActive ? 'bg-white/25 font-bold border-l-4 border-white text-white shadow-inner' : levelBg
            } w-full text-white no-underline text-left block`}
          >
            <div className="flex items-center gap-3 min-w-0 w-full pointer-events-none">
              {item.icon && <span className="pointer-events-none">{item.icon}</span>}
              <span className={`truncate pointer-events-none ${level === 0 ? 'text-base md:text-lg font-bold' : 'text-sm md:text-base font-medium'} ${isActive ? 'font-bold' : ''}`}>
                {item.name}
              </span>
            </div>
          </Link>
        </div>
      );
    });
  };

  return (
    <>
      {/* Botão Flutuante Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 rounded-xl bg-[var(--theme-primary)] dark:bg-[var(--theme-sidebar-dark)] text-white shadow-lg focus:outline-none transition-colors duration-300"
        aria-label="Abrir Menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          bg-[var(--theme-primary)] dark:bg-[var(--theme-sidebar-dark)] text-white flex flex-col shadow-inner select-none
          fixed lg:sticky top-0 lg:top-[52px] z-50 lg:z-20 h-screen lg:h-[calc(100vh-52px)]
          transition-all duration-300 ease-in-out border-r border-white/10 dark:border-white/5
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isPcCollapsed ? 'lg:w-0 lg:min-w-0 lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none' : 'lg:w-64 lg:min-w-[16rem] lg:opacity-100'}
        `}
      >
        {/* Header Mobile: Perfil Ativo com Alternador para Master */}
        <div className="lg:hidden px-5 py-3 border-b border-white/10 flex items-center justify-between mt-12 bg-black/15">
          <div className="flex items-center gap-2">
            {isMaster ? <Crown size={15} className="text-amber-400 shrink-0" /> : <Users size={15} className="text-white/80 shrink-0" />}
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {getRoleDisplayLabel(activeRole, realRole)}
            </span>
          </div>
          {isMaster && (
            <select
              value={activeRole}
              onChange={(e) => {
                const newRole = e.target.value;
                localStorage.setItem("integra_active_view", newRole);
                setActiveRole(newRole);
                window.dispatchEvent(new CustomEvent("activeRoleChanged", { detail: newRole }));
                if (newRole === "pedagogico") navigate("/?view=pedagogico");
                else if (newRole === "admin" || newRole === "master") navigate("/?view=geral");
                else if (newRole === "marketing") navigate("/marketing");
                else if (newRole === "instrutor") navigate("/instrutor");
                else if (newRole === "rh") navigate("/rh");
              }}
              className="bg-white/20 text-white text-xs font-bold rounded-lg px-2 py-1 border border-white/20 focus:outline-none"
            >
              <option value="admin" className="text-slate-900 bg-white">Administrativo</option>
              <option value="pedagogico" className="text-slate-900 bg-white">Pedagógico</option>
              <option value="marketing" className="text-slate-900 bg-white">Marketing</option>
              <option value="instrutor" className="text-slate-900 bg-white">Instrutor</option>
              <option value="rh" className="text-slate-900 bg-white">RH</option>
            </select>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar lg:mt-0 w-64">
          {renderMenuItems(filteredMenuTree)}
        </nav>
      </aside>
    </>
  );
};