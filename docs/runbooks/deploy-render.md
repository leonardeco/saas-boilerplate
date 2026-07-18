# Deploy on Render — NightTable CO

## 1. Blueprint

1. Push `main` to GitHub  
2. Render → **New → Blueprint** → select repo  
3. Apply `render.yaml`  
4. Fill `sync: false` secrets in dashboard  

## 2. Required secrets (API)

| Key | Example |
|---|---|
| `WEB_URL` | `https://nighttable-web.onrender.com` |
| `CORS_ORIGIN` | same as WEB_URL |
| `API_PUBLIC_URL` | `https://nighttable-api.onrender.com` |
| `STRIPE_*` | live or test |
| `RESEND_API_KEY` | optional |
| `EMAIL_FROM` | `no-reply@yourdomain.com` |

Web:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | public API URL |

## 3. After first deploy

```bash
# From laptop with DATABASE_URL = Render external connection string
npm run db:migrate -w @saas/db
npm run db:seed -w @saas/db
npm run make-superadmin -- you@email.com
npm run check:prod-env
```

## 4. Custom domain

- Attach domain to web + api  
- Update OAuth redirect URIs  
- Update Stripe webhook URL → `/billing/webhook`  
- `COOKIE_SECURE=true` already set  

## 5. Port note

Render sets `PORT`. API reads `PORT` via `API_PORT` default in env schema — ensure start uses the platform port. Blueprint sets `API_PORT=10000` which matches Render web default when using that mapping; if Render injects `PORT`, prefer:

```
startCommand: sh -c "API_PORT=$PORT npx tsx apps/api/src/index.ts"
```

Adjust blueprint if health checks fail on port mismatch.
