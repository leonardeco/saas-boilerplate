# Mobile / PWA API notes — NightTable CO

## Clients

| Client | Auth | Notes |
|---|---|---|
| Web PWA | httpOnly cookies + `credentials: include` | Installable via manifest |
| Native (future) | Bearer JWT from login/register JSON | Same API; store tokens in secure storage |
| Capacitor/React Native | Bearer preferred | Cookies need shared domain |

## Base URL

```
Production: https://api.nighttable.co
Local:      http://localhost:3001
```

Set mobile `API_URL` and never hardcode secrets.

## Auth flows

### Email

```http
POST /auth/register
POST /auth/login
→ { accessToken, refreshToken, user }

POST /auth/refresh  { "refreshToken": "..." }
POST /auth/logout   Authorization: Bearer …
GET  /auth/me       Authorization: Bearer …
```

### OAuth (native)

Prefer **system browser** / ASWebAuthenticationSession:

1. Open `{API}/auth/oauth/google/start`
2. Handle redirect to deep link or custom scheme after callback
3. Or use token exchange endpoint later (deep link with one-time code)

Web uses cookie set on callback → redirect `/dashboard`.

## Core product

```http
GET /geo/cities
GET /catalog/search?city=bogota&lens=salir&premiumOnly=true
GET /catalog/{city}/{slug}
GET /bookings/slots/{venueId}
POST /bookings/hold
POST /bookings/{id}/confirm
GET /bookings/mine
POST /reviews
```

## Headers

```
Authorization: Bearer <accessToken>   # native
Content-Type: application/json
traceparent: 00-<traceId>-<spanId>-01  # optional OTel
```

## Offline (PWA)

Service worker caches shell (`/`, manifest). API calls remain network-first.  
Hold/confirm always require network.

## Deep links (suggested)

```
nighttable://venue/{city}/{slug}
nighttable://booking/{id}
https://app.nighttable.co/co/{city}/{slug}
```

## Version

Negotiate via `GET /health` → `version`, `region`.
