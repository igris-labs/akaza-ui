import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function expectActiveVisible(body: Locator, path: string) {
  const active = body.locator(`a[href="${path}"][data-akaza-active]`);
  await expect(active).toHaveCount(1);
  await expect.poll(async () => active.evaluate(el => {
    const viewport = el.closest(".akaza-sidebar-body")!.getBoundingClientRect();
    const row = el.getBoundingClientRect();
    return row.top >= viewport.top - 1 && row.bottom <= viewport.bottom + 1;
  })).toBe(true);
}

test("direct links reveal the active sidebar item without scrolling the page", async ({ page }) => {
  await page.goto("/components/tree", { waitUntil: "networkidle" });
  const body = page.locator(".akaza-sidebar-body:visible");
  await expectActiveVisible(body, "/components/tree");
  expect(await body.evaluate(el => el.scrollTop)).toBeGreaterThan(100);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  const toggle = body.locator('a[href="/components/toggle"]');
  await toggle.scrollIntoViewIfNeeded();
  const previous = await body.evaluate(el => el.scrollTop);
  await toggle.click();
  await expect(page).toHaveURL(/\/components\/toggle$/);
  await expectActiveVisible(body, "/components/toggle");
  expect(Math.abs(await body.evaluate(el => el.scrollTop) - previous)).toBeLessThan(2);
});

test("search navigation and browser history reveal the new active item", async ({ page }) => {
  await page.goto("/components/accordion", { waitUntil: "networkidle" });
  const body = page.locator(".akaza-sidebar-body:visible");
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  const search = page.getByRole("dialog", { name: "Search documentation" });
  await search.getByRole("combobox").fill("Tree");
  await expect(search.getByRole("option").first()).toContainText("Tree");
  await search.getByRole("combobox").press("Enter");
  await expect(page).toHaveURL(/\/components\/tree$/);
  await expectActiveVisible(body, "/components/tree");
  await page.goBack();
  await expect(page).toHaveURL(/\/components\/accordion$/);
  await expectActiveVisible(body, "/components/accordion");
  await page.goForward();
  await expect(page).toHaveURL(/\/components\/tree$/);
  await expectActiveVisible(body, "/components/tree");
});

test("mobile navigation reveals the active item each time it opens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/components/tree", { waitUntil: "networkidle" });
  const open = page.getByRole("button", { name: "Open documentation navigation" });
  const body = page.locator(".akaza-sidebar-body:visible");
  await open.click();
  await expectActiveVisible(body, "/components/tree");
  await body.evaluate(el => el.scrollTop = 0);
  await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();
  await expect(body).toHaveCount(0);
  await open.click();
  await expectActiveVisible(body, "/components/tree");
  await page.setViewportSize({ width: 1440, height: 844 });
  await expectActiveVisible(body, "/components/tree");
});

test("reduced motion reveals the active item without a smooth scroll", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/tree", { waitUntil: "networkidle" });
  await expectActiveVisible(page.locator(".akaza-sidebar-body:visible"), "/components/tree");
});
