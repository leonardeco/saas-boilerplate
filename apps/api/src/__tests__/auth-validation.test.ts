import { describe, expect, it } from "vitest";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

describe("auth validation contracts", () => {
  it("accepts valid register payload", () => {
    const r = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "password1",
    });
    expect(r.success).toBe(true);
  });

  it("rejects short password", () => {
    const r = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
    });
    expect(r.success).toBe(false);
  });
});
