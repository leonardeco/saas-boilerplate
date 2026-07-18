/**
 * Minimal OpenTelemetry-compatible tracing:
 * - W3C traceparent propagation
 * - Optional OTLP/HTTP JSON export when OTEL_EXPORTER_OTLP_ENDPOINT is set
 * - No heavy SDK dependency (can swap to full SDK later)
 *
 * Env:
 *   OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
 *   OTEL_SERVICE_NAME=nighttable-api
 *   OTEL_ENABLED=true
 */

import { randomBytes } from "node:crypto";

export type Span = {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, string | number | boolean>;
  status: "ok" | "error";
};

const spansBuffer: Span[] = [];
const MAX_BUFFER = 100;

function otelEnabled() {
  return (
    process.env.OTEL_ENABLED === "true" &&
    Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT)
  );
}

export function newTraceId() {
  return randomBytes(16).toString("hex");
}

export function newSpanId() {
  return randomBytes(8).toString("hex");
}

/** Parse W3C traceparent: version-traceid-parentid-flags */
export function parseTraceparent(header?: string | string[]): {
  traceId: string;
  parentSpanId?: string;
} | null {
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw) return null;
  const parts = raw.trim().split("-");
  if (parts.length < 4) return null;
  const [, traceId, parentSpanId] = parts;
  if (!traceId || traceId.length !== 32) return null;
  return { traceId, parentSpanId };
}

export function formatTraceparent(traceId: string, spanId: string) {
  return `00-${traceId}-${spanId}-01`;
}

export function startSpan(
  name: string,
  opts?: {
    traceId?: string;
    parentSpanId?: string;
    attributes?: Record<string, string | number | boolean>;
  },
): Span {
  return {
    traceId: opts?.traceId ?? newTraceId(),
    spanId: newSpanId(),
    parentSpanId: opts?.parentSpanId,
    name,
    startTime: Date.now(),
    attributes: { ...(opts?.attributes ?? {}) },
    status: "ok",
  };
}

export function endSpan(span: Span, status: "ok" | "error" = "ok") {
  span.endTime = Date.now();
  span.status = status;
  spansBuffer.push(span);
  if (spansBuffer.length > MAX_BUFFER) spansBuffer.shift();
  if (otelEnabled()) {
    void flushSpan(span);
  }
}

function toNano(ms: number) {
  return String(BigInt(ms) * 1_000_000n);
}

async function flushSpan(span: Span) {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT!.replace(/\/$/, "");
  const url = `${endpoint}/v1/traces`;
  const service = process.env.OTEL_SERVICE_NAME ?? "nighttable-api";
  const region = process.env.REGION ?? "local";

  const body = {
    resourceSpans: [
      {
        resource: {
          attributes: [
            { key: "service.name", value: { stringValue: service } },
            { key: "deployment.region", value: { stringValue: region } },
          ],
        },
        scopeSpans: [
          {
            scope: { name: "nighttable-lite", version: "1.0.0" },
            spans: [
              {
                traceId: span.traceId,
                spanId: span.spanId,
                parentSpanId: span.parentSpanId,
                name: span.name,
                kind: 2, // SERVER
                startTimeUnixNano: toNano(span.startTime),
                endTimeUnixNano: toNano(span.endTime ?? Date.now()),
                attributes: Object.entries(span.attributes).map(([key, v]) => ({
                  key,
                  value:
                    typeof v === "number"
                      ? { doubleValue: v }
                      : typeof v === "boolean"
                        ? { boolValue: v }
                        : { stringValue: String(v) },
                })),
                status: {
                  code: span.status === "error" ? 2 : 1,
                },
              },
            ],
          },
        ],
      },
    ],
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.OTEL_EXPORTER_OTLP_HEADERS
          ? Object.fromEntries(
              process.env.OTEL_EXPORTER_OTLP_HEADERS.split(",").map((p) => {
                const [k, ...rest] = p.split("=");
                return [k!.trim(), rest.join("=").trim()];
              }),
            )
          : {}),
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[otel] export failed", err);
    }
  }
}

export function recentSpans() {
  return [...spansBuffer];
}

export function clearSpans() {
  spansBuffer.length = 0;
}
