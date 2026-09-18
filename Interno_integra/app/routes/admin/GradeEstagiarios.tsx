import React, { useState, useEffect } from 'react';
import { Printer, Trash2, ChevronLeft, Save } from 'lucide-react';
import { Link } from 'react-router';
import { CargoSelectionModal } from '../../components/CargoSelectionModal';
interface GradeTime {
  start: string;
  end: string;
}

interface GradeColumn {
  id: string;
  title: string;
  segunda: GradeTime;
  terca: GradeTime;
  quarta: GradeTime;
  quinta: GradeTime;
  sexta: GradeTime;
  sabado: GradeTime;
  cargaHoraria: string;
}

const DIAS_SEMANA = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'] as const;

export default function GradeEstagiarios() {
  const [institute, setInstitute] = useState('IBRASE');
  const [cargosDisponiveis, setCargosDisponiveis] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [columns, setColumns] = useState<GradeColumn[]>([]);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [projetoName, setProjetoName] = useState('');
  const [termoFomento, setTermoFomento] = useState('');
  const [selectedProjetoId, setSelectedProjetoId] = useState('');
  
  const [observacoes, setObservacoes] = useState("• Caso seja necessário mudar os dias de prestação de serviço, envie a proposta de mudança para a Presidência.\n• Em demandas especiais, o remanejo de horários poderá ser feito desde que seja acordado previamente.\n• Os horários contemplam o atendimento nos turnos matutino (manhã), vespertino (tarde) e noturno (noite).");
  const [assinatura, setAssinatura] = useState("_____/_____/_________");
  const [isSaving, setIsSaving] = useState(false);

  const flattenResponse = (data: any): any[] => {
    if (!data) return [];
    let list: any[] = Array.isArray(data) ? data : data.data || data.items || (data.json ? (Array.isArray(data.json) ? data.json : [data.json]) : [data]);
    if (!Array.isArray(list)) list = [list];
    let flat: any[] = [];
    list.forEach((entry: any) => {
      if (!entry) return;
      if (entry?.json) Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
      else flat.push(entry);
    });
    return flat.filter(item => item !== null && item !== undefined);
  };

  const getLogo = () => {
    return `/logo_${(institute || 'gasctpna').toLowerCase()}.png`;
  };

  useEffect(() => {
    const inst = localStorage.getItem('auth_institute') || 'IBRASE';
    setInstitute(inst);

    // if (inst === 'GASCTPNA') setProjetoName('PROJETO GASCTPNA');

    async function fetchCargos() {
      try {
        const res = await fetch(`https://w.ibrase.com.br/webhook/cargos-get?instituto=${inst.toUpperCase()}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.value || []);
          setCargosDisponiveis(list);
        }
      } catch (err) {
        console.error("Erro ao buscar cargos:", err);
      }
    }
    
    async function fetchProjetos() {
      try {
        const cached = sessionStorage.getItem(`cache_projetos_list_${inst.toUpperCase()}`);
        if (cached) {
          try { 
            const flat = flattenResponse(JSON.parse(cached));
            setProjetos(flat.filter(p => p.aplicabilidade !== 'eventos'));
          } catch(e) {}
        }
        const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst.toUpperCase()}`, { cache: "no-store" });
        if (res.ok) {
          const text = await res.text();
          if (text) {
            const data = JSON.parse(text);
            const flat = flattenResponse(data);
            setProjetos(flat.filter(p => p.aplicabilidade !== 'eventos'));
          }
        }
      } catch (err) {
        console.error("Erro ao buscar projetos:", err);
      }
    }
    
    fetchCargos();
    fetchProjetos();
  }, []);

  const addColumnFromCargo = (cargoName: string) => {
    if (!cargoName) return;
    
    const existingCount = columns.filter(c => c.title.startsWith(cargoName.toUpperCase())).length;
    let newTitle = cargoName.toUpperCase();
    
    if (existingCount > 0) {
      if (existingCount === 1) {
        setColumns(cols => cols.map(c => c.title === cargoName.toUpperCase() ? { ...c, title: `${cargoName.toUpperCase()} 1` } : c));
        newTitle = `${cargoName.toUpperCase()} 2`;
      } else {
        newTitle = `${cargoName.toUpperCase()} ${existingCount + 1}`;
      }
    }

    setColumns(cols => [
      ...cols,
      {
        id: Math.random().toString(36).substring(7),
        title: newTitle,
        segunda: { start: '', end: '' }, 
        terca: { start: '', end: '' }, 
        quarta: { start: '', end: '' }, 
        quinta: { start: '', end: '' }, 
        sexta: { start: '', end: '' }, 
        sabado: { start: '', end: '' },
        cargaHoraria: '20h'
      }
    ]);
  };

  const removeColumn = (idToRemove: string) => {
    setColumns(columns.filter(c => c.id !== idToRemove));
  };

  const updateColumnTitle = (id: string, value: string) => {
    setColumns(cols => cols.map(c => c.id === id ? { ...c, title: value } : c));
  };

  const updateColumnTime = (id: string, day: keyof GradeColumn, field: 'start' | 'end', value: string) => {
    setColumns(cols => cols.map(c => {
      if (c.id === id) {
        const timeObj = c[day] as GradeTime;
        const updatedCol = { ...c, [day]: { ...timeObj, [field]: value } } as GradeColumn;
        // Calculate total minutes for the week
        const totalMinutes = DIAS_SEMANA.reduce((sum, d) => {
          const key = d.toLowerCase().replace('á', 'a').replace('ç', 'c') as keyof GradeColumn;
          const t = updatedCol[key] as GradeTime;
          if (t.start && t.end) {
            const [sh, sm] = t.start.split(':').map(Number);
            const [eh, em] = t.end.split(':').map(Number);
            return sum + (eh * 60 + em - (sh * 60 + sm));
          }
          return sum;
        }, 0);
        const hours = Math.round(totalMinutes / 60);
        updatedCol.cargaHoraria = `${hours}h`;
        return updatedCol;
      }
      return c;
    }));
  };

  const updateCargaHoraria = (id: string, value: string) => setColumns(cols => cols.map(c => c.id === id ? { ...c, cargaHoraria: value } : c));

  const handleCargoConfirm = (selected: string[]) => {
    selected.forEach(name => addColumnFromCargo(name));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!selectedProjetoId) return;
    setIsSaving(true);
    try {
      const payload = {
        id: selectedProjetoId,
        grade_estagiarios: {
          columns,
          observacoes,
          assinatura
        }
      };
      
      const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-put?instituto=${institute.toUpperCase()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Grade salva com sucesso!");
        setProjetos(prev => prev.map(p => 
          String(p.id) === selectedProjetoId ? { ...p, grade_estagiarios: payload.grade_estagiarios } : p
        ));
      } else {
        alert("Erro ao salvar a grade.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar a grade.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimeDisplay = (timeObj: GradeTime) => {
    if (!timeObj.start && !timeObj.end) return ' - ';
    if (timeObj.start && !timeObj.end) return `${timeObj.start.replace(':', 'h')}`;
    return `${timeObj.start.replace(':', 'h')} às ${timeObj.end.replace(':', 'h')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950 font-sans print:bg-white print:p-0 print:m-0 overflow-y-auto">
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>
      
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/admin/nucleos" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Gerador de Grade (Estagiários)</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Construa a matriz dinâmica</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving || !selectedProjetoId}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 print:hidden"
          >
            <Save className="w-4 h-4" />
            <span className="hidden md:inline">{isSaving ? 'Salvando...' : 'Salvar Grade'}</span>
            <span className="inline md:hidden">{isSaving ? '...' : 'Salvar'}</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Imprimir / Salvar PDF</span>
            <span className="inline md:hidden">Imprimir</span>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8 flex-1 flex flex-col items-center print:p-0 print:block">
        
        <div className="w-full max-w-[1100px] mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm print:hidden flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Vincular a um Projeto</label>
            <select 
              className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 transition-colors text-slate-700 dark:text-slate-300"
              onChange={(e) => {
                const p = projetos.find(p => String(p.id) === e.target.value);
                if (p) {
                  setSelectedProjetoId(String(p.id));
                  const pName = String(p.nome).toUpperCase().includes('PROJETO') ? p.nome : `PROJETO ${p.nome}`;
                  setProjetoName(pName);
                  setTermoFomento(p.termo_fomento || '');

                  let savedGrade = p.grade_estagiarios;
                  if (typeof savedGrade === 'string') {
                    try { savedGrade = JSON.parse(savedGrade); } catch(e) {}
                  }
                  
                  if (savedGrade && savedGrade.columns) {
                    setColumns(savedGrade.columns);
                    setObservacoes(savedGrade.observacoes || "");
                    setAssinatura(savedGrade.assinatura || "_____/_____/_________");
                  } else {
                    setColumns([]);
                    setObservacoes("• Caso seja necessário mudar os dias de prestação de serviço, envie a proposta de mudança para a Presidência.\n• Em demandas especiais, o remanejo de horários poderá ser feito desde que seja acordado previamente.\n• Os horários contemplam o atendimento nos turnos matutino (manhã), vespertino (tarde) e noturno (noite).");
                    setAssinatura("_____/_____/_________");
                  }
                } else {
                  setSelectedProjetoId('');
                  setProjetoName('');
                  setTermoFomento('');
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Selecione um projeto...</option>
              {projetos.map(p => (
                <option key={p.id} value={String(p.id)}>
                  {p.nome} {p.termo_fomento ? `(${p.termo_fomento})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedProjetoId ? (
          <div className="w-full max-w-[1100px] mt-8 p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-center">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Selecione um Projeto</h2>
            <p className="text-slate-500">Por favor, selecione um projeto acima para iniciar a montagem da grade horária.</p>
          </div>
        ) : (
          <div className="bg-white w-full max-w-[1100px] min-h-[790px] p-8 md:p-12 shadow-md border border-slate-200 rounded-xl print:shadow-none print:border-none print:p-4 print:w-full print:max-w-none print:rounded-none text-slate-900 overflow-x-auto print:overflow-visible">
            
            <div className="min-w-[800px] print:min-w-0" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="relative mb-4">
                <div className="text-center pt-2">
                  <input 
                    value={projetoName} 
                    onChange={e => setProjetoName(e.target.value)}
                    className="w-full text-center text-[16px] font-bold text-black uppercase bg-transparent outline-none"
                  />
                  <h2 className="text-[16px] font-bold text-black uppercase mt-1">
                    GRADE HORÁRIA DE ESTAGIÁRIOS
                  </h2>
                </div>
                <div className="absolute right-0 top-0">
                  <div className={`p-2 rounded-lg ${institute?.toUpperCase() === 'AUNI' ? 'bg-slate-900 print:bg-slate-900 print:print-color-adjust-exact' : ''}`}>
                    <img src={getLogo()} alt="Logo" className="h-14 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-start gap-1 mb-2">
                <span className="text-[13px] font-bold text-black">Termo de fomento:</span>
                <input 
                  value={termoFomento}
                  onChange={e => setTermoFomento(e.target.value)}
                  className="text-[13px] font-normal text-black bg-transparent outline-none w-64"
                />
              </div>

              <div className="w-full overflow-hidden">
                <table className="w-full border-collapse text-center">
                  <thead>
                    <tr>
                      <th className="border border-black bg-[#a4c2f4] p-1 text-[11px] font-bold w-40 print:bg-[#a4c2f4] print:print-color-adjust-exact align-middle text-black">
                        DIAS /<br/>COLABORADOR
                      </th>
                      {columns.map(col => (
                        <th key={col.id} className="border border-black bg-[#a4c2f4] p-1 min-w-[120px] relative group print:bg-[#a4c2f4] print:print-color-adjust-exact align-middle text-black">
                          <textarea 
                            value={col.title}
                            onChange={e => updateColumnTitle(col.id, e.target.value)}
                            className="w-full text-center bg-transparent outline-none resize-none overflow-hidden font-bold text-[11px] uppercase placeholder:text-slate-400 text-black"
                            rows={2}
                            placeholder="DIGITE O CARGO"
                          />
                          <button 
                            onClick={() => removeColumn(col.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden shadow-sm z-10"
                            title="Remover coluna"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </th>
                      ))}
                      <th className="border border-transparent bg-transparent p-1 min-w-[120px] print:hidden align-middle">
                        <button
                          onClick={() => setIsCargoModalOpen(true)}
                          className="w-full text-center bg-blue-50 border border-blue-200 rounded text-[11px] font-bold text-blue-700 outline-none cursor-pointer py-2 hover:bg-blue-100 transition-colors"
                        >+ ADICIONAR</button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DIAS_SEMANA.map((dia) => {
                      const dayKey = dia.toLowerCase().replace('á', 'a').replace('ç', 'c') as keyof GradeColumn;
                      return (
                        <tr key={dia}>
                          <td className="border border-black bg-[#d9d9d9] font-bold text-[11px] p-1 uppercase text-black print:bg-[#d9d9d9] print:print-color-adjust-exact">
                            {dia}
                          </td>
                          {columns.map(col => {
                            const timeObj = col[dayKey] as GradeTime;
                            return (
                              <td key={col.id + dia} className="border border-black p-1 relative h-[30px] align-middle">
                                {/* View Mode (Print) */}
                                <div className="hidden print:flex items-center justify-center w-full h-full text-[12px] font-normal text-black">
                                  {formatTimeDisplay(timeObj)}
                                </div>
                                
                                {/* Edit Mode */}
                                <div className="print:hidden flex items-center justify-center gap-1 w-full px-1">
                                  <input 
                                    type="time" 
                                    value={timeObj.start}
                                    onChange={e => updateColumnTime(col.id, dayKey, 'start', e.target.value)}
                                    className="w-16 text-center bg-slate-50 border border-slate-200 rounded text-[10px] outline-none focus:border-blue-500 text-slate-600"
                                  />
                                  <span className="text-[10px] text-slate-400">às</span>
                                  <input 
                                    type="time" 
                                    value={timeObj.end}
                                    onChange={e => updateColumnTime(col.id, dayKey, 'end', e.target.value)}
                                    className="w-16 text-center bg-slate-50 border border-slate-200 rounded text-[10px] outline-none focus:border-blue-500 text-slate-600"
                                  />
                                </div>
                              </td>
                            );
                          })}
                          <td className="print:hidden border border-transparent p-1"></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="mt-8 flex justify-start">
                  <table className="w-full border-collapse text-center">
                    <tbody>
                      <tr>
                        <td colSpan={columns.length > 0 ? 2 : 1} className="border border-black bg-[#a4c2f4] p-1 text-[11px] font-bold w-40 text-left text-black print:bg-[#a4c2f4] print:print-color-adjust-exact">
                          CARGA HORARIA SEMANAL
                        </td>
                        {columns.length > 1 && columns.slice(1).map(col => <td key={`dummy-${col.id}`} className="border-transparent"></td>)}
                        <td className="print:hidden border-transparent"></td>
                      </tr>
                      <tr>
                        <td className="border border-black bg-[#d9d9d9] font-bold text-[11px] p-1 uppercase text-black w-40 print:bg-[#d9d9d9] print:print-color-adjust-exact">
                          HORAS
                        </td>
                        {columns.map(col => (
                          <td key={col.id} className="border border-black p-1 min-w-[120px] relative align-middle">
                            <div className="flex items-center justify-center w-full text-[12px] font-normal text-black">
                              {col.cargaHoraria}
                            </div>
                          </td>
                        ))}
                        <td className="print:hidden border border-transparent"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 text-[12px] text-black">
                <p className="font-bold mb-1">Observações:</p>
                <div className="flex items-end justify-between">
                  <textarea 
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    className="flex-1 text-[12px] text-black bg-transparent outline-none resize-none border border-transparent hover:border-slate-200 focus:border-slate-300 rounded p-1 -ml-1 min-h-[100px] print:border-none print:resize-none print:p-0 print:m-0"
                  />
                  <div className="text-center w-64 mb-4 pr-4">
                    <input 
                      value={assinatura}
                      onChange={e => setAssinatura(e.target.value)}
                      className="w-full text-center text-[12px] text-black bg-transparent outline-none border border-transparent transition-colors print:hover:bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {columns.length === 0 && (
                  <div className="text-center py-10 print:hidden text-slate-400 font-medium text-sm mt-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p> Nenhuma coluna adicionada.</p>
                    <p>Selecione um cargo no menu "+ Adicionar Cargo" acima.</p>
                  </div>
                )}
              <CargoSelectionModal isOpen={isCargoModalOpen} onClose={() => setIsCargoModalOpen(false)} onConfirm={handleCargoConfirm} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
