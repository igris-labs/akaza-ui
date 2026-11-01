import { expect, test } from "@playwright/test";
import { openPlayground, section, tap } from "./helpers";

test("touch selects colors without overflow on narrow screens", async ({ page }) => {
  await openPlayground(page);
  const area = section(page, "color-area").locator(".akaza-color-area").first();
  const before = await area.getByRole("slider").first().inputValue();
  await tap(page, area.locator("canvas"));
  await expect(area.getByRole("slider").first()).not.toHaveValue(before);
  const controls = section(page, "color-area").getByRole("group", { name: "Brand color controls", exact: true });
  await tap(page, controls.locator(".akaza-color-slider-track").first());
  await expect(controls.getByRole("slider", { name: "Lightness", exact: true })).toHaveValue("50");
  await tap(page, controls.locator(".akaza-color-slider-track").last());
  await expect(controls.getByRole("slider", { name: "Opacity", exact: true })).toHaveValue("50");
  const palette = section(page, "color-swatch-picker").getByRole("listbox", { name: "Brand palette" });
  await tap(page, palette.getByRole("option", { name: "Green", exact: true }));
  await expect(palette.getByRole("option", { name: "Green", exact: true })).toHaveAttribute("aria-selected", "true");
  const trigger = section(page, "color-picker").getByRole("button", { name: "Choose color", exact: true });
  await tap(page, trigger);
  const popup = page.locator(".akaza-popover-content");
  await expect(popup.locator(".akaza-color-picker[aria-label='Popup color']")).toBeVisible();
  await tap(page, popup.locator("canvas"));
  await expect(popup).toBeVisible();
  await page.touchscreen.tap(1, 1);
  await expect(popup).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
