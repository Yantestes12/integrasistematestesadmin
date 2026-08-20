import { z } from "zod";

export const projetoSchema = z.object({
  identificacao: z.object({
    nomeProjeto: z.string().min(1, "O nome da proposta é obrigatório"),
    numeroProposta: z.string().optional(),
    termoFomento: z.string().optional(),
    numeroProcessoAdm: z.string().optional(),
    numeroTransfereGov: z.string().optional(),
    aplicabilidade: z.string().min(1, "A aplicabilidade é obrigatória"),
    descricao: z.string().optional(),
  }),
  vigencia: z.object({
    dataInicio: z.string().optional(),
    dataTermino: z.string().optional(),
  }),
  limites: z.object({
    vagasPorNucleo: z.number().min(0).default(0),
    vagasPorAluno: z.number().min(0).default(0),
  }),
  limitesCargos: z.array(
    z.object({
      nome: z.string(),
      limite: z.number().min(0).default(0)
    })
  ).default([]),
  faixaEtaria: z.object({
    idadeMinima: z.number().nullable().optional(),
    idadeMaxima: z.number().nullable().optional(),
  }),
  vagasNucleo: z.array(
    z.object({
      numero: z.number(),
      modalidadeId: z.union([z.string(), z.number()]),
      modalidadeNome: z.string(),
      espacoVinculadoId: z.union([z.string(), z.number()]).nullable().default(null),
    })
  ).default([]),
  periodos: z.array(
    z.object({
      id: z.union([z.string(), z.number()]),
      tipo: z.string().optional().default("planejamento"),
      rotulo: z.string().optional().default(""),
      inicio: z.string().optional().default(""),
      fim: z.string().optional().default(""),
    })
  ).default([]),
  status: z.object({
    ativo: z.boolean().default(true),
  }),
});

export type ProjetoFormData = z.infer<typeof projetoSchema>;
