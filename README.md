# NightTable CO

**Food & Nightlife premium en Colombia** — marketplace + SaaS multi-sede + reservas + ingestión + reviews.

Repo: [leonardeco/saas-boilerplate](https://github.com/leonardeco/saas-boilerplate)  
Proceso: `full-dev-team` (SKILLS-GROK) · Arquitectura v2

## Stack

TypeScript · Next.js 15 · Fastify 5 · PostgreSQL · Redis · Meilisearch · BullMQ · Stripe · Drizzle

## Monorepo

```
apps/web       Discovery SEO, reserva, panel, admin
apps/api       Auth, catalog, bookings, claims, reviews, billing, admin
apps/worker    Ingestión (mock/OSM/Places) + publish + reindex
packages/
  domain       quality, booking machine, normalize
  contracts    Zod shared
  db           schema + migrations + seeds
  search       Meilisearch client
  ui           primitives
```

## Quick start

```bash
cp .env.example .env
# JWT secrets ≥ 32 chars

docker compose up postgres redis meilisearch -d
npm install
npm run db:migrate -w @saas/db
npm run db:seed -w @saas/db

npm run dev -w @saas/api
npm run dev -w @saas/worker
npm run dev -w @saas/web
```

| URL | |
|---|---|
| Web | http://localhost:3000 |
| API docs | http://localhost:3001/docs |
| Health | http://localhost:3001/health |

## Features (S0–S6)

| Sprint | Status |
|---|---|
| S0 Foundation | done |
| S1 Auth + catalog SEO | done |
| S2 Ingestion pipeline | done |
| S3 Booking HOLD/confirm + locks | done |
| S4 Claim + panel + Stripe hooks | done |
| S5 Reviews + admin curation | done |
| S6 Hardening / runbook | done |

### API map

- `POST /auth/*` — register, login, refresh, logout, me
- `GET /geo/cities`
- `GET /catalog/search` · `GET /catalog/:city/:slug`
- `POST /bookings/hold` · `POST /bookings/:id/confirm` · agenda/mine
- `POST /claims` · admin approve/reject
- `POST /reviews` · `GET /reviews/venue/:id`
- `GET /billing/plans` · checkout/portal/webhook
- `POST /admin/ingestion` · flags · curation
- `GET /venues/mine` · `PATCH /venues/:id`

### Web routes

- `/` · `/co/[city]` · `/co/[city]/[slug]` · `/reservar`
- `/login` · `/register` · `/mis-reservas`
- `/dashboard` · `/dashboard/agenda/[venueId]` · `/dashboard/billing`
- `/admin`

## SUPERADMIN

```sql
UPDATE users SET platform_role = 'SUPERADMIN' WHERE email = 'tu@email.com';
```

## Tests

```bash
npm test -w @saas/domain
npm test -w @saas/contracts
npm test -w @saas/api
```

## Docs

- [Architecture v2](./docs/architecture/v2.md)
- [ADRs](./docs/adr/)
- [Implementation plan](./docs/IMPLEMENTATION_PLAN.md)
- [Launch runbook](./docs/runbooks/launch.md)

## License

MIT
