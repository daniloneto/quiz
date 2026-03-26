# Frontend (Vue 3 + Quasar)

Aplicação SPA usando Vue 3, Vite e Quasar Framework integrada às APIs em `src/pages/api/v1`.

Configuração:
- Copie `.env.example` para `.env` e ajuste:
  - `VITE_API_BASE_URL` (ex: `http://localhost:3000`)
  - `VITE_API_KEY` (mesmo valor de `API_KEY` do backend)

Instalação e execução:
- `npm install`
- `npm run dev` (inicia em `http://localhost:5174` e proxy de `/api` -> `http://localhost:3000`)

Funcionalidades implementadas:
- Autenticação: login, registro, confirmação de e-mail, esqueci/redefinição de senha
- Provas: listagem com paginação, criação, exclusão e detalhes com quizzes
- Quizzes: criação, edição de perguntas/opções, jogar quiz e salvar resultado
- Perfil: dados do usuário e tabela de níveis
- Resultados: histórico por prova/quiz
- Ferramentas IA: Upload de arquivo e Crawler por URLs para gerar perguntas
- Backup: aciona geração de backup no servidor

Notas:
- Desenvolvimento: requests de `/api/*` são proxied para `http://localhost:3000` (evitando CORS). Produção usa `VITE_API_BASE_URL`.
- Headers: a maioria das rotas exigem `x-api-key` e `Authorization: Bearer <token>` (exceto confirmação e reset de senha). O app injeta automaticamente a chave e o token.
- Para jogar um quiz é necessário que o título da prova esteja disponível (propagado pela navegação a partir da lista). Se entrar direto por URL, a tela tenta resolver o título consultando `/exams` com `limit=1000`.
