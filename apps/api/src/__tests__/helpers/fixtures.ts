import type { User, Organization, OrganizationMember, Plan, Subscription } from "@saas/db";

export const mockUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  name: "Leonardo Guzman",
  email: "leo@test.com",
  passwordHash: "$2b$12$hashedpassword",
  avatarUrl: null,
  emailVerified: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ...overrides,
});

export const mockOrganization = (overrides: Partial<Organization> = {}): Organization => ({
  id: "org-1",
  name: "Test Workspace",
  slug: "test-workspace",
  logoUrl: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ...overrides,
});

export const mockMember = (overrides: Partial<OrganizationMember> = {}): OrganizationMember => ({
  id: "member-1",
  organizationId: "org-1",
  userId: "user-1",
  role: "OWNER",
  createdAt: new Date("2025-01-01"),
  ...overrides,
});

export const mockPlan = (overrides: Partial<Plan> = {}): Plan => ({
  id: "plan-1",
  name: "FREE",
  stripeMonthlyPriceId: null,
  stripeYearlyPriceId: null,
  maxMembers: 1,
  maxProjects: 3,
  createdAt: new Date("2025-01-01"),
  ...overrides,
});

export const mockSubscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: "sub-1",
  organizationId: "org-1",
  planId: "plan-1",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  status: "active",
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ...overrides,
});
