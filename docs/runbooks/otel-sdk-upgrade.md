# Upgrading to full OpenTelemetry SDK

Current production path: **lite OTLP** in `apps/api/src/lib/otel.ts` (zero native deps, OTLP/HTTP JSON).

## When to upgrade

- Need auto-instrumentation (pg, http, undici, redis)
- Sampling / baggage / context propagation across workers
- Vendor agents (Grafana, Honeycomb, Datadog OTLP)

## Suggested packages

```bash
npm i @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions -w @saas/api
```

## Bootstrap (example)

Create `apps/api/src/tracing.ts` loaded **before** app import:

```ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

```
node --import ./dist/tracing.js dist/index.js
```

Keep Prometheus `/metrics` as-is; dual-export is fine.

## Compatibility

Lite hooks can be disabled when `OTEL_USE_SDK=true` by no-opping `otel-hook.ts`.
