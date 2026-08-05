import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';

export const FilterCard = () => {
  const [projeto, setProjeto] = useState('Todos');
  const [dataInicial, setDataInicial] = useState('2026-06-21');
  const [dataFinal, setDataFinal] = useState('2026-07-20');

  // Referências para acionar o datepicker ao clicar no container ou ícone
  const inputInicialRef = useRef(null);
  const inputFinalRef = useRef(null);

  // Formata YYYY-MM-DD para DD/MM/YYYY no texto da direita
  const formatarDataBR = (dataString) => {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const handleOpenPicker = (ref) => {
    if (ref.current && typeof ref.current.showPicker === 'function') {
      ref.current.showPicker();
    } else if (ref.current) {
      ref.current.focus();
    }
  };

  const handleAplicar = () => {
    console.log('Filtros aplicados:', { projeto, dataInicial, dataFinal });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 w-full select-none">
      
      {/* Badge Visão Master */}
      <div className="mb-3">
        <span className="bg-[#a855f7] text-white text-[11px] font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
          VISÃO MASTER — ACESSO TOTAL
        </span>
      </div>

      {/* Título & Subtítulo */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Visão completa. Clique nos gráficos para detalhar registros.
        </p>
      </div>

      {/* Controles do Filtro */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        
        <div className="flex flex-wrap items-end gap-3 sm:gap-4 flex-1">
          
          {/* Select de Projeto */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-700">Projeto</label>
            <select
              value={projeto}
              onChange={(e) => setProjeto(e.target.value)}
              className="h-10 border border-slate-200 rounded-xl px-3 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 min-w-[160px] cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Projeto A">Projeto A</option>
              <option value="Projeto B">Projeto B</option>
            </select>
          </div>

          {/* Campo Data Inicial */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-700">Data inicial</label>
            <div 
              onClick={() => handleOpenPicker(inputInicialRef)}
              className="h-10 border border-slate-200 rounded-xl px-3 bg-white flex items-center justify-between gap-2 min-w-[180px] cursor-pointer hover:border-blue-400 transition-colors"
            >
              <input
                ref={inputInicialRef}
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="w-full text-sm text-slate-700 font-medium bg-transparent border-none focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
              />
              <Calendar size={18} className="text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Campo Data Final */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-700">Data final</label>
            <div 
              onClick={() => handleOpenPicker(inputFinalRef)}
              className="h-10 border border-slate-200 rounded-xl px-3 bg-white flex items-center justify-between gap-2 min-w-[180px] cursor-pointer hover:border-blue-400 transition-colors"
            >
              <input
                ref={inputFinalRef}
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className="w-full text-sm text-slate-700 font-medium bg-transparent border-none focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
              />
              <Calendar size={18} className="text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
            <button
              onClick={handleAplicar}
              className="h-10 bg-[#1d4ed8] hover:bg-blue-700 text-white font-bold text-sm px-6 rounded-xl shadow-sm transition-colors w-full sm:w-auto"
            >
              Aplicar
            </button>

            <button className="h-10 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 rounded-xl transition-colors whitespace-nowrap w-full sm:w-auto">
              Últimos 30 dias
            </button>
          </div>

        </div>

        {/* Resumo do Período Formatado à Direita */}
        <div className="text-right text-sm font-bold text-slate-700 shrink-0 hidden lg:block pb-2">
          {formatarDataBR(dataInicial)} → {formatarDataBR(dataFinal)}
        </div>

      </div>

    </div>
  );
}