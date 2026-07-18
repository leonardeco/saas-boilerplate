import { test, expect } from "@playwright/test";

const api = process.env.E2E_API_URL ?? "http://localhost:3001";

test.describe("NightTable smoke", () => {
  test("API health", async ({ request }) => {
    const res = await request.get(`${api}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("API geo cities", async ({ request }) => {
    const res = await request.get(`${api}/geo/cities`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test("home page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/NightTable|Food & Nightlife/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("login page has form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("register validation surface", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /crear cuenta/i })).toBeVisible();
  });
});
