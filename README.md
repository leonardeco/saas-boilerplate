# NightTable CO

**Food & Nightlife premium en Colombia** — marketplace de descubrimiento y reservas + SaaS multi-sede para locales.

> Reescritura del monorepo [saas-boilerplate](https://github.com/leonardeco/saas-boilerplate) según **Arquitectura v2** (proceso `full-dev-team` / SKILLS-GROK).

## Posicionamiento

| Código | Decisión |
|---|---|
| P4 | Híbrido: marketplace + SaaS + booking + reviews + billing + nightlife |
| B5+B2+B3 | Premium · Food & Nightlife · noche de primer nivel |
| F-Full | Alcance v1 completo (flags por módulo) |
| G2 | Catálogo nacional + activación por olas de ciudad |
| D5 | Ingestión multi-provider (Places, OSM, partners, curación) |
| T2 | Organization (cadena) → Venue (sede) |
| S1 | TypeScript · Next · Fastify · PG · Redis · Meili · BullMQ |
| I1 | Railway/Render + managed PG/Redis |

## Monorepo

```
apps/
  web/       Next.js 15 — SEO + panel (S0: home + ciudades)
  api/       Fastify 5  — REST (S0: /health + /geo)
  worker/    BullMQ     — ingestión y side-effects
packages/
  domain/    Reglas puras (quality, booking, normalize) + tests
  contracts/ Zod compartido FE/API
  db/        Drizzle schema (geo, orgs, venues) + seed CO
  search/    Cliente Meilisearch
  ui/        Componentes base
docs/
  architecture/v2.md
  adr/0001…0006
  domain/contexts.md
```

## Quick start

```bash
# Prereqs: Node >= 20, Docker
cp .env.example .env
npm install

# Infra local
docker compose up postgres redis meilisearch -d

# Tests de dominio (sin DB)
npm test -w @saas/domain
npm test -w @saas/contracts

# API + Web
npm run dev -w @saas/api
npm run dev -w @saas/web
```

| Servicio | URL |
|---|---|
| Web | http://localhost:3000 |
| API health | http://localhost:3001/health |
| Geo cities | http://localhost:3001/geo/cities |
| Meili | http://localhost:7700 |

## Sprint actual: S0 Foundation

- [x] Arquitectura v2 + ADRs
- [x] Scaffold monorepo (web, api, worker, packages)
- [x] Domain: quality + booking (TDD)
- [x] Contracts Zod
- [x] Schema geo + venues + orgs
- [x] Seed 18 ciudades principales CO
- [x] Docker Compose: PG + Redis + Meili
- [ ] Migraciones Drizzle aplicadas en CI
- [ ] Auth/JWT + Stripe (port desde boilerplate legacy en S1)
- [ ] Ingestión providers (S2)
- [ ] Booking engine con locks (S3)

## Docs

- [Arquitectura v2](./docs/architecture/v2.md)
- [ADRs](./docs/adr/)
- [Dominios](./docs/domain/contexts.md)
- [Plan de implementación](./docs/IMPLEMENTATION_PLAN.md)

## Licencia

MIT
