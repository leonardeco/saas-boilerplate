import fp from "fastify-plugin";
import { metrics } from "../lib/metrics.js";

export const metricsHook = fp(async (app) => {
  app.addHook("onRequest", async (req) => {
    (req as { _start?: number })._start = Date.now();
  });

  app.addHook("onResponse", async (req, reply) => {
    const start = (req as { _start?: number })._start ?? Date.now();
    const ms = Date.now() - start;
    const route =
      (req.routeOptions?.url as string | undefined) ??
      req.url.split("?")[0] ??
      "unknown";
    metrics.inc("http_requests_total", {
      method: req.method,
      status: String(reply.statusCode),
    });
    metrics.observe("http_request_duration", ms, {
      method: req.method,
      route: route.slice(0, 80),
    });
  });
});
