# 🧠 Memory Bank - Plataforma Integra

Este documento serve como um banco de memória ativo para o projeto **Plataforma Integra**. Ele consolida as regras de negócio, a arquitetura atual, o status de desenvolvimento e o contexto para futuras implementações (seja com desenvolvedores ou outras IAs).

---

## 1. Contexto do Projeto
- **Objetivo:** Refatorar a antiga plataforma PHP (site da GASCTPNA / Douglas) para um frontend moderno (React + Vite) chamado *Integra*, utilizando o N8N como middleware/backend e o Supabase como banco de dados.
- **Multi-Tenant (Institutos):** O sistema lida dinamicamente com 4 institutos/schemas principais através da seleção feita no frontend e enviada aos webhooks:
  - `IBRASE`
  - `GASCTPNA`
  - `AUNI`
  - `IVEM`

## 2. Arquitetura e Padrões
- **Frontend:** 
  - React com Vite e React Router (novo padrão em `app/routes.ts`).
  - Tailwind CSS para estilização (layouts premium, uso de cards, glassmorphism e design limpo estilo "Douglas").
  - Hook Forms (`react-hook-form`) com Zod (`zod`) para validação dos formulários.
- **Backend / Middleware:**
  - N8N (`w.ibrase.com.br/webhook/`) atua como a única ponte entre o Frontend e o Banco de Dados.
  - Fluxos separados por módulo (ex: `projetos-post`, `nucleos-get`).
  - Todo fluxo inicia com um nó de `Webhook` e possui um `Switch` para rotear a operação para o nó do Supabase correspondente ao instituto.
- **Banco de Dados (Supabase):**
  - Tabelas separadas por prefixo de instituto (ex: `IBRASE_projetos`, `AUNI_nucleos`).
  - Uso intensivo de relacionamentos (`projetos` -> `cidades` -> `bairros` -> `nucleos`).

## 3. Módulos Desenvolvidos e Status

### 📌 Projetos / Iniciativas
- **Status:** ✅ Concluído e testado.
- **Telas:**
  - `Iniciativas.tsx`: Listagem moderna com filtros, badge de status e listagem das aplicabilidades.
  - `CadastrarProjeto.tsx`: Formulário completo.
- **Fluxos N8N Relacionados:**
  - `projetos-post` (Criação de projetos).
  - `projetos-put` (Atualização via interface de edição).
  - `insert-limits` (Fluxo auxiliar para preencher JSONB de limites de cargos).
- **Regras de Negócio Chave:** O antigo modelo relacional de limites (quantidade de instrutores, vagas, etc.) foi migrado para um formato JSONB dentro da coluna `limites_cargos` (ex: `[{"nome":"Coordenador de Núcleo","limite":1}]`). Fallbacks foram criados no frontend (`useProjetoWebhook.ts`) para ler dados legados caso o JSON esteja vazio.

### 📌 Núcleos
- **Status:** ⏳ Frontend 100% implementado. Aguardando testes manuais do usuário nos Webhooks N8N.
- **Telas:**
  - `Nucleos.tsx`: Tabela de núcleos vinculados com Cidades, Bairros, Projetos e Cargos (Coordenador e Instrutor).
  - `CadastrarNucleo.tsx`: Formulário otimizado em seções (cards).
- **Integrações de API:**
  - Consulta de CEP via `consultarcep` apontando para o Hub do Desenvolvedor, preenchendo Logradouro e Bairro automaticamente.
- **Fluxos N8N (Arquivos JSON gerados no Workspace):**
  - `N8N_NUCLEOS_GET.json` (Faz um `getAll` com Supabase usando *select* em tabelas filhas `bairros(cidades(projetos))`).
  - `N8N_NUCLEOS_POST.json` (Insert na tabela `nucleos`).
  - `N8N_NUCLEOS_DELETE.json` (Faz um update na coluna `ativo = 0`).
  - `N8N_CONSULTAR_CEP.json`.

## 4. O Que Falta / Próximos Passos (To-Do)
1. **Teste da aba Núcleos:** Validar se o N8N está recebendo os payloads de POST e GET perfeitamente através da interface do `CadastrarNucleo.tsx`.
2. **Edição de Núcleo (PUT):** Implementar o carregamento dos dados legados na tela de `CadastrarNucleo.tsx` quando a URL contiver `?edit=ID`, bem como fazer o envio para um possível webhook `nucleos-put`.
3. **Módulo de Usuários / Colaboradores:** (Possível próximo módulo) Migrar a listagem e cadastro de Equipe/Colaboradores da versão em PHP para a versão React.
4. **Verificação Consistente:** Confirmar se todos os dados nos bancos `AUNI` e `IVEM` batem perfeitamente com o arquivo legado `.sql` de backup.

## 5. Dicas Úteis para a IA nas Próximas Sessões
- **Evitar Nomes Dissonantes:** Sempre usar o padrão de nomenclatura de variável do PHP legado no payload, a menos que especificado diferente pelo usuário.
- **N8N:** Ao gerar JSONs para N8N, certifique-se SEMPRE de incluir as propriedades root `"nodes": []`, `"connections": {}`, ou a importação falhará. Nunca use nó nativo de PostgreSQL se a base estiver no Supabase; prefira o `n8n-nodes-base.supabase` usando o param `getAll` + `columns`.
- **Navegação no React:** Sempre use o `useNavigate()` do React Router. O `window.history.back()` foi abandonado porque desfazia o cache/estado da sessão e mandava para a Home indevidamente em algumas situações.
