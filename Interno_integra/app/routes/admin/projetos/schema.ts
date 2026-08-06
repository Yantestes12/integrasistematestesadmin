import { z } from "zod";

export const projetoSchema = z.object({
  identificacao: z.object({
    nomeProjeto: z.string().min(1, "O nome da iniciativa é obrigatório"),
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
    instrutoresPorNucleo: z.number().min(0).default(0),
    auxiliaresPorNucleo: z.number().min(0).default(0),
    coordGeral: z.number().min(0).default(0),
    coordNucleo: z.number().min(0).default(0),
    coordPedagogico: z.number().min(0).default(0),
    supervisores: z.number().min(0).default(0),
    vagasPorNucleo: z.number().min(0).default(0),
    nucleosMaximos: z.number().min(0).default(0),
    vagasPorAluno: z.number().min(0).default(0),
  }),
  faixaEtaria: z.object({
    idadeMinima: z.number().nullable().optional(),
    idadeMaxima: z.number().nullable().optional(),
  }),
  limitesModalidade: z.array(
    z.object({
      id: z.union([z.string(), z.number()]),
      nome: z.string(),
      limite: z.number().min(0).default(0)
    })
  ).default([]),
  periodos: z.array(
    z.object({
      id: z.union([z.string(), z.number()]),
      tipo: z.string(),
      rotulo: z.string().min(1, "O rótulo é obrigatório"),
      inicio: z.string().min(1, "A data de início é obrigatória"),
      fim: z.string().min(1, "A data de fim é obrigatória"),
    })
  ).default([]),
  status: z.object({
    ativo: z.boolean().default(true),
  }),
});

export type ProjetoFormData = z.infer<typeof projetoSchema>;
