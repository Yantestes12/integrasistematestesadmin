import React, { useState } from "react";
import {
    Eye,
    Edit,
    Folder,
    RotateCcw,
    Ban,
    CheckCircle,
    Trash2,
    Plus
} from "lucide-react";
import { Topbar } from "~/components/Topbar";
import { Sidebar } from "~/components/Sidebar";

export const PersonalInfo = () => {
    const [cargoFiltro, setCargoFiltro] = useState("");

    // Dados 
    const colaboradoresMock = [
        { id: 145, usuario: "leandrooliveira", nome: "LEANDRO OLIVEIRA DA COSTA", cargo: "Instrutor", status: "Ativo" },
        { id: 144, usuario: "gleisonfidelis", nome: "GLEISON FIDELIS DE MELO", cargo: "Supervisor", status: "Ativo" },
        { id: 143, usuario: "andredejesus", nome: "ANDRE DE JESUS SILVA", cargo: "Instrutor", status: "Ativo" },
        { id: 142, usuario: "jonatanmateus", nome: "JONATAN MATEUS DE AZEVEDO", cargo: "Auxiliar", status: "Ativo" },
        { id: 141, usuario: "wellingtonalves", nome: "WELLINGTON ALVES BARBOSA", cargo: "Auxiliar", status: "Ativo" },
        { id: 140, usuario: "laudiniersantos", nome: "LAUDINIER DOS SANTOS BERNARDO DA SILVA FILHO", cargo: "Auxiliar", status: "Ativo" },
        { id: 18, usuario: "joaopaulosilva", nome: "JOAO PAULO SILVA DE VIVEIROS", cargo: "Instrutor", status: "Inativo" },
        { id: 17, usuario: "brunosirino", nome: "BRUNO SIRINO DA FONSECA", cargo: "Coordenador Pedagógico", status: "Inativo" },
        { id: 16, usuario: "masteribrase.com.br", nome: "EVANILDO PEREIRA BARBOSA", cargo: "Auxiliar", status: "Ativo" },
        { id: 15, usuario: "laissapaulino", nome: "LAISSA PAULINO PEREIRA", cargo: "Administrativo", status: "Ativo" },
        { id: 14, usuario: "dariodasilva", nome: "DARIO DA SILVA FREITAS", cargo: "Recursos Humanos", status: "Ativo" },
        { id: 13, usuario: "irglateiabruce", nome: "IRGLATEIA BRUCE GOIS", cargo: "Coordenador Pedagógico", status: "Ativo" },
        { id: 12, usuario: "joaoandre", nome: "JOAO ANDRE RISCADO BARRETO", cargo: "Coordenador Geral", status: "Ativo" },
        { id: 11, usuario: "brunodealmeida", nome: "BRUNO DE ALMEIDA FERNANDES", cargo: "Coordenador Geral", status: "Inativo" },
        { id: 10, usuario: "isabellirh", nome: "ISABELLI RODRIGUES", cargo: "Recursos Humanos", status: "Ativo" }
    ];

    // Filtro dinâmico
    const colaboradoresFiltrados = cargoFiltro
        ? colaboradoresMock.filter((item) => item.cargo === cargoFiltro)
        : colaboradoresMock;

    return (
        <div className="min-h-screen bg-[#f4f6fa] font-sans flex flex-col text-slate-800 overflow-x-hidden">
            <Topbar />

            <div className="flex flex-1 w-full relative">
                <Sidebar />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full min-w-0 h-[calc(100vh-64px)]">
                    <div className="p-4 sm:p-6 bg-[#f8fafc] min-h-screen w-full">
                        <div className="mb-6">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Contas / Colaborador / Colaborador
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                                Colaboradores do painel (tabela <code className="font-semibold text-slate-700 bg-slate-200/60 px-1 py-0.5 rounded">colaboradores</code> + login em <code className="font-semibold text-slate-700 bg-slate-200/60 px-1 py-0.5 rounded">admin_users</code>).
                            </p>
                        </div>

                        {/* Controles de Filtros e Ações */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">

                            {/* Lado Esquerdo */}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-slate-700">
                                <span>
                                    Total: <strong className="text-slate-900 font-bold">{colaboradoresFiltrados.length}</strong>
                                </span>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <label htmlFor="cargo-select" className="shrink-0">Cargo:</label>
                                    <select
                                        id="cargo-select"
                                        value={cargoFiltro}
                                        onChange={(e) => setCargoFiltro(e.target.value)}
                                        className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-auto cursor-pointer"
                                    >
                                        <option value="">Todos os cargos</option>
                                        <option value="Instrutor">Instrutor</option>
                                        <option value="Supervisor">Supervisor</option>
                                        <option value="Auxiliar">Auxiliar</option>
                                        <option value="Coordenador Pedagógico">Coordenador Pedagógico</option>
                                        <option value="Recursos Humanos">Recursos Humanos</option>
                                        <option value="Coordenador Geral">Coordenador Geral</option>
                                        <option value="Administrativo">Administrativo</option>
                                    </select>
                                </div>
                            </div>

                            {/* Lado Direito */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                <button className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5">
                                    <Plus size={18} /> Novo Colaborador
                                </button>
                                <button className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-colors text-center">
                                    + Novo Cargo
                                </button>
                            </div>
                        </div>

                        {/* Tabela de Dados Pessoais */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs sm:text-sm text-slate-600 border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-slate-200 text-[#64748b] text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-slate-50/50">
                                        <th className="px-3 sm:px-4 py-3.5">ID</th>
                                        <th className="px-3 sm:px-4 py-3.5">USUÁRIO</th>
                                        <th className="px-3 sm:px-4 py-3.5">NOME</th>
                                        <th className="px-3 sm:px-4 py-3.5">CARGO</th>
                                        <th className="px-3 sm:px-4 py-3.5">STATUS</th>
                                        <th className="px-3 sm:px-4 py-3.5 text-center">AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {colaboradoresFiltrados.map((colab) => (
                                        <tr key={colab.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-3 sm:px-4 py-3.5 font-bold text-slate-900">{colab.id}</td>
                                            <td className="px-3 sm:px-4 py-3.5 font-medium text-slate-700">{colab.usuario}</td>
                                            <td className="px-3 sm:px-4 py-3.5 font-bold text-slate-900 break-words">{colab.nome}</td>
                                            <td className="px-3 sm:px-4 py-3.5">
                                                <span className="bg-slate-100 text-slate-700 text-[11px] sm:text-xs px-2.5 py-1 rounded-full border border-slate-200 font-semibold inline-block whitespace-nowrap">
                                                    {colab.cargo}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-4 py-3.5">
                                                {colab.status === "Ativo" ? (
                                                    <span className="bg-[#e6f4ea] text-[#137333] text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-bold inline-block">
                                                        Ativo
                                                    </span>
                                                ) : (
                                                    <span className="bg-[#fce8e6] text-[#c5221f] text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-bold inline-block">
                                                        Inativo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 sm:px-4 py-3.5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Visualizar */}
                                                    <button title="Visualizar" className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors">
                                                        <Eye size={15} />
                                                    </button>
                                                    {/* Editar */}
                                                    <button title="Editar" className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors">
                                                        <Edit size={15} />
                                                    </button>
                                                    {/* Pastas/Documentos */}
                                                    <button title="Documentos" className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors">
                                                        <Folder size={15} />
                                                    </button>
                                                    {/* Reset de Senha */}
                                                    <button title="Redefinir Senha" className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors">
                                                        <RotateCcw size={15} />
                                                    </button>
                                                    {/* Bloquear / Ativar */}
                                                    {colab.status === "Ativo" ? (
                                                        <button title="Inativar" className="p-1.5 text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors">
                                                            <Ban size={15} />
                                                        </button>
                                                    ) : (
                                                        <button title="Ativar" className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors">
                                                            <CheckCircle size={15} />
                                                        </button>
                                                    )}
                                                    {/* Excluir */}
                                                    <button title="Excluir" className="p-1.5 text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </ div>
    );
}
