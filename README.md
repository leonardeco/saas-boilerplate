<div align="center">

# SaaS Boilerplate

**Production-ready monorepo para lanzar cualquier SaaS en dias, no semanas.**

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Fastify](https://img.shields.io/badge/Fastify_5-000000?style=for-the-badge&logo=fastify)](https://fastify.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Turborepo](https://img.shields.io/badge/built_with-Turborepo-EF4444?style=flat-square&logo=turborepo)](https://turbo.build)

</div>

---

## Por que este boilerplate?

Cada nuevo proyecto SaaS parte del mismo punto: auth, organizaciones, pagos, dashboard. Este boilerplate resuelve eso de forma robusta y escalable para que te concentres en lo que diferencia tu producto.

- **Monorepo con Turborepo** — builds incrementales y cache inteligente
- **Type-safe de punta a punta** — TypeScript en frontend, backend y base de datos
- **Sin magia oculta** — codigo claro, sin abstracciones innecesarias
- **Listo para produccion** — Docker, rate limiting, refresh token rotation, webhook validation

---

## Que incluye

| Modulo | Detalle |
|--------|---------|
| **Auth completo** | Registro, login, JWT access (15 min) + refresh token (7 dias) con rotacion, logout, `/auth/me` |
| **Multi-tenancy** | Organizaciones con slug unico, invitar miembros por email, roles `OWNER` / `ADMIN` / `MEMBER` |
| **Billing Stripe** | Checkout Session, Billing Portal, webhooks firmados, planes `FREE` / `PRO` / `ENTERPRISE` |
| **Dashboard** | Stats, lista de workspaces, gestion de miembros, configuracion, zona de peligro |
| **API docs** | Swagger UI autoconfigurado en `/docs` con autenticacion Bearer |
| **Rate limiting** | 100 req/min por IP con respuesta de error personalizada |
| **Seguridad** | CORS, bcrypt (cost 12), tokens revocables, validacion con Zod |
| **Docker** | Dockerfiles multi-stage optimizados + `docker-compose` completo con healthchecks |

---

## Stack

```
Frontend   →  Next.js 15 (App Router) · React 19 · Tailwind CSS · TypeScript
Backend    →  Fastify 5 · Zod · @fastify/jwt · Swagger
Base datos →  PostgreSQL 16 · Drizzle ORM · Drizzle Kit
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
│   ├── api/                          # Fastify REST API (puerto 3001)
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── auth.ts           # register · login · refresh · logout · me
│   │       │   ├── organizations.ts  # CRUD de organizaciones
│   │       │   ├── members.ts        # invitar · eliminar miembros
│   │       │   └── billing.ts        # checkout · portal · webhook
│   │       ├── services/             # logica de negocio desacoplada
│   │       └── plugins/              # cors · jwt · swagger · rate-limit
│   │
│   └── web/                          # Next.js 15 App Router (puerto 3000)
│       └── app/
│           ├── (auth)/
│           │   ├── login/            # pagina de inicio de sesion
│           │   └── register/         # pagina de registro
│           ├── (dashboard)/
│           │   ├── dashboard/        # stats y workspaces
│           │   ├── members/          # gestion de miembros
│           │   ├── settings/         # configuracion de org
│           │   └── billing/          # planes y facturacion
│           └── api/                  # route handlers internos (Next.js)
│
├── packages/
│   ├── db/                           # Drizzle ORM + schema + migraciones
│   ├── ui/                           # Button · Input · Badge reutilizables
│   └── config/                       # tsconfig base y nextjs compartidos
│
├── docker-compose.yml
├── turbo.json
└── .env.example
```

---

## Inicio rapido

### Prerrequisitos

- Node.js >= 20
- Docker (para PostgreSQL)
- Cuenta de Stripe (modo test)

### 1. Clonar el repositorio

```bash
git clone https://github.com/leonardeco/saas-boilerplate.git
cd saas-boilerplate
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Abre `.env` y completa:

```env
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_db

# JWT — genera secrets con: openssl rand -base64 32
JWT_ACCESS_SECRET=genera-un-secret-de-minimo-32-caracteres
JWT_REFRESH_SECRET=otro-secret-diferente-de-minimo-32-caracteres
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
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
| Drizzle Studio | ejecutar `npm run db:studio` |

---

## Deploy con Docker (stack completo)

Levanta PostgreSQL + API + Web en un solo comando:

```bash
cp .env.example .env
# Completar .env con tus claves reales
docker-compose up --build
```

Los Dockerfiles usan **multi-stage builds** para imagenes ligeras en produccion. El `docker-compose.yml` incluye healthchecks para garantizar el orden de arranque.

---

## API Reference

> La documentacion interactiva completa esta en **http://localhost:3001/docs** (Swagger UI)

### Auth `— /auth`

| Metodo | Ruta | Body | Descripcion |
|--------|------|------|-------------|
| `POST` | `/register` | `name, email, password` | Crea cuenta y organizacion personal |
| `POST` | `/login` | `email, password` | Retorna `accessToken` + `refreshToken` |
| `POST` | `/refresh` | `refreshToken` | Rota el refresh token y emite nuevo access token |
| `POST` | `/logout` | `refreshToken` | Revoca el refresh token |
| `GET` | `/me` | — | Datos del usuario autenticado |

### Organizaciones `— /organizations`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/` | Lista mis organizaciones con plan y suscripcion |
| `GET` | `/:slug` | Detalle con miembros y suscripcion |
| `PATCH` | `/:slug` | Actualiza nombre o logo (requiere OWNER o ADMIN) |

### Miembros `— /organizations/:slug/members`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/` | Invita un usuario existente por email |
| `DELETE` | `/:userId` | Elimina un miembro (no puede eliminar al OWNER) |

### Billing `— /billing`

| Metodo | Ruta | Body | Descripcion |
|--------|------|------|-------------|
| `POST` | `/checkout` | `organizationId, priceId` | Crea sesion de Stripe Checkout |
| `POST` | `/portal` | `organizationId` | Abre portal de facturacion de Stripe |
| `POST` | `/webhook` | *(raw body)* | Recibe eventos de Stripe |

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <accessToken>
```

---

## Stripe — configuracion local

Para recibir webhooks en desarrollo instala el [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3001/billing/webhook
```

Copia el `whsec_...` que aparece en consola y pegalo en `STRIPE_WEBHOOK_SECRET` de tu `.env`.

---

## Schema de base de datos

```
┌─────────────────────────────────────────────────────────────────────┐
│  users                                                              │
│  id · name · email · password_hash · avatar_url · email_verified   │
└────────────────────┬────────────────────────────────────────────────┘
                     │ 1:N
┌────────────────────▼──────────────────────────────────────────────┐
│  organization_members                                              │
│  id · organization_id · user_id · role (OWNER|ADMIN|MEMBER)       │
└────────────────────┬──────────────────────────────────────────────┘
                     │ N:1
┌────────────────────▼──────────────────────────────────────────────┐
│  organizations                                                     │
│  id · name · slug · logo_url                                      │
└────────────────────┬──────────────────────────────────────────────┘
                     │ 1:1
┌────────────────────▼──────────────────────────────────────────────┐
│  subscriptions                                                     │
│  id · organization_id · plan_id · stripe_customer_id              │
│  stripe_subscription_id · status · current_period_*               │
└────────────────────┬──────────────────────────────────────────────┘
                     │ N:1
┌────────────────────▼──────────────────────────────────────────────┐
│  plans                                                             │
│  id · name (FREE|PRO|ENTERPRISE) · stripe_price_ids               │
│  max_members · max_projects                                        │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│  refresh_tokens                                                    │
│  id · token · user_id · revoked · expires_at                      │
└───────────────────────────────────────────────────────────────────┘
```

---

## Scripts disponibles

```bash
# Desarrollo
npm run dev           # Arranca web + api en paralelo con Turborepo

# Build
npm run build         # Build de produccion de todos los apps

# Calidad
npm run lint          # ESLint en todos los packages
npm run format        # Prettier en todo el proyecto

# Base de datos
npm run db:generate   # Genera archivos de migracion con Drizzle Kit
npm run db:migrate    # Ejecuta migraciones pendientes
npm run db:studio     # Abre Drizzle Studio (GUI visual de la BD)
```

---

## Variables de entorno — referencia completa

| Variable | Requerida | Descripcion |
|----------|-----------|-------------|
| `DATABASE_URL` | Si | URL de conexion a PostgreSQL |
| `JWT_ACCESS_SECRET` | Si | Secret para firmar access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Si | Secret para firmar refresh tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRES` | No | Duracion del access token (default: `15m`) |
| `JWT_REFRESH_EXPIRES` | No | Duracion del refresh token (default: `7d`) |
| `API_PORT` | No | Puerto de la API (default: `3001`) |
| `CORS_ORIGIN` | No | Origen permitido por CORS (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Si | URL publica de la API |
| `STRIPE_SECRET_KEY` | Si | Clave secreta de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Si | Secret para validar webhooks de Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Si | Clave publica de Stripe |

---

## Roadmap

- [ ] Verificacion de email (nodemailer / Resend)
- [ ] OAuth — Google y GitHub
- [ ] Notificaciones in-app
- [ ] API keys por organizacion
- [ ] Tests unitarios con Vitest
- [ ] Tests E2E con Playwright
- [ ] CI/CD con GitHub Actions
- [ ] Soporte para intervalos anuales en billing

---

## Contribuciones

Las contribuciones son bienvenidas. Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir un PR.

1. Fork del repositorio
2. Crea tu rama: `git checkout -b feat/nueva-feature`
3. Commit: `git commit -m "feat: descripcion clara"`
4. Push: `git push origin feat/nueva-feature`
5. Abre un Pull Request

---

## Autor

**Leonardo Guzman** — Fullstack Developer · Colombia

[![GitHub](https://img.shields.io/badge/GitHub-leonardeco-181717?style=flat-square&logo=github)](https://github.com/leonardeco)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-leonardo--guzman--t-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/leonardo-guzman-t)
[![Portfolio](https://img.shields.io/badge/Portfolio-ganancia.app-000000?style=flat-square&logo=vercel)](https://ganancia.app)

---

## Licencia

[MIT](LICENSE) — libre para uso personal y comercial.
