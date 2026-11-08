import type { Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openPlayground(page);
  await page.setViewportSize({ width: 1280, height: 900 });
});

test("nonmodal Drawer keeps the issue list, keyboard focus, and scrolling available", async ({ page }) => {
  const demo = section(page, "drawer");
  const first = demo.getByRole("button", { name: "Login stalls", exact: true });
  await first.press("Enter");
  const drawer = page.getByRole("dialog", { name: "Issue preview", exact: true });
  await expect(drawer).toBeVisible();
  await expect(drawer).not.toHaveAttribute("aria-modal");
  await expect(page.locator(".akaza-drawer-overlay")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(first).toBeFocused();
  await demo.getByRole("button", { name: "Search is slow", exact: true }).click();
  await expect(drawer).toContainText("Search is slow");
  const capture = demo.getByRole("textbox", { name: "Quick capture" });
  await capture.fill("New issue");
  await expect(capture).toBeFocused();
  await expect(drawer).toBeVisible();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scroll);
  await capture.focus();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(capture).toBeFocused();
});

test("portaled Select escapes dialog clipping, stays accessible, and submits its form", async ({ page }) => {
  await section(page, "select").getByRole("button", { name: "Open project dialog" }).click();
  const dialog = page.getByRole("dialog", { name: "Project details" });
  const trigger = dialog.getByRole("combobox", { name: "Project", exact: true });
  await trigger.click();
  const popup = page.locator(".akaza-select-content");
  const search = popup.getByRole("searchbox", { name: "Search projects" });
  await expect(search).toBeFocused();
  expect(await popup.evaluate(element => element.parentElement === document.body)).toBe(true);
  await expect(popup).toHaveCSS("position", "fixed");
  await expect(dialog).toHaveCSS("overflow", "hidden");
  await expect(dialog.locator(".akaza-dialog-body")).toHaveCSS("overflow-y", "auto");
  await expect.poll(async () => {
    const box = await popup.boundingBox();
    const body = await dialog.locator(".akaza-dialog-body").boundingBox();
    return Boolean(box && body && (box.y < body.y || box.y + box.height > body.y + body.height));
  }).toBe(true);
  expect(await search.evaluate(element => element.closest('[inert], [aria-hidden="true"]'))).toBeNull();
  const accessibility = await new AxeBuilder({ page }).include(".akaza-dialog-content").include(".akaza-select-content")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await popup.getByRole("option", { name: "Project 5", exact: true }).click();
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
  await dialog.getByRole("button", { name: "Save project" }).click();
  await expect(dialog.locator("output")).toHaveText("project-5");
  await trigger.click();
  await search.press("Tab");
  await expect(popup).toBeHidden();
  await expect(dialog.getByRole("button", { name: "Save project" })).toBeFocused();
  await trigger.click();
  await search.press("Shift+Tab");
  await expect(popup).toBeHidden();
  await expect(dialog.getByRole("button", { name: "Close project dialog" })).toBeFocused();
  await trigger.click();
  await search.press("Escape");
  await expect(popup).toBeHidden();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("alignment demo follows each submenu trigger row", async ({ page }) => {
  const trigger = section(page, "menu").getByRole("button", { name: "Aligned account menu" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.locator("..").evaluate(element => { (element as HTMLElement).style.cssText = "position:fixed;left:360px;top:240px;z-index:1100"; });
  await trigger.click();
  const parent = page.locator(".akaza-menu-content:not(.akaza-menu-submenu-content)");
  const submenu = page.locator(".akaza-menu-submenu-content");
  const theme = parent.getByRole("menuitem", { name: "Theme", exact: true });
  await theme.focus();
  await theme.press("ArrowRight");
  await expect(submenu).toBeVisible();
  await expect(submenu).toHaveAttribute("data-akaza-align", "start");
  async function expectTopAligned(anchor: Locator) {
    await expect.poll(async () => {
      const a = await anchor.boundingBox();
      const b = await submenu.boundingBox();
      return a && b ? Math.abs(a.y - b.y) : Infinity;
    }).toBeLessThan(2);
    await expect.poll(async () => {
      const a = await parent.boundingBox();
      const b = await submenu.boundingBox();
      if (!a || !b) return Infinity;
      const side = await submenu.getAttribute("data-akaza-side");
      const gap = side === "left" ? a.x - b.x - b.width : b.x - a.x - a.width;
      return Math.abs(gap - 4);
    }).toBeLessThan(1);
  }
  await expectTopAligned(theme);
  await page.keyboard.press("ArrowLeft");
  await expect(submenu).toBeHidden();
  await expect(theme).toBeFocused();
  const help = parent.getByRole("menuitem", { name: "Help", exact: true });
  await help.focus();
  await help.press("ArrowRight");
  await expectTopAligned(help);
  await page.keyboard.press("Escape");
  await expect(submenu).toBeHidden();
  await expect(parent).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(parent).toBeHidden();
});
