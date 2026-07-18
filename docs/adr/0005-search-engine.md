# ADR-0005 — Meilisearch for discovery

- **Status:** accepted
- **Date:** 2026-07-18

## Context

National faceted search (city, type, stars, lens Comer/Salir) will outgrow naive SQL quickly.

## Decision

PostgreSQL remains source of truth. Meilisearch is the read model for discovery. Worker reindexes on publish/update.

## Consequences

- Eventual consistency between PG and search
- Local docker-compose includes Meilisearch
