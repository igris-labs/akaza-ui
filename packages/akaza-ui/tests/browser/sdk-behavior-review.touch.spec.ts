import { expect, test } from "@playwright/test";
import { longPress, openPlayground, section, tap } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("ContextMenu SDK hold opens once and respects its disabled hold option", async ({ page }, testInfo) => {
  const demo = section(page, "context-menu");
  const surface = demo.locator(".akaza-context-menu-root").first().locator("div").first();
  await surface.scrollIntoViewIfNeeded();
  const initialScroll = await page.evaluate(() => window.scrollY);
  if (testInfo.project.name === "mobile-chrome") {
    const box = await surface.boundingBox();
    if (!box) throw new Error("Missing ContextMenu touch surface");
    const session = await page.context().newCDPSession(page);
    try {
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + 10, y: box.y + 10 }] });
      await expect(page.getByRole("menu")).toBeVisible();
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } finally {
      await session.detach();
    }
  } else {
    // Playwright WebKit has no trusted hold API; pointer dispatch checks the same timer binding only.
    await longPress(page, surface);
  }
  await expect(page.getByRole("menu")).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);
  await tap(page, demo.getByRole("heading", { name: "Context Menu", exact: true }));
  await expect(page.getByRole("menu")).toHaveCount(0);
  await demo.getByRole("checkbox", { name: "Enable touch and pen long press" }).uncheck();
  await longPress(page, surface);
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("moving touch cancels a pending hold before native scrolling", async ({ page }, testInfo) => {
  const surface = section(page, "context-menu").locator(".akaza-context-menu-root").first().locator("div").first();
  await surface.scrollIntoViewIfNeeded();
  if (testInfo.project.name === "mobile-chrome") {
    const box = await surface.boundingBox();
    if (!box) throw new Error("Missing ContextMenu touch surface");
    const session = await page.context().newCDPSession(page);
    try {
      const point = { x: box.x + 12, y: box.y + box.height / 2 };
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...point, y: point.y - 45 }] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } finally {
      await session.detach();
    }
  } else {
    await surface.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "touch", isPrimary: true, button: 0, clientX: 30, clientY: 100 });
    await surface.dispatchEvent("pointermove", { pointerId: 1, pointerType: "touch", isPrimary: true, clientX: 30, clientY: 55 });
    await surface.dispatchEvent("pointercancel", { pointerId: 1, pointerType: "touch", isPrimary: true });
  }
  await page.waitForTimeout(800);
  await expect(page.getByRole("menu")).toHaveCount(0);
});
