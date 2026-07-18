# Production readiness — NightTable CO

## Pre-launch checklist

- [ ] `DATABASE_URL` managed Postgres 16
- [ ] `REDIS_URL` managed Redis
- [ ] `JWT_*_SECRET` ≥ 32 chars, unique per env
- [ ] `STRIPE_*` live keys only in production
- [ ] `GOOGLE_PLACES_API_KEY` budget + billing alerts
- [ ] `MEILI_HOST` + master key rotated
- [ ] `CORS_ORIGIN` / `WEB_URL` production domains
- [ ] Migrations applied: `npm run db:migrate -w @saas/db`
- [ ] Seed geo/plans (venues via ingestion, not demo in prod)
- [ ] First SUPERADMIN created (SQL update platform_role)
- [ ] Worker service running alongside API
- [ ] Health: `/health` and `/ready`
- [ ] HTTPS only; secrets never in git
- [ ] Rate limits verified on `/auth/login` and `/bookings/hold`
- [ ] Stripe webhook signature verified
- [ ] Error budget: overbooking SLO = 0

## Create SUPERADMIN

```sql
UPDATE users SET platform_role = 'SUPERADMIN' WHERE email = 'you@example.com';
```

## Deploy topology (I1)

| Service | Notes |
|---|---|
| web | Next.js |
| api | Fastify |
| worker | BullMQ consumer |
| postgres | managed |
| redis | managed |
| meilisearch | optional but recommended |

## Rollback

- Feature flags: `booking_enabled`, city waves
- Redeploy previous image tags
- DB migrations are additive (0000, 0001) — avoid destructive rollback without backup
