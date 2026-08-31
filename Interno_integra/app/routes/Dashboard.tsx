import type { Route } from "./+types/Dashboard";
import { 
  GraduationCap, 
  ArrowRight, 
  Layers, 
  Building2, 
  Home, 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  Award, 
  Percent, 
  PieChart as PieIcon, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Sparkles,
  Shirt,
  Download,
  Printer,
  X,
  Check,
  FileDown,
  Play,
  Pause,
  Settings2,
  Search,
  Tag,
  SlidersHorizontal,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useEffect, useState, useMemo, useRef } from "react";

// Componente de Animação Motion ao Rolar a Página (Scroll Reveal / After Effects style)
function MotionSection({ 
  children, 
  className = "", 
  delayClass = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delayClass?: string 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // Se o elemento já estiver visível na janela inicial do usuário, revela imediatamente
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`motion-scroll-section ${delayClass} ${isVisible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// Barra Animada de Proporção de Gênero
// Gráfico Interativo de Proporção de Gênero
function InteractiveGenderChart({ 
  mascPercent, 
  femPercent, 
  mascCount, 
  femCount 
}: { 
  mascPercent: number; 
  femPercent: number; 
  mascCount: number; 
  femCount: number; 
}) {
  const [isDrawn, setIsDrawn] = useState(false);
  const [hoveredGender, setHoveredGender] = useState<'masc' | 'fem' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom <= window.innerHeight + 50) {
      setTimeout(() => setIsDrawn(true), 120);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsDrawn(true), 120);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="my-2">
      {/* Barra Visual de Proporção Animada */}
      <div className="w-full h-12 bg-slate-100/90 dark:bg-slate-800 rounded-xl overflow-hidden flex p-1.5 gap-1.5 border border-slate-200 dark:border-slate-700 shadow-inner">
        <div 
          onMouseEnter={() => setHoveredGender('masc')}
          onMouseLeave={() => setHoveredGender(null)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-lg flex items-center justify-center text-white text-sm font-black shadow-xs overflow-hidden cursor-pointer"
          style={{ 
            width: isDrawn ? (hoveredGender === 'masc' ? `${Math.max(mascPercent, 10) + 5}%` : (hoveredGender === 'fem' ? `${Math.max(mascPercent, 10) - 5}%` : `${Math.max(mascPercent, 10)}%`)) : '0%',
            transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, filter 0.3s ease",
            opacity: hoveredGender === 'fem' ? 0.4 : 1,
            filter: hoveredGender === 'masc' ? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6)) brightness(1.1)" : "none"
          }}
          title={`Meninos: ${mascCount} (${mascPercent}%)`}
        >
          {mascPercent > 12 ? `${mascPercent}%` : ''}
        </div>
        <div 
          onMouseEnter={() => setHoveredGender('fem')}
          onMouseLeave={() => setHoveredGender(null)}
          className="bg-gradient-to-r from-rose-500 to-pink-600 h-full rounded-lg flex items-center justify-center text-white text-sm font-black shadow-xs overflow-hidden cursor-pointer"
          style={{ 
            width: isDrawn ? (hoveredGender === 'fem' ? `${Math.max(femPercent, 10) + 5}%` : (hoveredGender === 'masc' ? `${Math.max(femPercent, 10) - 5}%` : `${Math.max(femPercent, 10)}%`)) : '0%',
            transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, filter 0.3s ease",
            opacity: hoveredGender === 'masc' ? 0.4 : 1,
            filter: hoveredGender === 'fem' ? "drop-shadow(0 0 8px rgba(244, 63, 94, 0.6)) brightness(1.1)" : "none"
          }}
          title={`Meninas: ${femCount} (${femPercent}%)`}
        >
          {femPercent > 12 ? `${femPercent}%` : ''}
        </div>
      </div>

      {/* Mini Cards Comparativos Interativos */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div 
          onMouseEnter={() => setHoveredGender('masc')}
          onMouseLeave={() => setHoveredGender(null)}
          className={`bg-gradient-to-b from-blue-50/70 to-blue-50/20 dark:from-blue-950/40 dark:to-blue-950/10 border rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 ${
            hoveredGender === 'masc' 
              ? 'scale-[1.03] shadow-md shadow-blue-500/20 border-blue-400 dark:border-blue-500' 
              : hoveredGender === 'fem' 
                ? 'opacity-40 scale-[0.98] border-blue-200/40 dark:border-blue-900/30' 
                : 'border-blue-200/80 dark:border-blue-800/60 hover:scale-[1.01]'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-blue-800 dark:text-blue-300 mb-1">
            <span className="text-lg">👦</span>
            <span>Meninos</span>
          </div>
          <span className="text-3xl font-black text-blue-950 dark:text-blue-100 block tracking-tight">{mascCount}</span>
          <span className={`inline-block mt-1.5 text-xs font-black px-2.5 py-0.5 rounded-full border transition-colors ${
            hoveredGender === 'masc' 
              ? 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-50 border-blue-300 dark:border-blue-600' 
              : 'text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/60 border-blue-200 dark:border-blue-700/60'
          }`}>
            {mascPercent}% do total
          </span>
        </div>

        <div 
          onMouseEnter={() => setHoveredGender('fem')}
          onMouseLeave={() => setHoveredGender(null)}
          className={`bg-gradient-to-b from-pink-50/70 to-pink-50/20 dark:from-pink-950/40 dark:to-pink-950/10 border rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 ${
            hoveredGender === 'fem' 
              ? 'scale-[1.03] shadow-md shadow-pink-500/20 border-pink-400 dark:border-pink-500' 
              : hoveredGender === 'masc' 
                ? 'opacity-40 scale-[0.98] border-pink-200/40 dark:border-pink-900/30' 
                : 'border-pink-200/80 dark:border-pink-800/60 hover:scale-[1.01]'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-pink-800 dark:text-pink-300 mb-1">
            <span className="text-lg">👧</span>
            <span>Meninas</span>
          </div>
          <span className="text-3xl font-black text-pink-950 dark:text-pink-100 block tracking-tight">{femCount}</span>
          <span className={`inline-block mt-1.5 text-xs font-black px-2.5 py-0.5 rounded-full border transition-colors ${
            hoveredGender === 'fem' 
              ? 'bg-pink-200 dark:bg-pink-800 text-pink-900 dark:text-pink-50 border-pink-300 dark:border-pink-600' 
              : 'text-pink-700 dark:text-pink-300 bg-pink-100/80 dark:bg-pink-900/60 border-pink-200 dark:border-pink-700/60'
          }`}>
            {femPercent}% do total
          </span>
        </div>
      </div>
    </div>
  );
}

// Gráfico Circular (Donut) de Faixas de Idade com SVG Animado por Rolagem & Hover Interativo
function AgeDonutChart({ 
  faixas, 
  total, 
  mediaIdade 
}: { 
  faixas: { label: string; min?: number; max?: number; total: number; percent: number }[];
  total: number;
  mediaIdade: string | number;
}) {
  const [isDrawn, setIsDrawn] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom <= window.innerHeight + 100) {
      setTimeout(() => setIsDrawn(true), 120);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsDrawn(true), 120);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.7 } // Alterado para 0.7 para só disparar a animação quando estiver bem visível
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const colors = [
    { 
      hex: "#3b82f6", 
      dot: "bg-blue-500", 
      text: "text-blue-700 dark:text-blue-300", 
      border: "border-blue-200 dark:border-blue-800/60", 
      bg: "bg-blue-50 dark:bg-blue-950/60",
      barBg: "bg-blue-500"
    },
    { 
      hex: "#8b5cf6", 
      dot: "bg-violet-500", 
      text: "text-violet-700 dark:text-violet-300", 
      border: "border-violet-200 dark:border-violet-800/60", 
      bg: "bg-violet-50 dark:bg-violet-950/60",
      barBg: "bg-violet-500"
    },
    { 
      hex: "#10b981", 
      dot: "bg-emerald-500", 
      text: "text-emerald-700 dark:text-emerald-300", 
      border: "border-emerald-200 dark:border-emerald-800/60", 
      bg: "bg-emerald-50 dark:bg-emerald-950/60",
      barBg: "bg-emerald-500"
    },
    { 
      hex: "#f59e0b", 
      dot: "bg-amber-500", 
      text: "text-amber-700 dark:text-amber-300", 
      border: "border-amber-200 dark:border-amber-800/60", 
      bg: "bg-amber-50 dark:bg-amber-950/60",
      barBg: "bg-amber-500"
    },
  ];

  const circumference = 2 * Math.PI * 38; // ~238.76
  const activeFaixa = hoveredIdx !== null ? faixas[hoveredIdx] : null;

  return (
    <div ref={containerRef} className="flex flex-col sm:flex-row items-center justify-center gap-6 my-3">
      {/* Gráfico Donut em SVG com Revelação Animada e Interação */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center">
        <svg 
          className={`w-full h-full transform transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
            isDrawn ? "-rotate-90 scale-100 opacity-100" : "-rotate-180 scale-90 opacity-0"
          }`} 
          viewBox="0 0 100 100"
        >
          {/* Fundo do Donut */}
          <circle
            cx="50"
            cy="50"
            r="38"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
          />
          
          {/* Fatias das Faixas Etárias Animadas via SVG Stroke */}
          {(() => {
            let cumulativePercent = 0;

            return faixas.map((fx, idx) => {
              const percent = total > 0 ? (fx.total / total) * 100 : 0;
              const strokeDasharray = isDrawn 
                ? `${(percent / 100) * circumference} ${circumference}`
                : `0 ${circumference}`;
              const strokeDashoffset = isDrawn 
                ? -((cumulativePercent / 100) * circumference)
                : 0;
              cumulativePercent += percent;

              if (percent <= 0) return null;
              const isHovered = hoveredIdx === idx;
              const isOtherHovered = hoveredIdx !== null && hoveredIdx !== idx;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="38"
                  stroke={colors[idx % colors.length].hex}
                  strokeWidth={isHovered ? 16 : 12}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    transition: "stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.25s ease, opacity 0.25s ease, filter 0.25s ease",
                    filter: isHovered ? `drop-shadow(0 0 6px ${colors[idx % colors.length].hex})` : "none",
                    opacity: isOtherHovered ? 0.45 : 1,
                    cursor: "pointer"
                  }}
                />
              );
            });
          })()}
        </svg>

        {/* Centro do Gráfico Circular com Média Dinâmica / Interativa */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none transition-all duration-300">
          {activeFaixa ? (
            <div className="animate-in fade-in zoom-in duration-200 px-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none block">
                {activeFaixa.percent}%
              </span>
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block mt-0.5 truncate max-w-[100px]">
                {activeFaixa.total} {activeFaixa.total === 1 ? "aluno" : "alunos"}
              </span>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-200">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {mediaIdade}
              </span>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1 block">
                Média Geral
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Legenda Lateral com Barras de Progresso Animadas e Hover Interativo */}
      <div className="flex-1 w-full space-y-2.5">
        {faixas.map((fx, idx) => {
          const c = colors[idx % colors.length];
          const isHovered = hoveredIdx === idx;
          const isOtherHovered = hoveredIdx !== null && hoveredIdx !== idx;

          return (
            <div 
              key={idx} 
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isHovered 
                  ? "bg-slate-100/90 dark:bg-slate-800 border-slate-400/80 dark:border-slate-500 shadow-sm scale-[1.01]" 
                  : isOtherHovered
                    ? "opacity-50 bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-700/50"
                    : "bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-3 h-3 rounded-full ${c.dot} shrink-0 shadow-2xs`} />
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 truncate" title={fx.label}>
                    {fx.label.split('(')[0].trim()}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">{fx.total} {fx.total === 1 ? "aluno" : "alunos"}</span>
                  <span className={`font-black px-2 py-0.5 rounded-md text-[11px] border ${c.bg} ${c.text} ${c.border}`}>
                    {fx.percent}%
                  </span>
                </div>
              </div>

              {/* Barra de Progresso Animada individual */}
              <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${c.barBg} rounded-full`}
                  style={{
                    width: isDrawn ? `${Math.max(fx.percent, 3)}%` : '0%',
                    transition: `width 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.08}s`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Barra de Progresso Animada por Rolagem (Para Uniformes, etc)
function AnimatedProgressBar({ percent, gradientClass, delayIdx = 0 }: { percent: number; gradientClass: string; delayIdx?: number }) {
  const [isDrawn, setIsDrawn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom <= window.innerHeight + 100) {
      setTimeout(() => setIsDrawn(true), 120);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsDrawn(true), 120);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`h-full rounded-full ${gradientClass}`}
      style={{ 
        width: isDrawn ? `${Math.max(percent, 3)}%` : '0%',
        transition: `width 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delayIdx * 0.08}s, filter 0.3s ease`
      }}
    />
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Painel de Controle - Sistema Integra" },
    { name: "description", content: "Indicadores, Estatísticas e Gestão de Propostas" },
  ];
}

interface MatriculaItem {
  id: number | string;
  aluno_nome?: string;
  sexo?: string;
  idade?: number;
  data_nascimento?: string;
  status?: string;
  projeto_id?: number | string;
  cidade?: string;
  nucleo_id?: number | string;
  nucleo_nome?: string;
  turma?: string;
  modalidade_nome?: string;
  tamanho_camisa?: string;
  tamanho_calca?: string;
  tamanho_calcado?: string;
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [currentInstitute, setCurrentInstitute] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('auth_institute') || 'IBRASE' : 'IBRASE');
  const [userRole, setUserRole] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('auth_cargo') || 'colaborador').toLowerCase().trim() : 'colaborador');
  const [userAccountType, setUserAccountType] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('auth_account_type') || 'colaborador').toLowerCase().trim() : 'colaborador');
  const [activeView, setActiveView] = useState<"geral" | "pedagogico">("geral");
  const [uniformTab, setUniformTab] = useState<"todos" | "blusas" | "bermudas" | "tenis">("todos");

  // Modal de Exportação PDF Customizada
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportSections, setExportSections] = useState({
    resumo: true,
    genero: true,
    faixas: true,
    camisas: true,
    bermudas: true,
    calcados: true,
    nucleos: true,
  });

  // Filtros Globais sincronizados com GlobalFilterBar
  const [globalProjeto, setGlobalProjeto] = useState("all");
  const [globalCidade, setGlobalCidade] = useState("all");
  const [globalNucleo, setGlobalNucleo] = useState("all");

  const [loading, setLoading] = useState(true);
  const [matriculas, setMatriculas] = useState<MatriculaItem[]>([]);
  const [nucleosList, setNucleosList] = useState<any[]>([]);
  const [nucleosCount, setNucleosCount] = useState(0);
  const [propostasCount, setPropostasCount] = useState(0);
  const [espacosCount, setEspacosCount] = useState(0);
  const [modalidadesCache, setModalidadesCache] = useState<Record<number, string>>({});
  const [projetosCache, setProjetosCache] = useState<Record<number, string>>({});

  // Estados e filtros refinados para Gestão de Núcleos no Pedagógico
  const [nucleoFilterStatus, setNucleoFilterStatus] = useState<"todos" | "abertos" | "pausados">("todos");
  const [nucleoSearchQuery, setNucleoSearchQuery] = useState("");
  const nucleosCarouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (nucleosCarouselRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      nucleosCarouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const nucleoStats = useMemo(() => {
    let abertos = 0;
    let pausados = 0;
    nucleosList.forEach((n) => {
      const isAtivo = n.ativo !== false && n.ativo !== 0 && n.ativo !== "0" && n.ativo !== "false";
      if (isAtivo) abertos++;
      else pausados++;
    });
    return { total: nucleosList.length, abertos, pausados };
  }, [nucleosList]);

  const filteredManagementNucleos = useMemo(() => {
    return nucleosList.filter((n) => {
      const id = n.id || n.id_nucleo || n.nucleo_id;
      const nome = n.nome || n.nome_nucleo || n.nucleo_nome || n.identificacao?.nomeNucleo || `Núcleo ${id}`;
      const isAtivo = n.ativo !== false && n.ativo !== 0 && n.ativo !== "0" && n.ativo !== "false";

      // Filtros Globais (Barra do Topo)
      if (globalProjeto !== "all" && String(n.projeto_id) !== String(globalProjeto)) return false;
      if (globalCidade !== "all" && n.cidade && n.cidade.toLowerCase() !== globalCidade.toLowerCase()) return false;
      if (globalNucleo !== "all" && String(id) !== String(globalNucleo)) return false;

      // Filtros Locais (Tabs)
      if (nucleoFilterStatus === "abertos" && !isAtivo) return false;
      if (nucleoFilterStatus === "pausados" && isAtivo) return false;

      if (nucleoSearchQuery.trim()) {
        const query = nucleoSearchQuery.toLowerCase();
        const matchesNome = nome.toLowerCase().includes(query);
        const modalidade = n.modalidade_nome || n.modalidade || (n.modalidade_id && modalidadesCache[Number(n.modalidade_id)]) || "";
        const matchesMod = modalidade.toLowerCase().includes(query);
        const projetoNome = n.projetos?.nome || n.projeto_nome || n.proposta || (n.projeto_id && projetosCache[Number(n.projeto_id)]) || "";
        const matchesProj = projetoNome.toLowerCase().includes(query);
        if (!matchesNome && !matchesMod && !matchesProj) return false;
      }

      return true;
    });
  }, [nucleosList, nucleoFilterStatus, nucleoSearchQuery, modalidadesCache, projetosCache, globalProjeto, globalCidade, globalNucleo]);

  // 1. Inicializa Usuário e Papel
  useEffect(() => {
    const savedInst = localStorage.getItem("auth_institute") || "IBRASE";
    const cargo = (localStorage.getItem("auth_cargo") || "Colaborador").toLowerCase().trim();
    const accType = (localStorage.getItem("auth_account_type") || "colaborador").toLowerCase().trim();

    setCurrentInstitute(savedInst);
    setUserRole(cargo);
    setUserAccountType(accType);

    const queryView = searchParams.get("view");
    if (queryView === "pedagogico" || queryView === "geral") {
      setActiveView(queryView);
    } else if (accType === "pedagogico" || cargo.includes("pedagogic") || cargo.includes("pedagógic")) {
      setActiveView("pedagogico");
    } else {
      setActiveView("geral");
    }
  }, [searchParams]);

  // 2. Listener de Filtros Globais
  useEffect(() => {
    const updateFilters = () => {
      setGlobalProjeto(localStorage.getItem("global_projeto_filter") || "all");
      setGlobalCidade(localStorage.getItem("global_cidade_filter") || "all");
      setGlobalNucleo(localStorage.getItem("global_nucleo_filter") || "all");
    };

    updateFilters();
    window.addEventListener("globalFilterChanged", updateFilters);
    return () => window.removeEventListener("globalFilterChanged", updateFilters);
  }, []);

  // 3. Busca de Dados de Matrículas e Núcleos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const inst = currentInstitute.toUpperCase();
      
      // SWR Cache Hydration: Renderiza instantaneamente do cache da sessão (0ms)
      try {
        let hasCache = false;
        
        const cached = sessionStorage.getItem(`cache_matriculas_${inst}`);
        if (cached) {
          const parsedCached = JSON.parse(cached);
          if (Array.isArray(parsedCached) && parsedCached.length > 0) {
            setMatriculas(parsedCached);
            hasCache = true;
          }
        }
        
        const cachedProj = sessionStorage.getItem(`cache_projetos_count_${inst}`);
        if (cachedProj) { setPropostasCount(Number(cachedProj)); hasCache = true; }

        const cachedEspacos = sessionStorage.getItem(`cache_espacos_count_${inst}`);
        if (cachedEspacos) { setEspacosCount(Number(cachedEspacos)); hasCache = true; }

        const cachedNucleos = sessionStorage.getItem(`cache_nucleos_count_${inst}`);
        if (cachedNucleos) { setNucleosCount(Number(cachedNucleos)); hasCache = true; }

        const cachedNucleosList = sessionStorage.getItem(`cache_nucleos_list_${inst}`);
        if (cachedNucleosList) {
          setNucleosList(JSON.parse(cachedNucleosList));
        }

        if (hasCache) {
          setLoading(false); // Mostra o Dashboard instantaneamente! A requisição continuará em background.
        }
      } catch (e) {}

      // AbortController para evitar carregamento infinito
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

      try {
        const fetchOpts = { cache: "no-store" as RequestCache, signal: controller.signal };
        
        const pNucleos = fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst}`, fetchOpts)
          .then(async res => {
            if (!res.ok) return;
            const data = JSON.parse(await res.text());
            let list = Array.isArray(data) ? data : (data.data || data.items || (data.json ? [data.json] : [data]));
            let loadedNucleos: any[] = [];
            for (let i = 0; i < list.length; i++) {
              const entry = list[i];
              if (entry && entry.json) {
                if (Array.isArray(entry.json)) {
                  for (let j = 0; j < entry.json.length; j++) loadedNucleos.push(entry.json[j]);
                } else {
                  loadedNucleos.push(entry.json);
                }
              } else if (Array.isArray(entry)) {
                for (let j = 0; j < entry.length; j++) loadedNucleos.push(entry[j]);
              } else if (entry) {
                loadedNucleos.push(entry);
              }
            }
            setNucleosList(loadedNucleos);
            setNucleosCount(loadedNucleos.length);
            try { 
              sessionStorage.setItem(`cache_nucleos_count_${inst}`, loadedNucleos.length.toString()); 
              sessionStorage.setItem(`cache_nucleos_list_${inst}`, JSON.stringify(loadedNucleos));
            } catch (e) {}
          }).catch(() => {});

        const pProjetos = fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}`, fetchOpts)
          .then(async res => {
            if (!res.ok) return;
            const data = JSON.parse(await res.text());
            let list = Array.isArray(data) ? data : (data.data || data.items || (data.json ? [data.json] : [data]));
            let flatList: any[] = [];
            list.forEach((entry: any) => {
              if (entry && entry.json) {
                if (Array.isArray(entry.json)) flatList.push(...entry.json);
                else flatList.push(entry.json);
              } else if (Array.isArray(entry)) flatList.push(...entry);
              else flatList.push(entry);
            });
            const pCache: Record<number, string> = {};
            flatList.forEach((p: any) => {
              if (p.id && (p.nome || p.titulo || p.projeto_nome)) {
                pCache[Number(p.id)] = p.nome || p.titulo || p.projeto_nome;
              }
            });
            setProjetosCache(pCache);
            setPropostasCount(flatList.length);
            try { sessionStorage.setItem(`cache_projetos_count_${inst}`, flatList.length.toString()); } catch (e) {}
          }).catch(() => {});

        const pEspacos = fetch(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${inst}`, fetchOpts)
          .then(async res => {
            if (!res.ok) return;
            const data = JSON.parse(await res.text());
            const list = Array.isArray(data) ? data : data.data || [];
            setEspacosCount(list.length);
            try { sessionStorage.setItem(`cache_espacos_count_${inst}`, list.length.toString()); } catch (e) {}
          }).catch(() => {});

        const pMatriculas = fetch(`https://w.ibrase.com.br/webhook/matriculas-get?instituto=${inst}`, fetchOpts)
          .then(async res => {
            if (!res.ok) return;
            const data = JSON.parse(await res.text());
            if (data && !data.error && data.message !== "Workflow was started") {
              let list = Array.isArray(data) ? data : (data.data || data.items || (data.json ? [data.json] : [data]));
              let loadedMatriculas: MatriculaItem[] = [];
              for (let i = 0; i < list.length; i++) {
                const item = list[i];
                const row = item.json || item;
                if (row) loadedMatriculas.push(row);
              }
              setMatriculas(loadedMatriculas);
              try { sessionStorage.setItem(`cache_matriculas_${inst}`, JSON.stringify(loadedMatriculas)); } catch (e) {}
            }
          }).catch(() => {});

        // Carregar modalidades em background independente
        fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${inst}`, { cache: "no-store" })
          .then(res => res.json())
          .then(data => {
            let list = Array.isArray(data) ? data : (data.data || data.items || (data.json ? [data.json] : [data]));
            let flatList: any[] = [];
            list.forEach((entry: any) => {
              if (entry && entry.json) {
                if (Array.isArray(entry.json)) flatList.push(...entry.json);
                else flatList.push(entry.json);
              } else if (Array.isArray(entry)) flatList.push(...entry);
              else flatList.push(entry);
            });
            const modCache: Record<number, string> = {};
            flatList.forEach((m: any) => {
              if (m.id && m.nome) modCache[Number(m.id)] = m.nome;
            });
            setModalidadesCache(modCache);
          }).catch(() => {});

        await Promise.allSettled([pNucleos, pProjetos, pEspacos, pMatriculas]);
        clearTimeout(timeoutId);
        
      } catch (err) {
        console.warn("Erro ao ler dados do Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentInstitute]);

  const nucleosNameLookup = useMemo(() => {
    const map: Record<string, string> = {};
    nucleosList.forEach((n: any) => {
      const id = String(n.id || n.id_nucleo || n.nucleo_id || '');
      const name = n.nome || n.nome_nucleo || n.nucleo_nome || n.identificacao?.nomeNucleo || n.espaco_nome || '';
      if (id && name) {
        map[id] = name;
      }
    });
    return map;
  }, [nucleosList]);

  const nucleosProjetoLookup = useMemo(() => {
    const map: Record<string, string> = {};
    nucleosList.forEach((n: any) => {
      const id = String(n.id || n.id_nucleo || n.nucleo_id || '');
      const projeto = n.projeto_nome || n.proposta_nome || n.projeto || '';
      if (id && projeto) {
        map[id] = projeto;
      }
    });
    return map;
  }, [nucleosList]);

  // 4. Filtragem dos dados de acordo com a barra de filtros Global
  const filteredMatriculas = useMemo(() => {
    return matriculas.filter(m => {
      if (globalProjeto !== "all" && String(m.projeto_id) !== String(globalProjeto)) {
        return false;
      }
      if (globalCidade !== "all" && m.cidade && m.cidade.toLowerCase() !== globalCidade.toLowerCase()) {
        return false;
      }
      if (globalNucleo !== "all" && String(m.nucleo_id) !== String(globalNucleo)) {
        return false;
      }
      return true;
    });
  }, [matriculas, globalProjeto, globalCidade, globalNucleo]);

  // 5. Métricas e Estatísticas Pedagógicas Calculadas
  const metrics = useMemo(() => {
    const total = filteredMatriculas.length;
    if (total === 0) {
      return {
        total: 0,
        aprovadas: 0,
        pendentes: 0,
        outras: 0,
        mascCount: 0,
        femCount: 0,
        mascPercent: 0,
        femPercent: 0,
        mediaIdade: 0,
        faixas: [
          { label: "5 a 9 anos", total: 0, masc: 0, fem: 0, percent: 0 },
          { label: "10 a 12 anos", total: 0, masc: 0, fem: 0, percent: 0 },
          { label: "13 a 17 anos", total: 0, masc: 0, fem: 0, percent: 0 },
          { label: "18 ou mais anos", total: 0, masc: 0, fem: 0, percent: 0 },
        ],
        nucleosStats: [],
        uniformes: {
          camisas: { items: [], totalInformado: 0, topItem: null },
          bermudas: { items: [], totalInformado: 0, topItem: null },
          calcados: { items: [], totalInformado: 0, topItem: null },
        },
      };
    }

    let masc = 0;
    let fem = 0;
    let somaIdades = 0;
    let totalIdadesValidas = 0;
    let aprovadas = 0;
    let pendentes = 0;
    let outras = 0;

    let f1 = { total: 0, masc: 0, fem: 0 }; // 5-9
    let f2 = { total: 0, masc: 0, fem: 0 }; // 10-12
    let f3 = { total: 0, masc: 0, fem: 0 }; // 13-17
    let f4 = { total: 0, masc: 0, fem: 0 }; // 18+

    const nucleosMap: Record<string, any> = {};

    // 1. Inicializa todos os núcleos (ativos e inativos) para aparecerem no Dashboard
    nucleosList.forEach(n => {
      const nome = n.nome || n.nome_nucleo || `Núcleo ${n.id || ''}`;
      if (nome) {
        const projetoNome = n.projetos?.nome || n.projeto_nome || (n.projeto_id && projetosCache[Number(n.projeto_id)]) || 'Não Informada';
        nucleosMap[nome] = { 
          nome: nome, 
          projeto: projetoNome, 
          total: 0, masc: 0, fem: 0, aprovadas: 0, idadesValidas: 0, somaIdades: 0,
          ativo: n.ativo !== false && n.ativo !== 0 && n.ativo !== "0" && n.ativo !== "false"
        };
      }
    });

    const camisasMap: Record<string, number> = {};
    const bermudasMap: Record<string, number> = {};
    const calcadosMap: Record<string, number> = {};
    let totalCamisasInformadas = 0;
    let totalBermudasInformadas = 0;
    let totalCalcadosInformados = 0;

    filteredMatriculas.forEach(m => {
      const sx = (m.sexo || "").toLowerCase().trim();
      const isMale = sx.startsWith("m") || sx === "masculino";
      const isFemale = sx.startsWith("f") || sx === "feminino";

      if (isMale) masc++;
      else if (isFemale) fem++;
      else masc++; // fallback

      const st = (m.status || "").toLowerCase().trim();
      if (st === "aprovada" || st === "aprovado" || st === "ativo") aprovadas++;
      else if (st === "pendente") pendentes++;
      else outras++;

      const idade = Number(m.idade);
      let isValidIdade = false;
      if (idade && idade > 0 && idade < 120) {
        isValidIdade = true;
        somaIdades += idade;
        totalIdadesValidas++;

        if (idade <= 9) {
          f1.total++;
          if (isMale) f1.masc++; else f1.fem++;
        } else if (idade <= 12) {
          f2.total++;
          if (isMale) f2.masc++; else f2.fem++;
        } else if (idade <= 17) {
          f3.total++;
          if (isMale) f3.masc++; else f3.fem++;
        } else {
          f4.total++;
          if (isMale) f4.masc++; else f4.fem++;
        }
      }

      // Estatísticas de Uniformes
      const cam = (m.tamanho_camisa || "").trim().toUpperCase();
      if (cam && cam !== "NÃO INFORMADO" && cam !== "NAO INFORMADO" && cam !== "—" && cam !== "NULL") {
        camisasMap[cam] = (camisasMap[cam] || 0) + 1;
        totalCamisasInformadas++;
      }

      const cal = (m.tamanho_calca || "").trim().toUpperCase();
      if (cal && cal !== "NÃO INFORMADO" && cal !== "NAO INFORMADO" && cal !== "—" && cal !== "NULL") {
        bermudasMap[cal] = (bermudasMap[cal] || 0) + 1;
        totalBermudasInformadas++;
      }

      const calc = (m.tamanho_calcado || "").trim().toUpperCase();
      if (calc && calc !== "NÃO INFORMADO" && calc !== "NAO INFORMADO" && calc !== "—" && calc !== "NULL") {
        calcadosMap[calc] = (calcadosMap[calc] || 0) + 1;
        totalCalcadosInformados++;
      }

      // Resolução inteligente do Nome do Núcleo pelo ID
      const nIdKey = String(m.nucleo_id || '');
      const nNome = m.nucleo_nome || nucleosNameLookup[nIdKey] || (m.nucleo_id ? `Núcleo ${m.nucleo_id}` : 'Sem Núcleo Definido');
      const nProj = nucleosProjetoLookup[nIdKey] || 'Não Informada';
      
      if (!nucleosMap[nNome]) {
        nucleosMap[nNome] = { nome: nNome, projeto: nProj, total: 0, masc: 0, fem: 0, aprovadas: 0, idadesValidas: 0, somaIdades: 0 };
      }
      nucleosMap[nNome].total++;
      if (isMale) nucleosMap[nNome].masc++; else if (isFemale) nucleosMap[nNome].fem++;
      if (st === "aprovada" || st === "aprovado" || st === "ativo") nucleosMap[nNome].aprovadas++;
      if (isValidIdade) {
        nucleosMap[nNome].idadesValidas++;
        nucleosMap[nNome].somaIdades += idade;
      }
    });

    const mascPercent = Math.round((masc / total) * 100) || 0;
    const femPercent = 100 - mascPercent;
    const mediaIdade = totalIdadesValidas > 0 ? (somaIdades / totalIdadesValidas).toFixed(1) : "0";

    const nucleosStats = Object.values(nucleosMap)
      .map(n => ({
        ...n,
        percentualGeral: Math.round((n.total / total) * 100) || 0,
        mediaIdade: n.idadesValidas > 0 ? Math.round(n.somaIdades / n.idadesValidas) : 0,
        percentAprovados: n.total > 0 ? Math.round((n.aprovadas / n.total) * 100) : 0,
        percentMasc: n.total > 0 ? Math.round((n.masc / n.total) * 100) : 0,
        percentFem: n.total > 0 ? Math.round((n.fem / n.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const sizeOrder = ["4", "6", "8", "10", "12", "14", "16", "PP", "P", "M", "G", "GG", "XG", "XXG", "G1", "G2", "G3"];

    const formatSizeStats = (map: Record<string, number>, totalCount: number) => {
      const items = Object.entries(map)
        .map(([tamanho, count]) => ({
          tamanho,
          total: count,
          percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
        }))
        .sort((a, b) => {
          const numA = Number(a.tamanho);
          const numB = Number(b.tamanho);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          const idxA = sizeOrder.indexOf(a.tamanho);
          const idxB = sizeOrder.indexOf(b.tamanho);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return b.total - a.total;
        });

      const top = items.length > 0 ? [...items].sort((a, b) => b.total - a.total)[0] : null;

      return {
        items,
        totalInformado: totalCount,
        topItem: top,
      };
    };

    const uniformes = {
      camisas: formatSizeStats(camisasMap, totalCamisasInformadas),
      bermudas: formatSizeStats(bermudasMap, totalBermudasInformadas),
      calcados: formatSizeStats(calcadosMap, totalCalcadosInformados),
    };

    return {
      total,
      aprovadas,
      pendentes,
      outras,
      mascCount: masc,
      femCount: fem,
      mascPercent,
      femPercent,
      mediaIdade,
      faixas: [
        { label: "5 a 9 anos", total: f1.total, masc: f1.masc, fem: f1.fem, percent: Math.round((f1.total / total) * 100) || 0 },
        { label: "10 a 12 anos", total: f2.total, masc: f2.masc, fem: f2.fem, percent: Math.round((f2.total / total) * 100) || 0 },
        { label: "13 a 17 anos", total: f3.total, masc: f3.masc, fem: f3.fem, percent: Math.round((f3.total / total) * 100) || 0 },
        { label: "18 ou mais anos", total: f4.total, masc: f4.masc, fem: f4.fem, percent: Math.round((f4.total / total) * 100) || 0 },
      ],
      nucleosStats,
      uniformes,
    };
  }, [filteredMatriculas]);

  const getInstituteLogo = (inst: string) => {
    const up = (inst || "").toUpperCase().trim();
    if (up.includes("GASCTPNA")) return "/logo_gasctpna.png";
    if (up.includes("IBRASE")) return "/logo_ibrase.png";
    if (up.includes("AUNI")) return "/logo_auni.png";
    if (up.includes("IVEM")) return "/logo_ivem.png";
    return "/logo_ibrase.png";
  };

  const handlePrintPDF = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Por favor, permita pop-ups no navegador para gerar o documento PDF.");
      return;
    }

    const now = new Date().toLocaleString("pt-BR");
    const activeFiltersList: string[] = [];
    if (globalProjeto !== "all") activeFiltersList.push(`Proposta: #${globalProjeto}`);
    if (globalCidade !== "all") activeFiltersList.push(`Cidade: ${globalCidade}`);
    if (globalNucleo !== "all") activeFiltersList.push(`Núcleo: ${nucleosNameLookup[globalNucleo] || globalNucleo}`);
    const filterText = activeFiltersList.length > 0 ? activeFiltersList.join(" • ") : "Todos os polos e propostas";

    const instLogo = getInstituteLogo(currentInstitute);
    const isAuni = currentInstitute.toUpperCase().includes("AUNI");

    let contentHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Gráficos Pedagógicos - ${currentInstitute}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            body { margin: 0; padding: 0; color: #0f172a; background: #fff; font-size: 12px; line-height: 1.4; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
            .header-left { display: flex; align-items: center; gap: 14px; }
            .inst-logo { height: 44px; max-width: 140px; object-fit: contain; }
            .inst-logo-capsule { background: #0f172a; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; }
            .header-title-area h1 { margin: 0; font-size: 17px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
            .header-title-area p { margin: 2px 0 0 0; font-size: 11px; color: #475569; }
            .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
            .integra-logo-bw { height: 20px; object-fit: contain; filter: grayscale(100%) contrast(1.5) brightness(0.2); }
            .header-right .meta { text-align: right; font-size: 9px; color: #64748b; font-weight: 700; }
            .section { margin-bottom: 22px; page-break-inside: avoid; }
            .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #1e293b; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
            .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
            .kpi-card .label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; }
            .kpi-card .value { font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 2px; }
            .kpi-card .sub { font-size: 9px; color: #64748b; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
            th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: 800; text-align: left; text-transform: uppercase; font-size: 9px; color: #334155; }
            td { border: 1px solid #e2e8f0; padding: 6px 8px; color: #1e293b; }
            tr:nth-child(even) td { background: #f8fafc; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .badge { display: inline-block; padding: 2px 6px; font-size: 9px; font-weight: 800; border-radius: 4px; }
            .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
            .badge-pink { background: #fdf2f8; color: #be185d; border: 1px solid #fbcfe8; }
            .badge-green { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
            .uniform-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <div class="${isAuni ? 'inst-logo-capsule' : ''}">
                <img src="${instLogo}" class="inst-logo" alt="Logo ${currentInstitute}" />
              </div>
              <div class="header-title-area">
                <h1>Gráficos Pedagógicos</h1>
                <p>Filtros: <strong>${filterText}</strong></p>
              </div>
            </div>
            <div class="header-right">
              <img src="/logo_integra_texto.png" class="integra-logo-bw" alt="Integra" />
              <div class="meta">
                <div>Instituto <strong>${currentInstitute}</strong></div>
                <div>Emissão: ${now}</div>
              </div>
            </div>
          </div>
    `;

    // 1. Resumo Geral
    if (exportSections.resumo) {
      const topFaixa = [...metrics.faixas].sort((a, b) => b.total - a.total)[0];
      contentHtml += `
        <div class="section">
          <div class="section-title"><span>1. Resumo Geral</span></div>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="label">Total de Alunos</div>
              <div class="value">${metrics.total.toLocaleString("pt-BR")}</div>
              <div class="sub">Base cadastrada</div>
            </div>
            <div class="kpi-card">
              <div class="label">Núcleos Ativos</div>
              <div class="value">${metrics.nucleosStats.length}</div>
              <div class="sub">Com alunos alocados</div>
            </div>
            <div class="kpi-card">
              <div class="label">Média de Idade</div>
              <div class="value">${metrics.mediaIdade} <span style="font-size:12px">anos</span></div>
              <div class="sub">Média etária geral</div>
            </div>
            <div class="kpi-card">
              <div class="label">Maior Adesão</div>
              <div class="value" style="font-size:14px">${topFaixa ? topFaixa.label.split('(')[0].trim() : '—'}</div>
              <div class="sub">${topFaixa ? `${topFaixa.percent}% dos alunos` : '—'}</div>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Gênero e Faixas de Idade
    if (exportSections.genero || exportSections.faixas) {
      contentHtml += `
        <div class="section">
          <div class="section-title"><span>2. Perfil Demográfico & Etário</span></div>
          <div style="display: grid; grid-template-columns: ${exportSections.genero && exportSections.faixas ? '1fr 1fr' : '1fr'}; gap: 12px;">
      `;

      if (exportSections.genero) {
        contentHtml += `
          <div>
            <strong style="font-size:11px; text-transform:uppercase; color:#475569; display:block; margin-bottom:4px;">Divisão por Gênero</strong>
            <table>
              <thead><tr><th>Gênero</th><th class="text-center">Quantidade</th><th class="text-center">% Proporção</th></tr></thead>
              <tbody>
                <tr><td>👦 Masculino</td><td class="text-center"><strong>${metrics.mascCount}</strong></td><td class="text-center"><span class="badge badge-blue">${metrics.mascPercent}%</span></td></tr>
                <tr><td>👧 Feminino</td><td class="text-center"><strong>${metrics.femCount}</strong></td><td class="text-center"><span class="badge badge-pink">${metrics.femPercent}%</span></td></tr>
                <tr style="font-weight:bold; background:#f1f5f9;"><td style="border-top:2px solid #cbd5e1">Total</td><td class="text-center" style="border-top:2px solid #cbd5e1">${metrics.total}</td><td class="text-center" style="border-top:2px solid #cbd5e1">100%</td></tr>
              </tbody>
            </table>
          </div>
        `;
      }

      if (exportSections.faixas) {
        contentHtml += `
          <div>
            <strong style="font-size:11px; text-transform:uppercase; color:#475569; display:block; margin-bottom:4px;">Distribuição por Faixa de Idade</strong>
            <table>
              <thead><tr><th>Faixa Etária</th><th class="text-center">Alunos</th><th class="text-center">%</th></tr></thead>
              <tbody>
                ${metrics.faixas.map(fx => `
                  <tr>
                    <td><strong>${fx.label}</strong></td>
                    <td class="text-center">${fx.total}</td>
                    <td class="text-center"><span class="badge badge-green">${fx.percent}%</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      contentHtml += `</div></div>`;
    }

    // 3. Uniformes & Calçados
    if (exportSections.camisas || exportSections.bermudas || exportSections.calcados) {
      const activeUniformCols = [exportSections.camisas, exportSections.bermudas, exportSections.calcados].filter(Boolean).length;
      contentHtml += `
        <div class="section">
          <div class="section-title"><span>3. Grade de Tamanhos de Uniformes & Calçados</span></div>
          <div style="display: grid; grid-template-columns: repeat(${activeUniformCols}, 1fr); gap: 12px;">
      `;

      if (exportSections.camisas) {
        contentHtml += `
          <div class="uniform-box">
            <strong style="font-size:11px; text-transform:uppercase; color:#1d4ed8; display:block; margin-bottom:4px;">👕 Blusas & Camisas (${metrics.uniformes.camisas.totalInformado} un.)</strong>
            <table>
              <thead><tr><th>Tamanho</th><th class="text-center">Qtd</th><th class="text-center">%</th></tr></thead>
              <tbody>
                ${metrics.uniformes.camisas.items.map(it => `
                  <tr>
                    <td><strong>Tam. ${it.tamanho}</strong></td>
                    <td class="text-center"><strong>${it.total}</strong></td>
                    <td class="text-center">${it.percent}%</td>
                  </tr>
                `).join('')}
                ${metrics.uniformes.camisas.items.length === 0 ? '<tr><td colspan="3" class="text-center" style="color:#94a3b8">Sem dados</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        `;
      }

      if (exportSections.bermudas) {
        contentHtml += `
          <div class="uniform-box">
            <strong style="font-size:11px; text-transform:uppercase; color:#047857; display:block; margin-bottom:4px;">🩳 Bermudas (${metrics.uniformes.bermudas.totalInformado} un.)</strong>
            <table>
              <thead><tr><th>Tamanho</th><th class="text-center">Qtd</th><th class="text-center">%</th></tr></thead>
              <tbody>
                ${metrics.uniformes.bermudas.items.map(it => `
                  <tr>
                    <td><strong>Tam. ${it.tamanho}</strong></td>
                    <td class="text-center"><strong>${it.total}</strong></td>
                    <td class="text-center">${it.percent}%</td>
                  </tr>
                `).join('')}
                ${metrics.uniformes.bermudas.items.length === 0 ? '<tr><td colspan="3" class="text-center" style="color:#94a3b8">Sem dados</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        `;
      }

      if (exportSections.calcados) {
        contentHtml += `
          <div class="uniform-box">
            <strong style="font-size:11px; text-transform:uppercase; color:#b45309; display:block; margin-bottom:4px;">👟 Tênis & Calçados (${metrics.uniformes.calcados.totalInformado} un.)</strong>
            <table>
              <thead><tr><th>Número</th><th class="text-center">Qtd</th><th class="text-center">%</th></tr></thead>
              <tbody>
                ${metrics.uniformes.calcados.items.map(it => `
                  <tr>
                    <td><strong>Nº ${it.tamanho}</strong></td>
                    <td class="text-center"><strong>${it.total}</strong></td>
                    <td class="text-center">${it.percent}%</td>
                  </tr>
                `).join('')}
                ${metrics.uniformes.calcados.items.length === 0 ? '<tr><td colspan="3" class="text-center" style="color:#94a3b8">Sem dados</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        `;
      }

      contentHtml += `</div></div>`;
    }

    // 4. Relação por Núcleo
    if (exportSections.nucleos) {
      contentHtml += `
        <div class="section">
          <div class="section-title"><span>4. Distribuição por Núcleo</span></div>
          <table>
            <thead>
              <tr>
                <th style="width:30px; text-align:center">#</th>
                <th>Nome do Núcleo</th>
                <th>Proposta</th>
                <th class="text-center">Total de Alunos</th>
                <th class="text-center">% Geral</th>
                <th class="text-center">Gênero (M / F)</th>
                <th class="text-center">Média Idade</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.nucleosStats.map((n: any, idx: number) => `
                <tr>
                  <td class="text-center" style="color:#64748b">${idx + 1}</td>
                  <td><strong>${n.nome}</strong></td>
                  <td style="color:#475569; font-size:9pt">${n.projeto}</td>
                  <td class="text-center"><strong>${n.total}</strong></td>
                  <td class="text-center">${n.percentualGeral}%</td>
                  <td class="text-center">${n.percentMasc}% M / ${n.percentFem}% F</td>
                  <td class="text-center">${n.mediaIdade > 0 ? `${n.mediaIdade} anos` : '—'}</td>
                </tr>
              `).join('')}
              ${metrics.nucleosStats.length === 0 ? '<tr><td colspan="6" class="text-center" style="color:#94a3b8">Nenhum núcleo encontrado</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      `;
    }

    contentHtml += `
          <div class="footer">
            <span>Sistema Integra • Gráficos Pedagógicos</span>
            <span>Total: ${metrics.total} matrículas • Documento Oficial</span>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(contentHtml);
    printWin.document.close();
    setExportModalOpen(false);
  };

  const isPurePedagogico = userAccountType === "pedagogico" || userRole.includes("pedagogic") || userRole.includes("pedagógic");
  const isMaster = userAccountType.includes("master") || userRole.includes("master") || userAccountType.includes("admin");

  const handleToggleCaptacao = async (item: any) => {
    try {
      const isAtivo = item.ativo !== false && item.ativo !== 0 && item.ativo !== "0" && item.ativo !== "false";
      const novoEstado = !isAtivo;
      
      const formData = new FormData();
      formData.append("id", String(item.id || item.id_nucleo || item.nucleo_id));
      formData.append("ativo", String(novoEstado));
      formData.append("aceitando_vagas", String(novoEstado));
      formData.append("instituto", currentInstitute.toUpperCase());

      const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-put?instituto=${currentInstitute.toUpperCase()}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setNucleosList(prev => prev.map(n => 
          (String(n.id || n.id_nucleo || n.nucleo_id) === String(item.id || item.id_nucleo || item.nucleo_id)) 
            ? { ...n, ativo: novoEstado, aceitando_vagas: novoEstado } 
            : n
        ));
      } else {
        alert("Erro ao alterar status do núcleo.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-2 pb-12 font-sans transition-colors duration-200">
      
      {/* ========================================================================= */}
      {/* VISÃO PEDAGÓGICA                                                          */}
      {/* ========================================================================= */}
      {activeView === "pedagogico" ? (
        <div className="space-y-6">


          {/* 2. HEADER DA SEÇÃO DE GRÁFICOS (Posicionado logo abaixo da Gestão de Núcleos) */}
          <MotionSection delayClass="motion-stagger-2">
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
              <div>
                {(globalProjeto !== "all" || globalCidade !== "all" || globalNucleo !== "all") && (
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                      <Sparkles size={11} />
                      Filtros Ativos
                    </span>
                  </div>
                )}

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                  <PieIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <span>Gráficos</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                  Estatísticas demográficas, divisão por gênero e perfil etário dos alunos.
                </p>
              </div>

              {/* Botões de Ação do Header */}
              <div className="flex items-center gap-3 self-stretch sm:self-auto flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => setExportModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 shadow-xs border border-slate-800 dark:border-blue-500 cursor-pointer active:scale-[0.98]"
                  title="Baixar Relatório em PDF"
                >
                  <Download size={15} />
                  <span>Baixar Relatório PDF</span>
                </button>
              </div>
            </div>
          </MotionSection>

          {/* 1. Cards de Resumo Principal (Métricas com micro-elevação e acentos de cor) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* Total de Alunos */}
            <MotionSection delayClass="motion-stagger-1" className="h-full">
              <div className="h-full bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total de Alunos</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold border border-blue-100/80 dark:border-blue-800/60 group-hover:scale-105 transition-transform">
                      <Users size={17} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {metrics.total.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">alunos</span>
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Base consolidada ativa
                </p>
              </div>
            </MotionSection>

            {/* Núcleos Atendidos */}
            <MotionSection delayClass="motion-stagger-2" className="h-full">
              <div className="h-full bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Núcleos Ativos</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold border border-emerald-100/80 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
                      <Building2 size={17} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {metrics.nucleosStats.length}
                    </span>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">polos</span>
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Com alunos alocados
                </p>
              </div>
            </MotionSection>

            {/* Média de Idade */}
            <MotionSection delayClass="motion-stagger-3" className="h-full">
              <div className="h-full bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-black text-violet-700 dark:text-violet-400 uppercase tracking-wider">Média de Idade</span>
                    <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold border border-violet-100/80 dark:border-violet-800/60 group-hover:scale-105 transition-transform">
                      <Calendar size={17} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {metrics.mediaIdade}
                    </span>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">anos</span>
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                  Média etária geral
                </p>
              </div>
            </MotionSection>

            {/* Faixa Predominante */}
            <MotionSection delayClass="motion-stagger-4" className="h-full">
              <div className="h-full bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">Maior Adesão</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold border border-amber-100/80 dark:border-amber-800/60 group-hover:scale-105 transition-transform">
                      <TrendingUp size={17} />
                    </div>
                  </div>
                  {(() => {
                    const topFaixa = [...metrics.faixas].sort((a, b) => b.total - a.total)[0];
                    return (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate max-w-[140px]" title={topFaixa?.label}>
                            {topFaixa ? topFaixa.label.split('(')[0].trim() : '—'}
                          </span>
                          <span className="text-[11px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-800/60">
                            {topFaixa ? `${topFaixa.percent}%` : '0%'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Faixa mais expressiva
                </p>
              </div>
            </MotionSection>

          </div>

          {/* 2. Gráficos Comparativos: Gênero e Gráfico Circular de Faixas de Idade */}
          <MotionSection delayClass="motion-stagger-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Bloco Gênero */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                        <Users size={16} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Divisão por Gênero</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Proporção demográfica dos matriculados</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                      {metrics.total.toLocaleString("pt-BR")} alunos
                    </span>
                  </div>

                  {/* Barra Visual de Proporção com Gradientes Fluidos, Mini Cards e Animação */}
                  <InteractiveGenderChart 
                    mascPercent={metrics.mascPercent}
                    femPercent={metrics.femPercent}
                    mascCount={metrics.mascCount}
                    femCount={metrics.femCount}
                  />
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold flex items-center justify-center gap-1.5">
                    <Sparkles size={13} className="text-blue-500" />
                    Divisão demográfica atualizada em tempo real
                  </span>
                </div>
              </div>

              {/* Bloco Faixas de Idade: GRÁFICO CIRCULAR (DONUT) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Distribuição por Faixa de Idade</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Perfil etário dos alunos participantes</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-3 py-1 rounded-lg border border-violet-200/80 dark:border-violet-800/60">
                      Média: {metrics.mediaIdade} anos
                    </span>
                  </div>

                  {/* Gráfico Donut Animado com Revelação por Rolagem & Legenda Interativa */}
                  <AgeDonutChart 
                    faixas={metrics.faixas}
                    total={metrics.total}
                    mediaIdade={metrics.mediaIdade}
                  />
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
                    Divisão proporcional agrupada por faixa etária oficial
                  </span>
                </div>
              </div>

            </div>
          </MotionSection>

          {/* 3. Seção de Uniformes & Medidas (Blusas, Bermudas e Tênis) */}
          <MotionSection delayClass="motion-stagger-2">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                    <Shirt size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Distribuição de Uniformes e Calçados</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Grade completa de tamanhos para planejamento logístico e confecção</p>
                  </div>
                </div>

                {/* Botões de Filtro Rápido - EXCLUSIVO PARA CELULAR (no PC aparecem os 3 cards em 3 colunas) */}
                <div className="flex md:hidden items-center p-1 bg-slate-100/90 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 self-start w-full overflow-x-auto custom-scrollbar gap-1">
                  <button
                    type="button"
                    onClick={() => setUniformTab("todos")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                      uniformTab === "todos" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs border border-slate-200 dark:border-slate-600" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Visão Geral
                  </button>
                  <button
                    type="button"
                    onClick={() => setUniformTab("blusas")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                      uniformTab === "blusas" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    👕 Blusas
                  </button>
                  <button
                    type="button"
                    onClick={() => setUniformTab("bermudas")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                      uniformTab === "bermudas" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    🩳 Bermudas
                  </button>
                  <button
                    type="button"
                    onClick={() => setUniformTab("tenis")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                      uniformTab === "tenis" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    👟 Tênis
                  </button>
                </div>
              </div>

              {/* Grid dos 3 Cards de Uniforme (No PC md: os 3 aparecem juntos lado a lado; No Celular respeita o filtro selecionado) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Blusas / Camisas */}
                <div className={`${uniformTab === "todos" || uniformTab === "blusas" ? 'flex' : 'hidden'} md:flex bg-gradient-to-b from-blue-50/70 via-blue-50/25 to-white dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-5 flex-col justify-between hover:shadow-xs hover:border-blue-300 dark:hover:border-blue-800/60 transition-all`}>
                  <div>
                    <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-blue-200/60 dark:border-blue-900/40">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">👕</span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Blusas & Camisas</h4>
                          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">{metrics.uniformes.camisas.totalInformado} peças registradas</span>
                        </div>
                      </div>
                      {metrics.uniformes.camisas.topItem && (
                        <span className="text-[11px] font-black text-blue-800 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 px-2 py-0.5 rounded-md">
                          Top: {metrics.uniformes.camisas.topItem.tamanho} ({metrics.uniformes.camisas.topItem.percent}%)
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1.5 custom-scrollbar">
                      {metrics.uniformes.camisas.items.map((it, idx) => (
                        <div key={idx} className="bg-white/95 dark:bg-slate-800/90 p-2.5 rounded-xl border border-blue-100 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:scale-[1.02] hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Tam. {it.tamanho}</span>
                            <span className="font-black text-blue-700 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">{it.total} un. <span className="text-slate-400 dark:text-slate-500 font-semibold group-hover:text-blue-500/70 transition-colors">({it.percent}%)</span></span>
                          </div>
                          <div className="w-full h-2 bg-blue-100/70 dark:bg-blue-950/80 rounded-full overflow-hidden border border-blue-200/60 dark:border-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors">
                            <div className="h-full w-full group-hover:brightness-110 group-hover:drop-shadow-sm transition-all">
                              <AnimatedProgressBar percent={it.percent} gradientClass="bg-gradient-to-r from-blue-500 to-indigo-600" delayIdx={idx} />
                            </div>
                          </div>
                        </div>
                      ))}

                      {metrics.uniformes.camisas.items.length === 0 && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6 font-medium">Nenhum tamanho registrado</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bermudas */}
                <div className={`${uniformTab === "todos" || uniformTab === "bermudas" ? 'flex' : 'hidden'} md:flex bg-gradient-to-b from-emerald-50/70 via-emerald-50/25 to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl p-5 flex-col justify-between hover:shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-all`}>
                  <div>
                    <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-emerald-200/60 dark:border-emerald-900/40">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🩳</span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Bermudas</h4>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{metrics.uniformes.bermudas.totalInformado} peças registradas</span>
                        </div>
                      </div>
                      {metrics.uniformes.bermudas.topItem && (
                        <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-md">
                          Top: {metrics.uniformes.bermudas.topItem.tamanho} ({metrics.uniformes.bermudas.topItem.percent}%)
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1.5 custom-scrollbar">
                      {metrics.uniformes.bermudas.items.map((it, idx) => (
                        <div key={idx} className="bg-white/95 dark:bg-slate-800/90 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:scale-[1.02] hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer group">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Tam. {it.tamanho}</span>
                            <span className="font-black text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">{it.total} un. <span className="text-slate-400 dark:text-slate-500 font-semibold group-hover:text-emerald-500/70 transition-colors">({it.percent}%)</span></span>
                          </div>
                          <div className="w-full h-2 bg-emerald-100/70 dark:bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-200/60 dark:border-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900 transition-colors">
                            <div className="h-full w-full group-hover:brightness-110 group-hover:drop-shadow-sm transition-all">
                              <AnimatedProgressBar percent={it.percent} gradientClass="bg-gradient-to-r from-emerald-500 to-teal-600" delayIdx={idx} />
                            </div>
                          </div>
                        </div>
                      ))}

                      {metrics.uniformes.bermudas.items.length === 0 && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6 font-medium">Nenhum tamanho registrado</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tênis / Calçados */}
                <div className={`${uniformTab === "todos" || uniformTab === "tenis" ? 'flex' : 'hidden'} md:flex bg-gradient-to-b from-amber-50/70 via-amber-50/25 to-white dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-5 flex-col justify-between hover:shadow-xs hover:border-amber-300 dark:hover:border-amber-800/60 transition-all`}>
                  <div>
                    <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-amber-200/60 dark:border-amber-900/40">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">👟</span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Tênis & Calçados</h4>
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">{metrics.uniformes.calcados.totalInformado} pares registrados</span>
                        </div>
                      </div>
                      {metrics.uniformes.calcados.topItem && (
                        <span className="text-[11px] font-black text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/80 px-2 py-0.5 rounded-md">
                          Top: Nº {metrics.uniformes.calcados.topItem.tamanho} ({metrics.uniformes.calcados.topItem.percent}%)
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1.5 custom-scrollbar">
                      {metrics.uniformes.calcados.items.map((it, idx) => (
                        <div key={idx} className="bg-white/95 dark:bg-slate-800/90 p-2.5 rounded-xl border border-amber-100 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:scale-[1.02] hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer group">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-black text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Nº {it.tamanho}</span>
                            <span className="font-black text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">{it.total} un. <span className="text-slate-400 dark:text-slate-500 font-semibold group-hover:text-amber-500/70 transition-colors">({it.percent}%)</span></span>
                          </div>
                          <div className="w-full h-2 bg-amber-100/70 dark:bg-amber-950/80 rounded-full overflow-hidden border border-amber-200/60 dark:border-amber-900/50 group-hover:bg-amber-200 dark:group-hover:bg-amber-900 transition-colors">
                            <div className="h-full w-full group-hover:brightness-110 group-hover:drop-shadow-sm transition-all">
                              <AnimatedProgressBar percent={it.percent} gradientClass="bg-gradient-to-r from-amber-500 to-orange-500" delayIdx={idx} />
                            </div>
                          </div>
                        </div>
                      ))}

                      {metrics.uniformes.calcados.items.length === 0 && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6 font-medium">Nenhum tamanho registrado</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </MotionSection>



        </div>
      ) : (
        /* ========================================================================= */
        /* VISÃO GESTÃO (Cards Tradicionais de Módulo: Propostas, Espaços, Núcleos) */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Card 01 - Propostas */}
            <MotionSection delayClass="motion-stagger-1" className="h-full">
              <div className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 lg:p-7 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 group min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[var(--theme-primary)] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700/60 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      {loading && propostasCount === 0 ? <Loader2 className="w-3 h-3 animate-spin inline-block" /> : propostasCount} Ativas
                    </span>
                  </div>

                  <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-[var(--theme-primary)] transition-colors">
                    Propostas
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Crie e gerencie projetos de aula, termos de fomento e prazos de execução.
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate">Projetos & Eventos</span>
                  <Link 
                    to="/admin/propostas"
                    className="inline-flex items-center gap-1.5 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-all text-xs shrink-0 group-hover:translate-x-1"
                  >
                    <span>Acessar</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </MotionSection>

            {/* Card 02 - Espaços */}
            <MotionSection delayClass="motion-stagger-2" className="h-full">
              <div className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 lg:p-7 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 group min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-900/50 group-hover:scale-105 transition-transform">
                      <Home className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700/60 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      {loading && espacosCount === 0 ? <Loader2 className="w-3 h-3 animate-spin inline-block" /> : espacosCount} Locais
                    </span>
                  </div>

                  <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    Espaços
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Mapeamento dos locais físicos nos bairros, dados do cedente/responsável e termos de uso.
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate">Locais Físicos</span>
                  <Link
                    to="/admin/espacos"
                    className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-all text-xs shrink-0 group-hover:translate-x-1"
                  >
                    <span>Acessar</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </MotionSection>

            {/* Card 03 - Núcleos */}
            <MotionSection delayClass="motion-stagger-3" className="h-full">
              <div className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 lg:p-7 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 group min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50 group-hover:scale-105 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700/60 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      {loading && nucleosCount === 0 ? <Loader2 className="w-3 h-3 animate-spin inline-block" /> : nucleosCount} Ativos
                    </span>
                  </div>

                  <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Núcleos
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Gestão das unidades operacionais, alocação de equipe, vagas e grade horária.
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate">Unidades & Turmas</span>
                  <Link 
                    to="/admin/nucleos"
                    className="inline-flex items-center gap-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-all text-xs shrink-0 group-hover:translate-x-1"
                  >
                    <span>Acessar</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </MotionSection>

          </div>
        </div>
      )}

      {/* Modal de Exportação PDF Customizada */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shrink-0">
                  <Printer size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Baixar Gráficos Pedagógicos (PDF)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Selecione os gráficos e informações que deseja incluir no documento</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Ações Rápidas: Selecionar Todos / Desmarcar Todos */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Seções do Relatório</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExportSections({
                    resumo: true,
                    genero: true,
                    faixas: true,
                    camisas: true,
                    bermudas: true,
                    calcados: true,
                    nucleos: true,
                  })}
                  className="font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
                >
                  Marcar Todos
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setExportSections({
                    resumo: false,
                    genero: false,
                    faixas: false,
                    camisas: false,
                    bermudas: false,
                    calcados: false,
                    nucleos: false,
                  })}
                  className="font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline cursor-pointer"
                >
                  Desmarcar Todos
                </button>
              </div>
            </div>

            {/* Lista de Checkboxes */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1.5 custom-scrollbar">
              {[
                { key: "resumo", label: "Resumo Geral & KPIs", desc: "Total de alunos, núcleos ativos, média de idade e faixa principal" },
                { key: "genero", label: "Divisão por Gênero", desc: "Contagem e proporção de meninos e meninas" },
                { key: "faixas", label: "Distribuição por Faixas de Idade", desc: "Estatísticas de 5 a 9, 10 a 12, 13 a 17 e 18+ anos" },
                { key: "camisas", label: "Uniformes: Blusas & Camisas", desc: `Grade de tamanhos (${metrics.uniformes.camisas.totalInformado} peças registradas)` },
                { key: "bermudas", label: "Uniformes: Bermudas", desc: `Grade de tamanhos (${metrics.uniformes.bermudas.totalInformado} peças registradas)` },
                { key: "calcados", label: "Uniformes: Tênis & Calçados", desc: `Grade de numerações (${metrics.uniformes.calcados.totalInformado} pares registrados)` },
                { key: "nucleos", label: "Distribuição por Núcleo", desc: "Tabela completa com todos os núcleos, totais e médias" },
              ].map((item) => {
                const isChecked = exportSections[item.key as keyof typeof exportSections];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isChecked 
                        ? "bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white" 
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isChecked}
                      onChange={(e) => setExportSections(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    />
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      isChecked ? "bg-blue-600 text-white" : "border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}>
                      {isChecked && <Check size={14} className="stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-sm block">{item.label}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">{item.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Rodapé do Modal */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePrintPDF}
                disabled={!Object.values(exportSections).some(Boolean)}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer size={15} />
                <span>Gerar Gráficos Pedagógicos (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
