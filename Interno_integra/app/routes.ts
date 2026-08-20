import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Rota de Login (Pública/Autônoma)
  route("login", "routes/Login.tsx"),

  // Rotas Privadas / Administrativas
  layout("layouts/MainLayout.tsx", [
    index("routes/Dashboard.tsx"),
    
    // Admin / Propostas
    route("admin/propostas", "routes/admin/Propostas.tsx"),
    route("admin/cadastrar-projeto", "routes/admin/CadastrarProjeto.tsx"),
    // Admin / Espaços
    route("admin/espacos", "routes/admin/Espacos.tsx"),
    route("admin/cadastrar-espaco", "routes/admin/CadastrarEspaco.tsx"),
    // Admin / Núcleos
    route("admin/nucleos", "routes/admin/Nucleos.tsx"),
    route("admin/historico-nucleos", "routes/admin/HistoricoNucleos.tsx"),
    route("admin/cadastrar-nucleo", "routes/admin/CadastrarNucleo.tsx"),
    route("admin/grade-horaria", "routes/admin/GradeHoraria.tsx"),
    
    // Pedagógico / Inscrições
    route("pedagogico/inscricoes", "routes/pedagogico/Inscricoes.tsx"),
    // Pedagógico / Matrículas
    route("pedagogico/matriculas", "routes/pedagogico/Matriculas.tsx"),
    route("pedagogico/matriculas/resumo/:id", "routes/pedagogico/ResumoMatricula.tsx"),
    route("pedagogico/matriculas/historico/:id", "routes/pedagogico/HistoricoMatricula.tsx"),
    // Pedagógico / Turmas
    route("pedagogico/turmas", "routes/pedagogico/Turmas.tsx"),
    // Pedagógico / Relatórios
    route("pedagogico/relatorios", "routes/pedagogico/Relatorios.tsx"),
  ]),
] satisfies RouteConfig;