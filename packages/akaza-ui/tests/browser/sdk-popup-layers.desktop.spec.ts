import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("canceled Popover Escape keeps typed text and focus without scrolling", async ({ page }) => {
  const demo = section(page, "popover");
  const trigger = demo.getByRole("button", { name: "Open (Escape blocked)" });
  await trigger.click();
  const note = demo.getByRole("textbox", { name: "Protected popover note" });
  await note.fill("Keep this draft");
  const scroll = await page.evaluate(() => window.scrollY);
  await note.press("Escape");
  await expect(note).toBeVisible();
  await expect(note).toBeFocused();
  await expect(note).toHaveValue("Keep this draft");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await expect(demo.getByText("escape blocked", { exact: true })).toHaveCount(1);
  await note.locator("xpath=ancestor::*[contains(@class, 'akaza-popover-content')]")
    .getByRole("button", { name: "Close", exact: true }).click();
  await expect(note).toBeHidden();
});

test("Popover Escape preserves external focus and inline DOM in the native top layer", async ({ page }) => {
  const demo = section(page, "popover");
  const forceOpen = demo.getByRole("button", { name: "Force open", exact: true });
  await forceOpen.click();
  const popup = demo.locator(".akaza-popover-content").filter({ hasText: "Controlled popover" });
  await expect(popup).toBeVisible();
  await expect(popup).toHaveAttribute("popover", "manual");
  expect(await popup.evaluate(element => element.closest(".akaza-popover-root") !== null)).toBe(true);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await forceOpen.focus();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
  await expect(forceOpen).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
});
