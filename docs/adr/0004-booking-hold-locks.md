# ADR-0004 — Booking HOLD + Redis/Postgres locks

- **Status:** accepted
- **Date:** 2026-07-18

## Context

Double-booking destroys trust for venues and diners.

## Decision

State machine: `HOLD` (TTL ~8 min) → `CONFIRMED` → `COMPLETED | NO_SHOW | CANCELLED`.  
Capacity enforced with PostgreSQL transaction + Redis lock per `slot_id`.  
Target: **overbooking rate = 0**.

## Consequences

- Redis is required infrastructure
- Integration tests must cover concurrent holds
