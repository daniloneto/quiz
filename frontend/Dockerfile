# Use a imagem base oficial do Node.js
FROM node:22.7.0

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie todos os arquivos primeiro
COPY . .

# Instale as dependências do projeto
RUN npm install

# Exponha a porta em que a aplicação será executada
EXPOSE 9000

# Comando para iniciar a aplicação em modo desenvolvimento
CMD ["npm", "run", "dev"]
