# WhatsApp approved templates (Meta)

## Why templates

Outside the 24h user-initiated window, Meta only allows **approved templates**.

## NightTable mapping

| Event | Env var | Suggested template name | Body params |
|---|---|---|---|
| HOLD | `WHATSAPP_TEMPLATE_HOLD` | `nt_booking_hold` | 1 guest, 2 venue, 3 party, 4 when |
| Confirmed | `WHATSAPP_TEMPLATE_CONFIRMED` | `nt_booking_confirmed` | same |
| Cancelled | `WHATSAPP_TEMPLATE_CANCELLED` | `nt_booking_cancelled` | same |

## Create in Meta Business Manager

1. WhatsApp → Message templates → Create
2. Category: **Utility**
3. Language: **Spanish (COL)** or `es`
4. Body example:

```
Hola {{1}}, tu reserva en {{2}} para {{3}} personas ({{4}}) está en proceso. NightTable CO.
```

5. Submit for approval; copy the **template name** into env.

## Env

```env
WHATSAPP_ENABLED=true
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_USE_TEMPLATES=true
WHATSAPP_TEMPLATE_LANG=es
WHATSAPP_TEMPLATE_HOLD=nt_booking_hold
WHATSAPP_TEMPLATE_CONFIRMED=nt_booking_confirmed
WHATSAPP_TEMPLATE_CANCELLED=nt_booking_cancelled
```

## Fallback

If `WHATSAPP_USE_TEMPLATES` is false or name missing → free-form text (session messages only).
