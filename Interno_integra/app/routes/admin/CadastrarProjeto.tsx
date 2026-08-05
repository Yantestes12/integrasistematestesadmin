import React, { useState } from "react";
import { 
  FolderPlus, ArrowLeft, Calendar, Users, Layers, ShieldAlert, Plus, Trash2, Check 
} from "lucide-react";

export default function CadastrarProjeto() {
  // 1. Identificação e Documentação
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [numeroProposta, setNumeroProposta] = useState("");
  const [termoFomento, setTermoFomento] = useState("");
  const [numeroProcessoAdm, setNumeroProcessoAdm] = useState("");
  const [numeroTransfereGov, setNumeroTransfereGov] = useState("");
  const [aplicabilidade, setAplicabilidade] = useState("");
  const [descricao, setDescricao] = useState("");

  // 2. Vigência
  const [dataInicioVigencia, setDataInicioVigencia] = useState("");
  const [dataTerminoVigencia, setDataTerminoVigencia] = useState("");

  // 3. Limites de Membros da Equipe
  const [limites, setLimites] = useState({
    instrutoresPorNucleo: 0,
    auxiliaresPorNucleo: 0,
    coordGeral: 0,
    coordNucleo: 0,
    coordPedagogico: 0,
    supervisores: 0,
    vagasPorNucleo: 0,
  });

  // 4. Faixa Etária
  const [idadeMinima, setIdadeMinima] = useState("");
  const [idadeMaxima, setIdadeMaxima] = useState("");

  // 5. Limites de Núcleos por Modalidade
  const [limitesModalidade, setLimitesModalidade] = useState({
    funcional: 0,
    futebol: 0,
    luta: 0,
    projetoDeAula: 0,
    eventos: 0,
  });

  // 6. Períodos do Projeto
  const [periodos, setPeriodos] = useState([
    { id: 1, tipo: "Iniciação", rotulo: "", inicio: "", fim: "" },
  ]);

  // 7. Status
  const [projetoAtivo, setProjetoAtivo] = useState(true);

  // Manipulação de Períodos
  const handleAddPeriodo = () => {
    setPeriodos([
      ...periodos,
      { id: Date.now(), tipo: "Iniciação", rotulo: "", inicio: "", fim: "" },
    ]);
  };

  const handleRemovePeriodo = (id: number) => {
    setPeriodos(periodos.filter((p) => p.id !== id));
  };

  const handleUpdatePeriodo = (id: number, field: string, value: string) => {
    setPeriodos(
      periodos.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparando o Payload no padrão perfeito para N8N / Supabase
    const payload = {
      identificacao: {
        nomeProjeto,
        numeroProposta,
        termoFomento,
        numeroProcessoAdm,
        numeroTransfereGov,
        aplicabilidade,
        descricao,
      },
      vigencia: {
        dataInicio: dataInicioVigencia,
        dataTermino: dataTerminoVigencia,
      },
      limitesMembros: limites,
      faixaEtaria: {
        idadeMinima: idadeMinima ? Number(idadeMinima) : null,
        idadeMaxima: idadeMaxima ? Number(idadeMaxima) : null,
      },
      limitesModalidade,
      periodos,
      status: {
        ativo: projetoAtivo,
      }
    };

    console.log("PAYLOAD PRONTO PARA O N8N:", JSON.stringify(payload, null, 2));

    try {
      const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
      
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get("edit");
      
      const webhookUrl = editId 
        ? `https://w.ibrase.com.br/webhook/projetos-put?instituto=${authInstitute}` 
        : `https://w.ibrase.com.br/webhook/projetos-post?instituto=${authInstitute}`;
      
      if (editId) {
        (payload as any).id = editId;
      }
      
      const response = await fetch(webhookUrl, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao enviar dados para o N8N.");
      
      alert(editId ? "Iniciativa atualizada com sucesso!" : "Iniciativa cadastrada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar para o N8N.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderPlus className="w-7 h-7 text-blue-600" />
            Cadastrar Iniciativa
          </h1>
          <p className="text-slate-500 text-sm">
            Campos marcados com <span className="text-red-500 font-bold">*</span> são obrigatórios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a lista
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* IDENTIFICAÇÃO E DOCUMENTAÇÃO */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Identificação e Documentação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Iniciativa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: PROMOV"
                value={nomeProjeto}
                onChange={(e) => setNomeProjeto(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Proposta
              </label>
              <input
                type="text"
                placeholder="Ex.: 12345/2026"
                value={numeroProposta}
                onChange={(e) => setNumeroProposta(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Termo de Fomento
              </label>
              <input
                type="text"
                placeholder="Ex.: Termo nº 805/2024"
                value={termoFomento}
                onChange={(e) => setTermoFomento(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número do Processo Administrativo
              </label>
              <input
                type="text"
                placeholder="Ex.: 48000.00123/2026"
                value={numeroProcessoAdm}
                onChange={(e) => setNumeroProcessoAdm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número do Transfere gov
              </label>
              <input
                type="text"
                placeholder="Ex.: 941234/2026"
                value={numeroTransfereGov}
                onChange={(e) => setNumeroTransfereGov(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qual aplicabilidade? <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={aplicabilidade}
                onChange={(e) => setAplicabilidade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="aula">Aula</option>
                <option value="eventos">Eventos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              placeholder="Opcional..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* VIGÊNCIA DA INICIATIVA */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Vigência da Iniciativa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Início da Vigência
              </label>
              <input
                type="date"
                value={dataInicioVigencia}
                onChange={(e) => setDataInicioVigencia(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Término da Vigência
              </label>
              <input
                type="date"
                value={dataTerminoVigencia}
                onChange={(e) => setDataTerminoVigencia(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Deixe em branco para projeto sem prazo definido.
              </span>
            </div>
          </div>
        </div>

        {/* CONFIGURAÇÕES DE LIMITES DE MEMBROS DA EQUIPE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Configurações de Limites de Membros da Equipe
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aqui devem ser definidas as quantidade máximas de colaboradores para cada cargo dentro do projeto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Instrutores por Núcleo
              </label>
              <input
                type="number"
                min="0"
                value={limites.instrutoresPorNucleo}
                onChange={(e) => setLimites({ ...limites, instrutoresPorNucleo: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Auxiliares por Núcleo
              </label>
              <input
                type="number"
                min="0"
                value={limites.auxiliaresPorNucleo}
                onChange={(e) => setLimites({ ...limites, auxiliaresPorNucleo: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Coord. Geral
              </label>
              <input
                type="number"
                min="0"
                value={limites.coordGeral}
                onChange={(e) => setLimites({ ...limites, coordGeral: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Coord. Núcleo
              </label>
              <input
                type="number"
                min="0"
                value={limites.coordNucleo}
                onChange={(e) => setLimites({ ...limites, coordNucleo: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Coord. Pedagogicos
              </label>
              <input
                type="number"
                min="0"
                value={limites.coordPedagogico}
                onChange={(e) => setLimites({ ...limites, coordPedagogico: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Supervisores
              </label>
              <input
                type="number"
                min="0"
                value={limites.supervisores}
                onChange={(e) => setLimites({ ...limites, supervisores: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vagas por Núcleo
              </label>
              <input
                type="number"
                min="0"
                value={limites.vagasPorNucleo}
                onChange={(e) => setLimites({ ...limites, vagasPorNucleo: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Deixe em branco para sem limite definido.
              </span>
            </div>
          </div>
        </div>

        {/* FAIXA ETÁRIA */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Faixa Etária
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Idade mínima
              </label>
              <input
                type="number"
                placeholder="Ex.: 7"
                value={idadeMinima}
                onChange={(e) => setIdadeMinima(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Idade máxima
              </label>
              <input
                type="number"
                placeholder="Ex.: 17"
                value={idadeMaxima}
                onChange={(e) => setIdadeMaxima(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Deixe em branco para sem limite.
              </span>
            </div>
          </div>
        </div>

        {/* LIMITES DE NÚCLEOS POR MODALIDADE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Limites de Núcleos por Modalidade
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina o máximo de núcleos ativos de cada modalidade neste projeto. Informe <strong>0</strong> (ou deixe em branco) para não impor limite à modalidade. A soma destes limites determina a quantidade de <strong>Vagas Globais</strong> do projeto.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  <th className="p-3">Modalidade</th>
                  <th className="p-3 text-right">Máximo de núcleos ativos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Funcional</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={limitesModalidade.funcional}
                      onChange={(e) => setLimitesModalidade({ ...limitesModalidade, funcional: Number(e.target.value) })}
                      className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-right font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Futebol</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={limitesModalidade.futebol}
                      onChange={(e) => setLimitesModalidade({ ...limitesModalidade, futebol: Number(e.target.value) })}
                      className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-right font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Luta</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={limitesModalidade.luta}
                      onChange={(e) => setLimitesModalidade({ ...limitesModalidade, luta: Number(e.target.value) })}
                      className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-right font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Projeto de Aula</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={limitesModalidade.projetoDeAula}
                      onChange={(e) => setLimitesModalidade({ ...limitesModalidade, projetoDeAula: Number(e.target.value) })}
                      className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-right font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Eventos</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={limitesModalidade.eventos}
                      onChange={(e) => setLimitesModalidade({ ...limitesModalidade, eventos: Number(e.target.value) })}
                      className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-right font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO 6: PERÍODOS DA INICIATIVA */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Períodos da Iniciativa</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure as janelas de <strong>Iniciação</strong> e <strong>Trimestre</strong>. Elas serão utilizadas para construir o histórico e a linha do tempo da ocupação das vagas. A ordem de exibição segue a sequência da tabela abaixo.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Rótulo *</th>
                  <th className="p-3">Início *</th>
                  <th className="p-3">Fim *</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {periodos.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 w-44">
                      <select
                        value={p.tipo}
                        onChange={(e) => handleUpdatePeriodo(p.id, "tipo", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Iniciação">Iniciação</option>
                        <option value="1º Trimestre">1º Trimestre</option>
                        <option value="2º Trimestre">2º Trimestre</option>
                        <option value="3º Trimestre">3º Trimestre</option>
                        <option value="4º Trimestre">4º Trimestre</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Nome do período..."
                        value={p.rotulo}
                        onChange={(e) => handleUpdatePeriodo(p.id, "rotulo", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 w-44">
                      <input
                        type="date"
                        value={p.inicio}
                        onChange={(e) => handleUpdatePeriodo(p.id, "inicio", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 w-44">
                      <input
                        type="date"
                        value={p.fim}
                        onChange={(e) => handleUpdatePeriodo(p.id, "fim", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 text-center w-12">
                      <button
                        type="button"
                        onClick={() => handleRemovePeriodo(p.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Remover período"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddPeriodo}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-xs border border-dashed border-blue-300 px-3 py-2 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar período
          </button>
        </div>

        {/* SEÇÃO 7: STATUS DA INICIATIVA */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">Status</h2>

          <label className="inline-flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={projetoAtivo}
              onChange={(e) => setProjetoAtivo(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-slate-800">Iniciativa Ativa</span>
          </label>
        </div>

        {/* BOTÕES DE SUBMISSÃO */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Cadastrar Iniciativa
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm border border-slate-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}