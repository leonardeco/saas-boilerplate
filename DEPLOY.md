# Deployment Guide

## Render + ganancia.app

### Arquitectura

| Servicio | URL |
|---|---|
| Web (Next.js) | `https://app.ganancia.app` |
| API (Fastify) | `https://api.ganancia.app` |
| Base de datos | PostgreSQL gestionada por Render |

---

## 1. Primer deploy en Render

1. Ir a [render.com](https://render.com) → **New** → **Blueprint**
2. Conectar el repo `leonardeco/saas-boilerplate`
3. Render detecta `render.yaml` y crea los tres recursos automáticamente:
   - `saas-db` — PostgreSQL
   - `saas-api` — servicio Docker para la API
   - `saas-web` — servicio Docker para el frontend
4. Esperar a que el primer build termine (~5-10 min)

---

## 2. DNS — Configurar en tu registrador

Agrega estos dos registros CNAME en el panel DNS de `ganancia.app`
(Cloudflare, Namecheap, GoDaddy, etc.):

| Tipo | Nombre | Valor | TTL |
|---|---|---|---|
| CNAME | `app` | `saas-web.onrender.com` | Auto |
| CNAME | `api` | `saas-api.onrender.com` | Auto |

> **Si usas Cloudflare**: desactiva el proxy (nube naranja → gris) para estos registros
> la primera vez, hasta que Render valide los certificados TLS. Después puedes activarlo.

---

## 3. Activar los dominios en Render

Para **cada servicio** (saas-api y saas-web):

1. Render dashboard → servicio → **Settings** → **Custom Domains**
2. Clic en **Add Custom Domain**
3. Escribir el dominio (`api.ganancia.app` o `app.ganancia.app`)
4. Render verifica el DNS y emite el certificado TLS (Let's Encrypt) automáticamente
5. Estado pasa a ✅ **Verified** en ~2 minutos

---

## 4. Variables opcionales (post-deploy)

Configura estas en **Render → saas-api → Environment**:

### Stripe (billing)
```
STRIPE_SECRET_KEY       = sk_live_...
STRIPE_WEBHOOK_SECRET   = whsec_...
```
Webhook URL a registrar en Stripe: `https://api.ganancia.app/billing/webhook`

### Email (Resend)
```
RESEND_API_KEY = re_...
```
Dominio de envío verificado en Resend: `ganancia.app`

### OAuth Google
1. [console.cloud.google.com](https://console.cloud.google.com) → Credenciales → OAuth 2.0
2. Authorized redirect URI: `https://api.ganancia.app/auth/google/callback`
```
GOOGLE_CLIENT_ID     = ...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-...
```

### OAuth GitHub
1. GitHub → Settings → Developer Settings → OAuth Apps
2. Callback URL: `https://api.ganancia.app/auth/github/callback`
```
GITHUB_CLIENT_ID     = Iv1.xxx
GITHUB_CLIENT_SECRET = xxx
```

---

## 5. Auto-deploy (CI → Render)

Para que cada push a `main` dispare un deploy **solo si CI pasa**:

1. Render → **saas-api** → Settings → **Deploy Hook** → copiar URL
2. Render → **saas-web** → Settings → **Deploy Hook** → copiar URL
3. GitHub repo → Settings → **Variables** → agregar:
   - `RENDER_API_DEPLOY_HOOK` = URL del hook de saas-api
   - `RENDER_WEB_DEPLOY_HOOK` = URL del hook de saas-web

El workflow `.github/workflows/deploy.yml` se encarga del resto.

---

## Railway (alternativa)

### Crear el proyecto

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway init
```

### Agregar servicios

1. Railway dashboard → **New Service** → GitHub Repo
2. En **Settings** de cada servicio:
   - API: Dockerfile Path = `apps/api/Dockerfile`
   - Web: Dockerfile Path = `apps/web/Dockerfile`
3. **New** → **Database** → PostgreSQL

### Variables mínimas (API)

Genera los secretos JWT con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```
DATABASE_URL       = <del addon PostgreSQL — Internal Connection String>
JWT_ACCESS_SECRET  = <resultado del comando anterior>
JWT_REFRESH_SECRET = <resultado del comando anterior (ejecútalo de nuevo)>
NODE_ENV           = production
API_HOST           = 0.0.0.0
CORS_ORIGIN        = https://app.ganancia.app
WEB_URL            = https://app.ganancia.app
```

### Variables mínimas (Web)

```
NEXT_PUBLIC_API_URL = https://api.ganancia.app
JWT_ACCESS_SECRET   = <mismo valor que el API>
NODE_ENV            = production
```

### Dominio personalizado en Railway

Railway dashboard → Servicio → **Settings** → **Custom Domain** → ingresar dominio → agregar CNAME según las instrucciones mostradas.

---

## Verificar el deploy

```bash
# Health check de la API
curl https://api.ganancia.app/health

# Docs de la API
open https://api.ganancia.app/docs

# Frontend
open https://app.ganancia.app
```
