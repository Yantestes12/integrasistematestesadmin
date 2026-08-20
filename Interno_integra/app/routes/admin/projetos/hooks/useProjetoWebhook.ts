import { useEffect, useState } from "react";
import type { ProjetoFormData } from "../schema";

const formatDateForInput = (val: any) => {
  if (!val) return "";
  let str = String(val).trim();
  if (str.includes("T")) str = str.split("T")[0];
  if (str.includes(" ")) str = str.split(" ")[0];
  
  if (str.includes("/")) {
    const parts = str.split("/");
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  if (str.includes("-")) {
    const parts = str.split("-");
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return str;
};

const parseModalidades = (raw: any) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
  }
  return null;
};

export function useProjetoWebhook(editModeId: string | null, resetForm: (values: Partial<ProjetoFormData>) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editModeId) return;

    const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    const n8nEndpoint = `https://w.ibrase.com.br/webhook/projetos-get?instituto=${authInstitute}&_t=${new Date().getTime()}`;

    setIsLoading(true);
    fetch(n8nEndpoint, { cache: "no-store", headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" } })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Workflow was started" || (Array.isArray(data) && data[0]?.message === "Workflow was started")) {
          return;
        }
        
        let flatList: any[] = [];
        let list = Array.isArray(data) ? data : (data.json ? (Array.isArray(data.json) ? data.json : [data.json]) : [data]);
        list.forEach((entry: any) => {
          if (entry && entry.json) {
            if (Array.isArray(entry.json)) flatList.push(...entry.json);
            else flatList.push(entry.json);
          } else if (Array.isArray(entry)) {
            flatList.push(...entry);
          } else {
            flatList.push(entry);
          }
        });

        const item = flatList.find(i => String(i.id || i.id_projeto || i.id_proposta) === String(editModeId));
        if (item) {
          const rawInicio = item.vigencia_inicio || item.vigenciainicio || item.data_inicio_vigencia || item.data_inicio || item.dataInicioVigencia || item.vigencia?.dataInicio || item.vigencia?.inicio || "";
          const rawTermino = item.vigencia_fim || item.vigencia_termino || item.vigenciatermino || item.data_termino_vigencia || item.data_fim || item.dataTerminoVigencia || item.vigencia?.dataTermino || item.vigencia?.fim || "";

          let mappedVagasNucleo = null;
          const candidates = [
            item.vagas_nucleo,
            item.vagasNucleo,
            item.limites_modalidades,
            item.limitesModalidades
          ];
          for (const cand of candidates) {
            const parsed = parseModalidades(cand);
            if (parsed && parsed.length > 0) {
              mappedVagasNucleo = parsed;
              break;
            }
          }
          if (!mappedVagasNucleo) {
            mappedVagasNucleo = [];
          } else {
            // Check if it's a legacy format (has 'limite' instead of 'numero')
            const isLegacy = mappedVagasNucleo.some((v: any) => v.limite !== undefined && v.numero === undefined);
            if (isLegacy) {
              const convertedVagas: any[] = [];
              let currentSlot = 1;
              mappedVagasNucleo.forEach((legacyItem: any) => {
                const limite = Number(legacyItem.limite) || 0;
                for (let i = 0; i < limite; i++) {
                  convertedVagas.push({
                    numero: currentSlot++,
                    modalidadeId: String(legacyItem.id || legacyItem.modalidadeId || ""),
                    modalidadeNome: legacyItem.nome || legacyItem.modalidadeNome || "Modalidade Legada",
                  });
                }
              });
              mappedVagasNucleo = convertedVagas;
            }
          }

          let mappedPeriodos = [];
          if (item.periodos && Array.isArray(item.periodos) && item.periodos.length > 0) {
            mappedPeriodos = item.periodos;
          } else if (item.periodos_json) {
            try {
              const parsed = typeof item.periodos_json === 'string' ? JSON.parse(item.periodos_json) : item.periodos_json;
              if (Array.isArray(parsed) && parsed.length > 0) mappedPeriodos = parsed;
            } catch(e) {}
          }

          // Garante que as datas de início e fim venham no formato YYYY-MM-DD para o input type="date"
          mappedPeriodos = mappedPeriodos.map((p: any) => ({
            ...p,
            inicio: p.inicio ? formatDateForInput(p.inicio) : "",
            fim: p.fim ? formatDateForInput(p.fim) : ""
          }));



          let ativo = true;
          if (item.status?.ativo !== undefined) {
            ativo = item.status.ativo;
          } else if (item.ativo !== undefined) {
            ativo = (item.ativo === 1 || item.ativo === "1" || item.ativo === true || item.ativo === "true");
          }

          let mappedLimitesCargos: Array<{nome: string, limite: number}> = [];
          if (item.limites_cargos && typeof item.limites_cargos === 'string') {
            try { mappedLimitesCargos = JSON.parse(item.limites_cargos); } catch(e) {}
          } else if (item.limites_cargos && Array.isArray(item.limites_cargos)) {
            mappedLimitesCargos = item.limites_cargos;
          }
          
          // Se o JSON está vazio, tenta puxar das colunas antigas (projetos legados)
          if (mappedLimitesCargos.length === 0) {
            const fallback: Array<{nome: string, limite: number}> = [];
            if (item.qtd_instrutor) fallback.push({ nome: "Instrutor", limite: Number(item.qtd_instrutor) });
            if (item.limite_auxiliares) fallback.push({ nome: "Auxiliar", limite: Number(item.limite_auxiliares) });
            if (item.qtd_coord_geral) fallback.push({ nome: "Coordenador Geral", limite: Number(item.qtd_coord_geral) });
            if (item.qtd_coord_nucleo) fallback.push({ nome: "Coordenador de Núcleo", limite: Number(item.qtd_coord_nucleo) });
            if (item.qtd_coord_pedagogico) fallback.push({ nome: "Coordenador Pedagógico", limite: Number(item.qtd_coord_pedagogico) });
            if (item.qtd_supervisores) fallback.push({ nome: "Supervisor", limite: Number(item.qtd_supervisores) });
            if (fallback.length > 0) mappedLimitesCargos = fallback;
          }

          let vagasAlunoExtraidas = 0;
          if (item.limites) {
            let parsedLimites = item.limites;
            if (typeof parsedLimites === 'string') {
              try { parsedLimites = JSON.parse(parsedLimites); } catch(e) {}
            }
            vagasAlunoExtraidas = Number(parsedLimites?.vagasPorAluno || parsedLimites?.vagas_por_aluno || parsedLimites?.vagasPorNucleo || parsedLimites?.vagas_por_nucleo || 0);
          }
          if (!vagasAlunoExtraidas) {
            vagasAlunoExtraidas = Number(item.vagas_por_aluno || item.vagas_de_aluno || item.vagasPorAluno || item.vagas_por_nucleo || item.vagasPorNucleo || 0);
          }

          const defaultValues: Partial<ProjetoFormData> = {
            identificacao: {
              nomeProjeto: item.identificacao?.nomeProjeto || item.nome || item.nome_projeto || item.nomeProjeto || item.name || item.titulo || "",
              numeroProposta: item.identificacao?.numeroProposta || item.numero_proposta || item.numeroProposta || "",
              termoFomento: item.identificacao?.termoFomento || item.termo_fomento || item.termoFomento || "",
              numeroProcessoAdm: item.identificacao?.numeroProcessoAdm || item.numero_processo_adm || item.numeroProcessoAdm || "",
              numeroTransfereGov: item.identificacao?.numeroTransfereGov || item.numero_transferegov || item.numeroTransfereGov || "",
              aplicabilidade: item.identificacao?.aplicabilidade || item.aplicabilidade || "",
              descricao: item.identificacao?.descricao || item.descricao || "",
            },
            vigencia: {
              dataInicio: formatDateForInput(rawInicio),
              dataTermino: formatDateForInput(rawTermino),
            },
            limites: {
              vagasPorNucleo: vagasAlunoExtraidas, // Compatibilidade com formulários legados
              vagasPorAluno: vagasAlunoExtraidas,
            },
            limitesCargos: mappedLimitesCargos,
            faixaEtaria: {
              idadeMinima: (item.faixaEtaria?.idadeMinima || item.idade_min || item.idade_minima || item.idadeMinima) ? Number(item.faixaEtaria?.idadeMinima || item.idade_min || item.idade_minima || item.idadeMinima) : null,
              idadeMaxima: (item.faixaEtaria?.idadeMaxima || item.idade_max || item.idade_maxima || item.idadeMaxima) ? Number(item.faixaEtaria?.idadeMaxima || item.idade_max || item.idade_maxima || item.idadeMaxima) : null,
            },
            vagasNucleo: mappedVagasNucleo,
            periodos: mappedPeriodos,
            status: { ativo }
          };

          resetForm(defaultValues);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar dados do projeto:", err);
        setError("Erro ao carregar dados do projeto.");
      })
      .finally(() => setIsLoading(false));
  }, [editModeId, resetForm]);

  const saveProjeto = async (editId: string | null, data: ProjetoFormData) => {
    const authInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    const webhookUrl = editId 
      ? `https://w.ibrase.com.br/webhook/projetos-put?instituto=${authInstitute}` 
      : `https://w.ibrase.com.br/webhook/projetos-post?instituto=${authInstitute}`;

    // Mapeamento Flat retrocompatível com a base N8N/Supabase atual
    const payload: any = {
      nome_projeto: data.identificacao.nomeProjeto,
      numero_proposta: data.identificacao.numeroProposta,
      termo_fomento: data.identificacao.termoFomento,
      numero_processo_adm: data.identificacao.numeroProcessoAdm,
      numero_transferegov: data.identificacao.numeroTransfereGov,
      aplicabilidade: data.identificacao.aplicabilidade,
      descricao: data.identificacao.descricao,
      
      vigencia_inicio: data.vigencia.dataInicio,
      vigencia_termino: data.vigencia.dataTermino,
      vigencia_fim: data.vigencia.dataTermino,
      
      vagas_por_nucleo: data.limites.vagasPorAluno,
      vagas_por_aluno: data.limites.vagasPorAluno,
      vagas_de_aluno: data.limites.vagasPorAluno,
      
      idade_minima: data.faixaEtaria.idadeMinima,
      idade_maxima: data.faixaEtaria.idadeMaxima,
      idade_min: data.faixaEtaria.idadeMinima,
      idade_max: data.faixaEtaria.idadeMaxima,
      
      limites_cargos: data.limitesCargos,
      vagas_nucleo: data.vagasNucleo,
      
      // Retrocompatibilidade: Converte vagasNucleo de volta para limites_modalidades
      limites_modalidades: (() => {
        const counts: Record<string, { nome: string, count: number }> = {};
        data.vagasNucleo.forEach(v => {
          if (!counts[v.modalidadeId]) counts[v.modalidadeId] = { nome: v.modalidadeNome, count: 0 };
          counts[v.modalidadeId].count++;
        });
        return Object.entries(counts).map(([id, info]) => ({
          id: id,
          nome: info.nome,
          limite: info.count
        }));
      })(),

      periodos_json: data.periodos,
      ativo: data.status.ativo ? 1 : 0,

      // Dados Aninhados
      identificacao: data.identificacao,
      vigencia: data.vigencia,
      limitesMembros: data.limites,
      faixaEtaria: data.faixaEtaria,
      vagasNucleo: data.vagasNucleo,
      periodos: data.periodos,
      status: data.status,
    };

    if (editId) {
      payload.id = editId;
    }

    const response = await fetch(webhookUrl, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Erro ao enviar dados para o N8N.");
    return response;
  };

  return { isLoading, error, saveProjeto };
}
