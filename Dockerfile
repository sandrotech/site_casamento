# ===========================
# Etapa 1: Build da aplicação
# ===========================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia apenas dependências primeiro (melhor cache)
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o restante do projeto
COPY . .

# Faz o build de produção
RUN npm run build

# ===========================
# Etapa 2: Runtime (imagem leve)
# ===========================
FROM node:22-alpine AS runner

WORKDIR /app

# Define variáveis de ambiente
ENV NODE_ENV=production

# CapRover injeta a variável PORT automaticamente
# Portanto, usamos ela no CMD, sem fixar 3000
ENV PORT=3000

# Copia apenas os arquivos necessários
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY lib/respostas.json ./lib/respostas.json

# Instala apenas dependências de produção
RUN npm ci --omit=dev

# Exponha a porta, mas de forma genérica
EXPOSE $PORT

# Inicia o servidor Next.js escutando na porta dinâmica
CMD ["sh", "-c", "npm start -- -p ${PORT}"]