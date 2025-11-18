# ===========================
# Etapa 1: Build da aplicação
# ===========================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia apenas dependências primeiro (melhor cache)
COPY package*.json ./ 

# Instala dependências ignorando peer deps
RUN npm ci --legacy-peer-deps

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
ENV PORT=3000

# Copia apenas os arquivos necessários
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY lib/respostas.json ./lib/respostas.json

# Instala apenas dependências de produção ignorando peer deps
RUN npm ci --omit=dev --legacy-peer-deps

# Exponha a porta genérica do CapRover
EXPOSE $PORT

# Inicia o servidor Next.js na porta dinâmica
CMD ["sh", "-c", "npm start -- -p ${PORT}"]
