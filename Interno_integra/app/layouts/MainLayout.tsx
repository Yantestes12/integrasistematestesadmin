import { Outlet, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "~/components/Sidebar";
import { Topbar } from "~/components/Topbar";

const themes = {
  IBRASE: {
    "--theme-primary": "#5d6bf6",
    "--theme-primary-hover": "#4b5ae6",
    "--theme-level-1": "#4351df",
    "--theme-level-1-hover": "#3947d1",
    "--theme-level-2": "#3744cc",
    "--theme-level-2-hover": "#2f3cb8",
    "--theme-level-3": "#2b37a8",
    "--theme-level-3-hover": "#232f91",
  },
  GASCTPNA: {
    "--theme-primary": "#10b981",
    "--theme-primary-hover": "#059669",
    "--theme-level-1": "#047857",
    "--theme-level-1-hover": "#064e3b",
    "--theme-level-2": "#064e3b",
    "--theme-level-2-hover": "#022c22",
    "--theme-level-3": "#022c22",
    "--theme-level-3-hover": "#011611",
  },
  AUNI: {
    "--theme-primary": "#8b5cf6",
    "--theme-primary-hover": "#7c3aed",
    "--theme-level-1": "#6d28d9",
    "--theme-level-1-hover": "#5b21b6",
    "--theme-level-2": "#4c1d95",
    "--theme-level-2-hover": "#3b0764",
    "--theme-level-3": "#2e054e",
    "--theme-level-3-hover": "#200336",
  },
  IVEM: {
    "--theme-primary": "#f97316",
    "--theme-primary-hover": "#ea580c",
    "--theme-level-1": "#c2410c",
    "--theme-level-1-hover": "#9a3412",
    "--theme-level-2": "#7c2d12",
    "--theme-level-2-hover": "#431407",
    "--theme-level-3": "#431407",
    "--theme-level-3-hover": "#240a02",
  }
};

export const MainLayout = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [institute, setInstitute] = useState("IBRASE");

  useEffect(() => {
    // Basic route protection
    const inst = localStorage.getItem("auth_institute");
    if (!inst) {
      navigate("/login");
    } else {
      setInstitute(inst);
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (!isAuthenticated) return null; // Avoid flashing the dashboard before redirect

  const themeVars = themes[institute as keyof typeof themes] || themes.IBRASE;

  return (
    // 1. Container principal ocupando a altura da tela
    <div 
      className="min-h-screen bg-[#f4f6fa] font-sans flex flex-col text-slate-800"
      style={themeVars as React.CSSProperties}
    >
      <Topbar />

      <div className="flex flex-1 w-full relative min-h-0">
        <Sidebar />

        {/* 2. O scroll DEVE ser nesta div <main>, sem divs com h-full por dentro */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] w-full">
          
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