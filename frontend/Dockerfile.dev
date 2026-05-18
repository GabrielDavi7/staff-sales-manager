# 1. Usar uma imagem leve do Node
FROM node:20-alpine

# 2. Definir diretório de trabalho
WORKDIR /app

# 3. Copiar arquivos de dependências primeiro (otimiza cache)
COPY package.json package-lock.json* ./

# 4. Instalar dependências
RUN npm install

# 5. Copiar o restante do código
COPY . .

# 6. Expor a porta que o Vite usa por padrão
EXPOSE 5173

# 7. Comando para rodar o Vite no modo desenvolvimento
CMD ["npm", "run", "dev"]