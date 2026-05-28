FROM node:20-alpine AS base
RUN npm install -g turbo

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @saas/api --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
RUN turbo build --filter=@saas/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# Migration runner and SQL files
COPY --from=builder /app/packages/db/src/migrations ./packages/db/src/migrations
COPY --from=builder /app/packages/db/src/migrate.ts ./packages/db/src/migrate.ts
EXPOSE 3001
# Run DB migrations then start the API
CMD ["sh", "-c", "node --import tsx/esm /app/packages/db/src/migrate.ts && node /app/dist/index.js"]
