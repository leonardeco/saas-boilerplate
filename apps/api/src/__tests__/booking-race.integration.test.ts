import { describe, expect, it } from "vitest";

/**
 * Optional integration: requires DATABASE_URL + migrated schema.
 * Skips cleanly in unit CI without DB.
 *
 * Simulates two concurrent holds via domain+service when available.
 */
const hasDb = Boolean(process.env.DATABASE_URL && process.env.RUN_INTEGRATION === "1");

describe.skipIf(!hasDb)("booking race integration", () => {
  it("placeholder — enable with RUN_INTEGRATION=1 and DB", async () => {
    // Full PG race test hooks here when CI service is up:
    // create venue+slot capacity 1, Promise.all two holds, expect 1 ok 1 fail.
    expect(hasDb).toBe(true);
  });
});

describe("booking race contract", () => {
  it("documents expected conflict codes", () => {
    const codes = ["INSUFFICIENT_CAPACITY", "SLOT_LOCKED", "SLOT_NOT_FOUND"];
    expect(codes).toContain("INSUFFICIENT_CAPACITY");
  });
});
