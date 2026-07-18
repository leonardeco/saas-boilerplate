import { describe, expect, it, beforeEach } from "vitest";
import {
  clearSpans,
  endSpan,
  formatTraceparent,
  parseTraceparent,
  startSpan,
} from "../lib/otel.js";

describe("otel lite", () => {
  beforeEach(() => clearSpans());

  it("parses and formats traceparent", () => {
    const tp = formatTraceparent("a".repeat(32), "b".repeat(16));
    expect(tp.startsWith("00-")).toBe(true);
    const parsed = parseTraceparent(tp);
    expect(parsed?.traceId).toBe("a".repeat(32));
    expect(parsed?.parentSpanId).toBe("b".repeat(16));
  });

  it("starts and ends span", () => {
    const s = startSpan("HTTP GET /health", {
      attributes: { "http.method": "GET" },
    });
    endSpan(s, "ok");
    expect(s.endTime).toBeDefined();
    expect(s.status).toBe("ok");
  });

  it("rejects bad traceparent", () => {
    expect(parseTraceparent("nope")).toBeNull();
  });
});
