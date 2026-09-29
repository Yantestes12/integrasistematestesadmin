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
  Info,
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
  ChevronDown,
  Loader2,
  Heart,
  Target,
  AlertTriangle,
  Edit3
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { fetchWithDedupe, safeSetSession, safeGetSession } from "~/utils/apiCache";

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

// Gráfico de Barras Horizontais com Metas da Proposta (Inspirado no Painel Pedagógico)
function PedagogicoHorizontalBarChart({
  items,
  total,
  meta,
  termoPessoa,
  titulo,
  propostaSelecionada
}: {
  items: { label: string; value: number }[];
  total: number;
  meta: number;
  termoPessoa: string;
  titulo: string;
  propostaSelecionada?: boolean;
}) {
  const maxItemVal = Math.max(...items.map(i => i.value), 10);
  const maxVal = Math.max(10, Math.ceil((maxItemVal * 1.15) / 10) * 10);
  const percentMeta = meta > 0 ? Math.min(100, Math.round((total / meta) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header com Ícone e Título */}
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            <Users size={16} />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate" title={titulo}>
            {titulo}
          </h3>
        </div>

        {/* Top KPIs: Total e Meta Planejada (ou Polos Atendidos quando consolidado) */}
        <div className="grid grid-cols-2 gap-4 pb-5 mb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Total de {termoPessoa}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
              {total.toLocaleString("pt-BR")}
            </span>
          </div>
          <div>
            {propostaSelecionada && meta > 0 ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Meta da proposta
                  </span>
                  <span className="text-xs font-black text-blue-700 dark:text-blue-400">
                    {percentMeta}%
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-200 tracking-tight block">
                  {meta.toLocaleString("pt-BR")}
                </span>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-700" 
                    style={{ width: `${percentMeta}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Polos com {termoPessoa}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-200 tracking-tight block">
                  {items.length} {items.length === 1 ? "polo ativo" : "polos ativos"}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1 block">
                  Consolidado geral
                </span>
              </>
            )}
          </div>
        </div>

        {/* Barras Horizontais */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1.5 custom-scrollbar">
          {items.slice(0, 10).map((it, idx) => {
            const barWidth = maxVal > 0 ? Math.max(6, Math.round((it.value / maxVal) * 100)) : 0;
            return (
              <div key={idx} className="space-y-1 group">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]" title={it.label}>
                    {it.label}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {it.value}
                  </span>
                </div>
                <div className="w-full h-6 bg-slate-100 dark:bg-slate-800/80 rounded-md overflow-hidden relative flex items-center">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-md transition-all duration-700 flex items-center justify-end pr-2 text-[11px] font-bold text-white shadow-xs group-hover:brightness-110"
                    style={{ width: `${barWidth}%` }}
                  >
                    {barWidth > 20 && <span>{it.value}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">Nenhum dado encontrado</p>
          )}
        </div>
      </div>

      {/* Eixo inferior */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          <span>0</span>
          <span>{Math.round(maxVal * 0.25)}</span>
          <span>{Math.round(maxVal * 0.5)}</span>
          <span>{Math.round(maxVal * 0.75)}</span>
          <span>{maxVal}</span>
        </div>
        <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-wider mt-1.5">
          Quantidade de {termoPessoa}
        </p>
      </div>
    </div>
  );
}

// Gráfico Circular de Distribuição por Cidade (Inspirado no Painel Pedagógico)
function PedagogicoCityDonut({
  items,
  total,
  termoPessoa
}: {
  items: { label: string; value: number; percent: number }[];
  total: number;
  termoPessoa: string;
}) {
  const colors = ["#1e3a8a", "#2563eb", "#38bdf8", "#7dd3fc", "#93c5fd", "#cbd5e1"];

  const radius = 36;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            <MapPin size={16} />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Distribuição de {termoPessoa} por cidade
          </h3>
        </div>

        {/* Donut e Legenda lado a lado */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {/* SVG Donut com viewBox perfeito e sem cortes */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
                className="dark:stroke-slate-800"
              />
              {items.map((it, idx) => {
                const strokeDasharray = `${(it.percent / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                accumulatedPercent += it.percent;
                return (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={colors[idx % colors.length]}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 hover:opacity-80 cursor-pointer"
                  />
                );
              })}
            </svg>
            {/* Texto Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {total.toLocaleString("pt-BR")}
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 capitalize mt-0.5">
                {termoPessoa}
              </span>
            </div>
          </div>

          {/* Legenda Lateral */}
          <div className="flex-1 w-full space-y-2.5 max-h-56 overflow-y-auto pr-1.5 custom-scrollbar">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: colors[idx % colors.length] }} 
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-200 truncate" title={it.label}>
                    {it.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className="font-black text-slate-900 dark:text-white">{it.value}</span>
                  <span className="text-slate-400 font-semibold text-[11px]">({it.percent}%)</span>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Nenhuma cidade registrada</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
          Proporção geográfica dos participantes matriculados
        </span>
      </div>
    </div>
  );
}

// Gráfico de Linha / Área Temporal para Captação (Inspirado no Relatório de Captação)
function PedagogicoTimelineLineChart({
  items,
  totalPeriodo,
  periodo,
  onPeriodoChange,
  termoPessoa
}: {
  items: { label: string; value: number }[];
  totalPeriodo: number;
  periodo: "diario" | "mensal" | "anual";
  onPeriodoChange: (p: "diario" | "mensal" | "anual") => void;
  termoPessoa: string;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number; x: number; y: number } | null>(null);

  const maxVal = Math.max(...items.map(i => i.value), 5);
  const width = 800;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;

  const points = items.map((it, idx) => {
    const x = items.length > 1 
      ? paddingX + (idx / (items.length - 1)) * (width - 2 * paddingX)
      : width / 2;
    const y = height - paddingY - (it.value / maxVal) * (height - 2 * paddingY);
    return { ...it, x, y };
  });

  let pathD = "";
  let areaD = "";
  if (points.length === 1) {
    pathD = `M ${paddingX} ${points[0].y} L ${width - paddingX} ${points[0].y}`;
    areaD = `M ${paddingX} ${points[0].y} L ${width - paddingX} ${points[0].y} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;
  } else if (points.length > 1) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Top Bar: Títulos, Pills e KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Captação de {termoPessoa}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            {periodo === "diario" 
              ? `Acompanhe a quantidade de ${termoPessoa} captados nos últimos 7 dias.` 
              : `Acompanhe a quantidade de ${termoPessoa} captados ao longo do tempo.`}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Pills de Período */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            {(["diario", "mensal", "anual"] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => onPeriodoChange(p)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  periodo === p 
                    ? "bg-blue-600 text-white shadow-2xs font-extrabold" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {p === "diario" ? "Diário (7 dias)" : p === "mensal" ? "Mensal" : "Anual"}
              </button>
            ))}
          </div>

          {/* KPI box */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
            <div>
              <span className="text-lg font-black text-blue-950 dark:text-blue-100 block leading-tight">
                {totalPeriodo}
              </span>
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                {periodo === "diario" ? "Captados nos 7 dias" : "Total captado"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Line / Area Chart */}
      <div className="relative w-full h-56 pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines horizontais */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = height - paddingY - pct * (height - 2 * paddingY);
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400">
                  {Math.round(pct * maxVal)}
                </text>
              </g>
            );
          })}

          {/* Área com gradiente */}
          {areaD && <path d={areaD} fill="url(#areaGradient)" />}

          {/* Linha da curva */}
          {pathD && <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />}

          {/* Pontos interativos com hit-target invisível estático para eliminar 100% o flickering */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint?.label === pt.label;
            return (
              <g key={idx}>
                {/* Ponto visível animado sem roubar eventos de mouse */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? "#1d4ed8" : "#2563eb"}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="pointer-events-none transition-all duration-150"
                />
                {/* Área de toque transparente estática que não treme nem se move */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={16}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* Labels do Eixo X */}
          {points.map((pt, idx) => {
            if (points.length > 10 && idx % Math.ceil(points.length / 8) !== 0 && idx !== points.length - 1) return null;
            return (
              <text key={idx} x={pt.x} y={height - 5} textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
                {pt.label}
              </text>
            );
          })}
        </svg>

        {/* Tooltip flutuante */}
        {hoveredPoint && (
          <div 
            className="absolute bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full border border-slate-700 z-30 select-none"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`, 
              top: `${(hoveredPoint.y / height) * 100}%`,
              marginTop: "-10px"
            }}
          >
            <p className="font-extrabold text-blue-400">{hoveredPoint.label}</p>
            <p className="text-[11px] font-bold">{hoveredPoint.value} {termoPessoa}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Mini Donut Chart para Características do Público (Camisa, Bermuda, Calçado, Idade)
function PedagogicoMiniDonut({
  title,
  items,
  palette
}: {
  title: string;
  items: { label: string; count: number; percent: number }[];
  palette: string[];
}) {
  const size = 96;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
        {title}
      </h4>

      <div className="flex items-center gap-3.5 my-3">
        {/* Donut SVG */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              className="dark:stroke-slate-800"
            />
            {items.map((it, idx) => {
              const strokeDasharray = `${(it.percent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += it.percent;
              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={palette[idx % palette.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
        </div>

        {/* Legenda Lateral */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span 
                  className="w-2.5 h-2.5 rounded-sm shrink-0" 
                  style={{ backgroundColor: palette[idx % palette.length] }} 
                />
                <span className="font-bold text-slate-600 dark:text-slate-300 truncate" title={it.label}>
                  {it.label}
                </span>
              </div>
              <span className="font-black text-slate-900 dark:text-white shrink-0 pl-1">
                {it.percent}%
              </span>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-[10px] text-slate-400 text-center py-2">Sem registros</p>
          )}
        </div>
      </div>
    </div>
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
  created_at?: string;
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

const IMPACT_PHRASES = [
  "O seu trabalho já ajudou a transformar a vida de {count} alunos matriculados. Você faz a diferença! 💖",
  "Cada atendimento conta: já são {count} alunos acolhidos e integrados em nossos projetos. Parabéns pela dedicação! ⭐",
  "O futuro começa com oportunidades: {count} alunos já contam com o apoio da nossa equipe. Muito orgulho dessa trajetória! 🚀",
  "Construindo caminhos e sonhos: sua atuação alcançou {count} alunos matriculados. Obrigado pelo compromisso diário! 🌟",
  "O esporte e a educação transformam: {count} vidas impactadas diretamente pelo esforço coletivo da nossa rede! 🏆",
  "Juntos fazemos acontecer: {count} alunos registrados e em desenvolvimento com nossa estrutura. Excelente trabalho! 👏",
  "Dedicando cuidado a cada detalhe: já organizamos o percurso formativo de {count} alunos. Sua dedicação move montanhas! 💫",
  "Impacto real nas comunidades: são {count} alunos acolhidos e atendidos com excelência pela nossa instituição! 🎯",
  "Mais do que números, são histórias: {count} trajetórias iniciadas com a força do nosso time. Gratidão pelo empenho! 🌻",
  "Transformação que se sente no dia a dia: {count} alunos beneficiados pelo trabalho sério e humano de todos nós! 🤝",
  "A cada dia uma nova conquista: {count} famílias impactadas positivamente através dos nossos núcleos esportivos! ⚽",
  "O seu esforço diário abre portas: já são {count} jovens e crianças com acesso garantido aos nossos polos! 🌈",
  "Compromisso social em ação: {count} alunos já fazem parte da nossa comunidade ativa. Vamos juntos por mais! 💪",
  "Inclusão, respeito e cidadania: {count} alunos contam com o seu profissionalismo para seguir em frente! ✨",
  "Resultados que orgulham: com o seu apoio, já organizamos e acompanhamos {count} alunos com excelência! 🥇"
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [currentInstitute, setCurrentInstitute] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('auth_institute') || 'IBRASE' : 'IBRASE');
  const [userRole, setUserRole] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('auth_cargo') || 'colaborador').toLowerCase().trim() : 'colaborador');
  const [userAccountType, setUserAccountType] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('auth_account_type') || 'colaborador').toLowerCase().trim() : 'colaborador');
  const [activeView, setActiveView] = useState<"geral" | "pedagogico">(() => {
    if (typeof window !== "undefined") {
      const url = new URLSearchParams(window.location.search);
      const qv = url.get("view");
      if (qv === "pedagogico" || qv === "geral") return qv;
      const cargo = (localStorage.getItem("auth_cargo") || "").toLowerCase().trim();
      const accType = (localStorage.getItem("auth_account_type") || "").toLowerCase().trim();
      const saved = localStorage.getItem("integra_active_view");
      if (saved === "pedagogico" || accType === "pedagogico" || cargo.includes("pedagogic") || cargo.includes("pedagógic")) {
        return "pedagogico";
      }
    }
    return "geral";
  });
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
  const [globalTrimestreInicio, setGlobalTrimestreInicio] = useState("");
  const [globalTrimestreFim, setGlobalTrimestreFim] = useState("");

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [matriculas, setMatriculas] = useState<MatriculaItem[]>(() => {
    if (typeof window !== "undefined") {
      const inst = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
      const cached = safeGetSession<MatriculaItem[]>(`cache_matriculas_v2_${inst}`);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
    }
    return [];
  });
  const [matriculasFetched, setMatriculasFetched] = useState(() => {
    if (typeof window !== "undefined") {
      const inst = (localStorage.getItem("auth_institute") || "IBRASE").toUpperCase();
      const cached = safeGetSession<MatriculaItem[]>(`cache_matriculas_v2_${inst}`);
      return !!(cached && Array.isArray(cached) && cached.length > 0);
    }
    return false;
  });
  const [nucleosList, setNucleosList] = useState<any[]>([]);
  const [nucleosCount, setNucleosCount] = useState(0);
  const [propostasCount, setPropostasCount] = useState(0);
  const [espacosCount, setEspacosCount] = useState(0);
  const [modalidadesCache, setModalidadesCache] = useState<Record<number, string>>({});
  const [projetosCache, setProjetosCache] = useState<Record<number, string>>({});
  const [propostasComPendencia, setPropostasComPendencia] = useState<{ id: string | number, nome: string, campos: string[] }[]>([]);
  const [propostasList, setPropostasList] = useState<any[]>([]);
  const [espacosList, setEspacosList] = useState<any[]>([]);
  const [hoveredCityIdx, setHoveredCityIdx] = useState<number | null>(null);
  const [hoveredModIdx, setHoveredModIdx] = useState<number | null>(null);
  const modalidadesCarouselRef = useRef<HTMLDivElement>(null);
  const [pendenciasExpanded, setPendenciasExpanded] = useState(false);
  const [vagasModalidadeOpen, setVagasModalidadeOpen] = useState(false);

  // Estados para o Painel Pedagógico Inspirado na Referência
  const [captacaoPeriodo, setCaptacaoPeriodo] = useState<"diario" | "mensal" | "anual">("diario");
  const [generoPerfilFilter, setGeneroPerfilFilter] = useState<"todos" | "feminino" | "masculino">("todos");

  // Frase rotativa diária de impacto baseada no dia do mês
  const currentImpactPhrase = useMemo(() => {
    const day = typeof window !== 'undefined' ? new Date().getDate() : 1;
    const template = IMPACT_PHRASES[day % IMPACT_PHRASES.length];
    return template.replace("{count}", String(matriculas.length));
  }, [matriculas.length]);

  // Estados e filtros refinados para Gestão de Núcleos no Pedagógico
  const [nucleoFilterStatus, setNucleoFilterStatus] = useState<"todos" | "abertos" | "pausados">("todos");
  const [nucleoSearchQuery, setNucleoSearchQuery] = useState("");
  const nucleosCarouselRef = useRef<HTMLDivElement>(null);

    const scrollModalidades = (direction: 'left' | 'right') => {
    if (modalidadesCarouselRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      modalidadesCarouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (nucleosCarouselRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      nucleosCarouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

    // =========================================================================
  // CÁLCULOS EXECUTIVOS DA VISÃO GESTÃO (Vagas, Modalidades, Cidades, Pendências)
  // =========================================================================
  const CITY_PALETTE = [
    "#3b82f6", // Azul
    "#10b981", // Verde Esmeralda
    "#8b5cf6", // Roxo
    "#f59e0b", // Âmbar
    "#06b6d4", // Ciano
    "#ec4899", // Rosa
    "#6366f1", // Índigo
    "#14b8a6", // Verde Petróleo
    "#f97316", // Laranja
    "#84cc16", // Lima
    "#a855f7", // Violeta
    "#64748b"  // Ardósia
  ];

  // Mapas de Espaços (por ID e por Nome/Bairro) para resolução precisa e instantânea de cidades
  const espacosMaps = useMemo(() => {
    const byId: Record<string, any> = {};
    const byName: Record<string, any> = {};
    espacosList.forEach(e => {
      if (e) {
        if (e.id) {
          byId[String(e.id)] = e;
          byId[Number(e.id)] = e;
        }
        if (e.nome) byName[String(e.nome).toLowerCase().trim()] = e;
        if (e.bairro) byName[String(e.bairro).toLowerCase().trim()] = e;
      }
    });
    return { byId, byName };
  }, [espacosList]);

  // Mapeamento nucleo_id -> cidade derivado das matrículas dos alunos (garante cidade mesmo sem espaços carregados)
  const matCidadeMap = useMemo(() => {
    const map: Record<string, string> = {};
    matriculas.forEach((m) => {
      const nid = String(m.nucleo_id || '');
      const cid = (m.cidade || m.aluno_cidade || m.municipio || '').trim();
      if (nid && cid && !map[nid] && cid.toLowerCase() !== "null" && cid !== "—") {
        map[nid] = cid;
      }
    });
    return map;
  }, [matriculas]);

  // Resolução robusta da cidade do núcleo com contingência multinível (Espaço > Matrícula > Nome > Fallback oficial)
  const getResolvedNucleoCidade = (n: any): string => {
    if (n.cidade && String(n.cidade).trim() !== "" && String(n.cidade).toLowerCase() !== "null" && n.cidade !== "—") {
      return String(n.cidade).trim();
    }
    const nid = String(n.id || n.id_nucleo || n.nucleo_id || '');
    const espid = String(n.espaco_id || n.bairro_id || '');
    if (espid && espacosMaps.byId[espid]?.cidade) {
      return espacosMaps.byId[espid].cidade;
    }
    const nomeLower = String(n.nome || n.nome_nucleo || '').toLowerCase().trim();
    if (nomeLower && espacosMaps.byName[nomeLower]?.cidade) {
      return espacosMaps.byName[nomeLower].cidade;
    }
    const bairroLower = String(n.bairro || '').toLowerCase().trim();
    if (bairroLower && espacosMaps.byName[bairroLower]?.cidade) {
      return espacosMaps.byName[bairroLower].cidade;
    }
    if (nid && matCidadeMap[nid]) {
      return matCidadeMap[nid];
    }
    // Mapeamento de contingência para os núcleos cadastrados nos projetos oficiais
    if (nomeLower.includes("km 14") || nomeLower.includes("travessão") || nomeLower.includes("conselheiro josino") || 
        nomeLower.includes("parque são caetano") || nomeLower.includes("santa cruz") || nomeLower.includes("saturnino braga") || 
        nomeLower.includes("jóquei") || nomeLower.includes("goitacazes")) {
      return "Campos dos Goytacazes";
    }
    if (nomeLower.includes("centro") || nomeLower.includes("chatuba")) {
      return "São João da Barra";
    }
    if (nomeLower.includes("batelão") || nomeLower.includes("barra seca")) {
      return "São Francisco de Itabapoana";
    }
    if (nomeLower.includes("vila nova")) {
      return "Conceição de Macabu";
    }
    if (nomeLower.includes("moquetá") || nomeLower.includes("palmares")) {
      return "Nova Iguaçu";
    }
    if (nomeLower.includes("vargem pequena") || nomeLower.includes("magalhães bastos")) {
      return "Rio de Janeiro";
    }
    return "Outra Localidade";
  };

  // 1. Vagas Oficiais de Núcleos (Disponíveis, Ocupadas, Meta Planejada e por Modalidade)
  const vagasNucleoStats = useMemo(() => {
    // Propostas consideradas
    const propostasFiltradas = propostasList.filter(p => {
      const isAtivo = p.ativo !== false && p.status !== false && p.status !== "inativo";
      if (!isAtivo) return false;
      if (globalProjeto !== "all" && String(p.id || p.id_projeto || p.id_proposta) !== String(globalProjeto)) return false;
      return true;
    });

    let totalVagas = 0;
    const modTotals: Record<string, { nome: string; total: number; ocupadas: number; disponiveis: number }> = {};

    propostasFiltradas.forEach(p => {
      const raw = p.vagas_nucleo || p.vagasNucleo;
      let parsed: any[] = [];
      if (typeof raw === "string") {
        try { parsed = JSON.parse(raw); } catch (e) {}
      } else if (Array.isArray(raw)) {
        parsed = raw;
      }

      let count = parsed.length;
      if (count > 0 && (parsed[0].modalidadeNome || parsed[0].modalidade_nome || parsed[0].numero !== undefined)) {
        parsed.forEach((slot: any) => {
          const modName = slot.modalidadeNome || slot.modalidade_nome || (slot.modalidadeId && modalidadesCache[Number(slot.modalidadeId)]) || slot.modalidade || "Geral";
          if (!modTotals[modName]) {
            modTotals[modName] = { nome: modName, total: 0, ocupadas: 0, disponiveis: 0 };
          }
          modTotals[modName].total++;
        });
      } else if (p.limites_modalidades) {
        let lm = p.limites_modalidades;
        if (typeof lm === "string") {
          try { lm = JSON.parse(lm); } catch (e) {}
        }
        if (Array.isArray(lm)) {
          count = lm.reduce((acc: number, curr: any) => acc + (Number(curr.limite) || 0), 0);
          lm.forEach((item: any) => {
            const modName = item.nome || (item.id && modalidadesCache[Number(item.id)]) || "Geral";
            const lim = Number(item.limite) || 0;
            if (!modTotals[modName]) {
              modTotals[modName] = { nome: modName, total: 0, ocupadas: 0, disponiveis: 0 };
            }
            modTotals[modName].total += lim;
          });
        }
      }
      if (count === 0) {
        count = Number(p.limite_nucleos || p.qtd_nucleos || p.quantidade_nucleos || 0);
      }
      totalVagas += count;
    });

    // Núcleos ativos
    const nucleosAtivos = nucleosList.filter(n => {
      const isAtivo = n.ativo !== false && n.ativo !== 0 && n.ativo !== "0" && n.ativo !== "false";
      if (!isAtivo) return false;
      if (globalProjeto !== "all" && String(n.projeto_id) !== String(globalProjeto)) return false;
      const cid = getResolvedNucleoCidade(n);
      if (globalCidade !== "all" && cid.toLowerCase() !== globalCidade.toLowerCase()) return false;
      if (globalNucleo !== "all" && String(n.id || n.id_nucleo || n.nucleo_id) !== String(globalNucleo)) return false;
      return true;
    });

    const ocupadas = nucleosAtivos.filter(n => 
      n.numero_vaga !== null && n.numero_vaga !== undefined && String(n.numero_vaga).trim() !== "" && String(n.numero_vaga) !== "0"
    ).length;

    // Contabiliza ocupação por modalidade nos núcleos ativos com vaga
    nucleosAtivos.forEach(n => {
      const hasVaga = n.numero_vaga !== null && n.numero_vaga !== undefined && String(n.numero_vaga).trim() !== "" && String(n.numero_vaga) !== "0";
      if (!hasVaga) return;
      const modName = n.modalidade_nome || (n.modalidade_id && modalidadesCache[Number(n.modalidade_id)]) || n.modalidade || "Geral";
      if (modTotals[modName]) {
        modTotals[modName].ocupadas++;
      } else {
        const key = Object.keys(modTotals).find(k => k.toLowerCase() === modName.toLowerCase());
        if (key) {
          modTotals[key].ocupadas++;
        } else {
          modTotals[modName] = { nome: modName, total: 1, ocupadas: 1, disponiveis: 0 };
        }
      }
    });

    Object.values(modTotals).forEach(m => {
      m.disponiveis = Math.max(0, m.total - m.ocupadas);
    });

    const modalidadesDisponiveis = Object.values(modTotals)
      .sort((a, b) => b.disponiveis - a.disponiveis || a.nome.localeCompare(b.nome));

    const disponiveis = Math.max(0, totalVagas - ocupadas);
    const percentOcupado = totalVagas > 0 ? Math.min(100, Math.round((ocupadas / totalVagas) * 100)) : 0;

    return {
      totalVagas,
      ocupadas,
      disponiveis,
      percentOcupado,
      totalAtivos: nucleosAtivos.length,
      modalidadesDisponiveis
    };
  }, [propostasList, nucleosList, modalidadesCache, espacosMaps, matCidadeMap, globalProjeto, globalCidade, globalNucleo]);

  // 2. Gráfico de Barras: Quantidade de Núcleos por Modalidade
  const modalidadesChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    nucleosList.forEach(n => {
      const isAtivo = n.ativo !== false && n.ativo !== 0 && n.ativo !== "0" && n.ativo !== "false";
      if (!isAtivo) return;
      if (globalProjeto !== "all" && String(n.projeto_id) !== String(globalProjeto)) return;
      const cid = getResolvedNucleoCidade(n);
      if (globalCidade !== "all" && cid.toLowerCase() !== globalCidade.toLowerCase()) return;
      if (globalNucleo !== "all" && String(n.id || n.id_nucleo || n.nucleo_id) !== String(globalNucleo)) return;

      const modName = n.modalidade_nome || (n.modalidade_id && modalidadesCache[Number(n.modalidade_id)]) || n.modalidade || "Não Definida";
      counts[modName] = (counts[modName] || 0) + 1;
    });

    const list = Object.entries(counts).map(([nome, count]) => ({ nome, count }));
    list.sort((a, b) => b.count - a.count);
    return list;
  }, [nucleosList, modalidadesCache, espacosMaps, matCidadeMap, globalProjeto, globalCidade, globalNucleo]);

  // 3. Gráfico Circular: Distribuição de Núcleos por Cidade
  const cidadesChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalAtivos = 0;

    nucleosList.forEach(n => {
      const isAtivo = n.ativo !== false && n.ativo !== 0 && n.ativo !== "0" && n.ativo !== "false";
      if (!isAtivo) return;
      if (globalProjeto !== "all" && String(n.projeto_id) !== String(globalProjeto)) return;

      const cidade = getResolvedNucleoCidade(n);
      if (globalCidade !== "all" && cidade.toLowerCase() !== globalCidade.toLowerCase()) return;
      if (globalNucleo !== "all" && String(n.id || n.id_nucleo || n.nucleo_id) !== String(globalNucleo)) return;

      totalAtivos++;
      counts[cidade] = (counts[cidade] || 0) + 1;
    });

    const list = Object.entries(counts).map(([cidade, count]) => {
      const percent = totalAtivos > 0 ? (count / totalAtivos) * 100 : 0;
      return {
        cidade,
        count,
        percent: Number(percent.toFixed(1))
      };
    });
    list.sort((a, b) => b.count - a.count);
    return { list, totalAtivos };
  }, [nucleosList, espacosMaps, matCidadeMap, globalProjeto, globalCidade, globalNucleo]);

  // 4. Lista de Pendências Operacionais
  const pendenciasGestao = useMemo(() => {
    // Núcleos ativos sem vaga
    const nucleosSemVaga = nucleosList.filter(n => {
      const isAtivo = n.ativo !== false && n.ativo !== 0 && n.ativo !== "0" && n.ativo !== "false";
      if (!isAtivo) return false;
      return n.numero_vaga === null || n.numero_vaga === undefined || String(n.numero_vaga).trim() === "" || String(n.numero_vaga) === "0";
    });

    // Espaços incompletos
    const espacosIncompletos = espacosList.filter(e => {
      const respNome = e.resp_nome || e.respNome;
      const rua = e.rua || e.endereco;
      return !respNome || respNome === "—" || respNome === "temp" || respNome === "x" || !rua || rua === "temp" || rua === "xxxxxxx";
    });

    return {
      nucleosSemVaga,
      espacosIncompletos,
      total: nucleosSemVaga.length + espacosIncompletos.length + propostasComPendencia.length
    };
  }, [nucleosList, espacosList, propostasComPendencia]);

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
      const cid = getResolvedNucleoCidade(n);
      if (globalCidade !== "all" && cid.toLowerCase() !== globalCidade.toLowerCase()) return false;
      if (globalNucleo !== "all" && String(id) !== String(globalNucleo)) return false;

      // Filtros Locais (Tabs)
      if (nucleoFilterStatus === "abertos" && !isAtivo) return false;
      if (nucleoFilterStatus === "pausados" && isAtivo) return false;

      if (nucleoSearchQuery.trim()) {
        const query = nucleoSearchQuery.toLowerCase();
        const matchesNome = nome.toLowerCase().includes(query);
        const matchesCid = cid.toLowerCase().includes(query);
        const modalidade = n.modalidade_nome || n.modalidade || (n.modalidade_id && modalidadesCache[Number(n.modalidade_id)]) || "";
        const matchesMod = modalidade.toLowerCase().includes(query);
        const projetoNome = n.projetos?.nome || n.projeto_nome || n.proposta || (n.projeto_id && projetosCache[Number(n.projeto_id)]) || "";
        const matchesProj = projetoNome.toLowerCase().includes(query);
        if (!matchesNome && !matchesMod && !matchesProj && !matchesCid) return false;
      }

      return true;
    });
  }, [nucleosList, nucleoFilterStatus, nucleoSearchQuery, modalidadesCache, projetosCache, espacosMaps, matCidadeMap, globalProjeto, globalCidade, globalNucleo]);

  // 1. Inicializa Usuário e Papel
  useEffect(() => {
    const savedInst = localStorage.getItem("auth_institute") || "IBRASE";
    const cargo = (localStorage.getItem("auth_cargo") || "Colaborador").toLowerCase().trim();
    const accType = (localStorage.getItem("auth_account_type") || "colaborador").toLowerCase().trim();

    setCurrentInstitute(savedInst);
    setUserRole(cargo);
    setUserAccountType(accType);

    const queryView = searchParams.get("view");
    const activeViewStorage = cargo.includes("master") ? localStorage.getItem("integra_active_view") : null;
    if (queryView === "pedagogico" || queryView === "geral") {
      setActiveView(queryView);
    } else if (activeViewStorage === "pedagogico" || accType === "pedagogico" || cargo.includes("pedagogic") || cargo.includes("pedagógic")) {
      setActiveView("pedagogico");
    } else {
      setActiveView("geral");
    }

    const handleActiveRoleChanged = (e: any) => {
      const newRole = e.detail;
      if (newRole === "pedagogico") {
        setActiveView("pedagogico");
      } else if (newRole === "admin" || newRole === "master") {
        setActiveView("geral");
      }
    };
    window.addEventListener("activeRoleChanged", handleActiveRoleChanged);

    return () => {
      window.removeEventListener("activeRoleChanged", handleActiveRoleChanged);
    };
  }, [searchParams]);

  // 2. Listener de Filtros Globais
  useEffect(() => {
    let timeoutId: any;
    const updateFilters = () => {
      setFilterLoading(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setGlobalProjeto(localStorage.getItem("global_projeto_filter") || "all");
        setGlobalCidade(localStorage.getItem("global_cidade_filter") || "all");
        setGlobalNucleo(localStorage.getItem("global_nucleo_filter") || "all");
        setGlobalTrimestreInicio(localStorage.getItem("global_trimestre_inicio") || "");
        setGlobalTrimestreFim(localStorage.getItem("global_trimestre_fim") || "");
        setFilterLoading(false);
      }, 100);
    };

    // Inicialização sem delay
    setGlobalProjeto(localStorage.getItem("global_projeto_filter") || "all");
    setGlobalCidade(localStorage.getItem("global_cidade_filter") || "all");
    setGlobalNucleo(localStorage.getItem("global_nucleo_filter") || "all");
    setGlobalTrimestreInicio(localStorage.getItem("global_trimestre_inicio") || "");
    setGlobalTrimestreFim(localStorage.getItem("global_trimestre_fim") || "");

    window.addEventListener("globalFilterChanged", updateFilters);
    return () => {
      window.removeEventListener("globalFilterChanged", updateFilters);
      clearTimeout(timeoutId);
    };
  }, []);

  // 3. Busca de Dados de Matrículas e Núcleos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const inst = currentInstitute.toUpperCase();
      
      // SWR Cache Hydration: Renderiza instantaneamente do cache da sessão (0ms)
      try {
        let hasMatriculas = false;
        let hasNucleos = false;
        
        const cached = sessionStorage.getItem(`cache_matriculas_v2_${inst}`);
        if (cached) {
          const parsedCached = JSON.parse(cached);
          if (Array.isArray(parsedCached) && parsedCached.length > 0) {
            setMatriculas(parsedCached);
            hasMatriculas = true;
          }
        }
        
        const cachedProj = sessionStorage.getItem(`cache_projetos_count_${inst}`);
        if (cachedProj) setPropostasCount(Number(cachedProj));
        const cachedProjList = sessionStorage.getItem(`cache_projetos_list_${inst}`);
        if (cachedProjList) {
          try {
            const parsed = JSON.parse(cachedProjList);
            if (Array.isArray(parsed) && parsed.length > 0) setPropostasList(parsed);
          } catch(e) {}
        }

        const cachedEspacos = sessionStorage.getItem(`cache_espacos_count_${inst}`);
        if (cachedEspacos) setEspacosCount(Number(cachedEspacos));
        const cachedEspacosList = safeGetSession<any[]>(`cache_espacos_list_${inst}`) || 
          (() => {
            try {
              const raw = sessionStorage.getItem(`cache_espacos_list_${inst}`);
              return raw ? JSON.parse(raw) : null;
            } catch { return null; }
          })();
        let hasEspacos = false;
        if (cachedEspacosList && Array.isArray(cachedEspacosList) && cachedEspacosList.length > 0) {
          setEspacosList(cachedEspacosList);
          hasEspacos = true;
        }

        const cachedNucleos = sessionStorage.getItem(`cache_nucleos_count_${inst}`);
        if (cachedNucleos) setNucleosCount(Number(cachedNucleos));

        const cachedNucleosList = sessionStorage.getItem(`cache_nucleos_list_${inst}`);
        if (cachedNucleosList) {
          const parsedNucleos = JSON.parse(cachedNucleosList);
          if (Array.isArray(parsedNucleos) && parsedNucleos.length > 0) {
            setNucleosList(parsedNucleos);
            hasNucleos = true;
          }
        }

        // Se tivermos os dados necessários para a visão atual (incluindo espaços para o mapa de cidades), libera a tela
        if (activeView === "geral" ? (hasNucleos && hasPropostas && hasEspacos) : (hasMatriculas && hasNucleos && hasEspacos)) {
          setLoading(false);
        }
      } catch (e) {}
      // AbortController para evitar carregamento infinito
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 segundos timeout

      try {
        const fetchOpts = { cache: "no-store" as RequestCache, signal: controller.signal };
        
        const pNucleos = fetchWithDedupe(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst}`, 15000)
          .then(list => {
            let loadedNucleos: any[] = Array.isArray(list) ? list : [];
            setNucleosList(loadedNucleos);
            setNucleosCount(loadedNucleos.length);
            try { 
              sessionStorage.setItem(`cache_nucleos_count_${inst}`, loadedNucleos.length.toString()); 
              sessionStorage.setItem(`cache_nucleos_list_${inst}`, JSON.stringify(loadedNucleos));
            } catch (e) {}
          }).catch(() => {});

        const pProjetos = fetchWithDedupe(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}`, 15000)
          .then(list => {
            let flatList: any[] = Array.isArray(list) ? list : [];
            const pCache: Record<number, string> = {};
            flatList.forEach((p: any) => {
              if (p.id && (p.nome || p.titulo || p.projeto_nome)) {
                pCache[Number(p.id)] = p.nome || p.titulo || p.projeto_nome;
              }
            });
            setProjetosCache(pCache);
            setPropostasCount(flatList.length);
            setPropostasList(flatList);

            // Calcula pendências detalhadas de propostas para o Foco de Hoje
            const propostasPendentesLocal: { id: string | number, nome: string, campos: string[] }[] = [];
            
            const checks = [
              { key: 'numeroProposta', label: 'Nº Proposta', getValue: (i: any) => i.numero_proposta || i.numeroProposta || i.identificacao?.numeroProposta },
              { key: 'termoFomento', label: 'Termo de Fomento', getValue: (i: any) => i.termo_fomento || i.termoFomento || i.identificacao?.termoFomento },
              { key: 'processoAdm', label: 'Processo Adm', getValue: (i: any) => i.numero_processo_adm || i.numeroProcessoAdm || i.identificacao?.numeroProcessoAdm },
              { key: 'transfereGov', label: 'Transfere.gov', getValue: (i: any) => i.numero_transferegov || i.numeroTransfereGov || i.identificacao?.numeroTransfereGov },
              { key: 'aplicabilidade', label: 'Aplicabilidade', getValue: (i: any) => i.aplicabilidade || i.identificacao?.aplicabilidade },
              { key: 'vigencia', label: 'Início da Vigência', getValue: (i: any) => i.vigencia_inicio || i.vigenciainicio || i.data_inicio_vigencia || i.data_inicio || i.dataInicioVigencia || i.vigencia?.dataInicio || i.vigencia?.inicio }
            ];

            flatList.forEach((item: any) => {
              const isAtivo = item.ativo !== false && item.status !== false && item.status !== "inativo";
              if (!isAtivo) return;

              let camposFaltando: string[] = [];
              
              checks.forEach(check => {
                const val = check.getValue(item);
                if (!val || String(val).trim() === '' || val === '0' || val === 0) {
                  camposFaltando.push(check.label);
                }
              });

              let periodos_count = 0;
              if (Array.isArray(item.periodos) && item.periodos.length > 0) periodos_count = item.periodos.length;
              else if (item.periodos_json) {
                try {
                  const pp = typeof item.periodos_json === 'string' ? JSON.parse(item.periodos_json) : item.periodos_json;
                  if (Array.isArray(pp)) periodos_count = pp.length;
                } catch(e) {}
              }
              if (periodos_count === 0) camposFaltando.push('Períodos');

              let limites_cargos_count = 0;
              if (Array.isArray(item.limites_cargos)) limites_cargos_count = item.limites_cargos.length;
              else if (typeof item.limites_cargos === 'string') {
                try {
                  const lc = JSON.parse(item.limites_cargos);
                  if (Array.isArray(lc)) limites_cargos_count = lc.length;
                } catch(e) {}
              }
              if (limites_cargos_count === 0 && (item.qtd_instrutor || item.limite_auxiliares || item.qtd_coord_geral)) {
                limites_cargos_count = 1; // tem info legacy
              }
              if (limites_cargos_count === 0) camposFaltando.push('Equipe');

              if (camposFaltando.length > 0) {
                propostasPendentesLocal.push({
                  id: item.id || item.id_projeto || item.id_proposta,
                  nome: item.nome || item.titulo || item.projeto_nome || `Proposta #${item.id}`,
                  campos: camposFaltando
                });
              }
            });
            setPropostasComPendencia(propostasPendentesLocal);

            try { 
              sessionStorage.setItem(`cache_projetos_count_${inst}`, flatList.length.toString()); 
              safeSetSession(`cache_projetos_list_${inst}`, flatList);
            } catch (e) {}
          }).catch(() => {});

        const pEspacos = fetchWithDedupe(`https://w.ibrase.com.br/webhook/espacos-get?instituto=${inst}`, 15000)
          .then(list => {
            const arr = Array.isArray(list) ? list : (list?.data || []);
            if (arr.length > 0) {
              setEspacosCount(arr.length);
              safeSetSession(`cache_espacos_count_${inst}`, arr.length.toString());
              // Sanitizar fotos base64 gigantes para manter o Dashboard e o React ultraleves
              const cleanArr = arr.map((item: any) => {
                if (item && item.foto_url && item.foto_url.length > 500) {
                  const { foto_url, ...rest } = item;
                  return rest;
                }
                return item;
              });
              setEspacosList(cleanArr);
              safeSetSession(`cache_espacos_list_${inst}`, cleanArr);
            }
          }).catch(() => {});

        const pMatriculas = fetchWithDedupe(`https://w.ibrase.com.br/webhook/matriculas-get?instituto=${inst}`, 30000)
          .then(list => {
            let flatList: any[] = Array.isArray(list) ? list : [];
            if (flatList.length > 0) {
              setMatriculas(flatList);
              try { safeSetSession(`cache_matriculas_v2_${inst}`, flatList); } catch (e) {}
            }
            setMatriculasFetched(true);
          }).catch(() => {
            setMatriculasFetched(true);
          });

        // Carregar modalidades em background independente
        fetchWithDedupe(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${inst}`, 8000)
          .then(list => {
            let flatList: any[] = Array.isArray(list) ? list : [];
            const modCache: Record<number, string> = {};
            flatList.forEach((m: any) => {
              if (m.id && m.nome) modCache[Number(m.id)] = m.nome;
            });
            setModalidadesCache(modCache);
            try { sessionStorage.setItem(`cache_modalidades_list_${inst}`, JSON.stringify(flatList)); } catch (e) {}
          }).catch(() => {});

        if (activeView === "geral") {
          await Promise.allSettled([pNucleos, pProjetos, pEspacos]);
        } else {
          await Promise.allSettled([pNucleos, pProjetos, pEspacos, pMatriculas]);
        }
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
      const rawName = n.nome || n.nome_nucleo || n.nucleo_nome || n.identificacao?.nomeNucleo || n.espaco_nome || '';
      const cidade = getResolvedNucleoCidade(n);
      const name = (id && rawName && cidade && cidade !== "Outra Localidade") ? `${rawName} (${cidade})` : (rawName || `Núcleo ${id}`);
      if (id && name) {
        map[id] = name;
      }
    });
    return map;
  }, [nucleosList, espacosMaps, matCidadeMap]);

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

      if (globalTrimestreInicio && globalTrimestreFim) {
        const mDateStr = m.created_at || (m as any).criado_em;
        if (!mDateStr) return false;
        const normalizedDateStr = mDateStr.replace(' ', 'T');
        const dataM = new Date(normalizedDateStr);
        let dataInicio = new Date(globalTrimestreInicio);
        let dataFim = new Date(globalTrimestreFim);
        if (dataFim < dataInicio) {
          dataFim.setFullYear(dataFim.getFullYear() + 1);
        }
        dataFim.setHours(23, 59, 59, 999);
        if (dataM < dataInicio || dataM > dataFim) return false;
      }

      return true;
    });
  }, [matriculas, globalProjeto, globalCidade, globalNucleo, globalTrimestreInicio, globalTrimestreFim]);

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

  // Proposta selecionada e metadados contextuais para a Visão Pedagógica
  const selectedPropostaObj = useMemo(() => {
    if (globalProjeto !== "all") {
      return propostasList.find(p => String(p.id) === String(globalProjeto)) || null;
    }
    return null;
  }, [globalProjeto, propostasList]);

  const isEventoProposta = useMemo(() => {
    const aplicabilidade = (selectedPropostaObj?.aplicabilidade || "").toLowerCase();
    return aplicabilidade.includes("evento");
  }, [selectedPropostaObj]);

  const termoPessoa = isEventoProposta ? "participantes" : "alunos";
  const termoPessoaCap = isEventoProposta ? "Participantes" : "Alunos";

  const metaProposta = useMemo(() => {
    if (globalProjeto !== "all") {
      const nucleosDoProj = nucleosList.filter(n => String(n.projeto_id) === String(globalProjeto));
      const sumVagas = nucleosDoProj.reduce((acc, n) => acc + (Number(n.vagas) || 0), 0);
      if (sumVagas > 0) return sumVagas;
      if (selectedPropostaObj?.vagas_nucleo) return Number(selectedPropostaObj.vagas_nucleo) * (nucleosDoProj.length || 1);
    }
    const sumTotalVagas = nucleosList.reduce((acc, n) => acc + (Number(n.vagas) || 0), 0);
    return sumTotalVagas > 0 ? sumTotalVagas : 1000;
  }, [globalProjeto, nucleosList, selectedPropostaObj]);

  // Ranking Horizontal de Núcleos / Bairros
  const nucleosHorizontalStats = useMemo(() => {
    return metrics.nucleosStats
      .filter(n => n.total > 0)
      .map(n => ({
        label: n.nome,
        value: n.total
      }));
  }, [metrics.nucleosStats]);

  // Distribuição de Alunos por Cidade (com normalização de grafias reais)
  const cidadesStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredMatriculas.forEach(m => {
      let raw = (m.cidade || "").trim();
      if (!raw || raw === "—" || raw.toLowerCase() === "null") raw = "Não Informada";
      const cl = raw.toLowerCase();
      let nomeCid = raw;
      if (cl.includes("campos dos goytacazes") || cl === "campos") nomeCid = "Campos dos Goytacazes";
      else if (cl.includes("conceição de macabu") || cl.includes("conceicao de macabu")) nomeCid = "Conceição de Macabu";
      else if (cl.includes("são joão da barra") || cl.includes("sao joao da barra")) nomeCid = "São João da Barra";
      else if (cl.includes("são francisco") || cl.includes("sao francisco")) nomeCid = "São Francisco de Itabapoana";
      else if (cl.includes("rio de janeiro")) nomeCid = "Rio de Janeiro";

      counts[nomeCid] = (counts[nomeCid] || 0) + 1;
    });

    const total = filteredMatriculas.length;
    const sorted = Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        percent: total > 0 ? Math.round((value / total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);

    if (sorted.length > 5) {
      const top4 = sorted.slice(0, 4);
      const rest = sorted.slice(4);
      const restVal = rest.reduce((acc, c) => acc + c.value, 0);
      return [
        ...top4,
        {
          label: "Outras",
          value: restVal,
          percent: total > 0 ? Math.round((restVal / total) * 100) : 0
        }
      ];
    }

    return sorted;
  }, [filteredMatriculas]);

  // Relatório de Captação Temporal (Diário, Mensal, Anual) baseado nos registros reais
  const timelineData = useMemo(() => {
    const buckets: Record<string, number> = {};
    const totalReal = filteredMatriculas.length;

    filteredMatriculas.forEach(m => {
      const dateStr = m.created_at || (m as any).criado_em;
      if (!dateStr) return;
      const d = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) return;

      if (captacaoPeriodo === "diario") {
        const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
        buckets[key] = (buckets[key] || 0) + 1;
      } else if (captacaoPeriodo === "mensal") {
        const y = d.getFullYear();
        const mIdx = d.getMonth();
        const key = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
        buckets[key] = (buckets[key] || 0) + 1;
      } else {
        const y = String(d.getFullYear());
        buckets[y] = (buckets[y] || 0) + 1;
      }
    });

    const sortedKeys = Object.keys(buckets).sort();
    let displayKeys = sortedKeys;
    if (captacaoPeriodo === "diario") {
      // Exatamente os últimos 7 dias registrados
      displayKeys = sortedKeys.slice(-7);
    }

    const items = displayKeys.map(k => {
      let label = k;
      if (captacaoPeriodo === "diario") {
        const parts = k.split("-");
        if (parts.length === 3) label = `${parts[2]}/${parts[1]}`;
      } else if (captacaoPeriodo === "mensal") {
        const parts = k.split("-");
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        if (parts.length === 2) {
          const idx = parseInt(parts[1], 10) - 1;
          label = `${meses[idx] || parts[1]}/${parts[0].slice(2)}`;
        }
      }
      return {
        label,
        value: buckets[k] || 0
      };
    });

    const totalPeriodo = items.reduce((acc, cur) => acc + cur.value, 0);

    return {
      items,
      totalPeriodo
    };
  }, [filteredMatriculas, captacaoPeriodo]);

  // Características do Público (Filtrado por Gênero para os 4 Mini Donuts)
  const perfilStats = useMemo(() => {
    const list = filteredMatriculas.filter(m => {
      if (generoPerfilFilter === "todos") return true;
      const sx = (m.sexo || "").toLowerCase().trim();
      if (generoPerfilFilter === "masculino") return sx.startsWith("m") || sx === "masculino";
      if (generoPerfilFilter === "feminino") return sx.startsWith("f") || sx === "feminino";
      return true;
    });

    // Camisas
    const camisasMap: Record<string, number> = {};
    const bermudasMap: Record<string, number> = {};
    const calcadosMap: Record<string, number> = {
      "26 a 34": 0,
      "35 a 38": 0,
      "39 a 42": 0,
      "43+": 0
    };
    let totalCalcados = 0;

    const idadesMap: Record<string, number> = {
      "6 a 10 anos": 0,
      "11 a 14 anos": 0,
      "15 a 18 anos": 0,
      "19+ anos": 0
    };
    let totalIdades = 0;

    list.forEach(m => {
      const cam = (m.tamanho_camisa || "").trim().toUpperCase();
      if (cam && cam !== "NÃO INFORMADO" && cam !== "NAO INFORMADO" && cam !== "—" && cam !== "NULL") {
        camisasMap[cam] = (camisasMap[cam] || 0) + 1;
      }
      const cal = (m.tamanho_calca || "").trim().toUpperCase();
      if (cal && cal !== "NÃO INFORMADO" && cal !== "NAO INFORMADO" && cal !== "—" && cal !== "NULL") {
        bermudasMap[cal] = (bermudasMap[cal] || 0) + 1;
      }
      const calcRaw = m.tamanho_calcado ? String(m.tamanho_calcado).trim() : "";
      if (calcRaw && !isNaN(Number(calcRaw))) {
        const n = Number(calcRaw);
        totalCalcados++;
        if (n <= 34) calcadosMap["26 a 34"]++;
        else if (n <= 38) calcadosMap["35 a 38"]++;
        else if (n <= 42) calcadosMap["39 a 42"]++;
        else calcadosMap["43+"]++;
      }
      const idade = Number(m.idade);
      if (idade && idade > 0) {
        totalIdades++;
        if (idade <= 10) idadesMap["6 a 10 anos"]++;
        else if (idade <= 14) idadesMap["11 a 14 anos"]++;
        else if (idade <= 18) idadesMap["15 a 18 anos"]++;
        else idadesMap["19+ anos"]++;
      }
    });

    const toTop4Slices = (map: Record<string, number>) => {
      const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
      const sum = sorted.reduce((acc, cur) => acc + cur[1], 0);
      if (sum === 0) return [];
      const top3 = sorted.slice(0, 3);
      const rest = sorted.slice(3).reduce((acc, cur) => acc + cur[1], 0);
      const res = top3.map(([k, v]) => ({
        label: k,
        count: v,
        percent: Math.round((v / sum) * 100)
      }));
      if (rest > 0) {
        res.push({
          label: "Outros",
          count: rest,
          percent: Math.round((rest / sum) * 100)
        });
      }
      return res;
    };

    const camisas = toTop4Slices(camisasMap);
    const bermudas = toTop4Slices(bermudasMap);

    const calcados = Object.entries(calcadosMap).map(([label, count]) => ({
      label,
      count,
      percent: totalCalcados > 0 ? Math.round((count / totalCalcados) * 100) : 0
    }));

    const faixas = Object.entries(idadesMap).map(([label, count]) => ({
      label,
      count,
      percent: totalIdades > 0 ? Math.round((count / totalIdades) * 100) : 0
    }));

    return {
      camisas,
      bermudas,
      calcados,
      faixas,
      total: list.length
    };
  }, [filteredMatriculas, generoPerfilFilter]);

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
      
      const res = await fetch(`https://w.ibrase.com.br/webhook/nucleos-put?instituto=${currentInstitute.toUpperCase()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id || item.id_nucleo || item.nucleo_id,
          nome: item.nome || item.nome_nucleo,
          nomeNucleo: item.nome || item.nome_nucleo,
          projeto_id: item.projeto_id ? Number(item.projeto_id) : null,
          projetoId: item.projeto_id ? Number(item.projeto_id) : null,
          espaco_id: item.espaco_id ? Number(item.espaco_id) : null,
          espacoId: item.espaco_id ? Number(item.espaco_id) : null,
          modalidade_id: item.modalidade_id ? Number(item.modalidade_id) : null,
          modalidadeId: item.modalidade_id ? Number(item.modalidade_id) : null,
          bairro_id: item.bairro_id ? Number(item.bairro_id) : null,
          bairroId: item.bairro_id ? Number(item.bairro_id) : null,
          bairro: item.bairro || "",
          numero_vaga: (item.numero_vaga && item.numero_vaga !== "—") ? Number(item.numero_vaga) : null,
          numeroVaga: (item.numero_vaga && item.numero_vaga !== "—") ? Number(item.numero_vaga) : null,
          vagas: item.vagas ? Number(item.vagas) : 100,
          ativo: novoEstado,
          aceitando_vagas: novoEstado,
          instrutor: (item.instrutor && item.instrutor !== "—") ? item.instrutor : null,
          instituto: currentInstitute.toUpperCase()
        })
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
        (loading || filterLoading || (!matriculasFetched && matriculas.length === 0)) ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 font-sans select-none w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PieIcon className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-base font-bold text-slate-700 dark:text-slate-200">Carregando painel pedagógico...</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Consolidando alunos, turmas e distribuições</p>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>

            {/* Skeleton preview simulando o painel */}
            <div className="w-full space-y-4 px-2 mt-4 animate-pulse max-w-5xl mx-auto">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-20 w-full opacity-80" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-32 w-full" style={{ opacity: 1 - i * 0.15 }} />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-64 w-full opacity-60" />
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-64 w-full opacity-40" />
              </div>
            </div>
          </div>
        ) : (
        <div className="space-y-6">


          {/* 1. CABEÇALHO & CONTEXTO DA PROPOSTA (Inspirado no Painel Pedagógico da Referência) */}
          <MotionSection delayClass="motion-stagger-1">
            <div className="space-y-4">
              {/* Breadcrumb & Título de Boas-vindas */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Início</Link>
                    <ChevronRight size={13} />
                    <span className="text-slate-700 dark:text-slate-300">Pedagógico</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                    <span>Seja bem-vindo!</span>
                    <span className="text-lg">👋</span>
                  </h1>
                  {selectedPropostaObj ? (
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                      A proposta que você selecionou é{" "}
                      <strong className="text-blue-600 dark:text-blue-400 font-extrabold">
                        {selectedPropostaObj.nome}
                      </strong>
                      {selectedPropostaObj.aplicabilidade ? ` (${selectedPropostaObj.aplicabilidade})` : ""}. Para mudar, utilize os filtros acima.
                    </p>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                      Você está visualizando <strong className="text-blue-600 dark:text-blue-400 font-extrabold">todas as propostas consolidadas</strong>. Para filtrar por uma proposta específica, utilize os filtros acima.
                    </p>
                  )}
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

              {/* Banner Informativo: Participantes vs Alunos */}
              <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Info size={17} />
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p>
                    <strong className="font-extrabold text-blue-950 dark:text-blue-200">Participantes:</strong> Pessoas alcançadas em eventos pontuais, sem cadastro formal ou frequência contínua (ex: oficinas, palestras e ações comunitárias).
                  </p>
                  <p>
                    <strong className="font-extrabold text-blue-950 dark:text-blue-200">Alunos:</strong> Pessoas formalmente matriculadas e acompanhadas com frequência contínua nas turmas do projeto.
                  </p>
                </div>
              </div>
            </div>
          </MotionSection>

          {/* 2. LINHA SUPERIOR: ALUNOS DA PROPOSTA COM METAS (ESQUERDA) + DISTRIBUIÇÃO POR CIDADE (DIREITA) */}
          <MotionSection delayClass="motion-stagger-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Card Esquerda (7 cols): Horizontal Bar Chart com Meta */}
              <div className="lg:col-span-7">
                <PedagogicoHorizontalBarChart
                  titulo={
                    selectedPropostaObj
                      ? `${termoPessoaCap} do Projeto ${selectedPropostaObj.nome}`
                      : `${termoPessoaCap} — Todas as Propostas (${currentInstitute})`
                  }
                  total={metrics.total}
                  meta={metaProposta}
                  termoPessoa={termoPessoa}
                  items={nucleosHorizontalStats}
                  propostaSelecionada={!!selectedPropostaObj}
                />
              </div>

              {/* Card Direita (5 cols): Donut de Distribuição por Cidade */}
              <div className="lg:col-span-5">
                <PedagogicoCityDonut
                  items={cidadesStats}
                  total={metrics.total}
                  termoPessoa={termoPessoa}
                />
              </div>
            </div>
          </MotionSection>

          {/* 3. RELATÓRIO DE CAPTAÇÃO (LINHA / ÁREA TEMPORAL) */}
          <MotionSection delayClass="motion-stagger-2">
            <PedagogicoTimelineLineChart
              items={timelineData.items}
              totalPeriodo={timelineData.totalPeriodo}
              periodo={captacaoPeriodo}
              onPeriodoChange={setCaptacaoPeriodo}
              termoPessoa={termoPessoa}
            />
          </MotionSection>

          {/* 4. CARACTERÍSTICAS DO PÚBLICO (FILTRO DE GÊNERO + 4 MINI DONUTS) */}
          <MotionSection delayClass="motion-stagger-3">
            <div className="space-y-4">
              {/* Header com Filtros de Gênero */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Users size={17} className="text-blue-600 dark:text-blue-400" />
                    <span>Características do Público</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Distribuição proporcional de tamanhos de uniformes e faixas etárias dos {termoPessoa}.
                  </p>
                </div>

                {/* Filtro de Gênero */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold self-start sm:self-auto">
                  {(["todos", "feminino", "masculino"] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGeneroPerfilFilter(g)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                        generoPerfilFilter === g
                          ? "bg-blue-600 text-white shadow-2xs font-extrabold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {g === "todos" ? "Todos" : g === "feminino" ? "Feminino" : "Masculino"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Donut Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Camisa (Pink) */}
                <PedagogicoMiniDonut
                  title="Tamanhos de camisa"
                  items={perfilStats.camisas}
                  palette={["#e11d48", "#f43f5e", "#fb7185", "#fda4af"]}
                />

                {/* 2. Bermuda (Blue) */}
                <PedagogicoMiniDonut
                  title="Tamanhos de bermuda"
                  items={perfilStats.bermudas}
                  palette={["#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc"]}
                />

                {/* 3. Calçado (Purple) */}
                <PedagogicoMiniDonut
                  title="Tamanhos de calçado"
                  items={perfilStats.calcados}
                  palette={["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"]}
                />

                {/* 4. Faixa Etária (Green) */}
                <PedagogicoMiniDonut
                  title="Faixa etária"
                  items={perfilStats.faixas}
                  palette={["#059669", "#10b981", "#34d399", "#6ee7b7"]}
                />
              </div>
            </div>
          </MotionSection>

          {/* 5. PROPORÇÃO DE GÊNERO CONSOLIDADA */}
          <MotionSection delayClass="motion-stagger-3">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
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
                    {loading && metrics.total === 0 ? "..." : metrics.total.toLocaleString("pt-BR")} alunos
                  </span>
                </div>

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
          )
        ) : (
        /* ========================================================================= */
        /* VISÃO GESTÃO (Vagas Disponíveis, Gráficos de Modalidades e Cidades, Pendências) */
        /* ========================================================================= */
        <div className="space-y-6">

          {/* 1. CARD HERO DE VAGAS DE NÚCLEO DISPONÍVEIS & OBSERVAÇÃO SISTÊMICA */}
          <MotionSection delayClass="motion-stagger-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Destaque Numérico de Vagas - Tamanho Harmonioso e Confortável */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center shrink-0">
                    <Target size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Capacidade de Núcleos
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
                        Vagas de Núcleo disponíveis:
                      </span>
                      {loading || filterLoading ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs border border-slate-200/80 dark:border-slate-700">
                          <Loader2 size={13} className="animate-spin text-[var(--theme-primary)]" />
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Carregando...</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-[var(--theme-primary)]/15 text-[var(--theme-primary)] font-black text-base sm:text-lg">
                          {vagasNucleoStats.disponiveis}
                        </span>
                      )}

                      {/* Botão de Ajuda "?" com Modal/Popover de Modalidades Disponíveis */}
                      <div className="relative inline-flex items-center">
                        <button
                          type="button"
                          onClick={() => setVagasModalidadeOpen(!vagasModalidadeOpen)}
                          className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[var(--theme-primary)] hover:text-white text-slate-500 dark:text-slate-400 text-xs font-black flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                          title="Ver modalidades com vagas disponíveis"
                        >
                          ?
                        </button>

                        {vagasModalidadeOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setVagasModalidadeOpen(false)} />
                            <div 
                              className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 sm:w-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                            >
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)]" />
                                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    Vagas por Modalidade
                                  </h4>
                                </div>
                                <span className="text-[10px] font-black bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] px-2 py-0.5 rounded-full">
                                  {vagasNucleoStats.disponiveis} {vagasNucleoStats.disponiveis === 1 ? 'livre' : 'livres'}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">
                                Modalidades com cotas oficiais disponíveis para abertura de núcleos:
                              </p>

                              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                {vagasNucleoStats.modalidadesDisponiveis.length === 0 ? (
                                  <p className="text-xs text-slate-400 text-center py-4 font-semibold">
                                    Nenhuma vaga de modalidade encontrada.
                                  </p>
                                ) : (
                                  vagasNucleoStats.modalidadesDisponiveis.map((mod, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                        mod.disponiveis > 0 
                                          ? "bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80" 
                                          : "bg-slate-50/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60"
                                      }`}
                                    >
                                      <div className="min-w-0 pr-2">
                                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                                          {mod.nome}
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                          {mod.ocupadas} de {mod.total} núcleos alocados
                                        </span>
                                      </div>
                                      <div className="shrink-0">
                                        {mod.disponiveis > 0 ? (
                                          <span className="inline-flex items-center gap-1 font-black text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-lg">
                                            {mod.disponiveis} {mod.disponiveis === 1 ? 'vaga' : 'vagas'}
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                            Esgotado
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões Rápidos */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <Link
                    to="/admin/nucleos"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[var(--theme-primary)] hover:opacity-90 text-white font-extrabold px-3.5 py-2 rounded-xl shadow-xs transition-all text-xs tracking-wide"
                  >
                    <Building2 size={14} />
                    <span>Gerenciar Núcleos</span>
                    <ArrowRight size={12} />
                  </Link>

                  <Link
                    to="/admin/espacos"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-all text-xs"
                  >
                    <Home size={14} />
                    <span>Ver Espaços</span>
                  </Link>
                </div>
              </div>

              {/* Observação Suave e Discreta */}
              <div className="bg-slate-50/80 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed shadow-2xs">
                <Info size={14} className="text-[var(--theme-primary)] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-800 dark:text-slate-100 font-bold">Lembrete:</strong> Cada núcleo criado ocupa 1 vaga oficial no sistema, orientando todos os setores.
                </p>
              </div>
            </div>
          </MotionSection>

          {/* 2. GRID DE 2 COLUNAS: GRÁFICO DE MODALIDADES (BARRAS) & GRÁFICO DE CIDADES (CIRCULAR) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Gráfico 01: Quantidade de núcleos em cada modalidade (Barras Verticais + Slider) */}
            <MotionSection delayClass="motion-stagger-2" className="h-full">
              <div className="h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
                <div>
                  {/* Cabeçalho com Setinhas de Deslizar e Destaque no Hover */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="min-w-0 flex-1 pr-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="text-[var(--theme-primary)]" size={18} />
                        <span>Quantidade de núcleos em cada modalidade</span>
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 min-h-[20px]">
                        {hoveredModIdx !== null && modalidadesChartData[hoveredModIdx] ? (
                          <span className="text-xs font-black text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 px-2 py-0.5 rounded-md animate-in fade-in duration-150">
                            {modalidadesChartData[hoveredModIdx].nome}: <strong>{modalidadesChartData[hoveredModIdx].count} {modalidadesChartData[hoveredModIdx].count === 1 ? 'núcleo' : 'núcleos'}</strong>
                          </span>
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            Distribuição das unidades ativas por modalidade esportiva
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Controles de Navegação Horizontal */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => scrollModalidades('left')}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                        title="Deslizar modalidades para esquerda"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => scrollModalidades('right')}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                        title="Deslizar modalidades para direita"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Renderização do Gráfico de Barras com Escala no Eixo Y */}
                  {loading || filterLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
                      <div className="relative flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-[var(--theme-primary)] animate-spin" />
                        <Layers size={16} className="absolute text-[var(--theme-primary)]" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
                        Carregando distribuição de modalidades...
                      </p>
                    </div>
                  ) : modalidadesChartData.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs font-semibold">
                      Nenhuma modalidade com núcleos ativos encontrada.
                    </div>
                  ) : (() => {
                    const maxCount = Math.max(...modalidadesChartData.map(d => d.count), 1);
                    const step = maxCount <= 6 ? 2 : maxCount <= 12 ? 3 : maxCount <= 20 ? 4 : maxCount <= 35 ? 5 : 10;
                    const maxScale = Math.ceil(maxCount / step) * step;
                    const yTicks: number[] = [];
                    for (let i = maxScale; i >= 0; i -= step) {
                      yTicks.push(i);
                    }

                    return (
                      <div className="flex h-64 gap-2 pt-6">
                        {/* Eixo Y com Escala Numérica */}
                        <div className="flex flex-col justify-between text-right text-[11px] font-bold text-slate-400 dark:text-slate-500 pr-2 select-none shrink-0 w-7 h-[175px]">
                          {yTicks.map(tick => (
                            <span key={tick}>{tick}</span>
                          ))}
                        </div>

                        {/* Área das Barras com Rolagem Horizontal */}
                        <div className="relative flex-1 h-[215px]">
                          {/* Linhas de Grade de Fundo */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none h-[175px]">
                            {yTicks.map(tick => (
                              <div key={tick} className="w-full border-b border-slate-100 dark:border-slate-800/80" />
                            ))}
                          </div>

                          {/* Barras Roláveis Estilizadas */}
                          <div
                            ref={modalidadesCarouselRef}
                            className="relative z-10 flex items-end gap-3.5 sm:gap-4 overflow-x-auto pb-4 h-full custom-scrollbar scroll-smooth pl-2 pr-4"
                          >
                            {modalidadesChartData.map((item, idx) => {
                              const heightPercent = maxScale > 0 ? (item.count / maxScale) * 100 : 0;
                              const isHovered = hoveredModIdx === idx;
                              const isOtherHovered = hoveredModIdx !== null && hoveredModIdx !== idx;

                              return (
                                <div
                                  key={idx}
                                  onMouseEnter={() => setHoveredModIdx(idx)}
                                  onMouseLeave={() => setHoveredModIdx(null)}
                                  className={`flex flex-col items-center shrink-0 w-16 sm:w-20 group cursor-pointer transition-all duration-200 ${
                                    isOtherHovered ? "opacity-35" : "opacity-100"
                                  }`}
                                >
                                  {/* Quantidade no Topo - Sempre visível e nítida */}
                                  <span className={`text-xs font-black mb-1.5 transition-all ${isHovered ? "text-[var(--theme-primary)] scale-125" : "text-slate-700 dark:text-slate-300"}`}>
                                    {item.count}
                                  </span>

                                  {/* Barra Vertical sem caixas cinzas pesadas */}
                                  <div className="w-9 sm:w-11 h-[175px] flex items-end justify-center">
                                    <div
                                      className="w-full rounded-t-lg transition-all duration-300 shadow-xs"
                                      style={{
                                        height: `${Math.max(6, heightPercent)}%`,
                                        backgroundColor: "var(--theme-primary)",
                                        filter: isHovered ? "brightness(1.15) drop-shadow(0 0 6px var(--theme-primary))" : "none",
                                        transform: isHovered ? "scaleY(1.02)" : "scaleY(1)",
                                        transformOrigin: "bottom"
                                      }}
                                    />
                                  </div>

                                  {/* Nome da Modalidade */}
                                  <span
                                    className={`text-[11px] font-extrabold mt-2 text-center line-clamp-2 leading-tight transition-colors ${
                                      isHovered ? "text-[var(--theme-primary)]" : "text-slate-600 dark:text-slate-300"
                                    }`}
                                    title={item.nome}
                                  >
                                    {item.nome}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </MotionSection>

            {/* Gráfico 02: Distribuição dos núcleos entre as cidades de atendimento (Circular / Donut) */}
            <MotionSection delayClass="motion-stagger-3" className="h-full">
              <div className="h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
                <div>
                  <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <PieIcon className="text-emerald-600 dark:text-emerald-400" size={18} />
                        <span>Distribuição dos núcleos entre as cidades de atendimento</span>
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                        Presença territorial e cobertura por município
                      </p>
                    </div>
                    {cidadesChartData.list.length > 0 && (
                      <span className="shrink-0 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {cidadesChartData.list.length} {cidadesChartData.list.length === 1 ? 'Cidade Atendida' : 'Cidades Atendidas'}
                      </span>
                    )}
                  </div>

                  {loading || filterLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
                      <div className="relative flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-emerald-500 animate-spin" />
                        <PieIcon size={16} className="absolute text-emerald-500" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
                        Carregando cidades de atendimento...
                      </p>
                    </div>
                  ) : cidadesChartData.list.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs font-semibold">
                      Nenhuma cidade com núcleos ativos registrada.
                    </div>
                  ) : (() => {
                    const circumference = 2 * Math.PI * 38; // ~238.76
                    let cumulativePercent = 0;

                    return (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
                        {/* Donut Chart SVG */}
                        <div className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            {/* Fundo do Donut */}
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              className="text-slate-100 dark:text-slate-800"
                              strokeWidth="11"
                              stroke="currentColor"
                              fill="transparent"
                            />

                            {/* Fatias das Cidades com Destaque Hover & Opacidade Reduzida */}
                            {cidadesChartData.list.map((item, idx) => {
                              const percent = item.percent;
                              const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
                              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                              cumulativePercent += percent;

                              const isHovered = hoveredCityIdx === idx;
                              const isOtherHovered = hoveredCityIdx !== null && hoveredCityIdx !== idx;
                              const color = CITY_PALETTE[idx % CITY_PALETTE.length];

                              return (
                                <circle
                                  key={idx}
                                  cx="50"
                                  cy="50"
                                  r="38"
                                  stroke={color}
                                  strokeWidth={isHovered ? 15 : 11}
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  fill="transparent"
                                  onMouseEnter={() => setHoveredCityIdx(idx)}
                                  onMouseLeave={() => setHoveredCityIdx(null)}
                                  style={{
                                    transition: "stroke-width 0.25s ease, opacity 0.25s ease, filter 0.25s ease",
                                    filter: isHovered ? `drop-shadow(0 0 6px ${color})` : "none",
                                    opacity: isOtherHovered ? 0.35 : 1,
                                    cursor: "pointer"
                                  }}
                                />
                              );
                            })}
                          </svg>

                          {/* Centro do Gráfico Circular */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none transition-all duration-200">
                            {hoveredCityIdx !== null && cidadesChartData.list[hoveredCityIdx] ? (
                              <div className="animate-in fade-in zoom-in duration-150 px-2">
                                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none block">
                                  {cidadesChartData.list[hoveredCityIdx].count}
                                </span>
                                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 block mt-1">
                                  {cidadesChartData.list[hoveredCityIdx].percent}%
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block truncate max-w-[90px] mt-0.5">
                                  {cidadesChartData.list[hoveredCityIdx].cidade}
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none block">
                                  {cidadesChartData.list.length}
                                </span>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mt-1">
                                  {cidadesChartData.list.length === 1 ? 'Cidade' : 'Cidades'}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                                  ({cidadesChartData.totalAtivos} {cidadesChartData.totalAtivos === 1 ? 'núcleo' : 'núcleos'})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Legenda Lateral com Bolinhas Coloridas & Interatividade */}
                        <div className="w-full sm:flex-1 space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                          {cidadesChartData.list.map((item, idx) => {
                            const color = CITY_PALETTE[idx % CITY_PALETTE.length];
                            const isHovered = hoveredCityIdx === idx;
                            const isOtherHovered = hoveredCityIdx !== null && hoveredCityIdx !== idx;

                            return (
                              <div
                                key={idx}
                                onMouseEnter={() => setHoveredCityIdx(idx)}
                                onMouseLeave={() => setHoveredCityIdx(null)}
                                className={`flex items-center justify-between gap-2 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                                  isHovered
                                    ? "bg-slate-100 dark:bg-slate-800 scale-[1.02]"
                                    : isOtherHovered
                                    ? "opacity-50 hover:opacity-80"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
                                    style={{
                                      backgroundColor: color,
                                      transform: isHovered ? "scale(1.4)" : "scale(1)"
                                    }}
                                  />
                                  <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                                    {item.cidade}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                                  <span className="font-black text-slate-800 dark:text-slate-100">{item.count}</span>
                                  <span>({item.percent}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </MotionSection>

          </div>

          {/* 3. SEÇÃO INFERIOR: PENDÊNCIAS & ATENÇÃO OPERACIONAL */}
          <MotionSection delayClass="motion-stagger-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 lg:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" size={20} />
                    <span>Pendências & Atenção Operacional</span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Itens que necessitam de preenchimento ou confirmação para operação plena
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {pendenciasGestao.total} {pendenciasGestao.total === 1 ? "Pendência" : "Pendências"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Coluna 1: Núcleos Sem Vaga Oficial */}
                <div className="bg-slate-50/70 dark:bg-slate-850/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building2 size={14} className="text-blue-600 dark:text-blue-400" />
                        Núcleos sem Vaga Atribuída
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                        pendenciasGestao.nucleosSemVaga.length > 0
                          ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
                          : "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300"
                      }`}>
                        {pendenciasGestao.nucleosSemVaga.length}
                      </span>
                    </div>

                    {pendenciasGestao.nucleosSemVaga.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium py-4 text-center">
                        Todos os núcleos ativos possuem vagas vinculadas.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {pendenciasGestao.nucleosSemVaga.map(n => (
                          <div key={n.id} className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                              {n.nome || `Núcleo #${n.id}`}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate mt-0.5">
                              {getResolvedNucleoCidade(n)} • {n.modalidade_nome || "Modalidade a definir"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to="/admin/nucleos"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-2xs transition-all"
                  >
                    <span>Configurar Vagas nos Núcleos</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Coluna 2: Espaços Incompletos */}
                <div className="bg-slate-50/70 dark:bg-slate-850/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Home size={14} className="text-violet-600 dark:text-violet-400" />
                        Espaços Físicos Incompletos
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                        pendenciasGestao.espacosIncompletos.length > 0
                          ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
                          : "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300"
                      }`}>
                        {pendenciasGestao.espacosIncompletos.length}
                      </span>
                    </div>

                    {pendenciasGestao.espacosIncompletos.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium py-4 text-center">
                        Todos os espaços físicos estão devidamente documentados.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {pendenciasGestao.espacosIncompletos.slice(0, 8).map(e => (
                          <div key={e.id} className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                              {e.nome || `Espaço #${e.id}`}
                            </span>
                            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium block truncate mt-0.5">
                              Dados ou termo de uso pendentes
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to="/admin/espacos"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs shadow-2xs transition-all"
                  >
                    <span>Completar Cadastros de Espaço</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Coluna 3: Propostas com Pendências Cadastrais */}
                <div className="bg-slate-50/70 dark:bg-slate-850/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-emerald-600 dark:text-emerald-400" />
                        Propostas / Termos de Fomento
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                        propostasComPendencia.length > 0
                          ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
                          : "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300"
                      }`}>
                        {propostasComPendencia.length}
                      </span>
                    </div>

                    {propostasComPendencia.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium py-4 text-center">
                        Todas as propostas estão completas e validadas.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {propostasComPendencia.map(p => (
                          <div key={p.id} className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 block truncate">
                              {p.nome}
                            </span>
                            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium block truncate mt-0.5">
                              Faltam: {p.campos.slice(0, 3).join(", ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to="/admin/propostas"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-extrabold text-xs shadow-2xs transition-all"
                  >
                    <span>Editar Propostas</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

              </div>
            </div>
          </MotionSection>

          {/* 4. CARD INSPIRACIONAL: NOSSO IMPACTO (Frase Rotativa Diária) */}
          {!loading && matriculas.length > 0 && (
            <MotionSection delayClass="motion-stagger-5">
              <div className="bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-amber-50/40 dark:from-rose-950/20 dark:via-pink-950/20 dark:to-amber-950/10 border border-rose-200/60 dark:border-rose-900/40 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xs text-rose-500 shrink-0 border border-rose-100 dark:border-rose-900/30">
                  <Heart className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-[11px] font-black text-rose-900 dark:text-rose-200 uppercase tracking-widest">
                      Nosso Impacto Coletivo
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                      Inspiração do Dia
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-rose-950 dark:text-rose-100 leading-relaxed">
                    {currentImpactPhrase}
                  </p>
                </div>
              </div>
            </MotionSection>
          )}

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
