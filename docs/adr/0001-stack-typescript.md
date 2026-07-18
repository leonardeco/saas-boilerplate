# ADR-0001 — TypeScript full-stack monorepo

- **Status:** accepted
- **Date:** 2026-07-18
- **Deciders:** PO, Architect, Full-Stack

## Context

We need a web marketplace + multi-tenant venue SaaS with SEO, booking transactions, background ingestion, and Stripe billing for Colombia.

## Options

### A — TypeScript (Next.js + Fastify + Drizzle + PG + Redis)
- Pros: one language, reuses boilerplate DNA, excellent SEO via Next, strong ecosystem
- Cons: Node less “systems” than Go for extreme QPS

### B — Next + Go API
- Pros: performance
- Cons: dual stack, slower delivery

### C — Next + Python FastAPI
- Pros: ML ranking later
- Cons: unnecessary for v1 rules-based ranking

## Decision

**Option A.** Language: TypeScript. Apps: `web`, `api`, `worker`. Packages: `db`, `contracts`, `domain`, `search`, `ui`, `config`.

## Consequences

- Faster F-Full delivery on one monorepo
- ML can be a side service later without rewriting core
- Team must maintain Turbo workspaces discipline
