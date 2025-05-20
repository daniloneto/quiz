# QuizGPT

Uma aplicação para geração automática de quizzes via OpenAI GPT e gerenciamento de usuários.

## Funcionalidades

- Autenticação com JWT e verificação de API Key  
- Geração de perguntas em lote usando GPT-4o
- Extração de conteúdo via web crawling para geração de quizzes  
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
- API GPT: OpenAI (gpt-4o) e Gemini
- Web Crawling: Axios + Cheerio  

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
OPENAI_API_KEY=... # Necessária se LLM_PROVIDER for 'openai' ou não definido
GEMINI_API_KEY=...   # Necessária se LLM_PROVIDER for 'gemini'
LLM_PROVIDER=openai  # Pode ser 'openai' ou 'gemini'. Define qual LLM usar.
# Configuraçao do Rate Limiting
ENABLE_UPSTASH=false  # Define se o rate limiting será utilizado (true) ou desabilitado (false). Default: true
# Se ENABLE_UPSTASH=true, configure as seguintes variáveis:
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

![diagram](https://github.com/user-attachments/assets/9605208c-cc20-4c38-a985-3536a8e9e7b8)


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

### Geração de Quiz via Web Crawling

POST `/api/v1/crawler`  
Headers:
```
x-api-key: sua-api-key
Authorization: Bearer <token JWT>
Content-Type: application/json
```
Body (JSON):
```json
{
  "numQuestions": 5,
  "quizTitle": "Título do Quiz",
  "examTitle": "Título do Exame",
  "lingua": "pt",
  "urls": ["https://exemplo.com/pagina1", "https://exemplo.com/pagina2"]
}
```
- `numQuestions`: número de perguntas (1–20)  
- `quizTitle`: título do quiz  
- `examTitle`: título do exame existente  
- `lingua`: idioma (ex: `"pt"`)  
- `urls`: array de URLs para fazer o web crawling  

Resposta:
```json
{
  "success": true,
  "message": "Questions successfully created from crawled content",
  "questionCount": 15
}
```

## Licença

MIT © Danilo Neto
