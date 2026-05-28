import { vi } from "vitest";

// ─── Mock env before anything imports it ─────────────────────────────────────
vi.mock("../env.js", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/test_db",
    JWT_ACCESS_SECRET: "test-access-secret-that-is-at-least-32-chars-long",
    JWT_REFRESH_SECRET: "test-refresh-secret-that-is-at-least-32-chars-long",
    JWT_ACCESS_EXPIRES: "15m",
    JWT_REFRESH_EXPIRES: "7d",
    API_PORT: 3001,
    API_HOST: "0.0.0.0",
    CORS_ORIGIN: "http://localhost:3000",
    WEB_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_mock",
    STRIPE_WEBHOOK_SECRET: "whsec_mock",
    EMAIL_FROM: "test@test.com",
    NODE_ENV: "test",
  },
}));

// ─── Suppress console output during tests ────────────────────────────────────
beforeAll(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});
