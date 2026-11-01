import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openPlayground(page);
  // Reserve a real scrollbar gutter, including on hosts configured for overlay scrollbars.
  await page.addStyleTag({ content: `
    .akaza-combobox-viewport, .akaza-select-viewport {
      max-height: 80px !important;
      overflow: auto !important;
      scrollbar-gutter: stable;
      scrollbar-width: auto;
    }
    .akaza-combobox-viewport::-webkit-scrollbar, .akaza-select-viewport::-webkit-scrollbar {
      width: 18px;
      background: #eee;
    }
    .akaza-combobox-viewport::-webkit-scrollbar-thumb, .akaza-select-viewport::-webkit-scrollbar-thumb {
      background: #777;
    }
  ` });
});

for (const kind of ["combobox", "select", "autocomplete"] as const) {
  test(`${kind} keeps its popup open for scrollbar presses, dragging, and wheel scrolling`, async ({ page, browserName }) => {
    const control = kind === "combobox"
      ? section(page, "combobox").getByRole("combobox", { name: "Framework or skill" })
      : section(page, "select").getByRole("combobox", { name: kind === "autocomplete" ? "Permission" : "Plan", exact: true });
    await control.click();
    const prefix = kind === "combobox" ? "combobox" : "select";
    const root = control.locator("..");
    const content = root.locator(`.akaza-${prefix}-content`);
    const viewport = content.locator(`.akaza-${prefix}-viewport`);
    const focusOwner = kind === "autocomplete" ? content.getByRole("searchbox") : control;
    await expect(content).toBeVisible();
    // Wait for popup motion to finish before measuring its native scrollbar.
    await expect(content).toHaveCSS("scale", "none");
    await viewport.evaluate(element => { element.scrollTop = 0; });
    const metrics = await viewport.evaluate(element => ({ gutter: element.offsetWidth - element.clientWidth, overflow: element.scrollHeight - element.clientHeight }));
    expect(metrics.gutter).toBeGreaterThan(0);
    expect(metrics.overflow).toBeGreaterThan(0);
    const box = await viewport.boundingBox();
    if (!box) throw new Error("Popup viewport is missing");
    const x = box.x + box.width - metrics.gutter / 2;

    await page.mouse.move(x, box.y + box.height - 8);
    await page.mouse.down();
    await expect(content).toBeVisible();
    await page.mouse.up();
    await expect(control).toHaveAttribute("aria-expanded", "true");
    await expect(focusOwner).toBeFocused();
    // WebKit drives native scrollbar paging here; macOS headless Chromium may not.
    if (browserName === "webkit") await expect.poll(() => viewport.evaluate(element => element.scrollTop)).toBeGreaterThan(0);

    await viewport.evaluate(element => { element.scrollTop = 0; });
    await page.mouse.move(x, box.y + 8);
    await page.mouse.down();
    await page.mouse.move(x, box.y + box.height - 12, { steps: 5 });
    await page.mouse.up();
    await expect(content).toBeVisible();
    await expect(focusOwner).toBeFocused();

    await viewport.evaluate(element => { element.scrollTop = 0; });
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const before = await viewport.evaluate(element => element.scrollTop);
    await page.mouse.wheel(0, 60);
    await expect.poll(() => viewport.evaluate(element => element.scrollTop)).toBeGreaterThan(before);
    await expect(content).toBeVisible();

    await focusOwner.focus();
    // Some browsers include native scroll containers in the tab sequence.
    for (let step = 0; step < 4 && await control.getAttribute("aria-expanded") === "true"; step++) {
      await page.keyboard.press("Tab");
    }
    await expect(content).toBeHidden();
    await control.click();
    await expect(content).toBeVisible();
    await page.mouse.click(1, 1);
    await expect(content).toBeHidden();
  });
}
