# QuizGPT

Uma aplicação para geração automática de quizzes via OpenAI GPT e gerenciamento de usuários.

## Funcionalidades

- Autenticação com JWT e verificação de API Key  
- Geração de perguntas em lote usando GPT-4o  
- Armazenamento de exames e quizzes em MongoDB  
- Rate limiting com Upstash Redis ou memória  
- Hash de senhas com Argon2  
- Logs persistentes no MongoDB via Winston  

## Tech Stack

- Backend: Next.js API Routes (Node.js)  
- Banco de dados: MongoDB  
- Autenticação: JSON Web Tokens (JWT)  
- Hash de senhas: Argon2  
- Rate Limiter: Upstash Redis (ou memória)  
- Logger: Winston + winston-mongodb  
- API GPT: OpenAI (gpt-4o)  

## Pré-requisitos

- Node.js ≥ 18  
- MongoDB  
- Conta e key da OpenAI  
- (Opcional) Conta e credenciais Upstash Redis  

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```ini
MONGODB_URI=...
DB_NAME=...
JWT_SECRET_KEY=...
API_KEY=...
OPENAI_API_KEY=...
# Se usar Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## Instalação

```bash
git clone <repo>
cd quiz
npm install
```

## Execução em desenvolvimento

```bash
npm run dev
```

O servidor ficará disponível em `http://localhost:3000`.

## Endpoints da API

### Autenticação

POST `/api/v1/auth/login`  
Corpo (JSON):
```json
{
  "username": "usuario",
  "password": "senha",
  "loginType": "user" // ou "admin"
}
```
Resposta:
```json
{
  "token": "...",
  "expiresAt": "2024-..-..T..:..:..Z",
  "uid": "..."
}
```

### Geração de Quiz

POST `/api/v1/upload/gpt-integration`  
Headers:
```
x-api-key: sua-api-key
Authorization: Bearer <token JWT>
Content-Type: multipart/form-data
```
Body (form-data):
- `numQuestions`: número de perguntas (1–20)  
- `quizTitle`: título do quiz  
- `examTitle`: título do exame existente  
- `lingua`: idioma (ex: `"pt"`)  
- `file`: arquivo de texto com conteúdo-base  

Resposta: mensagem de sucesso ou erro.

## Licença

MIT © Danilo Neto
