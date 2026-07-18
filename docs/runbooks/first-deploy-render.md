# Primer deploy en Render (paso a paso)

Ruta recomendada para el primer go-live de NightTable CO.

## Antes de empezar

- Cuenta en [render.com](https://render.com) (tarjeta puede pedirse en planes de pago; hay free/starter limitados)
- Repo GitHub: `leonardeco/saas-boilerplate` (branch `main`, tag `v1.6.0`)
- 15–30 minutos

## Paso 0 — Helper Windows (opcional)

Desde el repo:

```powershell
cd "C:\Users\MI PC\Documents\PROYECTOS\saas-boilerplate"
git pull origin main
powershell -ExecutionPolicy Bypass -File .\scripts\first-deploy.ps1
```

El script genera secretos, te recuerda el Blueprint y (si pegas URLs) hace smoke + migrate + seed prod + superadmin.

## Paso 1 — Generar secretos locales

```bash
npm run gen:secrets
```

Guarda el output en un gestor de contraseñas. **No lo subas a git.**

## Paso 2 — Blueprint

1. Entra a Render → **New** → **Blueprint**
2. Conecta el repo **leonardeco/saas-boilerplate**
3. Branch: `main`
4. Render lee `render.yaml` y propone:
   - `nighttable-api` (web)
   - `nighttable-web` (web)
   - `nighttable-worker` (worker)
   - `nighttable-redis`
   - `nighttable-db` (Postgres 16)
5. **Apply** (creará recursos; el primer deploy de API puede fallar hasta poner URLs)

## Paso 3 — Anotar URLs públicas

Cuando existan servicios, copia:

| Servicio | URL ejemplo |
|---|---|
| API | `https://nighttable-api.onrender.com` |
| Web | `https://nighttable-web.onrender.com` |

## Paso 4 — Variables en cada servicio

### API (`nighttable-api`)

| Variable | Valor |
|---|---|
| `WEB_URL` | `https://nighttable-web.onrender.com` |
| `CORS_ORIGIN` | `https://nighttable-web.onrender.com` |
| `API_PUBLIC_URL` | `https://nighttable-api.onrender.com` |
| `JWT_*` | ya generados por Render **o** pega los de `gen-secrets` |
| `COOKIE_SECURE` | `true` |
| `TRUST_PROXY` | `true` |
| `NODE_ENV` | `production` |
| `STRIPE_SECRET_KEY` | `sk_test_...` (staging) o `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | tras crear webhook |
| `RESEND_API_KEY` / `EMAIL_FROM` | opcional al inicio |
| OAuth | opcional al inicio |

### Web (`nighttable-web`)

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://nighttable-api.onrender.com` |
| `NEXT_PUBLIC_APP_NAME` | `NightTable CO` |

**Importante:** `NEXT_PUBLIC_*` se inyecta en **build**. Tras cambiarla → **Clear build cache + Manual Deploy**.

### Worker

Comparte `DATABASE_URL` y `REDIS_URL` (ya en blueprint). Meili opcional.

## Paso 5 — Redeploy

1. API → Manual Deploy  
2. Web → Manual Deploy (tras `NEXT_PUBLIC_API_URL`)  
3. Worker → Manual Deploy  

Espera a que API health check pase:  
`https://nighttable-api.onrender.com/health`

## Paso 6 — Migraciones (desde tu PC)

En Render → nighttable-db → **Connections** → External Database URL:

```powershell
$env:DATABASE_URL="postgresql://...render.com/..."
npm run db:migrate -w @saas/db
# geo + plans + flags — SIN venues demo
npm run db:seed:prod
npm run make-superadmin -- tu@email.com
```

Staging con demos: `SEED_DEMO_VENUES=true npm run db:seed -w @saas/db`

## Paso 7 — Smoke test

```bash
curl -s https://nighttable-api.onrender.com/health
curl -s https://nighttable-api.onrender.com/ready
curl -s https://nighttable-api.onrender.com/geo/cities
```

En el navegador:

1. Abre la URL del web  
2. `/register` → crea cuenta  
3. `/co/bogota` (si hay seed demo)  
4. Login → `/dashboard`  
5. `/privacy` y `/terms` cargan  

## Paso 8 — Stripe (cuando quieras pagos)

1. Stripe Dashboard → Webhooks → endpoint  
   `https://nighttable-api.onrender.com/billing/webhook`  
2. Eventos: `checkout.session.completed` (mínimo)  
3. Copia `whsec_...` a `STRIPE_WEBHOOK_SECRET`  
4. Redeploy API  

## Paso 9 — OAuth (opcional)

Google / GitHub redirect:

```
https://nighttable-api.onrender.com/auth/oauth/google/callback
https://nighttable-api.onrender.com/auth/oauth/github/callback
```

## Free tier notes

- Free web services en Render **se duermen** sin tráfico (~15 min)  
- Primer request puede tardar 30–60s  
- Para demo seria usa plan **Starter** (blueprint default)

## Si la API no arranca

| Síntoma | Causa |
|---|---|
| Crash loop “Production env hardening” | Falta `WEB_URL` https / `COOKIE_SECURE` / JWT débiles |
| Health check fail | `PORT` no mapeado (ya corregido en startCommand) |
| Build OOM | Subir plan o reducir workspaces en build |
| CORS error en browser | `CORS_ORIGIN` ≠ origen exacto del web |

Logs: Render → servicio → **Logs**.

## Siguiente después del primer deploy

1. Dominio custom + TLS  
2. Quitar venues demo del seed en prod (solo geo/plans)  
3. Ingestión mock/OSM desde `/admin`  
4. Capacitor apuntando a `WEB_URL`  
