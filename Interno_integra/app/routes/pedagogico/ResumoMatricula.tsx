import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { 
  ChevronLeft, 
  Edit3, 
  FileText, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

export default function ResumoMatricula() {
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

    const fallbackFetch = async (inst: string, pMap: Record<string, string>, nMap: Record<string, string>, mMap: Record<string, string>) => {
      try {
        const res = await fetch(`https://w.ibrase.com.br/webhook/matriculas-get?instituto=${inst.toUpperCase()}`);
        if (res.ok) {
          const json = await res.json();
          const list = flattenArray(json);
          const item = list.find((i: any) => String(i.id) === String(id));
          if (item) {
            item.projeto_nome = item.projeto_nome || pMap[String(item.projeto_id || item.id_projeto)] || "";
            item.nucleo_nome = item.nucleo_nome || nMap[String(item.nucleo_id || item.id_nucleo)] || "";
            item.modalidade_nome = item.modalidade_nome || mMap[String(item.modalidade_id || item.id_modalidade)] || "";
            setData(item);
          } else {
            setErrorMsg("Matrícula não encontrada.");
          }
        }
      } catch (err) {
        setErrorMsg("Erro de conexão ao buscar detalhes.");
      } finally {
        setLoading(false);
      }
    };

    // Tentativa de buscar os detalhes da matrícula
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const inst = savedInstitute.toUpperCase();
        const [resM, resProj, resNuc, resMod] = await Promise.allSettled([
          fetch(`https://w.ibrase.com.br/webhook/matriculas-id-get?id=${id}&instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/projetos-get?instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/nucleos-get?instituto=${inst}`),
          fetch(`https://w.ibrase.com.br/webhook/modalidades-get?instituto=${inst}`)
        ]);

        let pMap: Record<string, string> = {};
        let nMap: Record<string, string> = {};
        let mMap: Record<string, string> = {};

        await Promise.all([
          processMap(resProj, pMap),
          processMap(resNuc, nMap),
          processMap(resMod, mMap)
        ]);

        if (resM.status === 'fulfilled' && resM.value.ok) {
          const json = await resM.value.json();
          const list = flattenArray(json);
          const item = list[0];
          if (item) {
            item.projeto_nome = item.projeto_nome || pMap[String(item.projeto_id || item.id_projeto)] || "";
            item.nucleo_nome = item.nucleo_nome || nMap[String(item.nucleo_id || item.id_nucleo)] || "";
            item.modalidade_nome = item.modalidade_nome || mMap[String(item.modalidade_id || item.id_modalidade)] || "";
            setData(item);
            setLoading(false);
          } else {
            fallbackFetch(inst, pMap, nMap, mMap);
          }
        } else {
          fallbackFetch(inst, pMap, nMap, mMap);
        }
      } catch (err) {
        fallbackFetch(savedInstitute, {}, {}, {});
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Buscando dados da matrícula...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Oops!</h2>
        <p className="text-slate-600 dark:text-slate-400">{errorMsg || "Matrícula não encontrada."}</p>
        <Link to="/pedagogico/matriculas" className="inline-block mt-4 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg font-bold">
          Voltar para Matrículas
        </Link>
      </div>
    );
  }

  // Fallback seguro de dados
  const nomeAluno = data.aluno_nome || data.nome || "Nome não informado";
  const cpfAluno = data.aluno_cpf || data.cpf || "—";
  const statusRaw = (data.status || "").toLowerCase();
  let statusBadge = (
    <span className="ml-1 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 uppercase">
      {data.status || "Desconhecido"}
    </span>
  );

  if (statusRaw === "aprovada" || statusRaw === "validada" || statusRaw === "ativo") {
    statusBadge = (
      <span className="ml-1 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 uppercase">
        {data.status || "Aprovada"}
      </span>
    );
  } else if (statusRaw === "pendente") {
    statusBadge = (
      <span className="ml-1 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase">
        Pendente
      </span>
    );
  } else if (statusRaw === "reprovada" || statusRaw === "cancelada") {
    statusBadge = (
      <span className="ml-1 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 uppercase">
        Reprovada
      </span>
    );
  }

  // Lista simulada caso seja fallback de dados parciais
  const camposGerais = [
    { label: "Data de nascimento", value: data.data_nascimento || "—" },
    { label: "Idade", value: data.idade || "—" },
    { label: "Raça", value: data.raca || "—" },
    { label: "Sexo", value: data.sexo || "—" },
    { label: "Naturalidade", value: data.naturalidade || "—" },
    { label: "Escolaridade", value: data.escolaridade || "—" },
    { label: "Profissão", value: data.profissao || "—" },
    { label: "WhatsApp", value: data.telefone_conta || data.whatsapp || "—" },
    { label: "CEP", value: data.cep || "—" },
    { label: "Endereço", value: data.endereco || "—" },
    { label: "Número", value: data.numero || "—" },
    { label: "Complemento", value: data.complemento || "—" },
    { label: "Bairro", value: data.bairro_nome || data.bairro || "—" },
    { label: "Cidade", value: data.cidade_nome || data.cidade || "—" },
    { label: "UF", value: data.uf || "—" },
    { label: "Nome do Responsável", value: data.resp_nome || data.responsavel_nome || "—" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Header com botões de navegação */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Matrícula #{id}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Ficha completa com dados do formulário.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/pedagogico/matriculas" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-slate-800 dark:text-slate-200 text-sm no-underline hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <ChevronLeft size={16} /> Voltar
          </Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-slate-800 dark:text-slate-200 text-sm no-underline hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <FileText size={16} /> Gerar PDF
          </button>
        </div>
      </div>

      {/* Card Principal */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-wrap gap-4 items-start shadow-sm">
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-black text-slate-900 dark:text-white truncate">{nomeAluno.toUpperCase()}</p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center">
              <span className="font-bold text-slate-800 dark:text-slate-200 mr-1">Status:</span> {statusBadge}
            </div>
            <div><span className="font-bold text-slate-800 dark:text-slate-200">CPF:</span> {cpfAluno}</div>
            <div><span className="font-bold text-slate-800 dark:text-slate-200">Projeto:</span> {data.projeto_nome || "—"}</div>
            <div><span className="font-bold text-slate-800 dark:text-slate-200">Núcleo:</span> {data.nucleo_nome || "—"}</div>
            <div><span className="font-bold text-slate-800 dark:text-slate-200">Modalidade:</span> {data.modalidade_nome || "—"}</div>
            <div><span className="font-bold text-slate-800 dark:text-slate-200">Turno:</span> {data.turno || "—"}</div>
          </div>
        </div>
      </div>

      {/* Dados do Formulário */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">Dados do formulário</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wide border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 w-64">Campo</th>
                <th className="px-5 py-3">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {camposGerais.map((campo, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-2.5 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{campo.label}</td>
                  <td className="px-5 py-2.5 text-slate-800 dark:text-slate-200 font-medium">{campo.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
