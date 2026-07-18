<p align="center">
  <img src="apps/web/public/icons/icon.svg" alt="NightTable CO" width="96" height="96" />
</p>

<h1 align="center">NightTable CO</h1>

<p align="center">
  <strong>Marketplace premium de food &amp; nightlife en Colombia</strong><br/>
  Descubre y reserva restaurantes, bares y discotecas · SaaS multi-sede para locales
</p>

<p align="center">
  <a href="https://github.com/leonardeco/saas-boilerplate/releases/tag/v1.6.0"><img src="https://img.shields.io/badge/release-v1.6.0-0ea5e9?style=for-the-badge" alt="v1.6.0" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge" alt="MIT" /></a>
  <a href="./docs/architecture/v2.md"><img src="https://img.shields.io/badge/architecture-v2-a78bfa?style=for-the-badge" alt="Architecture" /></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/security-policy-f43f5e?style=for-the-badge" alt="Security" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Fastify_5-000000?style=flat-square&logo=fastify&logoColor=white" alt="Fastify" />
  <img src="https://img.shields.io/badge/PostgreSQL_16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Capacitor-119EFF?style=flat-square&logo=capacitor&logoColor=white" alt="Capacitor" />
</p>

---

## Visión

NightTable CO es una plataforma **híbrida**:

| Lado | Valor |
|---|---|
| **Comensales** | Descubrir locales **premium** (alta calificación + curación) y **reservar** con flujo HOLD → confirmación |
| **Locales** | Reclamar ficha, agenda, planes SaaS (Stripe), multi-sede (cadena → sedes) |
| **Plataforma** | Ingestión de catálogo, admin, reviews, notificaciones, observabilidad |

Posicionamiento: **Food + Nightlife premium en Colombia** (lentes *Comer* / *Salir*), cobertura nacional por olas de ciudad.

