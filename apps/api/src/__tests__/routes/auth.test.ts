import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { mockUser, mockOrganization } from "../helpers/fixtures.js";

// ─── Mock services before importing the app ───────────────────────────────────
vi.mock("../../services/auth.service.js", () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  createRefreshToken: vi.fn().mockResolvedValue("mock-refresh-token"),
  rotateRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../services/password-reset.service.js", () => ({
  requestPasswordReset: vi.fn().mockResolvedValue(undefined),
  resetPassword: vi.fn(),
}));

import { buildTestApp, signTestToken } from "../helpers/app.js";
import {
  registerUser,
  loginUser,
  rotateRefreshToken,
} from "../../services/auth.service.js";
import { resetPassword } from "../../services/password-reset.service.js";

// ─────────────────────────────────────────────────────────────────────────────

describe("Auth Routes", () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;

  beforeAll(async () => { app = await buildTestApp(); });
  afterAll(async () => { await app.close(); });
  beforeEach(() => { vi.clearAllMocks(); });

  // ─── POST /auth/register ───────────────────────────────────────────────────

  describe("POST /auth/register", () => {
    it("201 — creates account and returns tokens", async () => {
      const user = mockUser();
      const org = mockOrganization();
      vi.mocked(registerUser).mockResolvedValue({ user, organization: org });

      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { name: "Leonardo", email: "leo@test.com", password: "password123" },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body).toHaveProperty("accessToken");
      expect(body).toHaveProperty("refreshToken", "mock-refresh-token");
      expect(body.user.email).toBe("leo@test.com");
    });

    it("409 — returns conflict when email already in use", async () => {
      vi.mocked(registerUser).mockRejectedValue(new Error("EMAIL_IN_USE"));

      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { name: "Leo", email: "leo@test.com", password: "password123" },
      });

      expect(res.statusCode).toBe(409);
      expect(res.json().error).toMatch(/email/i);
    });

    it("400 — validates required fields", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { email: "notvalid" }, // missing name, short password
      });

      expect(res.statusCode).toBe(400);
    });

    it("400 — rejects password shorter than 8 chars", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { name: "Leo", email: "leo@test.com", password: "short" },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // ─── POST /auth/login ──────────────────────────────────────────────────────

  describe("POST /auth/login", () => {
    it("200 — returns tokens on valid credentials", async () => {
      vi.mocked(loginUser).mockResolvedValue(mockUser());

      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "leo@test.com", password: "password123" },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty("accessToken");
      expect(body).toHaveProperty("refreshToken");
    });

    it("401 — wrong credentials", async () => {
      vi.mocked(loginUser).mockRejectedValue(new Error("INVALID_CREDENTIALS"));

      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "leo@test.com", password: "wrong" },
      });

      expect(res.statusCode).toBe(401);
      expect(res.json().error).toMatch(/credentials/i);
    });

    it("400 — missing email", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { password: "password123" },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // ─── POST /auth/refresh ────────────────────────────────────────────────────

  describe("POST /auth/refresh", () => {
    it("200 — rotates token and returns new pair", async () => {
      vi.mocked(rotateRefreshToken).mockResolvedValue({
        user: mockUser(),
        refreshToken: "new-refresh-token",
      });

      const res = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken: "old-refresh-token" },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty("accessToken");
      expect(body.refreshToken).toBe("new-refresh-token");
    });

    it("401 — invalid refresh token", async () => {
      vi.mocked(rotateRefreshToken).mockRejectedValue(new Error("INVALID_TOKEN"));

      const res = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken: "bad-token" },
      });

      expect(res.statusCode).toBe(401);
    });

    it("400 — missing refreshToken", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // ─── POST /auth/logout ─────────────────────────────────────────────────────

  describe("POST /auth/logout", () => {
    it("200 — logs out authenticated user", async () => {
      const token = signTestToken(app, { sub: "user-1", email: "leo@test.com" });

      const res = await app.inject({
        method: "POST",
        url: "/auth/logout",
        headers: { authorization: `Bearer ${token}` },
        payload: { refreshToken: "some-refresh-token" },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().message).toMatch(/logged out/i);
    });

    it("401 — rejects unauthenticated request", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/logout",
        payload: { refreshToken: "token" },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── GET /auth/me ──────────────────────────────────────────────────────────

  describe("GET /auth/me", () => {
    it("200 — returns user info from JWT", async () => {
      const token = signTestToken(app, { sub: "user-1", email: "leo@test.com" });

      const res = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: `Bearer ${token}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.id).toBe("user-1");
      expect(body.email).toBe("leo@test.com");
    });

    it("401 — rejects requests without token", async () => {
      const res = await app.inject({ method: "GET", url: "/auth/me" });
      expect(res.statusCode).toBe(401);
    });

    it("401 — rejects expired/invalid tokens", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: "Bearer invalid.token.here" },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── POST /auth/forgot-password ────────────────────────────────────────────

  describe("POST /auth/forgot-password", () => {
    it("200 — always returns success (prevents email enumeration)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/forgot-password",
        payload: { email: "anyone@test.com" },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty("message");
    });

    it("200 — even when email does not exist", async () => {
      // requestPasswordReset is mocked to do nothing (which covers non-existent users too)
      const res = await app.inject({
        method: "POST",
        url: "/auth/forgot-password",
        payload: { email: "nobody@test.com" },
      });

      expect(res.statusCode).toBe(200);
    });

    it("400 — rejects invalid email format", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/forgot-password",
        payload: { email: "not-an-email" },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // ─── POST /auth/reset-password ─────────────────────────────────────────────

  describe("POST /auth/reset-password", () => {
    it("200 — resets password and returns tokens", async () => {
      vi.mocked(resetPassword).mockResolvedValue(mockUser());

      const res = await app.inject({
        method: "POST",
        url: "/auth/reset-password",
        payload: { token: "valid-token", password: "newpassword123" },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty("accessToken");
      expect(body).toHaveProperty("refreshToken");
    });

    it("400 — invalid or expired token", async () => {
      vi.mocked(resetPassword).mockRejectedValue(new Error("TOKEN_INVALID"));

      const res = await app.inject({
        method: "POST",
        url: "/auth/reset-password",
        payload: { token: "bad-token", password: "newpassword123" },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error).toMatch(/invalido|expirado/i);
    });

    it("400 — rejects password shorter than 8 characters", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/reset-password",
        payload: { token: "some-token", password: "short" },
      });

      expect(res.statusCode).toBe(400);
    });
  });

});
