# Read replicas — catalog scale

## Design

| Path | Connection |
|---|---|
| Auth, booking, claims, billing, admin writes | `DATABASE_URL` (primary) via `db` |
| Catalog search, venue detail, geo list | `DATABASE_READ_URL` or primary via `dbRead` |

## Env

```env
DATABASE_URL=postgresql://user:pass@primary:5432/nighttable_db
DATABASE_READ_URL=postgresql://user:pass@replica:5432/nighttable_db
```

If `DATABASE_READ_URL` is omitted, `dbRead === db` (single node).

## Response meta

Catalog/geo may include:

```json
{ "meta": { "db": "replica" } }
```

or `"primary"`.

## Lag caveats

- After claim approve / publish, venue may lag on replica for milliseconds–seconds
- Booking paths always hit primary (correct capacity)
- For strong consistency after admin publish, reindex Meili (async) remains source of discovery truth when Meili is on

## Providers

| Host | Replica |
|---|---|
| Neon | Read replica endpoint |
| RDS | Reader endpoint |
| Supabase | Dedicated pooler read |
| Railway | Separate read plugin if available |
