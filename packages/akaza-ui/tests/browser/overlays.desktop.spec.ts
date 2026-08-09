import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("tooltip and hover preview have focus alternatives to hover", async ({ page }) => {
  const tooltipTrigger = section(page, "tooltip").getByRole("button", { name: "Instant (0ms)" });
  await tooltipTrigger.hover();
  await expect(page.locator(".akaza-tooltip-content")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.locator(".akaza-tooltip-content")).toBeHidden();
  await tooltipTrigger.focus();
  await expect(page.locator(".akaza-tooltip-content")).toBeVisible();

  const previewTrigger = section(page, "hover-preview-card").getByRole("link", { name: /Ada Lovelace/ });
  await previewTrigger.focus();
  await expect(page.locator('.akaza-hover-preview-card-content[data-akaza-state="open"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await previewTrigger.hover();
  const preview = page.locator('.akaza-hover-preview-card-content[data-akaza-state="open"]');
  await expect(preview).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(preview).toBeHidden();
});

test("popover, menu, and context menu support pointer and keyboard dismissal", async ({ page }) => {
  const popoverTrigger = section(page, "popover").getByRole("button", { name: "Open popover" });
  await popoverTrigger.click();
  await expect(page.locator(".akaza-popover-content")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".akaza-popover-content")).toBeHidden();
  await expect(popoverTrigger).toBeFocused();

  const menuTrigger = section(page, "menu").getByRole("button", { name: "Actions" });
  await menuTrigger.scrollIntoViewIfNeeded();
  const menuScroll = await page.evaluate(() => window.scrollY);
  await menuTrigger.click();
  const menu = page.locator(".akaza-menu-content").first();
  await expect(menu).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(menuScroll);
  await page.keyboard.press("ArrowDown");
  await expect(menu.locator("[data-akaza-highlighted]")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  const contextSection = section(page, "context-menu");
  const contextTargetText = contextSection.getByText("Right-click here", { exact: true });
  await contextTargetText.scrollIntoViewIfNeeded();
  const contextMenuScroll = await page.evaluate(() => window.scrollY);
  await contextTargetText.click({ button: "right" });
  await expect(page.locator(".akaza-context-menu-content")).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(contextMenuScroll);
  await page.keyboard.press("Escape");
  const contextTarget = contextSection.getByRole("button", { name: "Keyboard target" });
  await contextTarget.focus();
  await page.keyboard.press("Shift+F10");
  await expect(page.locator(".akaza-context-menu-content")).toBeVisible();
  await contextSection.locator(".akaza-context-menu-root > div").click({ position: { x: 10, y: 10 } });
  await expect(page.locator(".akaza-context-menu-content")).toBeHidden();
});

test("modal surfaces trap focus, dismiss correctly, and restore focus", async ({ page }) => {
  const dialogTrigger = section(page, "dialog").getByRole("button", { name: "Open", exact: true }).first();
  await dialogTrigger.click();
  const dialog = page.getByRole("dialog").first();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(dialogTrigger).toBeFocused();

  const alertTrigger = section(page, "alert-dialog").getByRole("button", { name: "Delete account" });
  await alertTrigger.press("Enter");
  const alert = page.getByRole("alertdialog").first();
  await expect(alert).toBeVisible();
  await expect(alert.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(alert).toBeVisible();
  await alert.getByRole("button", { name: "Cancel" }).click();
  await expect(alert).toBeHidden();

  const drawerTrigger = section(page, "drawer").getByRole("button", { name: "Open right" });
  await drawerTrigger.click();
  const drawer = page.locator(".akaza-drawer").first();
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(drawerTrigger).toBeFocused();
});

test("nested dialogs isolate the background and dismiss only the top layer", async ({ page }) => {
  const dialogSection = section(page, "dialog");
  await dialogSection.getByRole("button", { name: "Open outer" }).click();
  const outer = page.getByText("Outer dialog", { exact: true }).locator(
    "xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' akaza-dialog-content ')][1]",
  );
  await expect(outer).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  const innerTrigger = outer.getByRole("button", { name: "Open inner" });
  await innerTrigger.click();
  const inner = page.getByRole("dialog", { name: "Inner dialog" });
  await expect(inner).toBeVisible();
  await expect(outer).toHaveAttribute("inert", "");
  await expect(outer).toHaveAttribute("aria-hidden", "true");

  const [outerZ, innerZ] = await Promise.all([
    outer.evaluate((element) => Number(getComputedStyle(element).zIndex)),
    inner.evaluate((element) => Number(getComputedStyle(element).zIndex)),
  ]);
  expect(innerZ).toBeGreaterThan(outerZ);

  await page.keyboard.press("Escape");
  await expect(inner).toBeHidden();
  await expect(outer).toBeVisible();
  await expect(outer).not.toHaveAttribute("inert", "");
  await expect(innerTrigger).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await page.keyboard.press("Escape");
  await expect(outer).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("teleported popover tracks its trigger through scroll and resize", async ({ page }) => {
  const trigger = section(page, "popover").getByRole("button", { name: "Open popover" });
  await trigger.click();
  const root = trigger.locator("xpath=ancestor::*[contains(@class, 'akaza-popover-root')][1]");
  const content = page.locator(".akaza-popover-content").first();
  await expect(content).toBeVisible();
  await page.waitForTimeout(150);
  expect(await root.evaluate((element, popup) => element.contains(popup), await content.elementHandle())).toBe(false);

  await page.evaluate(() => window.scrollBy(0, 80));
  await expect.poll(async () => {
    const [triggerBox, contentBox] = await Promise.all([trigger.boundingBox(), content.boundingBox()]);
    return Math.abs((contentBox?.x ?? 0) - (triggerBox?.x ?? 0));
  }).toBeLessThanOrEqual(4);

  await page.setViewportSize({ width: 800, height: 600 });
  const contentBox = await content.boundingBox();
  expect(contentBox).not.toBeNull();
  expect(contentBox!.x).toBeGreaterThanOrEqual(4);
  expect(contentBox!.x + contentBox!.width).toBeLessThanOrEqual(796);
});

test("toast and programmatic overlay expose working controls", async ({ page }) => {
  const toastSection = section(page, "toast");
  await toastSection.getByRole("button", { name: "Success" }).click();
  const toast = page.locator(".akaza-toast").last();
  await expect(toast).toHaveAttribute("data-akaza-type", "success");
  await toast.locator(".akaza-toast-close").click();
  await expect(toast).toBeHidden();

  const overlayTrigger = section(page, "overlay").getByRole("button", { name: "Open dialog" });
  await overlayTrigger.click();
  const overlayDialog = page.getByRole("dialog", { name: "Hello!" });
  await expect(overlayDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(overlayDialog).toBeHidden();
});
