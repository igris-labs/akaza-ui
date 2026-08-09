import { expect, test } from "@playwright/test";
import { openPlayground, section, tap } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("playground and every closed component section fit the mobile viewport", async ({ page }) => {
  const overflow = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    return Array.from(document.querySelectorAll<HTMLElement>("main > section"))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > viewportWidth + 1;
      })
      .map((element) => ({
        id: element.id,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
  });

  expect(overflow).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth + 1),
  );
});

test("mobile popup and modal surfaces remain inside the visual viewport", async ({ page }) => {
  const select = section(page, "select").getByRole("combobox", { name: "Permission", exact: true });
  await tap(page, select);
  await expect(page.locator(".akaza-select-content")).toBeVisible();

  for (const locator of [page.locator(".akaza-select-content")]) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual((await page.viewportSize())!.width + 1);
  }
  await page.keyboard.press("Escape");

  const dateTrigger = section(page, "date-field").getByRole("button", { name: "Choose date" });
  await tap(page, dateTrigger);
  const datePopup = page.locator(".akaza-date-field-calendar-content");
  await expect(datePopup).toBeVisible();
  const dateBox = await datePopup.boundingBox();
  expect(dateBox).not.toBeNull();
  expect(dateBox!.x).toBeGreaterThanOrEqual(0);
  expect(dateBox!.x + dateBox!.width).toBeLessThanOrEqual((await page.viewportSize())!.width + 1);
  await page.keyboard.press("Escape");

  const rangeTrigger = section(page, "date-range-picker").getByRole("button", { name: "Choose date range" }).first();
  await tap(page, rangeTrigger);
  const rangePopup = page.locator(".akaza-date-range-picker-content");
  await expect(rangePopup).toBeVisible();
  const rangeBox = await rangePopup.boundingBox();
  expect(rangeBox).not.toBeNull();
  expect(rangeBox!.x).toBeGreaterThanOrEqual(0);
  expect(rangeBox!.x + rangeBox!.width).toBeLessThanOrEqual((await page.viewportSize())!.width + 1);
  await page.keyboard.press("Escape");

  const dialogTrigger = section(page, "dialog").getByRole("button", { name: "Open", exact: true }).first();
  await tap(page, dialogTrigger);
  const dialog = page.getByRole("dialog").first();
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual((await page.viewportSize())!.width + 1);
});
