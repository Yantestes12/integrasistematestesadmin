import React, { useState } from 'react';
import { Check, ClipboardList } from 'lucide-react';
import { Topbar } from '~/components/Topbar';
import { Sidebar } from '~/components/Sidebar';

export const ExportPDF = () => {
    // Estados para os filtros
    const [filters, setFilters] = useState({
        projeto: 'Todos',
        periodo: 'Todos',
        cidade: 'Todas',
        bairro: 'Todos',
        nucleo: 'Todos',
        modalidade: 'Todas',
        mes: 'Julho',
        ano: '2026',
        tipoEquipe: 'Instrutores / Auxiliares',
        presidente: '',
        observacao: ''
    });

    // Estado para controlar se a visualização foi gerada
    const [hasApplied, setHasApplied] = useState(false);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleApply = (e: any) => {
        e.preventDefault();
        setHasApplied(true);
        // Aqui você pode adicionar a chamada de API passando 'filters'
    };

    return (
        <div className="min-h-screen bg-[#f4f6fa] font-sans flex flex-col text-slate-800 overflow-x-hidden">
            <Topbar />

            <div className="flex flex-1 w-full relative">
                <Sidebar />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full min-w-0 h-[calc(100vh-64px)]">
                    <div className="w-full min-h-screen bg-[#f4f6fa] p-6 lg:p-8 font-sans text-slate-800">
                        {/* Cabeçalho */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Presença RH
                            </h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                Selecione os filtros e clique em <span className="font-bold text-slate-700">Aplicar</span> para visualizar a folha de presença.
                            </p>
                        </div>

                        {/* Card dos Filtros */}
                        <form onSubmit={handleApply} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
                            {/* Primeiras Linhas: Selects e Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">

                                {/* Projeto */}
                                <div className="lg:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        PROJETO
                                    </label>
                                    <select
                                        name="projeto"
                                        value={filters.projeto}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="Todos">Todos</option>
                                        <option value="Projeto A">Projeto A</option>
                                        <option value="Projeto B">Projeto B</option>
                                    </select>
                                </div>

                                {/* Período */}
                                <div className="lg:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        PERÍODO
                                    </label>
                                    <select
                                        name="periodo"
                                        value={filters.periodo}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="Todos">Todos</option>
                                        <option value="Manhã">Manhã</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Noite">Noite</option>
                                    </select>
                                </div>

                                {/* Cidade */}
                                <div className="lg:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        CIDADE
                                    </label>
                                    <select
                                        name="cidade"
                                        value={filters.cidade}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="Todas">Todas</option>
                                        <option value="Campos">Campos</option>
                                        <option value="Macaé">Macaé</option>
                                    </select>
                                </div>

                                {/* Bairro */}
                                <div className="lg:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        BAIRRO
                                    </label>
                                    <select
                                        name="bairro"
                                        value={filters.bairro}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="Todos">Todos</option>
                                        <option value="Centro">Centro</option>
                                        <option value="Pelinca">Pelinca</option>
                                    </select>
                                </div>

                                {/* Núcleo */}
                                <div className="lg:col-span-4">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        NÚCLEO
                                    </label>
                                    <select
                                        name="nucleo"
                                        value={filters.nucleo}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="Todos">Todos</option>
                                        <option value="Núcleo Central">Núcleo Central</option>
                                        <option value="Núcleo Norte">Núcleo Norte</option>
                                    </select>
                                </div>

                                {/* Modalidade */}
                                <div className="lg:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        MODALIDADE
                                    </label>
                                    <select
                                        name="modalidade"
                                        value={filters.modalidade}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="Todas">Todas</option>
                                        <option value="Futebol">Futebol</option>
                                        <option value="Natação">Natação</option>
                                    </select>
                                </div>

                                {/* Mês */}
                                <div className="lg:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        MÊS
                                    </label>
                                    <select
                                        name="mes"
                                        value={filters.mes}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="Janeiro">Janeiro</option>
                                        <option value="Fevereiro">Fevereiro</option>
                                        <option value="Março">Março</option>
                                        <option value="Abril">Abril</option>
                                        <option value="Maio">Maio</option>
                                        <option value="Junho">Junho</option>
                                        <option value="Julho">Julho</option>
                                        <option value="Agosto">Agosto</option>
                                        <option value="Setembro">Setembro</option>
                                        <option value="Outubro">Outubro</option>
                                        <option value="Novembro">Novembro</option>
                                        <option value="Dezembro">Dezembro</option>
                                    </select>
                                </div>

                                {/* Ano */}
                                <div className="lg:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        ANO
                                    </label>
                                    <input
                                        type="text"
                                        name="ano"
                                        value={filters.ano}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    />
                                </div>

                                {/* Tipo de Equipe */}
                                <div className="lg:col-span-3">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        TIPO DE EQUIPE
                                    </label>
                                    <select
                                        name="tipoEquipe"
                                        value={filters.tipoEquipe}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="Instrutores / Auxiliares">Instrutores / Auxiliares</option>
                                        <option value="Coordenadores">Coordenadores</option>
                                        <option value="Administrativo">Administrativo</option>
                                    </select>
                                </div>

                                {/* Botão Aplicar */}
                                <div className="lg:col-span-3 lg:col-start-10 flex justify-end">
                                    <button
                                        type="submit"
                                        className="w-full md:w-auto bg-[#254edb] hover:bg-[#1d40b8] text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} strokeWidth={2.5} />
                                        Aplicar
                                    </button>
                                </div>

                            </div>

                            {/* Segunda Linha: Presidente e Observações */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 pt-6 border-t border-slate-100">

                                {/* Presidente */}
                                <div className="lg:col-span-6">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        PRESIDENTE
                                    </label>
                                    <input
                                        type="text"
                                        name="presidente"
                                        placeholder="Nome do Presidente"
                                        value={filters.presidente}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    />
                                </div>

                                {/* Observação / Justificativa Global */}
                                <div className="lg:col-span-6">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        OBSERVAÇÃO / JUSTIFICATIVA GLOBAL
                                    </label>
                                    <input
                                        type="text"
                                        name="observacao"
                                        placeholder="Ex: Não houve aula do dia 21/12 até 04/01"
                                        value={filters.observacao}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    />
                                </div>

                            </div>
                        </form>

                        {/* Área de Preview (Estado Inicial vs Estado com Dados) */}
                        {!hasApplied ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 text-amber-600 shadow-sm">
                                    <ClipboardList size={36} />
                                </div>
                                <p className="text-slate-500 font-medium text-base">
                                    Selecione os filtros e clique em <span className="font-bold text-slate-700">Aplicar</span> para gerar o preview.
                                </p>
                            </div>
                        ) : (
                            /* Container onde será renderizada a tabela/dados após o clique */
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800 mb-4">
                                    Folha de Presença - {filters.mes} / {filters.ano}
                                </h2>
                                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
                                    A tabela com a folha de presença será renderizada aqui com base nos filtros selecionados.
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ div>
    );
}
