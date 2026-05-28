# SaaS Boilerplate

Production-ready monorepo para lanzar cualquier SaaS en dias, no semanas.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

---

## Que incluye

| Modulo | Detalle |
|--------|---------|
| **Auth** | Registro, login, JWT access token (15 min) + refresh token (7 dias), logout, `/auth/me` |
| **Multi-tenancy** | Organizaciones, invitar miembros por email, roles `OWNER` / `ADMIN` / `MEMBER` |
| **Billing** | Stripe Checkout, portal de facturacion, webhooks, planes `FREE` / `PRO` / `ENTERPRISE` |
| **Dashboard** | Stats, lista de workspaces, gestion de miembros, configuracion, zona de peligro |
| **API docs** | Swagger UI autoconfigurado en `/docs` |
| **Rate limiting** | 100 req/min por IP |
| **Docker** | Dockerfiles multi-stage para `api` y `web` + `docker-compose` completo |

---

## Stack

```
Frontend   →  Next.js 15 · React 19 · Tailwind CSS
Backend    →  Fastify 5 · JWT · Zod · Swagger
Base datos →  PostgreSQL 16 · Drizzle ORM
Billing    →  Stripe (Checkout · Billing Portal · Webhooks)
Monorepo   →  Turborepo · npm workspaces
Deploy     →  Docker · docker-compose
```

---

## Estructura del proyecto

```
saas-boilerplate/
│
├── apps/
│   ├── api/                        # Fastify REST API
│   │   └── src/
│   │       ├── routes/             # auth · organizations · members · billing
│   │       ├── services/           # logica de negocio
│   │       └── plugins/            # cors · jwt · swagger · rate-limit
│   │
│   └── web/                        # Next.js 15 App Router
│       └── app/
│           ├── (auth)/             # /login · /register
│           ├── (dashboard)/        # /dashboard · /members · /settings · /billing
│           └── api/                # route handlers internos
│
├── packages/
│   ├── db/                         # Drizzle ORM + schema + migraciones
│   ├── ui/                         # Componentes compartidos (Button, Input, Badge)
│   └── config/                     # TypeScript configs reutilizables
│
├── docker-compose.yml
├── turbo.json
└── .env.example
```

---

## Inicio rapido

### 1. Clonar el repositorio

```bash
git clone https://github.com/leonardeco/saas-boilerplate.git
cd saas-boilerplate
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus claves:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_db

JWT_ACCESS_SECRET=tu-secret-de-minimo-32-caracteres
JWT_REFRESH_SECRET=otro-secret-de-minimo-32-caracteres

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Levantar base de datos

```bash
docker-compose up postgres -d
```

### 5. Ejecutar migraciones

```bash
npm run db:migrate
```

### 6. Iniciar en desarrollo

```bash
npm run dev
```

| Servicio | URL |
|----------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger docs | http://localhost:3001/docs |
| Drizzle Studio | `npm run db:studio` |

---

## Deploy con Docker (stack completo)

```bash
cp .env.example .env
# Completar .env con tus claves reales
docker-compose up --build
```

Levanta PostgreSQL + API + Web en un solo comando.

---

## API Reference

### Auth

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/auth/register` | Crear cuenta |
| `POST` | `/auth/login` | Iniciar sesion |
| `POST` | `/auth/refresh` | Renovar access token |
| `POST` | `/auth/logout` | Cerrar sesion |
| `GET` | `/auth/me` | Usuario autenticado |

### Organizaciones

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/organizations` | Listar mis organizaciones |
| `GET` | `/organizations/:slug` | Detalle de organizacion |
| `PATCH` | `/organizations/:slug` | Actualizar organizacion |

### Miembros

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/organizations/:slug/members` | Invitar miembro |
| `DELETE` | `/organizations/:slug/members/:userId` | Eliminar miembro |

### Billing

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/billing/checkout` | Crear sesion de Stripe Checkout |
| `POST` | `/billing/portal` | Abrir portal de facturacion |
| `POST` | `/billing/webhook` | Webhook de Stripe |

> Documentacion interactiva completa en `/docs` (Swagger UI)

---

## Stripe — configuracion local

Para recibir webhooks en desarrollo:

```bash
stripe listen --forward-to localhost:3001/billing/webhook
```

Copia el `whsec_...` que aparece y pegalo en `STRIPE_WEBHOOK_SECRET` en tu `.env`.

---

## Schema de base de datos

```
users
  id · name · email · password_hash · avatar_url · email_verified · timestamps

organizations
  id · name · slug · logo_url · timestamps

organization_members
  id · organization_id · user_id · role (OWNER|ADMIN|MEMBER) · created_at

plans
  id · name (FREE|PRO|ENTERPRISE) · stripe_price_ids · max_members · max_projects

subscriptions
  id · organization_id · plan_id · stripe_customer_id · stripe_subscription_id · status · timestamps

refresh_tokens
  id · token · user_id · revoked · expires_at · created_at
```

---

## Scripts disponibles

```bash
npm run dev          # Arranca web + api en paralelo (Turborepo)
npm run build        # Build de produccion
npm run lint         # Lint de todos los packages
npm run db:generate  # Genera migraciones Drizzle
npm run db:migrate   # Ejecuta migraciones
npm run db:studio    # Abre Drizzle Studio (GUI de BD)
```

---

## Roadmap

- [ ] Verificacion de email
- [ ] OAuth (Google / GitHub)
- [ ] Notificaciones in-app
- [ ] API keys por organizacion
- [ ] Tests (Vitest + Playwright)
- [ ] CI/CD con GitHub Actions

---

## Autor

**Leonardo Guzman** — Fullstack Developer

[![GitHub](https://img.shields.io/badge/GitHub-leonardeco-181717?style=flat&logo=github)](https://github.com/leonardeco)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-leonardo--guzman--t-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/leonardo-guzman-t)
[![Portfolio](https://img.shields.io/badge/Portfolio-ganancia.app-000000?style=flat&logo=vercel)](https://ganancia.app)

---

## Licencia

MIT
