# Atualização do Fluxo N8N para Limites de Modalidades

O usuário solicitou que a lógica de buscar, apagar e inserir os limites de modalidades seja incorporada diretamente no fluxo atual do N8N (`workflow_n8n_crud_projetos.json`), utilizando nós nativos (Code, Loop, Switch, Supabase) para realizar a operação.

## Open Questions
- Você quer que eu utilize os **nós nativos do Supabase** (o que vai exigir criar um Switch e 4 nós para cada ação: buscar, deletar em loop, inserir) OU prefere que eu use o nó **HTTP Request** autenticado com sua credencial do Supabase (o que permite usar variáveis dinâmicas no nome da tabela e fazer tudo com apenas 1 ou 2 nós sem precisar de Switch e Loop gigantes)?

## Proposed Changes

Vou criar um script Node.js (`patch_n8n.js`) que vai ler o seu `workflow_n8n_crud_projetos.json`, adicionar os nós necessários e gerar um novo arquivo `workflow_n8n_crud_projetos_v2.json` para você importar.

### 1. Rota GET (Buscar Projetos)
- Interceptar os dados após o `Merge GET`.
- Adicionar um nó **Code** para separar as requisições.
- Buscar os limites correspondentes na tabela `_projeto_modalidade_limites` (via Switch + Supabase GET ou HTTP Request).
- Adicionar um nó **Code** para cruzar os limites com a tabela `_modalidades` (pegando os nomes) e injetar o array `limitesModalidade` no JSON do projeto.

### 2. Rota PUT (Atualizar Projetos)
- Após o `Merge PUT`, adicionar lógica para **Deletar** os limites antigos.
- Se for via nó nativo Supabase: Fazer um GET dos limites antigos -> Node Loop -> Switch -> 4 nós de DELETE (por ID).
- Adicionar nó **Code** (Item Lists) para separar o array `limitesModalidade` que veio do painel em múltiplos itens.
- Passar esses itens para a lógica de **Insert** (Switch -> 4 nós Supabase Insert).

### 3. Rota POST (Criar Projetos)
- Semelhante ao PUT, mas sem a etapa de exclusão.
- Após salvar o projeto e obter o novo `id`, usar um nó **Code** para separar o array `limitesModalidade` em múltiplos itens e inseri-los na tabela de limites usando o novo ID.

### 4. Rota DELETE (Excluir Projetos)
- Antes de excluir o projeto principal, buscar e deletar todos os limites atrelados a ele na tabela `_projeto_modalidade_limites` para evitar dados órfãos.

## Verification Plan
- Gerar o novo JSON.
- Validar a estrutura do JSON gerado para garantir que as conexões (connections) estão íntegras.
- O usuário importa o novo arquivo no N8N e testa salvar o projeto "IMPETO" no painel.
