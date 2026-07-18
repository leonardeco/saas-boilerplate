FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/
COPY packages packages
RUN npm install --workspace=@saas/web --include-workspace-root=false || npm install
COPY apps/web apps/web
WORKDIR /app/apps/web
RUN npm run build || true
EXPOSE 3000
CMD ["npx", "next", "dev", "-H", "0.0.0.0"]
