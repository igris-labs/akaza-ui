import { expect, test } from "@playwright/test";
import { openPlayground, section, tap } from "./helpers";

test("Listbox and inherited swatches retain touch selection and bounded layout", async ({ page }) => {
  await openPlayground(page);
  const list = section(page, "listbox").getByRole("listbox", { name: "Guarded permissions" });
  const edit = list.getByRole("option", { name: "Edit records", exact: true });
  await tap(page, edit);
  await expect(edit).toHaveAttribute("aria-selected", "true");
  await tap(page, edit);
  await expect(edit).toHaveAttribute("aria-selected", "false");
  await tap(page, list.getByRole("option", { name: "Deploy releases", exact: true }));
  await expect(list.locator('[aria-selected="true"]')).toHaveCount(2);
  const palette = section(page, "color-swatch-picker").getByRole("listbox", { name: "Multiple colors" });
  const red = palette.getByRole("option", { name: "Red", exact: true });
  await tap(page, red);
  await expect(red).toHaveAttribute("aria-selected", "true");
  await tap(page, palette.getByRole("option", { name: "Blue", exact: true }));
  await expect(palette.locator('[aria-selected="true"]')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
