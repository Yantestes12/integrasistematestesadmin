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

  // Mantém os submenus abertos por padrão (ex: 'Administrativo')
  const [openPaths, setOpenPaths] = useState<string[]>(['Administrativo']);

  // Atualiza os submenus abertos com base na rota atual para que NUNCA fechem sozinhos ao clicar
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setOpenPaths((prev) => prev.includes('Administrativo') ? prev : [...prev, 'Administrativo']);
    }
  }, [location.pathname]);

  const togglePath = (itemPath: any, e: any, item: any) => {
    if (!item.path) e.preventDefault();

    setOpenPaths((prev) => {
      if (prev.includes(itemPath)) {
        return prev.filter((path) => !path.startsWith(itemPath));
      } else {
        return [...prev, itemPath];
      }
    });
  };

  const handleItemClick = (item: any, e: any) => {
    if (!item.path) e.preventDefault();
    if (onSelectMenu) {
      onSelectMenu(item.name);
    }
    // Fecha o drawer no mobile ao selecionar uma opção final
    setIsOpen(false);
  };

  // Estrutura hierárquica atualizada com as rotas reais do app/routes.ts
  const menuTree = [
    { name: 'Dashboard', path: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      name: 'Administrativo',
      icon: <BookOpen className="w-5 h-5" />,
      children: [
        { name: 'Iniciativas', path: "/admin/iniciativas" },
        { name: 'Espaços', path: "/admin/espacos" },
        { name: 'Núcleos', path: "/admin/nucleos" },
      ]
    }
  ];

  // Componente recursivo para renderizar N níveis de submenus
  const renderMenuItems = (items: any, level = 0, currentPath = '') => {
    return items.map((item: any, index: any) => {
      const itemKey = currentPath ? `${currentPath}>${item.name}` : item.name;
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = openPaths.includes(itemKey);

      // Estilos dinâmicos baseados na profundidade da árvore (level)
      const paddingLeft = level === 0 ? 'px-5' : level === 1 ? 'pl-8 pr-5' : level === 2 ? 'pl-12 pr-5' : 'pl-14 pr-5';

      const levelBg =
        level === 0
          ? isExpanded ? 'bg-[var(--theme-primary)]' : 'hover:bg-[var(--theme-primary-hover)]'
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
              className={`flex items-center justify-between py-3 cursor-pointer ${paddingLeft} ${levelBg}`}
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
        className="lg:hidden fixed top-3 left-4 z-50 p-2 rounded-xl bg-[var(--theme-primary)] text-white shadow-lg focus:outline-none"
        aria-label="Abrir Menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          w-64 bg-[var(--theme-primary)] text-white flex flex-col shadow-inner select-none
          fixed lg:sticky top-0 lg:top-16 z-50 lg:z-20 h-screen lg:h-[calc(100vh-64px)]
          transition-transform duration-300 ease-in-out lg:transition-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar mt-12 lg:mt-0">
          {renderMenuItems(menuTree)}
        </nav>
      </aside>
    </>
  );
};