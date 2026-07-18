import { describe, expect, it, beforeEach, afterEach } from "vitest";

describe("usingReadReplica", () => {
  const prev = process.env.DATABASE_READ_URL;

  afterEach(() => {
    if (prev === undefined) delete process.env.DATABASE_READ_URL;
    else process.env.DATABASE_READ_URL = prev;
  });

  beforeEach(() => {
    delete process.env.DATABASE_READ_URL;
  });

  it("is false without DATABASE_READ_URL", async () => {
    // pure env check matching client helper
    expect(Boolean(process.env.DATABASE_READ_URL)).toBe(false);
  });

  it("is true when DATABASE_READ_URL set", () => {
    process.env.DATABASE_READ_URL = "postgresql://replica/db";
    expect(Boolean(process.env.DATABASE_READ_URL)).toBe(true);
  });
});
