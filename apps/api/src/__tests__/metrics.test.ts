import { describe, expect, it, beforeEach } from "vitest";
import { metrics } from "../lib/metrics.js";

describe("metrics", () => {
  beforeEach(() => metrics.reset());

  it("increments counters and renders prometheus text", () => {
    metrics.inc("http_requests_total", { method: "GET", status: "200" });
    metrics.inc("http_requests_total", { method: "GET", status: "200" });
    metrics.observe("http_request_duration", 12, { method: "GET", route: "/health" });
    const text = metrics.render();
    expect(text).toContain("nighttable_up 1");
    expect(text).toContain("http_requests_total");
    expect(text).toContain("2");
  });
});
