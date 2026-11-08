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

test("touch opens a parent-aligned submenu and outside tap dismisses it", async ({ page }) => {
  await tap(page, section(page, "menu").getByRole("button", { name: "Aligned account menu" }));
  const parent = page.locator(".akaza-menu-content:not(.akaza-menu-submenu-content)");
  await tap(page, parent.getByRole("menuitem", { name: "Theme", exact: true }));
  const submenu = page.locator(".akaza-menu-submenu-content");
  await expect(submenu).toBeVisible();
  await expect(submenu).toHaveAttribute("data-akaza-align", "end");
  await expect(submenu.getByRole("menuitem", { name: "Light", exact: true })).toBeFocused();
  await page.touchscreen.tap(2, 2);
  await expect(parent).toBeHidden();
});
