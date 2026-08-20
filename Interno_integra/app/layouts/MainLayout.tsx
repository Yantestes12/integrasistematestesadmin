import { Outlet, useNavigate, useNavigation } from "react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "~/components/Sidebar";
import { Topbar } from "~/components/Topbar";
import { GlobalFilterBar } from "~/components/GlobalFilterBar";

const themes = {
  IBRASE: {
    // Laranja
    "--theme-primary": "#f97316",
    "--theme-primary-hover": "#ea580c",
    "--theme-topbar": "#431407",
    "--theme-topbar-dark": "#240a02",
    "--theme-sidebar-dark": "#2c0e04",
    "--theme-level-1": "#c2410c",
    "--theme-level-1-hover": "#9a3412",
    "--theme-level-2": "#7c2d12",
    "--theme-level-2-hover": "#431407",
    "--theme-level-3": "#431407",
    "--theme-level-3-hover": "#240a02",
  },
  AUNI: {
    // Azul
    "--theme-primary": "#2563eb",
    "--theme-primary-hover": "#1d4ed8",
    "--theme-topbar": "#0f172a",
    "--theme-topbar-dark": "#080e1b",
    "--theme-sidebar-dark": "#0d1629",
    "--theme-level-1": "#1e40af",
    "--theme-level-1-hover": "#1e3a8a",
    "--theme-level-2": "#1e3a8a",
    "--theme-level-2-hover": "#172554",
    "--theme-level-3": "#172554",
    "--theme-level-3-hover": "#0f172a",
  },
  GASCTPNA: {
    // Verde
    "--theme-primary": "#10b981",
    "--theme-primary-hover": "#059669",
    "--theme-topbar": "#022c22",
    "--theme-topbar-dark": "#011611",
    "--theme-sidebar-dark": "#02241b",
    "--theme-level-1": "#047857",
    "--theme-level-1-hover": "#064e3b",
    "--theme-level-2": "#064e3b",
    "--theme-level-2-hover": "#022c22",
    "--theme-level-3": "#022c22",
    "--theme-level-3-hover": "#011611",
  },
  IVEM: {
    // Vermelho
    "--theme-primary": "#ef4444",
    "--theme-primary-hover": "#dc2626",
    "--theme-topbar": "#450a0a",
    "--theme-topbar-dark": "#2a0404",
    "--theme-sidebar-dark": "#3a0808",
    "--theme-level-1": "#b91c1c",
    "--theme-level-1-hover": "#991b1b",
    "--theme-level-2": "#7f1d1d",
    "--theme-level-2-hover": "#450a0a",
    "--theme-level-3": "#450a0a",
    "--theme-level-3-hover": "#2a0404",
  }
};

export const MainLayout = () => {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [institute, setInstitute] = useState("IBRASE");

  useEffect(() => {
    setIsMounted(true);
    // Basic route protection
    const inst = localStorage.getItem("auth_institute");
    if (!inst) {
      navigate("/login");
    } else {
      setInstitute(inst);
      setIsAuthenticated(true);
    }

    // Garantir que a classe .dark permaneça ativa apenas se o usuário explicitamente ativou o dark mode. Começa no modo claro por padrão.
    try {
      const savedTheme = localStorage.getItem("integra_dark_mode");
      if (savedTheme === "true") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {}
  }, [navigate]);

  if (!isMounted || !isAuthenticated) return null; // Avoid flashing the dashboard before redirect or theme resolve

  const themeVars = themes[institute as keyof typeof themes] || themes.IBRASE;
  const isNavigating = navigation.state === "loading";

  return (
    // 1. Container principal ocupando a altura da tela (sem scroll duplo)
    <div 
      className="h-screen overflow-hidden bg-[#f4f6fa] dark:bg-slate-950 font-sans flex flex-col text-slate-800 dark:text-slate-100 relative transition-colors duration-300"
      style={themeVars as React.CSSProperties}
    >
      <Topbar />

      <div className="flex flex-1 w-full relative min-h-0">
        <Sidebar />

        {/* 2. O scroll DEVE ser nesta div <main>, sem divs com h-full por dentro */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-52px)] w-full relative flex flex-col">
          
          <GlobalFilterBar />
          
          {/* Indicador de Bolinhas Carregando durante a navegação entre páginas */}
          {isNavigating && (
            <div className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200 py-3 px-4 flex items-center justify-center gap-3 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-bold text-slate-700">Carregando página...</span>
            </div>
          )}

          {/* Conteúdo das rotas com o padding */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <Outlet />
          </div>

        </main>
      </div>
    </div>
  );
};

export default MainLayout;