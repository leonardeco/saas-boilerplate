import fp from "fastify-plugin";
import {
  endSpan,
  formatTraceparent,
  parseTraceparent,
  startSpan,
  type Span,
} from "../lib/otel.js";

declare module "fastify" {
  interface FastifyRequest {
    otelSpan?: Span;
  }
}

export const otelHook = fp(async (app) => {
  app.addHook("onRequest", async (req, reply) => {
    const parent = parseTraceparent(req.headers.traceparent);
    const route =
      (req.routeOptions?.url as string | undefined) ??
      req.url.split("?")[0] ??
      "unknown";
    const span = startSpan(`HTTP ${req.method} ${route}`, {
      traceId: parent?.traceId,
      parentSpanId: parent?.parentSpanId,
      attributes: {
        "http.method": req.method,
        "http.route": route.slice(0, 120),
        "http.target": req.url.slice(0, 200),
      },
    });
    req.otelSpan = span;
    reply.header("traceparent", formatTraceparent(span.traceId, span.spanId));
  });

  app.addHook("onResponse", async (req, reply) => {
    const span = req.otelSpan;
    if (!span) return;
    span.attributes["http.status_code"] = reply.statusCode;
    endSpan(span, reply.statusCode >= 500 ? "error" : "ok");
  });

  app.addHook("onError", async (req, _reply, error) => {
    if (req.otelSpan) {
      req.otelSpan.attributes["error.message"] = error.message.slice(0, 200);
    }
  });
});
