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
        const [resM, resProj, resNuc] = await Promise.allSettled([
          fetch(`https://w.ibrase.com.br/webhook/matriculas-get?instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst}`)
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
          0 registros
        </span>
      </div>

      {/* Estado: sem registros (Mock) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center py-16 px-6 text-center gap-4 shadow-sm mt-4">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700">
          <Clock size={32} />
        </div>
        <div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">Nenhuma alteração registrada</p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">Esta matrícula ainda não possui histórico de modificações no sistema.</p>
        </div>
      </div>
      
    </div>
  );
}
