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

## Next: S1

1. Port auth/JWT/Stripe from legacy boilerplate routes
2. Drizzle migrate + seed runner in CI
3. Public SEO city pages with seeded demo venues
4. Mock ingestion → publish premium venues
