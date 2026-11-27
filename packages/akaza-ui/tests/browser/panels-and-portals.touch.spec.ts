import { expect, test } from "@playwright/test";
import { openPlayground, section, tap } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("touch selection in a portaled dialog popup stays inside the owning modal", async ({ page }) => {
  await tap(page, section(page, "select").getByRole("button", { name: "Open project dialog" }));
  const dialog = page.getByRole("dialog", { name: "Project details" });
  const trigger = dialog.getByRole("combobox", { name: "Project", exact: true });
  await tap(page, trigger);
  const popup = page.locator(".akaza-select-content");
  await expect(popup.getByRole("searchbox")).toBeFocused();
  await tap(page, popup.getByRole("option", { name: "Project 3", exact: true }));
  await expect(popup).toBeHidden();
  await tap(page, dialog.getByRole("button", { name: "Save project" }));
  await expect(dialog.locator("output")).toHaveText("project-3");
  await tap(page, dialog.getByRole("button", { name: "Close project dialog" }));
  await expect(dialog).toBeHidden();
});

test("touch aligns a submenu with its trigger row and outside tap dismisses it", async ({ page }) => {
  const trigger = section(page, "menu").getByRole("button", { name: "Aligned account menu" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.locator("..").evaluate(element => { (element as HTMLElement).style.cssText = "position:fixed;left:16px;top:96px;z-index:1100"; });
  await tap(page, trigger);
  const parent = page.locator(".akaza-menu-content:not(.akaza-menu-submenu-content)");
  const theme = parent.getByRole("menuitem", { name: "Theme", exact: true });
  await tap(page, theme);
  const submenu = page.locator(".akaza-menu-submenu-content");
  await expect(submenu).toBeVisible();
  await expect(submenu).toHaveAttribute("data-akaza-align", "start");
  await expect.poll(async () => {
    const anchor = await theme.boundingBox();
    const panel = await submenu.boundingBox();
    return anchor && panel ? Math.abs(anchor.y - panel.y) : Infinity;
  }).toBeLessThan(2);
  await expect.poll(async () => {
    const anchor = await parent.boundingBox();
    const panel = await submenu.boundingBox();
    if (!anchor || !panel) return Infinity;
    const gap = await submenu.getAttribute("data-akaza-side") === "left"
      ? anchor.x - panel.x - panel.width
      : panel.x - anchor.x - anchor.width;
    return Math.abs(gap - 4);
  }).toBeLessThan(1);
  await expect(submenu.getByRole("menuitem", { name: "Light", exact: true })).toBeFocused();
  await page.touchscreen.tap(2, 2);
  await expect(parent).toBeHidden();
});
