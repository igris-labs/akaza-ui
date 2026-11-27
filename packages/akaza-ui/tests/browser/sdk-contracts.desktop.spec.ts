import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("multi-month Calendar focuses the own-month day without duplicate tab stops", async ({ page }) => {
  const calendar = section(page, "calendar").locator('.akaza-calendar[data-akaza-selection-mode="multiple"]');
  await calendar.scrollIntoViewIfNeeded();
  await expect(calendar.locator('.akaza-calendar-cell-trigger[tabindex="0"]')).toHaveCount(1);
  const august = calendar.getByRole("button", { name: /August 31, 2026/ });
  await expect(august).toHaveCount(2);
  const ownAugust = august.and(calendar.locator('.akaza-calendar-cell-trigger:not([data-akaza-outside-view])'));
  await ownAugust.focus();
  await page.keyboard.press("ArrowRight");
  const september = calendar.locator(".akaza-calendar-cell-trigger:focus");
  await expect(september).toHaveAttribute("aria-label", /September 1, 2026/);
  await expect(september).not.toHaveAttribute("data-akaza-outside-view");
  await page.keyboard.press("ArrowLeft");
  await expect(ownAugust).toBeFocused();
  await expect(calendar.locator('.akaza-calendar-cell-trigger[tabindex="0"]')).toHaveCount(1);
});

test("Editable keeps a canceled unchanged draft open and accepts a changed draft", async ({ page }) => {
  const demo = section(page, "editable");
  const editable = demo.locator(".akaza-editable").first();
  await editable.locator(".akaza-editable-preview").click();
  const input = editable.locator(".akaza-editable-input");
  await expect(input).toBeFocused();
  await expect(input).toHaveJSProperty("selectionStart", 0);
  await expect(input).toHaveJSProperty("selectionEnd", "Quarterly planning notes".length);
  await editable.locator(".akaza-editable-submit").click();
  await expect(input).toBeVisible();
  await expect(input).toHaveValue("Quarterly planning notes");
  await expect(demo.getByText("Unchanged submit canceled; draft stays open.", { exact: true })).toBeVisible();
  await input.fill("Release review");
  await editable.locator(".akaza-editable-submit").click();
  await expect(editable.locator(".akaza-editable-preview")).toHaveText("Release review");
  await expect(input).toHaveCount(0);
});

test("controlled PIN rejection restores positional cells without advancing focus", async ({ page }) => {
  const pin = section(page, "pin-input").getByRole("group", { name: "Parent-controlled code" });
  const cells = pin.locator(".akaza-pin-input-input");
  await cells.first().fill("9");
  await expect(cells.first()).toHaveValue("1");
  await expect(cells.nth(1)).toHaveValue("2");
  await expect(cells.nth(2)).toHaveValue("");
  await expect(cells.nth(3)).toHaveValue("");
  await expect(cells.first()).toBeFocused();
  await expect(pin.locator(".akaza-pin-input-hidden-input")).toHaveValue("12");
  await cells.first().press("ArrowRight");
  await expect(cells.nth(1)).toBeFocused();
});

test("keyboard token removal recovers focus and respects canceled deletion", async ({ page }) => {
  const demo = section(page, "tags-input");
  const protectedTags = demo.locator(".akaza-tags-input").filter({ has: page.getByRole("textbox", { name: "Protected tags" }) });
  const required = protectedTags.locator(".akaza-tags-input-item").filter({ hasText: "required" });
  await required.focus();
  await required.press("Delete");
  await expect(required).toBeFocused();
  await expect(protectedTags.locator(".akaza-tags-input-item")).toHaveCount(2);
  const optional = protectedTags.locator(".akaza-tags-input-item").filter({ hasText: "optional" });
  await optional.focus();
  await optional.press("Delete");
  await expect(required).toBeFocused();

  const tags = demo.locator(".akaza-tags-input").first();
  const first = tags.locator(".akaza-tags-input-item").first();
  await first.focus();
  await first.press("Delete");
  await expect(tags.locator(".akaza-tags-input-item")).toHaveCount(1);
  await expect(tags.locator(".akaza-tags-input-item")).toBeFocused();
  await page.keyboard.press("Delete");
  await expect(tags.locator(".akaza-tags-input-item")).toHaveCount(0);
  await expect(tags.locator(".akaza-tags-input-input")).toBeFocused();
});
