FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY .npmrc .npmrc
RUN apk add --no-cache libc6-compat && npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOST=0.0.0.0
RUN apk add --no-cache libc6-compat
COPY --from=builder /app ./
RUN mkdir -p /app/public/uploads/gifts /app/public/uploads/supporters /app/data && \
    chown -R node:node /app/public/uploads /app/data
VOLUME ["/app/public/uploads", "/app/data"]
USER node
EXPOSE 3000
CMD ["sh", "-c", "npm start -- -p ${PORT}"]
