import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Rota de Login (Pública/Autônoma)
  route("login", "routes/Login.tsx"),
  route(":instituto/eventos", "routes/InscricaoEventoPublica.tsx"),
  route(":instituto/lgpd", "routes/LgpdPublica.tsx"),
  route("api/proxy-image", "routes/api.proxy-image.ts"),

  // Rotas Privadas / Administrativas
  layout("layouts/MainLayout.tsx", [
    index("routes/Dashboard.tsx"),
    
    // Admin / Propostas, Formulários e Cronogramas
    route("admin/propostas", "routes/admin/Propostas.tsx"),
    route("admin/cadastrar-projeto", "routes/admin/CadastrarProjeto.tsx"),
    route("admin/formularios", "routes/admin/Formularios.tsx", { id: "admin-formularios" }),
    route("admin/projetos/formularios", "routes/admin/Formularios.tsx", { id: "admin-projetos-formularios" }),
    route("admin/eventos/formularios", "routes/admin/Formularios.tsx", { id: "admin-eventos-formularios" }),
    route("admin/projetos/cronogramas", "routes/admin/Cronogramas.tsx", { id: "admin-projetos-cronogramas" }),
    route("admin/eventos/cronogramas", "routes/admin/Cronogramas.tsx", { id: "admin-eventos-cronogramas" }),
    // Admin / Espaços
    route("admin/espacos", "routes/admin/Espacos.tsx"),
    route("admin/cadastrar-espaco", "routes/admin/CadastrarEspaco.tsx"),
    // Admin / Núcleos
    route("admin/nucleos", "routes/admin/Nucleos.tsx"),
    route("admin/historico-nucleos", "routes/admin/HistoricoNucleos.tsx"),
    route("admin/cadastrar-nucleo", "routes/admin/CadastrarNucleo.tsx"),
    route("admin/grade-horaria", "routes/admin/GradeHoraria.tsx"),
    route("admin/grade-gestao", "routes/admin/GradeGestao.tsx"),
    route("admin/grade-estagiarios", "routes/admin/GradeEstagiarios.tsx"),
    // Admin / Eventos
    route("admin/locais-evento", "routes/admin/LocaisEvento.tsx"),
    route("admin/cadastrar-local-evento", "routes/admin/CadastrarLocalEvento.tsx"),
    route("admin/ocorrencias-evento", "routes/admin/OcorrenciasEvento.tsx"),
    
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
    
    // Marketing
    route("marketing", "routes/marketing/MarketingDashboard.tsx"),
    
    // Instrutor
    route("instrutor", "routes/instrutor/InstrutorDashboard.tsx"),
    
    // RH
    route("rh", "routes/rh/RHDashboard.tsx"),
  ]),
] satisfies RouteConfig;

