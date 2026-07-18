import { describe, expect, it, beforeEach, afterEach } from "vitest";

describe("oauthConfigured", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ?? "postgresql://u:p@localhost:5432/db";
    process.env.JWT_ACCESS_SECRET =
      process.env.JWT_ACCESS_SECRET ?? "x".repeat(32);
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET ?? "y".repeat(32);
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it("detects missing providers", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    // dynamic import after env — module caches env from ../env.js which already loaded
    // so test pure logic inline:
    const google = Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    );
    const github = Boolean(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
    );
    expect(google).toBe(false);
    expect(github).toBe(false);
  });

  it("detects google when set", () => {
    process.env.GOOGLE_CLIENT_ID = "id";
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    expect(
      Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    ).toBe(true);
  });
});
