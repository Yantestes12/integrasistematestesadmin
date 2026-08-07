# Memória de Sessão - Plataforma Integra (GASCTPNA)

## 🔴 REGRA CRÍTICA: Branch de Deploy
- A hospedagem usa a branch **`master`** (NÃO `main`).
- Sempre fazer push para AMBAS: `git push origin main` E `git push origin main:master`
- Repositório: `https://github.com/Yantestes12/integrasistematestesadmin.git`

## 🔴 REGRA CRÍTICA: Não Mexer no Mobile
- O design mobile está PERFEITO. Nunca alterar estilos/lógica do celular.
- Alterações de PC devem usar breakpoints `md:` ou `lg:` para não afetar mobile.
- O usuário usa **NOTEBOOK** (não monitor grande). Breakpoint `md:` (768px+) é mais seguro que `lg:` (1024px+) porque notebooks com zoom 125%/150% do Windows podem não atingir `lg:`.

## 🔴 REGRA CRÍTICA: Permissões de Instituto
- NUNCA sobrescrever `auth_institutos_permitidos` do localStorage.
- Respeitar isolamento de dados por instituto (GASCTPNA, IBRASE, AUNI, IVEM).

## Design Aprovado
- Estética: Minimalista, clean, "pintado a lápis". NÃO futurista/robótico.
- Topbar PC: cor escura do instituto (`--theme-topbar`).
- Logo AUNI: sempre fundo escuro (`bg-slate-900`).
- Dashboard PC: cards quadrados (grid 2 colunas). Mobile: retângulos empilhados.
- Fontes PC: GRANDES (sidebar `text-lg md:text-xl` nível 0, `text-base md:text-lg` subitens).

## Sidebar - Problemas Resolvidos
- **Clique falhando no touchpad de notebook**: Causado por `active:scale` que fazia Chrome cancelar cliques com micro-movimento do touchpad. Removido.
- **Solução final**: `<Link>` nativo do React Router + `pointer-events-none` em TODOS os elementos filhos (spans, ícones).
- **Transição removida no PC**: `lg:transition-none` no aside para evitar layout thrashing.

## Nucleos.tsx - Estado Atual
- **Colunas da tabela**: Núcleo | Iniciativa | Bairro | Modalidade | Status Alocação | Status Físico | Ações
- **Resolução de nomes**: O N8N GET retorna apenas IDs (`projeto_id`, `modalidade_id`). O frontend faz 2 fetches paralelos antes (`projetos-get` e `modalidades-get`) para criar cache de nomes.
- **Status Alocação** = `aceitando_vagas` (Aberto/Fechado)
- **Status Físico** = `ativo` (Ativo/Inativo)
- **Problema pendente**: Verificar se `modalidades-get` existe como endpoint N8N. Se não existir, criar.

## N8N Endpoints
- Base: `https://w.ibrase.com.br/webhook/`
- Endpoints: `nucleos-get`, `nucleos-post`, `nucleos-put`, `nucleos-delete`, `projetos-get`, `modalidades-get` (verificar se existe), `api-hub-cpf`, `consultarcnpj`, `consultarcep`
- Token Hub: `193160880WeLPJqFrMT348746112`
- **Respond Webhook**: Todos os GETs devem usar `responseMode: "responseNode"` + nó `Respond to Webhook` com `respondWith: "allIncomingItems"`.

## Supabase - Schema nucleos
- Colunas reais: `id`, `projeto_id`, `bairro_id`, `nome`, `subnome`, `ativo`, `aceitando_vagas`, `modalidade_id`, `resp_cpf`, `resp_nome`, `resp_email`, `resp_telefone`, `possui_cnpj`, `cnpj`, `cep`, `rua`, `numero`, `bairro`, `ponto_referencia`, `turnos_calculados`, `formulario_id`, `vagas`, `inscritos`, `ip_cadastro`, `user_agent`, `created_by`, `updated_by`, `created_at`, `updated_at`
- Tabelas por instituto: `GASCTPNA_nucleos`, `IBRASE_nucleos`, `AUNI_nucleos`, `IVEM_nucleos`
- Joins Supabase (`projetos(nome)`) podem NÃO funcionar se as tabelas têm prefixo de instituto.

## Arquivos Principais
- `Interno_integra/app/components/Sidebar.tsx` - Navegação lateral
- `Interno_integra/app/components/Topbar.tsx` - Barra superior
- `Interno_integra/app/layouts/MainLayout.tsx` - Layout principal com temas
- `Interno_integra/app/routes/Dashboard.tsx` - Tela inicial
- `Interno_integra/app/routes/admin/Iniciativas.tsx` - Lista de projetos/iniciativas
- `Interno_integra/app/routes/admin/Nucleos.tsx` - Lista de núcleos (REESCRITO)
- `Interno_integra/app/routes/admin/CadastrarNucleo.tsx` - Cadastro/edição de núcleo
- `Interno_integra/app/routes/admin/CadastrarProjeto.tsx` - Cadastro/edição de projeto

## Último Commit
- Hash: `0767eb2` (sincronizado em `main` E `master`)
- Conteúdo: Todas as correções de sidebar, fontes, bolinhas de loading, e reescrita do Nucleos.tsx
