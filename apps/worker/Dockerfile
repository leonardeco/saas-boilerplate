# NightTable Worker — BullMQ ingest / reindex
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/worker/package.json apps/worker/
COPY packages/db/package.json packages/db/
COPY packages/domain/package.json packages/domain/
COPY packages/search/package.json packages/search/
COPY packages/config packages/config
RUN npm ci --workspace=@saas/worker --include-workspace-root \
  || npm install --workspace=@saas/worker --include-workspace-root

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY packages ./packages
COPY apps/worker ./apps/worker
WORKDIR /app/apps/worker
CMD ["npx", "tsx", "src/index.ts"]
