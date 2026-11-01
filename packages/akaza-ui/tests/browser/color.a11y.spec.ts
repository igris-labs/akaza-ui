import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openPlayground } from "./helpers";

test("color examples expose named controls without automated WCAG violations", async ({ page }) => {
  await openPlayground(page);
  const result = await new AxeBuilder({ page }).include("#color-picker").include("#color-field").include("#color-area").include("#color-slider").include("#color-swatch").include("#color-swatch-picker").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(result.violations).toEqual([]);
});

test("open color popover has no automated WCAG violations", async ({ page }) => {
  await openPlayground(page);
  await page.locator("#color-picker").getByRole("button", { name: "Choose color", exact: true }).click();
  await expect(page.locator(".akaza-popover-content .akaza-color-picker")).toBeVisible();
  const result = await new AxeBuilder({ page }).include(".akaza-popover-content").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(result.violations).toEqual([]);
});
