# Multi-region deploy — NightTable CO

## Goals

- Low latency for Colombian users (primary: `sao` / `mia` / `bog` edge)
- Stateless API/web/worker; shared data plane

## Topology

```
                    ┌─────────────────────┐
   Users CO  ───►   │  CDN / Edge (web)   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         API region A     API region B     Worker (single
         (primary)        (standby)        or queue-shared)
              │                │                │
              └────────┬───────┴────────────────┘
                       ▼
              Managed Postgres (primary)
              Redis (primary or regional cache)
              Meilisearch (primary; optional replicas)
```

## Environment per region

| Variable | Example | Purpose |
|---|---|---|
| `REGION` | `sao` / `iad` / `local` | Label in `/health` + `/metrics` |
| `DATABASE_URL` | primary writer URL | All writes |
| `DATABASE_READ_URL` | (future) replica | Read scaling |
| `REDIS_URL` | shared or regional | Locks + queues |
| `MEILI_HOST` | primary search | Catalog |
| `API_PUBLIC_URL` | https://api-sao… | OAuth redirects |
| `WEB_URL` | https://nighttable.co | Cookies / OAuth return |
| `CORS_ORIGIN` | https://nighttable.co | Browser |

## OAuth multi-region

Register **one** redirect URI per provider that hits a **stable** API hostname (global load balancer), not per-region hostnames, unless you register each:

```
https://api.nighttable.co/auth/oauth/google/callback
https://api.nighttable.co/auth/oauth/github/callback
```

Set `API_PUBLIC_URL=https://api.nighttable.co` in every region.

## Cookies

- `COOKIE_SECURE=true` in production
- Prefer single apex domain so cookies work across regions behind same host

## Failover

1. Promote DB replica if primary fails (provider runbook)
2. Point LB health checks to `/ready`
3. Drain region: scale API to 0 after traffic shift
4. Worker: run in **one** active region only (queue consumers) unless using Redis Cluster carefully

## Observability

- Scrape `GET /metrics` (Prometheus) from each region
- Label `nighttable_region_info{region="sao"}`
- Alert on: 5xx rate, hold conflict spike, queue lag

## Railway / Fly / Render notes

| Platform | Tip |
|---|---|
| Railway | Separate services api/web/worker; same `DATABASE_URL` |
| Fly.io | `primary_region`; set `REGION=$FLY_REGION` |
| Render | Multi-region not native; use single region + CDN for web |

## Checklist before multi-region

- [ ] Migrations applied once on shared DB
- [ ] Worker single-active for ingest queue
- [ ] Stripe webhook → single public API endpoint
- [ ] WhatsApp / Resend webhooks → single endpoint
- [ ] Secrets synced across regions
