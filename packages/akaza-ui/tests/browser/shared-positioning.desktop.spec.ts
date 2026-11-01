import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openPlayground(page);
  await page.setViewportSize({ width: 800, height: 600 });
});

async function expectWithinViewport(content: Locator) {
  await expect.poll(() => content.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return rect.left >= 3 && rect.top >= 3 && rect.right <= innerWidth - 3 && rect.bottom <= innerHeight - 3;
  })).toBe(true);
}

test("pointer-anchored context menus flip both axes and track viewport resizing", async ({ page }) => {
  const target = section(page, "context-menu").getByText("Right-click here", { exact: true });
  await target.evaluate(element => {
    const surface = element.parentElement!;
    surface.style.cssText = "position:fixed;right:8px;bottom:8px;width:180px;height:80px;z-index:100";
  });
  await target.locator("..").click({ button: "right", position: { x: 170, y: 70 } });
  const content = page.locator(".akaza-context-menu-content").first();
  await expect(content).toBeVisible();
  await expect(content).toHaveAttribute("data-akaza-side", "left");
  await expect(content).toHaveAttribute("data-akaza-align", "end");
  await expectWithinViewport(content);
  await page.setViewportSize({ width: 640, height: 480 });
  await expectWithinViewport(content);
  expect(await content.evaluate(element => element.style.getPropertyValue("--akaza-context-menu-anchor-width"))).toBe("0px");
  await page.keyboard.press("Escape");
  await expect(content).toBeHidden();
});

test("inline popovers use offset-parent coordinates without overriding consumer transforms", async ({ page }) => {
  const trigger = section(page, "popover").getByRole("button", { name: "start", exact: true });
  await trigger.evaluate(element => {
    const root = element.closest<HTMLElement>(".akaza-popover-root")!;
    root.style.cssText = "position:fixed;left:50px;top:120px;width:240px;height:40px;border:5px solid transparent;z-index:2000";
  });
  await trigger.click();
  const root = trigger.locator("..");
  const content = root.locator(".akaza-popover-content");
  await expect(content).toBeVisible();
  await expect(content).toHaveAttribute("data-akaza-side", "bottom");
  await expect.poll(() => content.evaluate(element => {
    const rootRect = element.parentElement!.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return Math.abs(rect.left - rootRect.left) < 1 && Math.abs(rect.top - rootRect.bottom - 6) < 1;
  })).toBe(true);
  await page.addStyleTag({ content: ".akaza-popover-content { transform: translateX(4px); transform-origin: 7px 9px; }" });
  await expect(content).toHaveCSS("transform", "matrix(1, 0, 0, 1, 4, 0)");
  await expect(content).toHaveCSS("transform-origin", "7px 9px");
  await page.keyboard.press("Escape");
  await expect(content).toBeHidden();
});

test("preview arrows stay anchored through content resizing and viewport clamping", async ({ page }) => {
  const trigger = section(page, "hover-preview-card").getByRole("link", { name: /Ada Lovelace/ });
  await trigger.evaluate(element => {
    element.closest<HTMLElement>(".akaza-hover-preview-card-root")!.style.cssText = "position:fixed;left:4px;top:180px;z-index:2000";
  });
  await trigger.focus();
  const content = page.locator('.akaza-hover-preview-card-content[data-akaza-state="open"]');
  await expect(content).toBeVisible();
  await expectWithinViewport(content);
  const arrow = content.locator(".akaza-hover-preview-card-arrow");
  async function expectArrowAtTrigger() {
    await expect.poll(async () => {
      const anchor = await trigger.boundingBox();
      const pointer = await arrow.boundingBox();
      return anchor && pointer ? Math.abs(anchor.x + anchor.width / 2 - pointer.x - pointer.width / 2) : Infinity;
    }).toBeLessThan(2);
  }
  await expectArrowAtTrigger();
  await page.addStyleTag({ content: ".akaza-hover-preview-card-content { width: 220px; }" });
  await expectArrowAtTrigger();
  await expectWithinViewport(content);
});
