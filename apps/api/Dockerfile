FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY packages packages
RUN npm install --workspace=@saas/api --include-workspace-root=false || npm install
COPY apps/api apps/api
WORKDIR /app/apps/api
CMD ["npx", "tsx", "src/index.ts"]
