import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => { await openPlayground(page); });

test("color picker preserves output format, hue memory, and keyboard access", async ({ page }) => {
  const demo = section(page, "color-picker");
  const picker = demo.locator(".akaza-color-picker").first();
  const hue = picker.getByRole("slider", { name: "Hue", exact: true });
  await hue.focus();
  await hue.press("End");
  await expect(hue).toHaveValue("360");
  await demo.getByLabel("Output format").selectOption("lch");
  await expect(picker.getByRole("textbox")).toHaveValue(/^lch\(/);
  await demo.getByLabel("Output format").selectOption("display-p3");
  await expect(picker.getByRole("textbox")).toHaveValue(/^color\(display-p3 /);
  await expect(picker.locator(".akaza-color-slider-thumb").first()).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const readonly = demo.locator(".akaza-color-picker[data-akaza-readonly]");
  const readonlyHue = readonly.getByRole("slider", { name: "Hue", exact: true });
  const previous = await readonlyHue.inputValue();
  await readonlyHue.focus();
  await readonlyHue.press("Home");
  await expect(readonlyHue).toHaveValue(previous);
  await readonlyHue.press("Tab");
  await expect(readonly.getByRole("slider", { name: "Opacity", exact: true })).toBeFocused();
});

test("color popover renders its picker, keeps edits open, and dismisses correctly", async ({ page }) => {
  const demo = section(page, "color-picker");
  const trigger = demo.getByRole("button", { name: "Choose color", exact: true });
  const popup = page.locator(".akaza-popover-content").filter({ has: page.getByRole("group", { name: "Popup color", exact: true }) });
  await trigger.click();
  await expect(popup).toBeVisible();
  await expect(popup.getByRole("slider")).toHaveCount(4);
  await popup.locator("canvas").click({ position: { x: 80, y: 50 } });
  await expect(popup).toBeVisible();
  const inlineField = demo.getByRole("group", { name: "Brand color", exact: true }).getByRole("textbox");
  const previous = await inlineField.inputValue();
  const field = popup.getByRole("textbox");
  await field.fill("#ff0000");
  await expect(inlineField).not.toHaveValue(previous);
  await expect(popup).toBeVisible();
  await field.fill("#");
  await field.press("Escape");
  await expect(field).not.toHaveValue("#");
  await expect(popup).toBeVisible();
  await field.press("Escape");
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(popup).toBeVisible();
  await page.mouse.click(1, 1);
  await expect(popup).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("color area paints a nonblank plane and accepts pointer/channel input", async ({ page }) => {
  const area = section(page, "color-area").locator(".akaza-color-area").first();
  await area.scrollIntoViewIfNeeded();
  const canvas = area.locator("canvas");
  await expect.poll(() => canvas.evaluate(element => {
    const context = element.getContext("2d")!;
    const pixels = context.getImageData(0, 0, element.width, element.height).data;
    return pixels.some(value => value !== 0) && pixels[0] !== pixels[(element.height - 1) * element.width * 4];
  })).toBe(true);
  await expect(area.getByRole("slider").first()).toHaveAttribute("aria-label", "Brand area Hue");
  await expect(area.locator(".akaza-color-area-thumb")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const size = await canvas.boundingBox();
  expect(size?.width).toBe(size?.height);
  await canvas.click({ position: { x: 60, y: 40 } });
  const x = area.getByRole("slider").first();
  const y = area.getByRole("slider").last();
  await expect(x).toBeFocused();
  await x.press("Home");
  await expect(x).toHaveValue("0");
  await x.press("Tab");
  await expect(y).toBeFocused();
  await y.press("End");
  await expect(y).toHaveValue("100");
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error("Missing color plane bounds");
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await expect(area).toHaveAttribute("data-akaza-dragging");
  await page.mouse.move(rect.x + rect.width + 30, rect.y - 20);
  await page.mouse.up();
  await expect(area).not.toHaveAttribute("data-akaza-dragging");
  await expect(x).toHaveValue("360");
  await expect(y).toHaveValue("100");
});

test("color area lightness and opacity reach black, white, and transparent without losing hue", async ({ page }) => {
  const demo = section(page, "color-area");
  const controls = demo.getByRole("group", { name: "Brand color controls", exact: true });
  const axes = controls.getByRole("group", { name: "Brand area", exact: true }).getByRole("slider");
  const hue = await axes.first().inputValue();
  const saturation = await axes.last().inputValue();
  const lightness = controls.getByRole("slider", { name: "Lightness", exact: true });
  const opacity = controls.getByRole("slider", { name: "Opacity", exact: true });
  const lightnessTrack = controls.locator(".akaza-color-slider-track").first();
  const lightnessGradient = await lightnessTrack.evaluate(element => getComputedStyle(element).backgroundImage);
  const output = demo.locator("output").first();
  await lightness.focus();
  await lightness.press("Home");
  await expect(output).toHaveText("Current: #000000");
  await expect(lightnessTrack).toHaveCSS("background-image", lightnessGradient);
  await lightness.press("End");
  await expect(output).toHaveText("Current: #ffffff");
  await expect(lightnessTrack).toHaveCSS("background-image", lightnessGradient);
  await opacity.focus();
  await opacity.press("Home");
  await expect(output).toHaveText("Current: #ffffff00");
  await lightness.focus();
  for (let i = 0; i < 5; i++) await lightness.press("PageDown");
  await expect(lightness).toHaveValue("50");
  await opacity.focus();
  await opacity.press("End");
  await expect(axes.first()).toHaveValue(hue);
  await expect(axes.last()).toHaveValue(saturation);
  await expect(output).not.toHaveText("Current: #808080");
  await opacity.press("Home");
  await lightness.focus();
  await lightness.press("Home");
  await expect(output).toHaveText("Current: #00000000");
});

test("color slider pointer focus avoids a track ring and keyboard focus marks the thumb", async ({ page }) => {
  const controls = section(page, "color-area").getByRole("group", { name: "Brand color controls", exact: true });
  const slider = controls.locator(".akaza-color-slider").last();
  const axis = slider.getByRole("slider", { name: "Opacity", exact: true });
  const thumb = slider.locator(".akaza-color-slider-thumb");
  const restingShadow = await thumb.evaluate(element => getComputedStyle(element).boxShadow);
  await slider.locator(".akaza-color-slider-track").click();
  await expect(axis).toBeFocused();
  await expect(slider).toHaveCSS("box-shadow", "none");
  await expect(thumb).toHaveCSS("box-shadow", restingShadow);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(axis).toBeFocused();
  await expect(slider).toHaveCSS("box-shadow", "none");
  await expect(thumb).not.toHaveCSS("box-shadow", restingShadow);
  await expect(slider).toHaveAttribute("data-akaza-focus-visible");
  await slider.locator(".akaza-color-slider-track").click();
  await expect(thumb).toHaveCSS("box-shadow", restingShadow);
  await expect(slider).not.toHaveAttribute("data-akaza-focus-visible");
});

test("disabled color area keeps its lightness and opacity controls visible and disabled", async ({ page }) => {
  const controls = section(page, "color-area").getByRole("group", { name: "Disabled color controls", exact: true });
  await controls.scrollIntoViewIfNeeded();
  await expect(controls.getByRole("slider")).toHaveCount(4);
  for (const name of ["Lightness", "Opacity"]) {
    const axis = controls.getByRole("slider", { name, exact: true });
    await expect(axis).toBeDisabled();
    const value = await axis.inputValue();
    const slider = controls.locator(`.akaza-color-slider[data-akaza-channel="${name === "Lightness" ? "lightness" : "alpha"}"]`);
    await expect(slider.locator(".akaza-color-slider-track")).toBeVisible();
    const bounds = await slider.locator(".akaza-color-slider-track").boundingBox();
    expect(bounds).not.toBeNull();
    await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
    await expect(axis).toHaveValue(value);
  }
});

test("color area output formats preserve its rainbow, handles, and other examples", async ({ page }) => {
  const demo = section(page, "color-area");
  const area = demo.getByRole("group", { name: "Formatted color area", exact: true });
  const canvas = area.locator("canvas");
  await area.scrollIntoViewIfNeeded();
  await expect.poll(() => canvas.evaluate(element => element.getContext("2d")!.getImageData(0, 0, 1, 1).data[3])).toBe(255);
  const pixels = await canvas.evaluate(element => element.toDataURL());
  const axes = area.getByRole("slider");
  const hue = await axes.first().inputValue();
  const saturation = await axes.last().inputValue();
  const otherValue = await demo.locator("output").first().textContent();
  const output = demo.locator("output").nth(1);
  const selector = demo.getByRole("combobox");
  await expect(selector.locator("option")).toHaveCount(17);
  const formats = await selector.locator("option").evaluateAll(options => options.map(option => option.value));
  expect(formats).toHaveLength(17);
  for (const format of formats) {
    await selector.selectOption(format);
    const prefix = format.startsWith("hex") ? "#" : ["rgb", "rgba"].includes(format) ? "rgb(" : ["hsl", "hsla"].includes(format) ? "hsl(" : ["display-p3", "a98-rgb", "prophoto-rgb", "rec2020", "xyz-d50", "xyz-d65"].includes(format) ? "color(" : `${format}(`;
    await expect.poll(async () => (await output.textContent())?.trim().startsWith(prefix)).toBe(true);
    await expect(axes.first()).toHaveValue(hue);
    await expect(axes.last()).toHaveValue(saturation);
    expect(await canvas.evaluate(element => element.toDataURL())).toBe(pixels);
    await expect(demo.locator("output").first()).toHaveText(otherValue!);
  }
});

test("color field validates drafts, submits formatted output, and resets", async ({ page }) => {
  const form = section(page, "color-field").locator("form");
  const input = form.getByRole("textbox", { name: "Brand color" });
  await input.fill("#");
  await input.blur();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect.poll(() => input.evaluate(element => (element as HTMLInputElement).checkValidity())).toBe(false);
  await input.fill("rgb(20 90 160 / 0.5)");
  await form.getByRole("button", { name: "Submit color" }).click();
  await expect(form.locator("output")).toHaveText(/^lch\(/);
  await input.fill("not-a-color");
  await form.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(input).not.toHaveAttribute("data-akaza-invalid");
});

test("color palette uses semantic single and multiple selection", async ({ page }) => {
  const demo = section(page, "color-swatch-picker");
  const single = demo.getByRole("listbox", { name: "Brand palette" });
  await single.getByRole("option", { name: "Blue", exact: true }).click();
  await expect(single.getByRole("option", { name: "Blue", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(single.getByRole("option", { name: "Blue", exact: true }).locator("svg")).toBeVisible();
  const multiple = demo.getByRole("listbox", { name: "Multiple colors" });
  await multiple.getByRole("option", { name: "Red", exact: true }).click();
  await multiple.getByRole("option", { name: "Blue", exact: true }).click();
  await expect(multiple.locator('[aria-selected="true"]')).toHaveCount(2);
  await expect(multiple.getByRole("option", { name: "Unavailable gray" })).toHaveAttribute("aria-disabled", "true");
  const output = demo.locator("output").nth(1);
  const selectedColors = JSON.parse((await output.textContent())!.trim());
  expect(selectedColors).toHaveLength(2);
  expect((await output.textContent())!.trim()).toBe(JSON.stringify(selectedColors, null, 2));
  await expect(output).toHaveCSS("white-space", "pre-wrap");
  await multiple.focus();
  await multiple.press("Home");
  await expect(demo.locator(".akaza-color-swatch-picker").nth(1)).toHaveCSS("box-shadow", "none");
  await expect(multiple).toHaveCSS("outline-style", "none");
  await expect(multiple.locator("[data-akaza-highlighted]")).not.toHaveCSS("box-shadow", "none");
});
