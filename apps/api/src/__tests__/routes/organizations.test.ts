import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { mockOrganization, mockMember } from "../helpers/fixtures.js";

// ─── Mock services ────────────────────────────────────────────────────────────
vi.mock("../../services/organization.service.js", () => ({
  getOrganizationsByUser: vi.fn(),
  getOrganization: vi.fn(),
  updateOrganization: vi.fn(),
  inviteMember: vi.fn(),
  removeMember: vi.fn(),
}));

import { buildTestApp, signTestToken } from "../helpers/app.js";
import {
  getOrganizationsByUser,
  getOrganization,
  updateOrganization,
  inviteMember,
  removeMember,
} from "../../services/organization.service.js";

// ─────────────────────────────────────────────────────────────────────────────

describe("Organization Routes", () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  let authHeader: { authorization: string };

  beforeAll(async () => {
    app = await buildTestApp();
    const token = signTestToken(app, { sub: "user-1", email: "leo@test.com" });
    authHeader = { authorization: `Bearer ${token}` };
  });
  afterAll(async () => { await app.close(); });
  beforeEach(() => { vi.clearAllMocks(); });

  // ─── GET /organizations ────────────────────────────────────────────────────

  describe("GET /organizations", () => {
    it("200 — returns user memberships", async () => {
      const memberships = [{ ...mockMember(), organization: mockOrganization() }];
      vi.mocked(getOrganizationsByUser).mockResolvedValue(memberships as any);

      const res = await app.inject({
        method: "GET",
        url: "/organizations",
        headers: authHeader,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(1);
      expect(res.json()[0].organization.slug).toBe("test-workspace");
    });

    it("200 — returns empty array when user has no orgs", async () => {
      vi.mocked(getOrganizationsByUser).mockResolvedValue([]);

      const res = await app.inject({
        method: "GET",
        url: "/organizations",
        headers: authHeader,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });

    it("401 — rejects unauthenticated request", async () => {
      const res = await app.inject({ method: "GET", url: "/organizations" });
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── GET /organizations/:slug ──────────────────────────────────────────────

  describe("GET /organizations/:slug", () => {
    it("200 — returns org details", async () => {
      const org = { ...mockOrganization(), members: [mockMember()], subscription: null };
      vi.mocked(getOrganization).mockResolvedValue(org as any);

      const res = await app.inject({
        method: "GET",
        url: "/organizations/test-workspace",
        headers: authHeader,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().slug).toBe("test-workspace");
    });

    it("404 — org not found", async () => {
      vi.mocked(getOrganization).mockRejectedValue(new Error("NOT_FOUND"));

      const res = await app.inject({
        method: "GET",
        url: "/organizations/ghost-org",
        headers: authHeader,
      });

      expect(res.statusCode).toBe(404);
    });

    it("403 — user is not a member", async () => {
      vi.mocked(getOrganization).mockRejectedValue(new Error("FORBIDDEN"));

      const res = await app.inject({
        method: "GET",
        url: "/organizations/private-org",
        headers: authHeader,
      });

      expect(res.statusCode).toBe(403);
    });
  });

  // ─── PATCH /organizations/:slug ────────────────────────────────────────────

  describe("PATCH /organizations/:slug", () => {
    it("200 — updates org name", async () => {
      const updated = mockOrganization({ name: "New Name" });
      vi.mocked(updateOrganization).mockResolvedValue(updated as any);

      const res = await app.inject({
        method: "PATCH",
        url: "/organizations/test-workspace",
        headers: authHeader,
        payload: { name: "New Name" },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().name).toBe("New Name");
    });

    it("400 — rejects invalid logoUrl", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/organizations/test-workspace",
        headers: authHeader,
        payload: { logoUrl: "not-a-url" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("403 — non-admin cannot update", async () => {
      vi.mocked(updateOrganization).mockRejectedValue(new Error("FORBIDDEN"));

      const res = await app.inject({
        method: "PATCH",
        url: "/organizations/test-workspace",
        headers: authHeader,
        payload: { name: "Hacked" },
      });

      expect(res.statusCode).toBe(403);
    });
  });

  // ─── POST /organizations/:slug/members ─────────────────────────────────────

  describe("POST /organizations/:slug/members", () => {
    it("201 — invites a new member", async () => {
      const member = mockMember({ userId: "user-2", role: "MEMBER" });
      vi.mocked(inviteMember).mockResolvedValue(member as any);

      const res = await app.inject({
        method: "POST",
        url: "/organizations/test-workspace/members",
        headers: authHeader,
        payload: { email: "sara@test.com", role: "MEMBER" },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().role).toBe("MEMBER");
    });

    it("409 — already a member", async () => {
      vi.mocked(inviteMember).mockRejectedValue(new Error("ALREADY_MEMBER"));

      const res = await app.inject({
        method: "POST",
        url: "/organizations/test-workspace/members",
        headers: authHeader,
        payload: { email: "existing@test.com", role: "MEMBER" },
      });

      expect(res.statusCode).toBe(409);
    });

    it("404 — invited user not found", async () => {
      vi.mocked(inviteMember).mockRejectedValue(new Error("USER_NOT_FOUND"));

      const res = await app.inject({
        method: "POST",
        url: "/organizations/test-workspace/members",
        headers: authHeader,
        payload: { email: "ghost@test.com", role: "MEMBER" },
      });

      expect(res.statusCode).toBe(404);
    });

    it("400 — invalid email format", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/organizations/test-workspace/members",
        headers: authHeader,
        payload: { email: "not-an-email", role: "MEMBER" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("400 — invalid role", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/organizations/test-workspace/members",
        headers: authHeader,
        payload: { email: "valid@test.com", role: "SUPERADMIN" },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // ─── DELETE /organizations/:slug/members/:userId ───────────────────────────

  describe("DELETE /organizations/:slug/members/:userId", () => {
    it("204 — removes member", async () => {
      vi.mocked(removeMember).mockResolvedValue(undefined);

      const res = await app.inject({
        method: "DELETE",
        url: "/organizations/test-workspace/members/user-2",
        headers: authHeader,
      });

      expect(res.statusCode).toBe(204);
    });

    it("400 — cannot remove the owner", async () => {
      vi.mocked(removeMember).mockRejectedValue(new Error("CANNOT_REMOVE_OWNER"));

      const res = await app.inject({
        method: "DELETE",
        url: "/organizations/test-workspace/members/owner-id",
        headers: authHeader,
      });

      expect(res.statusCode).toBe(400);
    });

    it("403 — only owner or admin can remove members", async () => {
      vi.mocked(removeMember).mockRejectedValue(new Error("FORBIDDEN"));

      const res = await app.inject({
        method: "DELETE",
        url: "/organizations/test-workspace/members/user-2",
        headers: authHeader,
      });

      expect(res.statusCode).toBe(403);
    });
  });

});
