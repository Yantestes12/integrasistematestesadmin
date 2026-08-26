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

## N8N Endpoints & Workflows
- Base: `https://w.ibrase.com.br/webhook/`
- Endpoints: `nucleos-get`, `nucleos-post`, `nucleos-put`, `nucleos-delete`, `espacos-get`, `espacos-post`, `espacos-put`, `espacos-delete`, `projetos-get`, `projetos-post`, `projetos-put`, `projetos-delete`
- **REGRA CRÍTICA DE DELETE NO N8N (SUPABASE NODE)**: Nós de `delete` DEVEM usar `filters` com `conditions: [{ keyName: 'id', condition: 'eq', keyValue: '={{ $json.body.id || $json.query.id }}' }]`. NUNCA usar `matchColumn`/`matchValue` antigos pois ignoram o WHERE e apagam a tabela inteira!
- **REGRA CRÍTICA DE GET NO N8N**: Usar `limit: 100` em vez de `returnAll: true` para evitar exceção quando a tabela está vazia.

## Módulo de Espaços e Núcleos - Estado Atual
- **Espacos.tsx**: Removido badge/estado de "Info Faltante". Status de aprovação é representado por um badge verde discreto com ícone "L" (CheckCircle2).
- **Nucleos.tsx**: Proteção com fallback em caso de webhook retornar resposta em branco ou vazia.
- **Scripts SQL**:
  - `gerar_nucleos_dos_espacos.sql`: Regenera núcleos automaticamente caso os espaços existam.
  - `povoar_modalidades_e_profissoes.sql`: Popula 34 modalidades e 30 profissões.

## Supabase - Schema nucleos & espacos
- Tabelas por instituto: `GASCTPNA_nucleos`, `IBRASE_nucleos`, `AUNI_nucleos`, `IVEM_nucleos`
- Tabelas de espaços: `GASCTPNA_espacos`, `IBRASE_espacos`, `AUNI_espacos`, `IVEM_espacos`

## Arquivos Principais
- `Interno_integra/app/components/Sidebar.tsx` - Navegação lateral
- `Interno_integra/app/components/Topbar.tsx` - Barra superior
- `Interno_integra/app/layouts/MainLayout.tsx` - Layout principal com temas
- `Interno_integra/app/routes/Dashboard.tsx` - Tela inicial
- `Interno_integra/app/routes/admin/Iniciativas.tsx` - Lista de projetos/iniciativas
- `Interno_integra/app/routes/admin/Nucleos.tsx` - Lista de núcleos
- `Interno_integra/app/routes/admin/Espacos.tsx` - Lista de espaços físicos
- `Interno_integra/app/routes/admin/CadastrarNucleo.tsx` - Cadastro/edição de núcleo
- `Interno_integra/app/routes/admin/CadastrarEspaco.tsx` - Cadastro/edição de espaço

## 🔴 REGRA CRÍTICA: Raciocínio Profundo & Validação de Código (Deep Think Mode)
- **Zero Suposições**: NUNCA assumir que um erro ou falta de atualização é culpa de cache/servidor sem antes inspecionar logs, conferir compilação, testar localmente ou verificar git diff.
- **Raciocínio Passo a Passo**: Antes de responder ou entregar código, analise criticamente a arquitetura, tipos, importações e dependências.
- **Verificação Rigorosa**: Teste builds (`npm run build`), verifique sintaxe e garanta alinhamento perfeito com os esquemas do N8N e Supabase antes de declarar concluído.

## Último Commit
- Hash: `cf6d941` (sincronizado em `main` E `master`)
- Conteúdo: Fix robust nucleos fallback, espacos badges, n8n delete filters e regeneração de núcleos SQL.


