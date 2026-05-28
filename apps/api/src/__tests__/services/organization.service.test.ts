import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockUser, mockOrganization, mockMember } from "../helpers/fixtures.js";

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockDb = {
  query: {
    organizations: { findFirst: vi.fn() },
    organizationMembers: { findMany: vi.fn() },
    users: { findFirst: vi.fn() },
  },
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@saas/db", () => ({
  db: mockDb,
  organizations: {},
  organizationMembers: {},
  users: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_col, val) => ({ _col, val })),
  and: vi.fn((...args) => args),
}));

import {
  getOrganizationsByUser,
  getOrganization,
  updateOrganization,
  inviteMember,
  removeMember,
} from "../../services/organization.service.js";

// ─────────────────────────────────────────────────────────────────────────────

describe("Organization Service", () => {

  beforeEach(() => vi.clearAllMocks());

  // ─── getOrganizationsByUser ────────────────────────────────────────────────

  describe("getOrganizationsByUser", () => {
    it("returns memberships with organization data", async () => {
      const memberships = [
        { ...mockMember(), organization: mockOrganization() },
      ];
      mockDb.query.organizationMembers.findMany.mockResolvedValue(memberships);

      const result = await getOrganizationsByUser("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].organization.slug).toBe("test-workspace");
    });
  });

  // ─── getOrganization ───────────────────────────────────────────────────────

  describe("getOrganization", () => {
    it("returns org when user is a member", async () => {
      const org = {
        ...mockOrganization(),
        members: [mockMember({ userId: "user-1" })],
        subscription: null,
      };
      mockDb.query.organizations.findFirst.mockResolvedValue(org);

      const result = await getOrganization("test-workspace", "user-1");

      expect(result.slug).toBe("test-workspace");
    });

    it("throws NOT_FOUND when org does not exist", async () => {
      mockDb.query.organizations.findFirst.mockResolvedValue(null);

      await expect(getOrganization("ghost-org", "user-1")).rejects.toThrow("NOT_FOUND");
    });

    it("throws FORBIDDEN when user is not a member", async () => {
      mockDb.query.organizations.findFirst.mockResolvedValue({
        ...mockOrganization(),
        members: [mockMember({ userId: "other-user" })],
        subscription: null,
      });

      await expect(getOrganization("test-workspace", "user-1")).rejects.toThrow("FORBIDDEN");
    });
  });

  // ─── updateOrganization ────────────────────────────────────────────────────

  describe("updateOrganization", () => {
    it("updates org when requester is OWNER", async () => {
      const updated = mockOrganization({ name: "New Name" });
      mockDb.query.organizations.findFirst.mockResolvedValue({
        ...mockOrganization(),
        members: [mockMember({ userId: "user-1", role: "OWNER" })],
      });
      const returning = vi.fn().mockResolvedValue([updated]);
      const where = vi.fn(() => ({ returning }));
      const set = vi.fn(() => ({ where }));
      mockDb.update.mockReturnValue({ set });

      const result = await updateOrganization("test-workspace", "user-1", { name: "New Name" });

      expect(result?.name).toBe("New Name");
    });

    it("updates org when requester is ADMIN", async () => {
      const updated = mockOrganization({ name: "Updated" });
      mockDb.query.organizations.findFirst.mockResolvedValue({
        ...mockOrganization(),
        members: [mockMember({ userId: "user-1", role: "ADMIN" })],
      });
      const returning = vi.fn().mockResolvedValue([updated]);
      const where = vi.fn(() => ({ returning }));
      const set = vi.fn(() => ({ where }));
      mockDb.update.mockReturnValue({ set });

      const result = await updateOrganization("test-workspace", "user-1", { name: "Updated" });
      expect(result?.name).toBe("Updated");
    });

    it("throws FORBIDDEN when requester is MEMBER", async () => {
      mockDb.query.organizations.findFirst.mockResolvedValue({
        ...mockOrganization(),
        members: [mockMember({ userId: "user-1", role: "MEMBER" })],
      });

      await expect(
        updateOrganization("test-workspace", "user-1", { name: "Hack" })
      ).rejects.toThrow("FORBIDDEN");
    });
  });

  // ─── inviteMember ──────────────────────────────────────────────────────────

  describe("inviteMember", () => {
    it("adds member when invited by OWNER", async () => {
      const newUser = mockUser({ id: "user-2", email: "sara@test.com" });
      const newMember = mockMember({ userId: "user-2", role: "MEMBER" });

      mockDb.query.organizations.findFirst.mockResolvedValue({
        ...mockOrganization(),
        members: [mockMember({ userId: "user-1", role: "OWNER" })],
      });
      mockDb.query.users.findFirst.mockResolvedValue(newUser);

      const returning = vi.fn().mockResolvedValue([newMember]);
      const values = vi.fn(() => ({ returning }));
      mockDb.insert.mockReturnValue({ values });

      const result = await inviteMember("test-workspace", "user-1", "sara@test.com", "MEMBER");
      expect(result.userId).toBe("user-2");
    });

    it("throws ALREADY_MEMBER if user is already in org", async () => {
      const existingUser = mockUser({ id: "user-2", email: "sara@test.com" });
      mockDb.query.organizations.findFirst.mockResolvedValue({
        ...mockOrganization(),
        members: [
          mockMember({ userId: "user-1", role: "OWNER" }),
          mockMember({ userId: "user-2", role: "MEMBER" }),
        ],
      });
      mockDb.query.users.findFirst.mockResolvedValue(existingUser);

      await expect(
        inviteMember("test-workspace", "user-1", "sara@test.com", "MEMBER")
      ).rejects.toThrow("ALREADY_MEMBER");
    });

    it("throws USER_NOT_FOUND if invited email doesn't exist", async () => {
      mockDb.query.organizations.findFirst.mockResolvedValue({
        ...mockOrganization(),
        members: [mockMember({ userId: "user-1", role: "OWNER" })],
      });
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await expect(
        inviteMember("test-workspace", "user-1", "ghost@test.com", "MEMBER")
      ).rejects.toThrow("USER_NOT_FOUND");
    });

    it("throws FORBIDDEN when MEMBER tries to invite", async () => {
      mockDb.query.organizations.findFirst.mockResolvedValue({
        ...mockOrganization(),
        members: [mockMember({ userId: "user-1", role: "MEMBER" })],
      });

      await expect(
        inviteMember("test-workspace", "user-1", "sara@test.com", "MEMBER")
      ).rejects.toThrow("FORBIDDEN");
    });
  });

  // ─── removeMember ──────────────────────────────────────────────────────────

  describe("removeMember", () => {
    it("removes a MEMBER when requested by OWNER", async () => {
      mockDb.query.organizations.findFirst.mockResolvedValue({
        ...mockOrganization(),
        members: [
          mockMember({ userId: "user-1", role: "OWNER" }),
          mockMember({ id: "member-2", userId: "user-2", role: "MEMBER" }),
        ],
      });
      const where = vi.fn().mockResolvedValue(undefined);
      mockDb.delete.mockReturnValue({ where });

      await expect(
        removeMember("test-workspace", "user-1", "user-2")
      ).resolves.toBeUndefined();

      expect(where).toHaveBeenCalledOnce();
    });

    it("throws CANNOT_REMOVE_OWNER", async () => {
      mockDb.query.organizations.findFirst.mockResolvedValue({
        ...mockOrganization(),
        members: [
          mockMember({ userId: "user-1", role: "OWNER" }),
          mockMember({ id: "member-2", userId: "user-2", role: "OWNER" }),
        ],
      });

      await expect(
        removeMember("test-workspace", "user-1", "user-2")
      ).rejects.toThrow("CANNOT_REMOVE_OWNER");
    });
  });

});
