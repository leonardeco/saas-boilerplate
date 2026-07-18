# Deploy on Railway — NightTable CO

## Services to create

| Service | Root / Docker | Notes |
|---|---|---|
| **Postgres** | Railway plugin | PG 16 |
| **Redis** | Railway plugin | |
| **api** | Dockerfile `apps/api/Dockerfile` | monorepo root as context |
| **worker** | Dockerfile `apps/worker/Dockerfile` | |
| **web** | Dockerfile `apps/web/Dockerfile` | build-arg `NEXT_PUBLIC_API_URL` |

Each service has `railway.toml` under `apps/*`.

## Docker build context

Set **Root Directory** empty (repo root) and Dockerfile path:

- API: `apps/api/Dockerfile`  
- Worker: `apps/worker/Dockerfile`  
- Web: `apps/web/Dockerfile`  

## Shared variables

Reference Postgres/Redis variables from plugins:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

API/Web:

```
NODE_ENV=production
TRUST_PROXY=true
COOKIE_SECURE=true
WEB_URL=https://<web-domain>
CORS_ORIGIN=https://<web-domain>
API_PUBLIC_URL=https://<api-domain>
JWT_ACCESS_SECRET=<openssl rand -base64 48>
JWT_REFRESH_SECRET=<openssl rand -base64 48>
REGION=railway
```

Web build args:

```
NEXT_PUBLIC_API_URL=https://<api-domain>
NEXT_PUBLIC_APP_NAME=NightTable CO
```

## Migrate

Use Railway shell or local:

```bash
railway run npm run db:migrate -w @saas/db
railway run npm run db:seed -w @saas/db
```

## Health

- API: `/health`, `/ready`  
- Public metrics: restrict at edge if possible  

## Worker

Only **one** worker instance for ingest queue (scale=1) unless you redesign consumers.
