# Security Policy — NightTable CO

## Supported versions

| Version | Supported |
|---|---|
| main / 1.x | Yes |

## Reporting a vulnerability

Email **security@yourdomain.com** (configure before launch) with:

- Description and impact
- Steps to reproduce
- Optional fix suggestion

Do **not** open public GitHub issues for sensitive vulns.

We aim to acknowledge within 72 hours.

## Security controls (product)

- JWT access short-lived + refresh rotation / revoke
- httpOnly cookies (web) · Preferences Bearer (native)
- bcrypt password hashing (cost 12)
- Helmet, HSTS (prod), rate limits (auth/hold stricter)
- Stripe webhook signature verification
- Production env validation (weak JWT / insecure cookies rejected)
- Swagger disabled by default in production
- Log redaction for secrets and tokens
- Multi-tenant membership checks on agenda/venue writes

## Secrets

Never commit `.env`. Rotate JWT, Stripe, OAuth, Places, WA tokens on leak.
