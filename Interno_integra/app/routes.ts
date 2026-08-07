import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Rota de Login (Pública/Autônoma)
  route("login", "routes/Login.tsx"),

  // Rotas Privadas / Administrativas
  layout("layouts/MainLayout.tsx", [
    index("routes/Dashboard.tsx"),
    
    // Admin / Iniciativas
    route("admin/iniciativas", "routes/admin/Iniciativas.tsx"),
    route("admin/cadastrar-projeto", "routes/admin/CadastrarProjeto.tsx"),
    // Admin / Espaços
    route("admin/espacos", "routes/admin/Espacos.tsx"),
    route("admin/cadastrar-espaco", "routes/admin/CadastrarEspaco.tsx"),
    // Admin / Núcleos
    route("admin/nucleos", "routes/admin/Nucleos.tsx"),
    route("admin/cadastrar-nucleo", "routes/admin/CadastrarNucleo.tsx"),
  ]),
] satisfies RouteConfig;