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

## Remaining backlog

- WhatsApp Business notifications
- Full cookie-only SPA (drop localStorage tokens)
- CI job with Postgres service for integration tests
- Playwright in CI with webServer


