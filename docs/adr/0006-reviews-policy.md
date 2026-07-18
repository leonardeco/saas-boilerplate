# ADR-0006 — Reviews and external ratings

- **Status:** accepted
- **Date:** 2026-07-18

## Context

Premium positioning needs stars and social proof without violating third-party ToS.

## Decision

- Store **own** reviews (user-generated on platform) with moderation.
- External providers may contribute **rating snapshots** (avg/count) + attribution, not necessarily full third-party review text if ToS forbids it.
- `quality_score` combines rating, volume, and curation badge.
- Prefer verified visits (COMPLETED reservation) when available.

## Consequences

- Dual rating display may show “on NightTable” vs “external snapshot”
- Moderation roles required
