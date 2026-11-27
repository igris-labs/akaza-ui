import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("custom Button and Toggle activate Space on release without page scrolling", async ({ page }) => {
  const demo = section(page, "button");
  const button = demo.getByRole("button", { name: "As <div>" });
  await button.scrollIntoViewIfNeeded();
  await button.focus();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.keyboard.down("Space");
  await expect(demo.getByText("Custom activations: 0")).toBeVisible();
  await page.keyboard.up("Space");
  await expect(demo.getByText("Custom activations: 1")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(demo.getByText("Custom activations: 2")).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  const toggle = section(page, "toggle").getByRole("button", { name: "Custom toggle" });
  await toggle.focus();
  await page.keyboard.down("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.up("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("Tree range focus cancellation and controlled refusal stay separate", async ({ page }) => {
  const demo = section(page, "tree");
  const tree = demo.getByRole("tree", { name: "Typed key selection" });
  const rows = tree.getByRole("treeitem");
  const toggle = (label: string) => demo.getByRole("checkbox", { name: label }).evaluate(element => (element as HTMLInputElement).click());
  await toggle("Cancel selection changes");
  await toggle("Cancel Tree focus changes");
  await rows.nth(0).focus();
  await page.keyboard.press("Shift+End");
  await expect(rows.nth(0)).toBeFocused();
  await expect(rows.nth(2)).toHaveAttribute("aria-selected", "false");
  await toggle("Cancel Tree focus changes");
  await toggle("Refuse Tree selection updates");
  await page.keyboard.press("Shift+End");
  await expect(rows.nth(2)).toBeFocused();
  await expect(rows.nth(2)).toHaveAttribute("aria-selected", "false");
  await toggle("Refuse Tree selection updates");
  await page.keyboard.press("Shift+Home");
  await expect(rows.nth(0)).toBeFocused();
  await expect(tree.locator('[aria-selected="true"]')).toHaveCount(1);
  await page.keyboard.press("Shift+End");
  await expect(tree.locator('[aria-selected="true"]')).toHaveCount(3);
});

test("removed time segments recover focus without replacing native Tab order", async ({ page }) => {
  const demo = section(page, "time-field");
  const field = demo.locator('.akaza-time-field[aria-label="Snapped time"]');
  const second = field.locator('[data-akaza-segment="second"]');
  await second.focus();
  const scroll = await page.evaluate(() => window.scrollY);
  await demo.getByRole("checkbox", { name: "Seconds", exact: true }).evaluate(element => (element as HTMLInputElement).click());
  await expect(field.locator('[data-akaza-segment="minute"]')).toBeFocused();
  expect(await field.getByRole("spinbutton").evaluateAll(inputs => inputs.every(element => (element as HTMLElement).tabIndex === 0))).toBe(true);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.keyboard.press("Shift+Tab");
  await expect(field.locator('[data-akaza-segment="hour"]')).toBeFocused();
});

test("Calendar crosses month boundaries with one canonical day tab stop", async ({ page }) => {
  const calendar = section(page, "calendar").locator(".akaza-calendar").first();
  const day = calendar.getByRole("button", { name: /August 31, 2026/ }).first();
  await day.focus();
  await page.keyboard.press("ArrowRight");
  await expect(calendar.locator('.akaza-calendar-cell-trigger[tabindex="0"]')).toHaveCount(1);
  await expect(calendar.getByRole("button", { name: /September 1, 2026/ }).first()).toBeFocused();
  await page.keyboard.press("PageDown");
  await expect(calendar.getByRole("button", { name: /October 1, 2026/ }).first()).toBeFocused();
});
