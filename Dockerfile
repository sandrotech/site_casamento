##############################
# BUILD STAGE
##############################
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY .npmrc .npmrc

RUN apk add --no-cache libc6-compat && npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}

RUN npm run build

##############################
# RUNTIME STAGE
##############################
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOST=0.0.0.0
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}

RUN apk add --no-cache libc6-compat

# Copia tudo do builder (inclui public/fotos e public/uploads)
COPY --from=builder /app ./

# Cria pastas de uploads e ajusta permissões
RUN mkdir -p /app/public/uploads \
    /app/public/uploads/gifts \
    /app/public/uploads/supporters \
    /app/data && \
    chown -R node:node /app/public/uploads /app/data

# !!! IMPORTANTE !!!
# NÃO DEFINIR VOLUME AQUI!
# O CapRover deve gerenciar volumes pela interface.

USER node

EXPOSE 3000

CMD ["sh", "-c", "npm start -- -p ${PORT}"]
