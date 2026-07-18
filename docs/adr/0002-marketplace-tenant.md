# ADR-0002 — Marketplace + chain multi-tenancy (T2)

- **Status:** accepted
- **Date:** 2026-07-18

## Context

Venues may be single sites or multi-site brands. Many catalog entries start unclaimed.

## Decision

- `organizations` = brand/chain (billing owner)
- `venues` = physical sites (0..N per org)
- Unclaimed venues: `organization_id = null`, `claim_status = UNCLAIMED`
- Booking only when `claim_status ∈ {CLAIMED, VERIFIED}` and `booking_enabled = true`
- Roles: comensal (user), OWNER/ADMIN/MEMBER on org, platform SUPERADMIN/MODERATOR

## Consequences

- Catalog can be national before supply onboarding
- Claim verification required to prevent venue hijacking
