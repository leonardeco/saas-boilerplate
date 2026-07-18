# Implementation plan — NightTable CO

See conversation full-dev-team plan (tracks T0–T7, sprints S0–S6).

## S0 (this branch / rewrite foundation)

| Task | Status |
|---|---|
| T0.1 ADRs + architecture | done |
| T0.2 Scaffold apps/packages | done |
| T0.3 docker-compose redis/meili | done |
| T0.4 contracts Zod | done |
| T0.5 platform roles on users | schema ready |
| T1.1 geo schema + seed | done |
| T1.2 venues schema | done |
| T1.3 quality domain TDD | done |
| T1.4 geo API read | done (seed-backed) |

## S1 (done on feature/s1-auth-catalog)

1. Auth JWT port (register/login/refresh/logout/me)
2. SQL migrate runner + seed geo/plans/demo venues
3. Catalog search API + SEO city/venue pages
4. Login/register UI
5. CI unit tests

## S2–S6 (completed)

| Sprint | Delivered |
|---|---|
| S2 | mock/OSM/Places providers, publish pipeline, reindex, admin enqueue |
| S3 | slots, HOLD/confirm/cancel, Redis locks, reservar UI, agenda |
| S4 | claim flow, venues panel, Stripe checkout/portal/webhook stubs |
| S5 | reviews + rating recalc, flag, admin curation/flags |
| S6 | /ready, logging redact, runbook, CI unit tests |

## Post S6 hardening (done)

- Email templates + Resend/dev log on hold/confirm/cancel
- Meilisearch catalog search with Postgres fallback
- httpOnly cookies (nt_access / nt_refresh) + Bearer still supported
- Rate limits: auth 10/min, hold 20/min
- Playwright smoke suite in apps/e2e
- scripts/make-superadmin.mjs

## v1.2 (done)

- WhatsApp Cloud API optional + unified notify service
- SPA cookie-only (no localStorage tokens)
- CI: unit + Postgres/Redis integration + Playwright e2e
- Domain concurrency simulation + optional DB hold race

## v1.3 (done)

- WhatsApp approved templates (Meta) + fallback text
- OAuth Google/GitHub API + login/register UI
- Prometheus `/metrics` + request hooks (OTel-ready labels)
- Multi-region runbook + REGION on health

## v1.4 (done)

- OTLP/HTTP JSON traces (lite) + traceparent + /debug/spans
- DATABASE_READ_URL for catalog/geo (`dbRead`)
- PWA manifest + service worker + mobile API docs
- Touch-safe CSS / safe-area

## v1.5 (done)

- Capacitor shell `apps/mobile` (config, www, plugins, scripts)
- Native auth bridge (Preferences + Bearer)
- Deep link placeholders (assetlinks / AASA)
- OTel full SDK upgrade path doc

## v1.6 (done)

- Production env hardening + check-prod-env script
- Helmet/HSTS/security headers, swagger off in prod, trust proxy
- Release checklist, store listing, SECURITY.md
- Privacy + Terms pages, prod compose example

## v1.6.1 deploy packaging (done)

- Production Dockerfiles (api/web/worker)
- `render.yaml` blueprint + Railway tomls
- Deploy runbooks Render/Railway
- CHANGELOG + `npm run release`

## Remaining backlog (ops)

- Commit generated ios/android after first `cap add`
- Full @opentelemetry/sdk-node (optional)
- Meta WA templates + legal entity copy
- Store screenshots & binary upload
- Point DNS + first production deploy



