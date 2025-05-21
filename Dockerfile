# Multi-stage build para otimização
# Stage 1: Dependências e build
FROM node:22.7.0-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos necessários para instalação de dependências
COPY package*.json ./

# Instala dependências com flag de produção
RUN npm ci --only=production

# Copia o código fonte
COPY . .

# Constrói a aplicação em modo de produção
RUN npm run build:api

# Stage 2: Imagem de produção
FROM node:22.7.0-alpine AS runner

WORKDIR /app

# Define variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=3000

# Copia apenas os arquivos necessários da fase de build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Reduz os privilégios para usuário não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

# Exponha a porta da aplicação
EXPOSE ${PORT}

# Inicia a aplicação em modo de produção
CMD ["node", "server.js"]
