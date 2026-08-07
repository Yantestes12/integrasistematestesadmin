import { useFormContext } from "react-hook-form";
import type { ProjetoFormData } from "../schema";

export function IdentificacaoSection() {
  const { register, formState: { errors } } = useFormContext<ProjetoFormData>();

  return (
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
            placeholder="Ex.: PROMOV"
            {...register("identificacao.nomeProjeto")}
            className={`w-full bg-slate-50 border ${errors.identificacao?.nomeProjeto ? 'border-red-500' : 'border-slate-200'} rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.identificacao?.nomeProjeto && <span className="text-red-500 text-xs mt-1">{errors.identificacao.nomeProjeto.message}</span>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Proposta</label>
          <input
            type="text"
            placeholder="Ex.: 12345/2026"
            {...register("identificacao.numeroProposta")}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Termo de Fomento</label>
          <input
            type="text"
            placeholder="Ex.: Termo nº 805/2024"
            {...register("identificacao.termoFomento")}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Número do Processo Administrativo</label>
          <input
            type="text"
            placeholder="Ex.: 48000.00123/2026"
            {...register("identificacao.numeroProcessoAdm")}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Número do Transfere gov</label>
          <input
            type="text"
            placeholder="Ex.: 941234/2026"
            {...register("identificacao.numeroTransfereGov")}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Qual aplicabilidade? <span className="text-red-500">*</span>
          </label>
          <select
            {...register("identificacao.aplicabilidade")}
            className={`w-full bg-slate-50 border ${errors.identificacao?.aplicabilidade ? 'border-red-500' : 'border-slate-200'} rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Selecione...</option>
            <option value="projeto de aula">Projeto de Aula</option>
            <option value="evento">Evento</option>
          </select>
          {errors.identificacao?.aplicabilidade && <span className="text-red-500 text-xs mt-1">{errors.identificacao.aplicabilidade.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
        <textarea
          rows={3}
          placeholder="Opcional..."
          {...register("identificacao.descricao")}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
