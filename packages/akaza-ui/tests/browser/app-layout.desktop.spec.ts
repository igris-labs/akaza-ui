import { expect, test } from "@playwright/test";

test("application shell isolates scrolling and tracks sidebar geometry", async ({ page }) => {
  await page.goto("/#app-layout");
  const frame = page.getByTestId("app-layout-fixed");
  await frame.scrollIntoViewIfNeeded();
  const root = frame.locator(".akaza-app-layout");
  const main = root.locator(".akaza-app-layout-main");
  const header = root.locator(".akaza-app-layout-header");
  const top = (await header.boundingBox())!.y;
  await main.evaluate(element => { element.scrollTop = 500; });
  expect((await header.boundingBox())!.y).toBeCloseTo(top, 0);
  await expect.poll(() => main.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  const before = (await main.boundingBox())!.width;
  await header.getByRole("button", { name: "Navigation", exact: true }).click();
  await expect(root.locator(".akaza-sidebar-root").first()).toHaveAttribute("data-akaza-state", "collapsed");
  await expect.poll(async () => (await main.boundingBox())!.width).toBeGreaterThan(before);
  const skip = root.locator(".akaza-app-layout-skip-link");
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(main).toBeFocused();
  expect(await main.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
});

test("layout spans and overlay sides update without reserving stale columns", async ({ page }) => {
  await page.goto("/#app-layout");
  const section = page.locator("#app-layout");
  const root = section.getByTestId("app-layout-fixed").locator(".akaza-app-layout");
  const left = root.locator(".akaza-app-layout-left");
  const main = root.locator(".akaza-app-layout-main");
  await section.getByLabel("Header over content only").check();
  await expect(root.locator(".akaza-app-layout-header")).toHaveAttribute("data-akaza-span", "content");
  const inlineX = (await main.boundingBox())!.x;
  expect(inlineX).toBeGreaterThan((await left.boundingBox())!.x + 100);
  await section.getByLabel("Overlay left sidebar").check();
  await expect(left).toHaveAttribute("data-akaza-mode", "overlay");
  expect((await main.boundingBox())!.x).toBeCloseTo((await root.boundingBox())!.x + 1, 0);
});

test("page scrolling keeps its header sticky", async ({ page }) => {
  await page.goto("/#app-layout");
  const frame = page.getByTestId("app-layout-page");
  await frame.scrollIntoViewIfNeeded();
  const header = frame.locator(".akaza-app-layout-header");
  const before = (await header.boundingBox())!.y;
  await frame.evaluate(element => { element.scrollTop = 400; });
  expect((await header.boundingBox())!.y).toBeCloseTo(before, 0);
});
