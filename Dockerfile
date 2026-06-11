# VERYX AI-OS — production container
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:./dev.db"
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL="file:/data/veryx.db"
RUN addgroup -S veryx && adduser -S veryx -G veryx
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
RUN mkdir -p /data && chown -R veryx:veryx /data /app
USER veryx
EXPOSE 3000
# Push schema + seed on first boot (idempotent for demo), then serve.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx tsx prisma/seed.ts && npm start"]
