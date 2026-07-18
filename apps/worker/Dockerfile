FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/worker/package.json apps/worker/
COPY packages packages
RUN npm install --workspace=@saas/worker --include-workspace-root=false || npm install
COPY apps/worker apps/worker
WORKDIR /app/apps/worker
RUN npm run build || true
CMD ["npx", "tsx", "src/index.ts"]
