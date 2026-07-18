# Domain contexts

| Context | Owns | Key entities |
|---|---|---|
| Geo | Colombia hierarchy | department, city, municipality, neighborhood |
| Catalog | Public venues | venue, media, hours, tags, nightlife attrs |
| Ingestion | Provider sync | raw_payload, venue_source, ingestion_job |
| Inventory | Capacity | space, table, availability_slot |
| Booking | Reservations | reservation (HOLD…), agenda |
| Reviews | UGC | review, moderation_flag |
| Identity | People | user, session/tokens, platform_role |
| Tenant | B2B structure | organization, membership, claim |
| Billing | Money SaaS | plan, subscription, Stripe events |
| Notify | Outbound | email jobs (WhatsApp later) |
| Trust | Safety | spam, claim fraud, rate limits |
| Admin | Platform ops | feature flags, city waves, budgets |

## Lenses

- **Comer** — restaurants / mixed dining ranking
- **Salir** — bars / clubs / nightlife ranking