> Evolución profesional del monorepo [saas-boilerplate](https://github.com/leonardeco/saas-boilerplate) · release **[v1.6.0](https://github.com/leonardeco/saas-boilerplate/releases/tag/v1.6.0)**

---

## Características

| Módulo | Capacidad |
|---|---|
| **Auth** | Registro/login, JWT + refresh rotation, cookies httpOnly, OAuth Google/GitHub |
| **Catálogo** | Geo CO, búsqueda premium, lentes Comer/Salir, SEO por ciudad/local |
| **Booking** | Slots, HOLD con TTL, confirm/cancel, locks Redis, agenda del local |
| **Claims** | Solicitud de dueño + aprobación SUPERADMIN |
| **Reviews** | Reseñas propias, recálculo de rating y quality score |
| **Billing** | Planes FREE/PRO/ENTERPRISE, Checkout/Portal/Webhooks Stripe |
| **Ingestión** | Worker BullMQ · mock / OSM / Google Places · reindex Meili |
| **Notify** | Email (Resend) + WhatsApp (texto o plantillas Meta) |
| **Mobile** | PWA + shell Capacitor iOS/Android |
| **Ops** | Prometheus `/metrics`, OTLP lite, réplicas de lectura, multi-región documentada |

---

## Arquitectura

```text
┌──────────────┐     REST / JWT / cookies      ┌─────────────────┐
│  apps/web    │ ────────────────────────────► │  apps/api       │
│  Next.js 15  │                               │  Fastify 5      │
│  PWA + SEO   │                               └────────┬────────┘
└──────────────┘                                        │
       ▲                                                │
       │ WebView                                        ▼
┌──────────────┐     BullMQ                      ┌─────────────┐
│ apps/mobile  │                         ┌──────►│ PostgreSQL  │
│ Capacitor    │                         │       │ (+ replica) │
└──────────────┘                  ┌──────┴───┐   └─────────────┘
                                  │  Redis   │
┌──────────────┐                  └──────┬───┘   ┌─────────────┐
│ apps/worker  │ ─ ingest / reindex ─────┘       │ Meilisearch │
│ BullMQ       │ ─ mock · OSM · Places ─────────►│  (search)   │
└──────────────┘                                 └─────────────┘
```

**Monorepo (Turborepo + npm workspaces)**

```text
apps/
  web/          Discovery SEO, reserva, panel, admin, legal
  api/          REST auth · catalog · bookings · billing · admin
  worker/       Ingestión + publish + reindex
  mobile/       Capacitor shell
  e2e/          Playwright smoke
packages/
  domain/       Reglas puras (quality, booking) + tests
  contracts/    Zod compartido FE/API
  db/           Drizzle schema · migrations · seeds
  search/       Cliente Meilisearch
  ui/           Primitivos
docs/           ADRs · arquitectura · runbooks · release
```

Diseño y ADRs: [`docs/architecture/v2.md`](./docs/architecture/v2.md) · [`docs/adr/`](./docs/adr/)

---

## Quick start (local)

**Requisitos:** Node.js ≥ 20 · PostgreSQL 16 · Redis (recomendado) · opcional Meilisearch / Docker

```bash
git clone https://github.com/leonardeco/saas-boilerplate.git
cd saas-boilerplate
cp .env.example .env
# JWT secrets ≥ 32 caracteres (openssl rand -base64 48)

# Con Docker (Postgres + Redis + Meili):
docker compose up postgres redis meilisearch -d

npm install
npm run db:migrate -w @saas/db
npm run db:seed -w @saas/db          # geo + planes + venues demo

npm run dev -w @saas/api             # :3001
npm run dev -w @saas/web             # :3000
# opcional: npm run dev -w @saas/worker
```

| Servicio | URL |
|---|---|
| Web | http://localhost:3000 |
| Catálogo demo | http://localhost:3000/co/bogota |
| API health | http://localhost:3001/health |
| Swagger (dev) | http://localhost:3001/docs |
| Privacidad / Términos | `/privacy` · `/terms` |

**QA automático (API en marcha):**

```bash
npm run qa:local
```

Checklist manual: [`docs/runbooks/local-qa-checklist.md`](./docs/runbooks/local-qa-checklist.md)

---

## Superficie de producto

### API (resumen)

| Área | Rutas |
|---|---|
| Auth | `POST /auth/register` · `login` · `refresh` · `logout` · `GET /auth/me` |
| OAuth | `GET /auth/oauth/{google\|github}/start` · `callback` |
| Geo | `GET /geo/cities` |
| Catálogo | `GET /catalog/search` · `GET /catalog/:city/:slug` |
| Reservas | `POST /bookings/hold` · `/:id/confirm` · `mine` · `agenda/:venueId` |
| Claims / Reviews | `POST /claims` · `POST /reviews` |
| Billing | `GET /billing/plans` · checkout · portal · webhook |
| Admin | `POST /admin/ingestion` · flags · curación |
| Ops | `GET /health` · `/ready` · `/metrics` |

### Web

| Ruta | Descripción |
|---|---|
| `/` | Home nacional |
| `/co/[city]` | Listado premium (Comer / Salir) |
| `/co/[city]/[slug]/reservar` | Flujo de reserva |
| `/login` · `/register` | Auth + OAuth |
| `/dashboard` · `/admin` | Panel local y plataforma |
| `/mis-reservas` | Historial comensal |

---

## Calidad y seguridad

```bash
npm run test:unit          # domain · contracts · api · db
npm run test:e2e           # Playwright (API + web arriba)
npm run check:prod-env     # validación env de producción
npm run smoke:prod -- https://api.example.com
```

| Control | Implementación |
|---|---|
| Auth | Access JWT corto + refresh revocable · cookies httpOnly (web) · Bearer nativo |
| Multi-tenant | Roles org `OWNER/ADMIN/MEMBER` · platform `SUPERADMIN` |
| Booking | HOLD + capacity · lock Redis · overbooking target **0** |
| Prod | Rechazo de JWT débiles, HSTS, rate limits, Swagger off por defecto |
| Datos | Habeas Data (plantilla `/privacy`) · sin secretos en git |

Política: [`SECURITY.md`](./SECURITY.md)

---

## Producción y deploy

| Recurso | Descripción |
|---|---|
| [`.env.production.example`](./.env.production.example) | Variables campo a campo |
| [`render.yaml`](./render.yaml) | Blueprint Render (API · Web · Worker · Redis · PG) |
| [`docs/runbooks/first-deploy-render.md`](./docs/runbooks/first-deploy-render.md) | Primer deploy clic a clic |
| [`docs/runbooks/deploy-railway.md`](./docs/runbooks/deploy-railway.md) | Railway + Docker |
| [`docs/runbooks/release-checklist.md`](./docs/runbooks/release-checklist.md) | Go-live |
| [`docker-compose.prod.example.yml`](./docker-compose.prod.example.yml) | Stack self-hosted |

```bash
npm run gen:secrets                 # escribe secrets.local.env (gitignored)
npm run db:seed:prod                # geo + planes, sin demos
npm run make-superadmin -- ops@tudominio.com
npm run release -- 1.6.0            # ayuda de tagging
```

Release notes: [v1.6.0](https://github.com/leonardeco/saas-boilerplate/releases/tag/v1.6.0) · [CHANGELOG](./CHANGELOG.md)

---

## Mobile (PWA + Capacitor)

- **PWA:** manifest + service worker (producción)
- **Nativo:** `apps/mobile` — WebView hacia la web desplegada

```bash
npm run mobile:www
# CAPACITOR_SERVER_URL=https://app.tudominio.com
npm run mobile:sync -w @saas/mobile
```

Guías: [`docs/mobile-api.md`](./docs/mobile-api.md) · [`docs/runbooks/capacitor.md`](./docs/runbooks/capacitor.md) · [`docs/runbooks/store-listing.md`](./docs/runbooks/store-listing.md)

---

## Documentación

| Documento | Contenido |
|---|---|
| [Architecture v2](./docs/architecture/v2.md) | Decisiones de producto y stack |
| [ADRs](./docs/adr/) | Stack, tenancy, ingestión, booking, search, reviews |
| [Runbooks](./docs/runbooks/) | Deploy, OTel, réplicas, WhatsApp, multi-región, QA |
| [Implementation plan](./docs/IMPLEMENTATION_PLAN.md) | Tracks S0–S6 y releases |

---

## Roadmap (ops, no core)

- [ ] Primer deploy cloud (Render/Railway) + dominio
- [ ] OAuth y Stripe en producción
- [ ] Plantillas WhatsApp aprobadas (Meta)
- [ ] Builds store (Capacitor) + screenshots
- [ ] Catálogo real vía ingestión / partners

---

## Autor

**Leonardo Guzmán** · Colombia  
[GitHub @leonardeco](https://github.com/leonardeco)

Construido con proceso **full-dev-team** ([SKILLS-GROK](https://github.com/leonardeco/SKILLS-GROK)).

---

## Licencia

[MIT](./LICENSE) — uso personal y comercial permitido.
