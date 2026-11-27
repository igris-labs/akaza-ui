import { expect, test } from "@playwright/test";
import { openPlayground, section, tap } from "./helpers";

test("touch editing preserves cancellation and controlled PIN cells", async ({ page }) => {
  await openPlayground(page);
  const editable = section(page, "editable").locator(".akaza-editable").first();
  await tap(page, editable.locator(".akaza-editable-preview"));
  const input = editable.locator(".akaza-editable-input");
  await expect(input).toBeFocused();
  await tap(page, editable.locator(".akaza-editable-submit"));
  await expect(input).toHaveValue("Quarterly planning notes");
  await expect(input).toBeVisible();
  await input.fill("Mobile release review");
  await tap(page, editable.locator(".akaza-editable-submit"));
  await expect(editable.locator(".akaza-editable-preview")).toHaveText("Mobile release review");

  const pin = section(page, "pin-input").getByRole("group", { name: "Parent-controlled code" });
  const cells = pin.locator(".akaza-pin-input-input");
  await tap(page, cells.first());
  await cells.first().fill("9");
  await expect(cells.first()).toHaveValue("1");
  await expect(cells.nth(1)).toHaveValue("2");
  await expect(cells.nth(2)).toHaveValue("");
  await expect(cells.nth(3)).toHaveValue("");
  await expect(cells.first()).toBeFocused();
  await expect(pin.locator(".akaza-pin-input-hidden-input")).toHaveValue("12");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual((page.viewportSize()?.width ?? 0) + 1);
});
