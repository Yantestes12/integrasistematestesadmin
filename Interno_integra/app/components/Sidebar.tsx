import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Settings,
  Users,
  BookOpen,
  UserSquare2,
  Megaphone,
  Eye,
  Wallet,
  Network,
  Crown,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export const Sidebar = ({ onSelectMenu }: { onSelectMenu?: any }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isPcCollapsed, setIsPcCollapsed] = useState(false);

  // Mantém os submenus fechados por padrão, abrindo somente via clique do usuário
  const [openPaths, setOpenPaths] = useState<string[]>([]);
  const [userRole, setUserRole] = useState("colaborador");
  const [hasEventos, setHasEventos] = useState(false);

  // Recupera o cargo do usuário para o RBAC e o estado recolhido do menu no PC
  useEffect(() => {
    const cargo = (localStorage.getItem("auth_cargo") || "colaborador").toLowerCase().trim();
    const accountType = (localStorage.getItem("auth_account_type") || "colaborador").toLowerCase().trim();
    setUserRole(`${cargo} ${accountType}`);

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
          const temEventos = projetos.some((p: any) => p.aplicabilidade === "eventos");
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

    window.addEventListener("toggleSidebarPC", handleTogglePC);
    return () => window.removeEventListener("toggleSidebarPC", handleTogglePC);
  }, []);

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

  const handleItemClick = (item: any, e: any) => {
    if (!item.path) e.preventDefault();
    if (onSelectMenu) {
      onSelectMenu(item.name);
    }
    // Fecha o drawer no mobile ao selecionar uma opção final
    setIsOpen(false);
  };

  // Estrutura hierárquica atualizada com as rotas e regras de acesso
  const menuTree = [
    {
      name: 'Administrativo',
      icon: <BookOpen className="w-5 h-5" />,
      roles: ['master', 'admin'],
      path: "/?view=geral", // Rota do dashboard do setor
      children: [
        { name: 'Propostas', path: "/admin/propostas" },
        { 
          name: 'Projetos', 
          children: [
            { name: 'Espaços', path: "/admin/espacos" },
            { name: 'Núcleos', path: "/admin/nucleos" }
          ]
        },
        ...(hasEventos ? [{
          name: 'Eventos', 
          children: [
            { name: 'Local (Núcleo)', path: "/admin/locais-evento" }
          ]
        }] : [])
      ]
    },
    {
      name: 'Pedagógico',
      icon: <Users className="w-5 h-5" />,
      roles: ['master', 'pedagogico'],
      path: "/?view=pedagogico", // Rota do dashboard do setor
      children: [
        { name: 'Inscrições', path: "/pedagogico/inscricoes" },
        { name: 'Matrículas', path: "/pedagogico/matriculas" },
        { name: 'Turmas', path: "/pedagogico/turmas" },
        { name: 'Relatórios', path: "/pedagogico/relatorios" },
      ]
    }
  ];

  // Filtra o menu com base no cargo do usuário
  const filteredMenuTree = menuTree.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(allowedRole => userRole.includes(allowedRole));
  });

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
          <div key={index} className={`w-full pt-4 pb-1 mt-1 ${paddingLeft}`}>
            <div className="text-[10px] font-bold text-white/50 tracking-widest uppercase border-b border-white/10 pb-1.5 select-none pointer-events-none">
              {item.name}
            </div>
          </div>
        );
      }

      const isActiveParent = item.path && location.pathname === '/' && location.search.includes(item.path.split('?')[1]);


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
              className={`flex items-center justify-between py-3 cursor-pointer ${paddingLeft} ${levelBg} ${isActiveParent ? 'border-l-4 border-white font-bold shadow-inner' : ''}`}
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

      const isActive = item.path && location.pathname === item.path;

      return (
        <div key={index} className="w-full">
          <Link
            to={item.path || '#'}
            onClick={() => {
              if (onSelectMenu) onSelectMenu(item.name);
              setIsOpen(false);
            }}
            className={`flex items-center justify-between py-3 cursor-pointer select-none ${paddingLeft} ${
              isActive ? 'bg-white/25 font-bold border-l-4 border-white text-white shadow-inner' : levelBg
            } w-full text-white no-underline text-left block`}
          >
            <div className="flex items-center gap-3 min-w-0 w-full pointer-events-none">
              {item.icon && <span className="pointer-events-none">{item.icon}</span>}
              <span className={`truncate pointer-events-none ${level === 0 ? 'text-base md:text-lg font-bold' : 'text-sm md:text-base font-medium'} ${isActive ? 'font-bold' : ''}`}>
                {level > 0 && !item.icon && '• '} {item.name}
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
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar mt-12 lg:mt-0 w-64">
          {renderMenuItems(filteredMenuTree)}
        </nav>
      </aside>
    </>
  );
};