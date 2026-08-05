import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Dados de exemplo para os 5 gráficos
const dataModalidade = [
  { name: 'Futebol', valor: 450 },
  { name: 'Futsal', valor: 380 },
  { name: 'Vôlei', valor: 290 },
  { name: 'Basquete', valor: 210 },
  { name: 'Natação', valor: 180 },
  { name: 'Judô', valor: 150 },
];

const dataCidade = [
  { name: 'Campos', valor: 620 },
  { name: 'Macaé', valor: 480 },
  { name: 'Niterói', valor: 350 },
  { name: 'Cabo Frio', valor: 280 },
  { name: 'Rio de Janeiro', valor: 210 },
  { name: 'Volta Redonda', valor: 190 },
];

const dataProjeto = [
  { name: 'Projeto A', valor: 510 },
  { name: 'Projeto B', valor: 430 },
  { name: 'Projeto C', valor: 310 },
  { name: 'Projeto D', valor: 260 },
  { name: 'Projeto E', valor: 190 },
];

const dataFaixaEtaria = [
  { name: '6-10 anos', valor: 340 },
  { name: '11-14 anos', valor: 520 },
  { name: '15-17 anos', valor: 410 },
  { name: '18-29 anos', valor: 230 },
  { name: '30+ anos', valor: 110 },
];

const dataNucleo = [
  { name: 'Núcleo Central', valor: 320 },
  { name: 'Núcleo Norte', valor: 280 },
  { name: 'Núcleo Sul', valor: 250 },
  { name: 'Núcleo Leste', valor: 210 },
  { name: 'Núcleo Oeste', valor: 190 },
  { name: 'Núcleo Centro-Sul', valor: 170 },
  { name: 'Núcleo Praias', valor: 150 },
  { name: 'Núcleo Baixada', valor: 130 },
  { name: 'Núcleo Serrana', valor: 110 },
  { name: 'Núcleo Rural', valor: 90 },
  { name: 'Núcleo Expansão', valor: 75 },
  { name: 'Núcleo Especial', valor: 50 },
];

export const ChartCard = () => {
  const handleBarClick = (data, tipo) => {
    console.log(`Clicou em ${tipo}:`, data);
  };

  return (
    <div className="space-y-6 w-full select-none">
      
      {/* Grid com os 4 Gráficos Verticais (2x2 em telas grandes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico Vertical 1: Por Modalidade */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              Por Modalidade (Top 10)
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5 mb-4">
              Clique em uma barra.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataModalidade} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="valor" fill="#2563eb" radius={[4, 4, 0, 0]} onClick={(entry) => handleBarClick(entry, 'Modalidade')} className="cursor-pointer hover:opacity-80 transition-opacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Vertical 2: Por Cidade */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              Por Cidade (Top 10)
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5 mb-4">
              Clique em uma barra.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCidade} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="valor" fill="#2563eb" radius={[4, 4, 0, 0]} onClick={(entry) => handleBarClick(entry, 'Cidade')} className="cursor-pointer hover:opacity-80 transition-opacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Vertical 3: Por Projeto */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              Por Projeto
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5 mb-4">
              Clique em uma barra.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataProjeto} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="valor" fill="#2563eb" radius={[4, 4, 0, 0]} onClick={(entry) => handleBarClick(entry, 'Projeto')} className="cursor-pointer hover:opacity-80 transition-opacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Vertical 4: Por Faixa Etária */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              Por Faixa Etária
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5 mb-4">
              Clique em uma barra.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataFaixaEtaria} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="valor" fill="#2563eb" radius={[4, 4, 0, 0]} onClick={(entry) => handleBarClick(entry, 'Faixa Etária')} className="cursor-pointer hover:opacity-80 transition-opacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Gráfico 5 (Horizontal no final): Por Núcleo (Top 12) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 w-full">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            Por Núcleo (Top 12)
          </h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5 mb-4">
            Clique para listar.
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={dataNucleo}
              margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={120}
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey="valor" 
                fill="#2563eb" 
                radius={[0, 4, 4, 0]}
                onClick={(entry) => handleBarClick(entry, 'Núcleo')}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}