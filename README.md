# SaaS Boilerplate

Monorepo production-ready para lanzar cualquier SaaS en dias.

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | Fastify 5, JWT, Swagger |
| Base de datos | PostgreSQL + Drizzle ORM |
| Billing | Stripe (Checkout + Billing Portal + Webhooks) |
| Monorepo | Turborepo |
| Deploy | Docker + docker-compose |

## Estructura

```
saas-boilerplate/
├── apps/
│   ├── web/          # Next.js 15
│   └── api/          # Fastify REST API
├── packages/
│   ├── db/           # Drizzle ORM + schema
│   ├── ui/           # Componentes compartidos
│   └── config/       # TypeScript configs
├── docker-compose.yml
└── turbo.json
```

## Inicio rapido

```bash
# 1. Clonar y entrar
cd saas-boilerplate

# 2. Variables de entorno
cp .env.example .env
# Editar .env con tus claves

# 3. Instalar dependencias
npm install

# 4. Levantar base de datos
docker-compose up postgres -d

# 5. Migrar base de datos
npm run db:migrate

# 6. Desarrollo
npm run dev
```

## Con Docker (completo)

```bash
cp .env.example .env
docker-compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Docs: http://localhost:3001/docs

## Features

- **Auth**: registro, login, JWT access + refresh tokens, logout
- **Multi-tenancy**: organizaciones, invitar miembros, roles (OWNER / ADMIN / MEMBER)
- **Billing**: planes FREE/PRO/ENTERPRISE, Stripe Checkout, portal de facturacion, webhooks
- **Dashboard**: stats, lista de workspaces, gestion de miembros, configuracion
- **API documentada**: Swagger UI en `/docs`
- **Rate limiting**: 100 req/min por IP
- **Docker listo**: Dockerfiles optimizados con multi-stage build

## Stripe webhooks local

```bash
stripe listen --forward-to localhost:3001/billing/webhook
```
