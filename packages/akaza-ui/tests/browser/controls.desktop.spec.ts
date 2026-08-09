import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("button, toggle, switch, and checkbox support pointer and keyboard", async ({ page }) => {
  const button = section(page, "button").getByRole("button", { name: "Enabled", exact: true }).first();
  await button.click();
  await button.focus();
  await page.keyboard.press("Enter");

  const toggle = section(page, "toggle").getByRole("button", { name: "Bold", exact: true });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  const switchControl = section(page, "switch").getByRole("switch", { name: "Toggle feature" });
  await switchControl.click();
  await expect(switchControl).toHaveAttribute("aria-checked", "true");
  await switchControl.press("Space");
  await expect(switchControl).toHaveAttribute("aria-checked", "false");

  const checkbox = section(page, "checkbox").getByRole("checkbox", { name: "Example state" });
  await checkbox.click();
  await expect(checkbox).toHaveAttribute("aria-checked", "true");
  await checkbox.press("Space");
  await expect(checkbox).toHaveAttribute("aria-checked", "false");
});

test("selection controls expose state and roving keyboard focus", async ({ page }) => {
  const checkboxGroup = section(page, "checkbox-group").getByRole("group", { name: "Notification channels" });
  const sms = checkboxGroup.getByRole("checkbox", { name: "SMS" });
  await sms.click();
  await expect(sms).toHaveAttribute("aria-checked", "true");
  const push = checkboxGroup.getByRole("checkbox", { name: "Push" });
  await push.focus();
  await push.press("Space");
  await expect(push).toHaveAttribute("aria-checked", "true");

  const radioGroup = section(page, "radio-group").getByRole("radiogroup").first();
  const radios = radioGroup.getByRole("radio");
  await radios.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(radios.nth(1)).toBeFocused();
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
  await radios.nth(2).click();
  await expect(radios.nth(2)).toHaveAttribute("aria-checked", "true");

  const toggleGroup = section(page, "toggle-group").getByRole("group", { name: "Text alignment" });
  const alignment = toggleGroup.getByRole("button");
  await alignment.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(alignment.nth(1)).toBeFocused();
  await alignment.nth(1).press("Space");
  await expect(alignment.nth(1)).toHaveAttribute("aria-pressed", "true");
  await alignment.nth(2).click();
  await expect(alignment.nth(2)).toHaveAttribute("aria-pressed", "true");

  const rating = section(page, "rating").getByRole("radiogroup").first();
  const ratingItems = rating.getByRole("radio");
  await ratingItems.nth(2).focus();
  await page.keyboard.press("ArrowRight");
  await expect(ratingItems.nth(3)).toHaveAttribute("aria-checked", "true");
  await ratingItems.last().click();
  await expect(ratingItems.last()).toHaveAttribute("aria-checked", "true");
});

test("text, pin, tags, and editable controls work with direct input", async ({ page }) => {
  const input = section(page, "input").locator(".akaza-input").first();
  await input.fill("Vue native");
  await expect(section(page, "input").getByText("model: Vue native", { exact: true })).toBeVisible();

  const pin = section(page, "pin-input").locator(".akaza-pin-input").first();
  await pin.locator(".akaza-pin-input-input").first().focus();
  await page.keyboard.type("123456");
  await expect(pin.locator(".akaza-pin-input-hidden-input")).toHaveValue("123456");

  const tags = section(page, "tags-input").locator(".akaza-tags-input").first();
  const tagInput = tags.locator("input:not(.akaza-tags-input-hidden-input)");
  await tagInput.fill("Accessibility");
  await tagInput.press("Enter");
  await expect(tags.locator(".akaza-tags-input-item-text", { hasText: "Accessibility" })).toBeVisible();

  const editable = section(page, "editable").locator(".akaza-editable").first();
  await editable.locator(".akaza-editable-preview").click();
  const editableInput = editable.locator(".akaza-editable-input");
  await expect(editableInput).toBeFocused();
  await expect(editableInput).toHaveJSProperty("selectionStart", 0);
  await editableInput.fill("Release title");
  await editable.locator(".akaza-editable-submit").click();
  await expect(editable.locator(".akaza-editable-preview")).toContainText("Release title");
});

test("number field and slider support pointer and keyboard adjustment", async ({ page }) => {
  const numberField = section(page, "number-field").locator(".akaza-number-field").first();
  const spinbutton = numberField.getByRole("spinbutton", { name: "Seats" });
  const initialNumber = Number(await spinbutton.getAttribute("aria-valuenow"));
  await numberField.locator(".akaza-number-field-increment").click();
  await expect(spinbutton).toHaveAttribute("aria-valuenow", String(initialNumber + 1));
  await spinbutton.press("ArrowDown");
  await expect(spinbutton).toHaveAttribute("aria-valuenow", String(initialNumber));

  const slider = section(page, "slider").getByRole("slider", { name: "Volume" });
  const initialSlider = Number(await slider.getAttribute("aria-valuenow"));
  await slider.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", String(initialSlider + 1));

  const track = section(page, "slider").locator(".akaza-slider-track").first();
  const box = await track.boundingBox();
  if (!box) throw new Error("Slider track has no bounding box");
  await page.mouse.click(box.x + box.width * 0.8, box.y + box.height / 2);
  expect(Number(await slider.getAttribute("aria-valuenow"))).toBeGreaterThan(60);
});
