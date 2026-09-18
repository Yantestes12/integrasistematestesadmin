import { Outlet, useNavigate, useNavigation } from "react-router";
import { useEffect, useState } from "react";
import { Sidebar } from "~/components/Sidebar";
import { Topbar } from "~/components/Topbar";
import { GlobalFilterBar } from "~/components/GlobalFilterBar";
import { Loader2, Building2 } from "lucide-react";

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
  const [isGlobalLoading, setIsGlobalLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const inst = localStorage.getItem("auth_institute") || "IBRASE";
      return !sessionStorage.getItem(`cache_raw_nucleos_${inst.toUpperCase()}`);
    }
    return true;
  });
  const [institute, setInstitute] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_institute") || "IBRASE";
    }
    return "IBRASE";
  });

    const flattenResponse = (rawData: any): any[] => {
    if (!rawData) return [];
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (typeof rawData === 'object') {
      if (Array.isArray(rawData.data)) list = rawData.data;
      else if (Array.isArray(rawData.items)) list = rawData.items;
      else if (Array.isArray(rawData.value)) list = rawData.value;
      else if (rawData.json) list = Array.isArray(rawData.json) ? rawData.json : [rawData.json];
      else list = [rawData];
    }
    let flat: any[] = [];
    list.forEach((entry: any) => {
      if (!entry) return;
      if (entry.json) {
        Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
      } else if (Array.isArray(entry)) {
        flat.push(...entry);
      } else {
        flat.push(entry);
      }
    });
    return flat.filter(item => item !== null && item !== undefined);
  };

  const preFetchByRole = async (inst: string, cargo: string, accountType: string) => {
    const role = `${cargo} ${accountType}`.toLowerCase();
    const base = 'https://w.ibrase.com.br/webhook';
    const IN = inst.toUpperCase();

    const fetchAndCache = async (url: string, rawKey: string, parsedKeys?: string[]) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const flat = flattenResponse(data);
        // Salva a chave raw (usada internamente)
        sessionStorage.setItem(rawKey, JSON.stringify(flat));
        // Salva também nas chaves parsedKeys que as páginas realmente leem
        if (parsedKeys) {
          parsedKeys.forEach(key => {
            try { sessionStorage.setItem(key, JSON.stringify(flat)); } catch(e) {}
          });
        }
      } catch (e) {
        console.warn(`Prefetch falhou: ${url}`, e);
      }
    };

    const tasks: Promise<void>[] = [];

    // Núcleos → usado por Nucleos.tsx (cache_nucleos_parsed_*), Turmas.tsx (cache_nucleos_list_*), Dashboard (cache_nucleos_list_*)
    tasks.push(fetchAndCache(
      `${base}/nucleos-get?instituto=${IN}`,
      `cache_raw_nucleos_${IN}`,
      [`cache_nucleos_parsed_${IN}`, `cache_nucleos_list_${IN}`]
    ));

    // Espaços → usado por Espacos.tsx (cache_espacos_parsed_*)
    tasks.push(fetchAndCache(
      `${base}/espacos-get?instituto=${IN}`,
      `cache_raw_espacos_${IN}`,
      [`cache_espacos_parsed_${IN}`]
    ));

    // Modalidades
    tasks.push(fetchAndCache(
      `${base}/modalidades-get?instituto=${IN}`,
      `cache_raw_modalidades_${IN}`,
      [`cache_modalidades_list_${IN}`]
    ));

    if (role.includes('master') || role.includes('admin') || role.includes('pedagogico') || role.includes('instrutor')) {
      // Projetos → usado por Dashboard, Nucleos.tsx, Espacos.tsx
      // ATENÇÃO: cache_raw_projetos_* NÃO entra aqui — Propostas.tsx usa essa chave com o formato original do N8N
      tasks.push(fetchAndCache(
        `${base}/projetos-get?instituto=${IN}`,
        `cache_projetos_list_${IN}`,
        [`cache_projetos_list_${IN}`]
      ));
    }

    if (role.includes('master') || role.includes('pedagogico')) {
      // Matrículas → usado por Matriculas.tsx e Turmas.tsx (cache_matriculas_*)
      tasks.push(fetchAndCache(
        `${base}/matriculas-get?instituto=${IN}`,
        `cache_raw_matriculas_${IN}`,
        [`cache_matriculas_${IN}`]
      ));
    }

    if (role.includes('master') || role.includes('admin')) {
      tasks.push(fetchAndCache(
        `${base}/cargos-get?instituto=${IN}`,
        `cache_raw_cargos_${IN}`
      ));
    }

    await Promise.allSettled(tasks);
  };


  useEffect(() => {
    setIsMounted(true);
    // Basic route protection
    const inst = localStorage.getItem("auth_institute");
    if (!inst) {
      navigate("/login");
    } else {
      // 24h Session Timeout Check
      const loginTime = localStorage.getItem("auth_login_timestamp");
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        if (elapsed > 24 * 60 * 60 * 1000) {
          localStorage.removeItem("auth_institute");
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_cargo");
          localStorage.removeItem("auth_account_type");
          localStorage.removeItem("auth_id");
          localStorage.removeItem("auth_institutos_permitidos");
          localStorage.removeItem("auth_login_timestamp");
          navigate("/login");
          return;
        }
      }

      setInstitute(inst);
      setIsAuthenticated(true);

      const cargo = localStorage.getItem("auth_cargo") || "colaborador";
      const accountType = localStorage.getItem("auth_account_type") || "colaborador";
      const IN = inst.toUpperCase();
      
      // Checa se o cache básico já existe (qualquer das chaves populadas pelo prefetch)
      const hasBasicCache = !!(
        sessionStorage.getItem(`cache_raw_nucleos_${IN}`) ||
        sessionStorage.getItem(`cache_nucleos_parsed_${IN}`)
      );
      
      if (hasBasicCache) {
        setIsGlobalLoading(false); // Libera instantaneamente (cache já existe)
        preFetchByRole(inst, cargo, accountType); // Atualiza em background silenciosamente
      } else {
        // Aguarda os dados chegarem de verdade antes de exibir a tela.
        // Timeout de segurança de 8s para não travar caso o servidor esteja offline.
        const maxWait = setTimeout(() => setIsGlobalLoading(false), 8000);
        preFetchByRole(inst, cargo, accountType).finally(() => {
          clearTimeout(maxWait);
          setIsGlobalLoading(false);
        });
      }
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

  if (isGlobalLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
        <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full shadow-inner"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.4)]" style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Preparando ambiente...</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Carregando dados essenciais do seu setor para uma navegação instantânea.
          </p>
        </div>
      </div>
    );
  }

  const themeVars = themes[institute as keyof typeof themes] || themes.IBRASE;
  const isNavigating = navigation.state === "loading";

  return (
    // 1. Container principal ocupando a altura da tela (sem scroll duplo)
    <div 
      className="h-screen overflow-hidden bg-[#f4f6fa] dark:bg-slate-950 font-sans flex flex-col text-slate-800 dark:text-slate-100 relative transition-colors duration-300 print:h-auto print:overflow-visible print:bg-white"
      style={themeVars as React.CSSProperties}
    >
      <div className="print:hidden">
        <Topbar />
      </div>

      <div className="flex flex-1 w-full relative min-h-0 print:block">
        <div className="print:hidden">
          <Sidebar />
        </div>

        {/* 2. O scroll DEVE ser nesta div <main>, sem divs com h-full por dentro */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-52px)] w-full relative flex flex-col print:overflow-visible print:h-auto print:block">
          
          <div className="print:hidden">
            <GlobalFilterBar />
          </div>
          
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
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 print:p-0 print:m-0 print:space-y-0">
            <Outlet />
          </div>

        </main>
      </div>
    </div>
  );
};

export default MainLayout;