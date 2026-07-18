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

## Next: S2

1. Ingestion providers (mock + Places/OSM adapters)
2. Worker pipeline publish + reindex Meili
3. Admin trigger SUPERADMIN
