import { expect, test, type BrowserContext, type Page } from "playwright/test";

const APP_ROUTES = [
  "/dashboard",
  "/tracking",
  "/locate",
  "/geofences",
  "/tasks",
  "/tasks/task-002",
  "/history?trip=trip-002",
  "/vehicles",
  "/drivers",
  "/accidents",
  "/reports",
  "/snapshots",
  "/dashcam",
  "/control",
  "/settings",
];

async function authorize(context: BrowserContext) {
  await context.addCookies([
    {
      name: "vanguard-local-session",
      value: "1",
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
    },
  ]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
}

test("protected routes redirect to the local workspace gate", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  await expect(page.getByRole("button", { name: "Buka workspace" })).toBeVisible();
});

test("primary routes render without page errors or desktop overflow", async ({ context }) => {
  await authorize(context);

  for (const route of APP_ROUTES) {
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("body"), route).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(pageErrors, route).toEqual([]);
    await page.close();
  }
});

test("selection URL contracts select the requested entities", async ({ context, page }) => {
  await authorize(context);

  await page.goto("/tasks?task=task-002");
  await expect(page.getByText("OPS-2026-002").first()).toBeVisible();

  await page.goto("/history?trip=trip-002");
  await expect(page.locator("select")).toHaveValue("trip-002");

  await page.goto("/history?trip=invalid");
  await expect(
    page.getByRole("heading", { name: "Perjalanan tidak ditemukan" })
  ).toBeVisible();

  await page.goto("/dashboard");
  const attentionLinks = page.locator('a[href^="/tracking?focus="]');
  expect(await attentionLinks.count()).toBeGreaterThan(0);
  for (const href of await attentionLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute("href"))
  )) {
    expect(href).toMatch(/^\/tracking\?focus=\d+$/);
  }

  await attentionLinks.first().click();
  await expect(page).toHaveURL(/\/tracking\?focus=\d+$/);
});

test("core operational pages do not overflow at 768px", async ({ context }) => {
  await authorize(context);
  const page = await context.newPage();
  await page.setViewportSize({ width: 768, height: 900 });

  for (const route of ["/dashboard", "/tracking", "/tasks", "/history?trip=trip-002"] ) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expectNoHorizontalOverflow(page);
  }
});
