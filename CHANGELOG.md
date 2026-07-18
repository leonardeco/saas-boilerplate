# Changelog

All notable changes to **NightTable CO** (`saas-boilerplate`).

## [1.6.0] — 2026-07-18

### Added
- Production env hardening (weak JWT / insecure cookies / localhost CORS rejected)
- `scripts/check-prod-env.mjs` · `npm run check:prod-env`
- Release checklist, store listing, SECURITY.md
- Legal pages `/privacy` · `/terms`
- `docker-compose.prod.example.yml`
- Render blueprint `render.yaml` + Railway `railway.toml` per service
- Deploy runbooks (Render, Railway)

### Security
- HSTS, nosniff, frame-deny, permissions-policy
- Swagger off by default in production
- `/debug/*` disabled in production
- Trust proxy support for rate limits behind LB

## [1.5.0] — 2026-07-18

### Added
- Capacitor shell `apps/mobile` (iOS/Android WebView)
- Native auth bridge (Preferences + Bearer)
- Deep link placeholders (assetlinks, AASA)
- OTel full SDK upgrade path doc

## [1.4.0] — 2026-07-18

### Added
- Lite OTLP/HTTP traces + W3C `traceparent`
- `DATABASE_READ_URL` / `dbRead` for catalog & geo
- PWA manifest + service worker
- Mobile API documentation

## [1.3.0] — 2026-07-18

### Added
- WhatsApp Meta approved templates + text fallback
- OAuth Google/GitHub + login/register UI
- Prometheus `/metrics` + region label
- Multi-region runbook

## [1.2.0] — 2026-07-18

### Added
- WhatsApp notify + unified notify service
- Cookie-only SPA (no localStorage tokens)
- CI: unit + Postgres/Redis integration + Playwright e2e
- Booking concurrency domain tests + optional DB race

## [1.1.0] — 2026-07-18

### Added
- Email on hold/confirm/cancel (Resend or dev log)
- Meilisearch catalog search with Postgres fallback
- httpOnly auth cookies + rate limits
- Playwright smoke suite

## [1.0.0] — 2026-07-18

### Added
- Full product tracks S0–S6 on Architecture v2
- Auth JWT, multi-tenant orgs, venues, catalog premium
- Booking HOLD/confirm, claims, reviews, Stripe hooks
- Ingestion worker (mock/OSM/Places), admin tools
- Domain TDD (quality, booking), contracts, monorepo Turborepo

## [0.1.0] — Foundation

### Added
- NightTable CO rewrite from generic SaaS boilerplate
- ADRs 0001–0006, monorepo scaffold, geo seed Colombia
