# Production readiness — NightTable CO

Full release flow: **[release-checklist.md](./release-checklist.md)**  
Stores: **[store-listing.md](./store-listing.md)**

## Pre-launch checklist (summary)

- [ ] Managed Postgres 16 + backups
- [ ] Managed Redis (required for multi-instance locks)
- [ ] JWT secrets strong & unique (`openssl rand -base64 48`)
- [ ] `COOKIE_SECURE=true` · `TRUST_PROXY=true`
- [ ] `WEB_URL` / `CORS_ORIGIN` / `API_PUBLIC_URL` https
- [ ] Stripe live + webhook
- [ ] Migrations applied; SUPERADMIN created
- [ ] Worker running
- [ ] Swagger off in prod
- [ ] Privacy + Terms pages live (`/privacy`, `/terms`)
- [ ] `node scripts/check-prod-env.mjs` exit 0

## Create SUPERADMIN

```bash
DATABASE_URL=... npm run make-superadmin -- you@example.com
```

## Deploy topology (I1)

| Service | Notes |
|---|---|
| web | Next.js |
| api | Fastify · trust proxy |
| worker | BullMQ · single active region preferred |
| postgres | managed primary (+ optional replica) |
| redis | managed |
| meilisearch | recommended |

Example: `docker-compose.prod.example.yml`

## Hardening (v1.6)

- Production env rejects weak JWT / insecure cookies / localhost CORS
- HSTS, nosniff, frame deny, permissions-policy
- Global rate limit tighter in prod; auth/hold still stricter
- `/debug/*` disabled when `NODE_ENV=production`
- Swagger only if `ENABLE_SWAGGER=true`

## Rollback

- Redeploy previous images
- Additive migrations only reverse with DBA plan
- Feature-flag booking off if needed

## SLO

| Metric | Target |
|---|---|
| Overbooking | **0** |
| Availability | 99.5%+ |
