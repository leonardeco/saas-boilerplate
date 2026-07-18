# OpenTelemetry (lite OTLP) — NightTable API

## What we ship

- W3C `traceparent` on every response
- In-process spans for HTTP requests
- Optional export to OTLP/HTTP JSON (`/v1/traces`)
- Prometheus still at `GET /metrics`

No heavy `@opentelemetry/*` SDK — drop-in OTLP without native addons.

## Enable

```env
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=nighttable-api
# optional: OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer xxx
REGION=sao
```

## Local collector (example)

```bash
# Jaeger all-in-one exposes OTLP HTTP on 4318
docker run --rm -p 4318:4318 -p 16686:16686 jaegertracing/all-in-one:1.57
```

Open http://localhost:16686 and generate traffic against the API.

## Debug

- Non-production: `GET /debug/spans` — last ~20 spans in memory
- Response header: `traceparent: 00-<trace>-<span>-01`

## Upgrade path

Replace `apps/api/src/lib/otel.ts` with official SDK (`@opentelemetry/sdk-node` + auto-instrumentations) without changing route code if you keep the same hooks.
