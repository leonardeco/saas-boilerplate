# Release checklist — NightTable CO v1.6+

## 0. Pre-flight

- [ ] `git status` clean on release branch / `main`
- [ ] `npm run test:unit` green
- [ ] CI green on GitHub Actions
- [ ] CHANGELOG / version tag decided (`v1.6.0`)

## 1. Secrets & env

```bash
# load prod env then:
node scripts/check-prod-env.mjs
```

- [ ] JWT secrets unique, ≥ 32, not default
- [ ] `COOKIE_SECURE=true`
- [ ] `WEB_URL` + `CORS_ORIGIN` + `API_PUBLIC_URL` https production hosts
- [ ] `TRUST_PROXY=true` behind LB
- [ ] Stripe **live** keys + webhook endpoint verified
- [ ] Resend domain verified (SPF/DKIM)
- [ ] OAuth redirect URIs production
- [ ] Places / WA keys with budget alerts

## 2. Database

```bash
npm run db:migrate -w @saas/db
# seed geo + plans only (NOT demo venues in prod unless intentional)
DATABASE_URL=... npm run db:seed -w @saas/db
DATABASE_URL=... npm run make-superadmin -- ops@yourdomain.com
```

- [ ] Backup / PITR enabled on managed Postgres
- [ ] Optional `DATABASE_READ_URL` configured

## 3. Services deploy order

1. Postgres / Redis / Meili  
2. API (`/health` + `/ready`)  
3. Worker  
4. Web  
5. DNS / TLS  

- [ ] Swagger disabled or private (`ENABLE_SWAGGER` unset in prod)
- [ ] Metrics scrape restricted to private network
- [ ] `/debug/*` not exposed (auto-off in production)

## 4. Smoke after deploy

```bash
curl -sf https://api…/health
curl -sf https://api…/ready
curl -sf https://api…/geo/cities | head
# register + login + hold booking on a test venue
```

- [ ] OAuth Google/GitHub end-to-end
- [ ] Stripe checkout test mode on staging only
- [ ] Email arrives (or Resend dashboard)
- [ ] Overbooking race: two holds capacity 1 → one fails

## 5. Mobile / store (if shipping app)

See [store-listing.md](./store-listing.md)

- [ ] `CAPACITOR_SERVER_URL=https://app…`
- [ ] assetlinks SHA256 + AASA TEAMID filled
- [ ] Screenshots 6.7" / 5.5" / tablet
- [ ] Privacy policy URL live
- [ ] Age rating (17+ if nightlife heavy)

## 6. Observability

- [ ] Prometheus scrapes `/metrics`
- [ ] Alerts: 5xx > 1%, p95 latency, redis down, queue depth
- [ ] Optional OTEL exporter to Jaeger/Grafana

## 7. Go / no-go

| SLO | Target |
|---|---|
| Overbooking | **0** |
| API availability | 99.5%+ |
| Auth success | monitor spikes of 401 |

## Rollback

1. Redeploy previous image tags for api/web/worker  
2. Do **not** reverse additive migrations without DBA plan  
3. Feature-flag off booking via admin flags if partial outage  

## Post-release

- [ ] Tag `git tag v1.6.0 && git push --tags`
- [ ] Watch error logs 24h
- [ ] Ingest wave-1 cities only first week
