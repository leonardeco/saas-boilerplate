# App Store / Play Store listing — NightTable CO

## Identity

| Field | Value |
|---|---|
| App name | NightTable CO |
| Subtitle | Food & Nightlife premium Colombia |
| Package / Bundle | `co.nighttable.app` |
| Category | Food & Drink / Lifestyle |
| Content rating | Likely **17+** (nightlife, alcohol venues) |

## Short description (80 chars)

```
Reserva restaurantes, bares y discotecas top en Colombia.
```

## Full description (template)

```
NightTable CO te ayuda a descubrir y reservar los mejores restaurantes,
bares y discotecas de Colombia — con foco en lugares bien valorados y
experiencias de noche de primer nivel.

• Explora por ciudad (Bogotá, Medellín, Cali, Cartagena…)
• Filtros Comer / Salir y calificación premium
• Reserva mesas en locales con booking online
• Panel para dueños de locales (claim y agenda)

Cuenta requerida para reservar. Algunos locales pueden tener restricción
de edad (18+).
```

## Keywords

```
reservas, restaurantes, bares, discotecas, colombia, nightlife, bogota, medellin
```

## Screenshots (minimum)

1. Home ciudades  
2. Lista premium Comer  
3. Lista Salir / club  
4. Ficha venue  
5. Flujo reservar HOLD→confirm  
6. Mis reservas / panel  

Sizes: follow current Apple/Google guidelines (phone + optional tablet).

## Privacy policy URL

Host: `https://app.nighttable.co/privacy`  
(Also required for OAuth / WhatsApp / Play Data safety)

## Support

- Email: support@yourdomain.com  
- Web: https://app.nighttable.co  

## Data safety (Play) / Privacy nutrition (Apple)

| Data | Collected | Linked to user | Purpose |
|---|---|---|---|
| Email / name | Yes | Yes | Account |
| Phone (optional) | Yes | Yes | Booking contact / WA |
| Location | Approx city only if you add GPS later | — | Discovery |
| Purchases | Via Stripe web | Org billing | Venue SaaS plans |
| Photos | No (unless you add upload) | — | — |

## Icons

- Source: `apps/web/public/icons/icon.svg`  
- Export 1024×1024 PNG for stores  
- Android adaptive: foreground + background `#020617`

## Before submit

- [ ] Replace `REPLACE_WITH_YOUR_RELEASE_KEYSTORE_SHA256` in assetlinks.json  
- [ ] Replace `TEAMID` in apple-app-site-association  
- [ ] Test production API with release build  
- [ ] No debug endpoints reachable  
