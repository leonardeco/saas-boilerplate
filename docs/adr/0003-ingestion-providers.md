# ADR-0003 — Multi-provider catalog ingestion (D5)

- **Status:** accepted
- **Date:** 2026-07-18

## Context

Ambitious national coverage requires bulk discovery of restaurants, bars, and clubs with quality signals.

## Decision

Primary sources: Google Places API, Foursquare (or equivalent), OpenStreetMap/Overpass, partner CSV, human curation, venue claim.  
Pipeline: raw landing → normalize → dedupe → enrich → quality_score → publish → reindex.  
Aggressive scraping of Maps/Instagram as a primary source is **out of scope** (legal/ToS/fragility).

## Consequences

- API cost management (quotas, cache, daily budget)
- Attribution and ToS compliance for display
- Mock adapters for local/dev without keys
