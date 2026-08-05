import React, { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Users, Trophy, Percent, Search, RotateCcw } from "lucide-react";

// --- DADOS DOS GRÁFICOS ---
const dataNucleos = [
  { name: "Núcleo Central", alunos: 240 },
  { name: "Núcleo Norte", alunos: 180 },
  { name: "Núcleo Sul", alunos: 195 },
  { name: "Núcleo Leste", alunos: 160 },
];

const dataFaixaEtaria = [
  { name: "6 a 10 anos", value: 35, color: "#3b82f6" },
  { name: "11 a 14 anos", value: 45, color: "#10b981" },
  { name: "15 a 17 anos", value: 20, color: "#f59e0b" },
];

const dataGenero = [
  { name: "Masculino", value: 58, color: "#2563eb" },
  { name: "Feminino", value: 42, color: "#ec4899" },
];

export function DashboardChart() {
  const [modalidade, setModalidade] = useState("Todas as Modalidades");
  const [nucleo, setNucleo] = useState("Todos os Núcleos");
  const [faixaEtaria, setFaixaEtaria] = useState("Todas as idades");

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DA TELA */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          ⚽ Indicadores por Modalidade
        </h1>
        <p className="text-slate-500 text-sm">
          Filtre por modalidade, núcleo e faixa etária para consultar as métricas atualizadas no banco de dados.
        </p>
      </div>

      {/* CARD DE FILTROS DE PESQUISA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 tracking-wider uppercase">
          <Search className="w-4 h-4 text-slate-400" />
          Filtros de Pesquisa
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">
              Modalidade
            </label>
            <select 
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Todas as Modalidades</option>
              <option>Futebol</option>
              <option>Futsal</option>
              <option>Basquete</option>
              <option>Vôlei</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">
              Núcleo
            </label>
            <select 
              value={nucleo}
              onChange={(e) => setNucleo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Todos os Núcleos</option>
              <option>Núcleo Central</option>
              <option>Núcleo Norte</option>
              <option>Núcleo Sul</option>
              <option>Núcleo Leste</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">
              Faixa Etária (Base de Idade)
            </label>
            <select 
              value={faixaEtaria}
              onChange={(e) => setFaixaEtaria(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Todas as idades</option>
              <option>6 a 10 anos</option>
              <option>11 a 14 anos</option>
              <option>15 a 17 anos</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                setModalidade("Todas as Modalidades");
                setNucleo("Todos os Núcleos");
                setFaixaEtaria("Todas as idades");
              }}
              className="p-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              title="Limpar filtros"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-800">775</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Alunos Ativos</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-800">Futebol</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modalidade Selecionada</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-800">94%</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxa de Frequência Média</p>
          </div>
        </div>
      </div>

      {/* ÁREA DOS GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Barras - Inscritos por Núcleo */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-base font-bold text-slate-800 mb-1">Alunos Inscritos por Núcleo</h2>
          <p className="text-xs text-slate-400 mb-6">Quantidade de participantes cadastrados no filtro atual.</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataNucleos}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip />
                <Bar dataKey="alunos" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza - Faixa Etária */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-1">Faixa Etária (%)</h2>
            <p className="text-xs text-slate-400 mb-4">Proporção de idade dos participantes.</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataFaixaEtaria}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataFaixaEtaria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardChart;