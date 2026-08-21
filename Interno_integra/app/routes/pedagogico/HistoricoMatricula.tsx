import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { 
  ChevronLeft, 
  Clock, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

export default function HistoricoMatricula() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentInstitute, setCurrentInstitute] = useState("IBRASE");

  useEffect(() => {
    const savedInstitute = localStorage.getItem("auth_institute") || "IBRASE";
    setCurrentInstitute(savedInstitute);
    
    const flattenArray = (rawData: any): any[] => {
      if (!rawData) return [];
      if (Array.isArray(rawData)) {
        const result: any[] = [];
        for (let i = 0; i < rawData.length; i++) {
          const item = rawData[i];
          if (item && item.json) {
            if (Array.isArray(item.json)) {
              for (let j = 0; j < item.json.length; j++) result.push(item.json[j]);
            } else {
              result.push(item.json);
            }
          } else {
            result.push(item);
          }
        }
        return result;
      }
      if (typeof rawData === 'object') {
        if (Array.isArray(rawData.data)) return rawData.data;
        if (Array.isArray(rawData.items)) return rawData.items;
        if (rawData.json) return Array.isArray(rawData.json) ? rawData.json : [rawData.json];
        return [rawData];
      }
      return [];
    };

    const processMap = async (resObj: any, mapObj: Record<string, string>) => {
      if (resObj.status === 'fulfilled' && resObj.value.ok) {
        try {
          const data = await resObj.value.json();
          const arr = flattenArray(data);
          arr.forEach((i: any) => {
            const mapId = String(i.id || i.id_nucleo || i.nucleo_id || i.projeto_id || i.modalidade_id || '');
            const mapName = i.nome || i.nome_nucleo || i.nucleo_nome || i.espaco_nome || i.titulo || '';
            if (mapId && mapName) mapObj[mapId] = mapName;
          });
        } catch(e) {}
      }
    };

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const inst = savedInstitute.toUpperCase();
        const [resM, resProj, resNuc, resHist] = await Promise.allSettled([
          fetch(`https://w.ibrase.com.br/webhook/matriculas-get?instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/historico-matriculas-get?instituto=${inst}`)
        ]);

        let pMap: Record<string, string> = {};
        let nMap: Record<string, string> = {};

        await Promise.all([
          processMap(resProj, pMap),
          processMap(resNuc, nMap)
        ]);

        if (resM.status === 'fulfilled' && resM.value.ok) {
          const json = await resM.value.json();
          const list = flattenArray(json);
          const item = list.find((i: any) => String(i.id) === String(id));
          if (item) {
            item.projeto_nome = item.projeto_nome || pMap[String(item.projeto_id || item.id_projeto)] || "";
            item.nucleo_nome = item.nucleo_nome || nMap[String(item.nucleo_id || item.id_nucleo)] || "";
            setData(item);
          } else {
            setErrorMsg("Matrícula não encontrada.");
          }
        }

        if (resHist.status === 'fulfilled' && resHist.value.ok) {
          try {
            const histData = await resHist.value.json();
            let arr = flattenArray(histData);
            
            // Filtra os logs apenas para esta matrícula
            let historicoLogs = arr.filter((h: any) => String(h.matricula_id) === String(id));
            
            // Ordena: mais recente primeiro
            historicoLogs.sort((a, b) => new Date(b.data_alteracao || b.created_at || 0).getTime() - new Date(a.data_alteracao || a.created_at || 0).getTime());
            
            // Traduz IDs para Nomes
            historicoLogs = historicoLogs.map(h => {
              let ant = h.valor_antigo;
              let nov = h.valor_novo;
              if (h.campo_alterado === 'Núcleo' || h.campo_alterado === 'nucleo_id') {
                 ant = nMap[String(ant)] || ant;
                 nov = nMap[String(nov)] || nov;
              }
              if (h.campo_alterado === 'Projeto' || h.campo_alterado === 'projeto_id') {
                 ant = pMap[String(ant)] || ant;
                 nov = pMap[String(nov)] || nov;
              }
              return { ...h, valor_antigo_txt: ant, valor_novo_txt: nov };
            });

            setHistorico(historicoLogs);
          } catch(e) {}
        }
      } catch (err) {
        setErrorMsg("Erro de conexão ao buscar histórico.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Buscando histórico de alterações...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Oops!</h2>
        <p className="text-slate-600 dark:text-slate-400">{errorMsg || "Matrícula não encontrada."}</p>
        <Link to="/pedagogico/matriculas" className="inline-block mt-4 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg font-bold">
          Voltar para Matrículas
        </Link>
      </div>
    );
  }

  const nomeAluno = data.aluno_nome || data.nome || "Nome não informado";
  const cpfAluno = data.aluno_cpf || data.cpf || "—";

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Barra de navegação */}
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/pedagogico/matriculas" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-slate-800 dark:text-slate-200 text-sm no-underline hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
          <ChevronLeft size={16} />
          Voltar para Matrículas
        </Link>
      </div>

      {/* Card de identificação do aluno */}
      <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        <div className="relative z-10">
          <p className="text-2xl font-black mb-1">{nomeAluno.toUpperCase()}</p>
          <p className="text-sm font-bold opacity-80 mb-6">
            Matrícula #{id} &nbsp;·&nbsp; CPF: {cpfAluno}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-wide opacity-70">Status</span>
              <span className="text-sm font-bold capitalize">{data.status || "Aprovada"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-wide opacity-70">Projeto</span>
              <span className="text-sm font-bold">{data.projeto_nome || "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-wide opacity-70">Núcleo</span>
              <span className="text-sm font-bold">{data.nucleo_nome || "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-wide opacity-70">Turno</span>
              <span className="text-sm font-bold">{data.turno || "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-wide opacity-70">Data de Cadastro</span>
              <span className="text-sm font-bold">{data.created_at || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Título da seção de histórico */}
      <div className="flex items-center gap-2 mt-8 px-2">
        <Clock className="text-slate-800 dark:text-slate-200" size={20} />
        <h4 className="text-lg font-black text-slate-900 dark:text-white m-0">Histórico de Alterações</h4>
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-black px-2.5 py-1 rounded-md ml-2 border border-blue-200 dark:border-blue-800">
          {historico.length} {historico.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {historico.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center py-16 px-6 text-center gap-4 shadow-sm mt-4">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-200">Nenhuma alteração registrada</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">Esta matrícula ainda não possui histórico de modificações no sistema.</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {historico.map((log, idx) => {
            const dataAlt = new Date(log.data_alteracao || log.created_at);
            const dataStr = isNaN(dataAlt.getTime()) ? "Data desconhecida" : dataAlt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
            
            return (
              <div key={log.id || idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:border-blue-300 dark:hover:border-blue-700">
                <div className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-3 rounded-full shrink-0">
                  <Clock size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <h5 className="font-bold text-slate-800 dark:text-white m-0">Alteração de {log.campo_alterado}</h5>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      {dataStr}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4 text-sm mt-3">
                    <div className="flex-1 w-full text-center md:text-left bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs line-through opacity-70 decoration-red-400">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">De (Antigo)</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300 truncate block">
                        {log.valor_antigo_txt || "—"}
                      </span>
                    </div>
                    <div className="text-slate-300 dark:text-slate-600 font-black rotate-90 md:rotate-0">➔</div>
                    <div className="flex-1 w-full text-center md:text-left bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-xs">
                      <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Para (Novo)</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300 truncate block">
                        {log.valor_novo_txt || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
}
