import React, { useEffect, useState } from 'react';

export const GlobalFilterBar = () => {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [selectedProjeto, setSelectedProjeto] = useState<string>("all");

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    
    const fetchProjetos = async (inst: string) => {
      try {
        const res = await fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}`, { cache: "no-store" });
        if (res.ok) {
          const text = await res.text();
          let data = JSON.parse(text);
          if (data && data.message !== "Workflow was started" && !data.error) {
            let list = Array.isArray(data) ? data : data.data || data.items || [];
            let flat: any[] = [];
            list.forEach((entry: any) => {
              if (entry?.json) Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
              else if (Array.isArray(entry)) flat.push(...entry);
              else flat.push(entry);
            });
            setProjetos(flat);
          }
        }
      } catch (e) {}
    };
    fetchProjetos(savedInstitute);

    const savedFilter = localStorage.getItem("global_projeto_filter");
    if (savedFilter) setSelectedProjeto(savedFilter);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProjeto(val);
    localStorage.setItem("global_projeto_filter", val);
    window.dispatchEvent(new Event("globalFilterChanged"));
  };

  return (
    <div className="hidden lg:flex sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 items-center shadow-sm w-full">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Iniciativa:</span>
        <select 
          value={selectedProjeto}
          onChange={handleFilterChange}
          className="bg-slate-100 text-slate-800 text-sm font-bold outline-none cursor-pointer border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-200 transition-colors focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">Todas as Iniciativas</option>
          {projetos.map(p => (
            <option key={p.id} value={p.id}>{p.nome || p.iniciativa}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
