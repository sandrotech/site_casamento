FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY .npmrc .npmrc
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOST=0.0.0.0
COPY --from=builder /app ./
EXPOSE 3000
CMD ["sh", "-c", "npm start -- -p ${PORT}"]