## 🔴 REGRA CRÍTICA: Prevenção de Regressões e Efeitos Colaterais
- **O Usuário está cansado de regressões (arrumar uma coisa e quebrar outra).**
- **NÃO ALTERE LÓGICA QUE JÁ ESTÁ FUNCIONANDO** a menos que seja estritamente solicitado e necessário para a tarefa.
- **NÃO ADIVINHE SOLUÇÕES COMPLEXAS**: Se um código já funcionava (ex: ID vs UUID no React Hook Form), resolva o problema da forma MENOS invasiva possível, sem reescrever ou destruir o que o usuário já havia validado no passado.
- **Raciocínio Defensivo:** Antes de alterar qualquer linha de código, pergunte a si mesmo: "Isso vai quebrar outra parte do sistema que não me pediram para mexer?". Use o Deep Think Mode rigorosamente para não cometer erros em cadeia.

## 🔴 REGRA CRÍTICA: NUNCA Alterar Páginas de Login ou Outros Repositórios sem Permissão
- **NUNCA alterar a página de login** (`login.html` do portal do aluno ou `Login.tsx` do admin) a menos que o usuário peça EXPLICITAMENTE e EXCLUSIVAMENTE para alterar o login.
- **NUNCA fazer push de diretórios inteiros para repositórios secundários** (como `areadeloginintegra`). Cada repositório tem sua própria estrutura (ex: `matricula.html` em vez de `matricula_aluno.html`).
- **Modificações Pontuais**: Se for solicitado alterar apenas a matrícula ou o PDF, edite APENAS o arquivo correspondente e JAMAIS toque em arquivos de login, autenticação ou navegação.

## Módulo de Eventos — Estado Atual
- **Arquivos frontend COMPLETOS**: `LocaisEvento.tsx`, `CadastrarLocalEvento.tsx`, `OcorrenciasEvento.tsx`
- **Rotas registradas** em `routes.ts`: `admin/locais-evento`, `admin/cadastrar-local-evento`, `admin/ocorrencias-evento`
- **Sidebar condicional**: "Locais de Evento" só aparece se instituto tiver proposta com `aplicabilidade="eventos"` (fetch em `projetos-get`)
- **Upload via N8N**: foto → bucket `eventos-fotos`, documentos → bucket `eventos-documentos`. Endpoint: `upload-storage` (recebe `{bucket, fileName, mimeType, base64}`, retorna `{url}`)
- **Pendente (configuração manual)**:
  1. Rodar SQL `criar_tabelas_eventos.sql` no Supabase (cria 8 tabelas: 4x locais_evento + 4x ocorrencias_evento)
  2. Criar buckets no Supabase Storage: `eventos-fotos` e `eventos-documentos` (ambos públicos)
  3. Criar 8 endpoints N8N: `locais-evento-get/post/put/delete` + `ocorrencias-evento-get/post/delete` + `upload-storage`
  4. Ver guia completo em `n8n_eventos_guide.md` (no artifact do brain)

## Último Commit
- Hash: `330d97d` (sincronizado em `main` E `master`)
- Conteúdo: Módulo de eventos — upload N8N Storage, sidebar condicional, locais/ocorrências completos.

## 🔴 REGRA CRÍTICA: Atitude Esperada (Qualidades do Claude)
- **Proatividade e Completude**: Nunca entregue tarefas pela metade. Se algo precisa ser criado (como 8 arquivos de configuração), crie TODOS os 8 sem pedir para o usuário fazer o trabalho manual.
- **Transparência Visual**: Sempre que gerar arquivos de configuração, scripts, ou respostas longas que o usuário precisa copiar, exiba-os na interface (como Artefatos visíveis no painel lateral) para fácil acesso, não apenas como arquivos soltos invisíveis no diretório.
- **Zero Achismos**: Sempre que o contexto não for suficiente, pare e FAÇA PERGUNTAS EXPLÍCITAS para alinhar as expectativas antes de sair executando código errado.
- **Raciocínio Metódico**: Resolva um problema de cada vez com total profundidade. Não pule etapas nem entregue soluções rasas. Assuma a responsabilidade de investigar até o fim.

