import { Outlet, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "~/components/Sidebar";
import { Topbar } from "~/components/Topbar";

export const MainLayout = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Basic route protection
    const institute = localStorage.getItem("auth_institute");
    if (!institute) {
      navigate("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (!isAuthenticated) return null; // Avoid flashing the dashboard before redirect

  return (
    // 1. Container principal ocupando a altura da tela
    <div className="min-h-screen bg-[#f4f6fa] font-sans flex flex-col text-slate-800">
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