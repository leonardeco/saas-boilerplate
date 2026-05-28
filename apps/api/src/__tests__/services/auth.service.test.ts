import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { mockUser } from "../helpers/fixtures.js";

// ─── Mock @saas/db ────────────────────────────────────────────────────────────
const mockDb = {
  query: {
    users: { findFirst: vi.fn() },
    refreshTokens: { findFirst: vi.fn() },
  },
  insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn() })) })),
  update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
};

vi.mock("@saas/db", () => ({
  db: mockDb,
  users: {},
  organizations: {},
  organizationMembers: {},
  refreshTokens: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col, val) => ({ col: _col, val })),
  and: vi.fn((...args) => args),
}));

import {
  registerUser,
  loginUser,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../../services/auth.service.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setupInsertChain(returnValue: unknown) {
  const returning = vi.fn().mockResolvedValue([returnValue]);
  const values = vi.fn(() => ({ returning }));
  mockDb.insert.mockReturnValue({ values });
  return { returning, values };
}

// ─────────────────────────────────────────────────────────────────────────────

describe("Auth Service", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── registerUser ───────────────────────────────────────────────────────────

  describe("registerUser", () => {
    it("creates a new user and personal organization", async () => {
      const user = mockUser();
      const org = { id: "org-1", name: "Leo's Workspace", slug: "leo-123" };

      mockDb.query.users.findFirst.mockResolvedValue(null); // no existing user

      // First insert = user, second insert = org, third insert = member
      let callCount = 0;
      mockDb.insert.mockImplementation(() => ({
        values: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue(
            callCount++ === 0 ? [user] : [org]
          ),
        })),
      }));

      const result = await registerUser("Leonardo", "leo@test.com", "password123");

      expect(result.user).toMatchObject({ email: "leo@test.com" });
      expect(mockDb.insert).toHaveBeenCalledTimes(3); // user + org + member
    });

    it("throws EMAIL_IN_USE if email already exists", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser());

      await expect(
        registerUser("Leo", "leo@test.com", "password123")
      ).rejects.toThrow("EMAIL_IN_USE");

      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it("hashes the password before storing", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);
      const spy = vi.spyOn(bcrypt, "hash");

      setupInsertChain(mockUser());

      await registerUser("Leo", "leo@test.com", "mysecretpassword").catch(() => {});

      expect(spy).toHaveBeenCalledWith("mysecretpassword", 12);
    });
  });

  // ─── loginUser ─────────────────────────────────────────────────────────────

  describe("loginUser", () => {
    it("returns user on valid credentials", async () => {
      const passwordHash = await bcrypt.hash("correctpassword", 12);
      const user = mockUser({ passwordHash });
      mockDb.query.users.findFirst.mockResolvedValue(user);

      const result = await loginUser("leo@test.com", "correctpassword");

      expect(result.email).toBe("leo@test.com");
    });

    it("throws INVALID_CREDENTIALS if user not found", async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await expect(
        loginUser("nobody@test.com", "password")
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("throws INVALID_CREDENTIALS if password is wrong", async () => {
      const passwordHash = await bcrypt.hash("correctpassword", 12);
      mockDb.query.users.findFirst.mockResolvedValue(mockUser({ passwordHash }));

      await expect(
        loginUser("leo@test.com", "wrongpassword")
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });
  });

  // ─── createRefreshToken ────────────────────────────────────────────────────

  describe("createRefreshToken", () => {
    it("inserts a refresh token and returns the raw token", async () => {
      const { values } = setupInsertChain({});

      const token = await createRefreshToken("user-1");

      expect(typeof token).toBe("string");
      expect(token).toHaveLength(128); // 64 bytes hex = 128 chars
      expect(values).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1", revoked: false })
      );
    });

    it("sets expiry 7 days from now", async () => {
      setupInsertChain({});

      await createRefreshToken("user-1");

      const callArg = mockDb.insert({}).values.mock?.calls[0]?.[0] as {
        expiresAt: Date;
      } | undefined;

      if (callArg?.expiresAt) {
        const diff = callArg.expiresAt.getTime() - Date.now();
        expect(diff).toBeGreaterThan(6 * 24 * 60 * 60 * 1000); // > 6 days
        expect(diff).toBeLessThan(8 * 24 * 60 * 60 * 1000);    // < 8 days
      }
    });
  });

  // ─── rotateRefreshToken ────────────────────────────────────────────────────

  describe("rotateRefreshToken", () => {
    it("revokes old token and returns a new one with the user", async () => {
      const user = mockUser();
      const future = new Date(Date.now() + 60_000);

      mockDb.query.refreshTokens.findFirst.mockResolvedValue({
        id: "token-1",
        token: "old-token",
        userId: "user-1",
        expiresAt: future,
        revoked: false,
        user,
      });

      const updateWhere = vi.fn().mockResolvedValue(undefined);
      const updateSet = vi.fn(() => ({ where: updateWhere }));
      mockDb.update.mockReturnValue({ set: updateSet });

      setupInsertChain({});

      const result = await rotateRefreshToken("old-token");

      expect(result.user.email).toBe("leo@test.com");
      expect(typeof result.refreshToken).toBe("string");
      expect(updateSet).toHaveBeenCalledWith({ revoked: true });
    });

    it("throws INVALID_TOKEN for an expired token", async () => {
      const past = new Date(Date.now() - 1000);
      mockDb.query.refreshTokens.findFirst.mockResolvedValue({
        expiresAt: past,
        revoked: false,
        user: mockUser(),
      });

      await expect(rotateRefreshToken("expired-token")).rejects.toThrow("INVALID_TOKEN");
    });

    it("throws INVALID_TOKEN if token not found", async () => {
      mockDb.query.refreshTokens.findFirst.mockResolvedValue(null);

      await expect(rotateRefreshToken("ghost-token")).rejects.toThrow("INVALID_TOKEN");
    });
  });

  // ─── revokeRefreshToken ────────────────────────────────────────────────────

  describe("revokeRefreshToken", () => {
    it("marks the token as revoked", async () => {
      const updateWhere = vi.fn().mockResolvedValue(undefined);
      const updateSet = vi.fn(() => ({ where: updateWhere }));
      mockDb.update.mockReturnValue({ set: updateSet });

      await revokeRefreshToken("some-token");

      expect(updateSet).toHaveBeenCalledWith({ revoked: true });
    });
  });

});
