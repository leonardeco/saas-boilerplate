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
npm run test:unit
# E2E (API + web running):
npm run test:e2e -w @saas/e2e
# or: cd apps/e2e && npx playwright install chromium && npm test
```

## SUPERADMIN script

```bash
DATABASE_URL=postgresql://... npm run make-superadmin -- you@email.com
```

## Production release

```bash
# with prod env loaded:
npm run check:prod-env
```

- [Release checklist](./docs/runbooks/release-checklist.md)
- [Store listing](./docs/runbooks/store-listing.md)
- [SECURITY.md](./SECURITY.md)
- Legal pages: `/privacy` · `/terms`
- Compose example: `docker-compose.prod.example.yml`


## Auth notes (v1.2)

- **Cookie-only SPA**: web no longer stores tokens in `localStorage`.
- Cookies httpOnly: `nt_access`, `nt_refresh` · `credentials: "include"`.
- API still returns JWT in JSON for mobile clients if needed.
- Auth **10 req/min** · hold **20 req/min**.

## Notifications

- **Email**: Resend or console preview
- **WhatsApp**: free-form or **approved Meta templates** (`WHATSAPP_USE_TEMPLATES`)
- See [docs/runbooks/whatsapp-templates.md](./docs/runbooks/whatsapp-templates.md)

## OAuth

- Google + GitHub: `/auth/oauth/{provider}/start` → callback sets cookies → `/dashboard`
- UI buttons on `/login` and `/register`
- Configure `GOOGLE_*` / `GITHUB_*` + `API_PUBLIC_URL`

## Observability

- `GET /metrics` — Prometheus text (requests, latency, region)
- `GET /health` — `version`, `region`
- **OTLP traces** — set `OTEL_ENABLED=true` + `OTEL_EXPORTER_OTLP_ENDPOINT`  
  See [docs/runbooks/otel.md](./docs/runbooks/otel.md)

## Read replicas

```env
DATABASE_READ_URL=postgresql://…@replica/…
```

Catalog + geo use `dbRead`. Bookings/auth always primary.  
Docs: [docs/runbooks/read-replicas.md](./docs/runbooks/read-replicas.md)

## PWA / Mobile / Capacitor

- Installable web: `manifest.webmanifest` + service worker (prod)
- **Capacitor shell**: `apps/mobile` (iOS/Android WebView)
- Guides: [docs/mobile-api.md](./docs/mobile-api.md) · [docs/runbooks/capacitor.md](./docs/runbooks/capacitor.md)

```bash
npm run mobile:www
# CAPACITOR_SERVER_URL=http://<LAN-IP>:3000 npm run mobile:sync -w @saas/mobile
```


## Multi-region

- See [docs/runbooks/multi-region.md](./docs/runbooks/multi-region.md)
- Set `REGION` per deploy; shared Postgres; single active worker

## Catalog search

- **Meilisearch** when `MEILI_HOST` set · else **Postgres**

## CI

- `unit` · `integration` (Postgres + Redis + migrate/seed) · `e2e` (API + Web + Playwright)




## Docs

- [Architecture v2](./docs/architecture/v2.md)
- [ADRs](./docs/adr/)
- [Implementation plan](./docs/IMPLEMENTATION_PLAN.md)
- [Launch runbook](./docs/runbooks/launch.md)

## License

MIT
