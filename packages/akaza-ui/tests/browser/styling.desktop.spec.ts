import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const packageCss = readFileSync(new URL("../../dist/akaza-ui.css", import.meta.url), "utf8");

for (const packageFirst of [true, false]) {
  test(`consumer utilities override package CSS with packageFirst=${packageFirst}`, async ({ page }) => {
    const utilities = `@layer utilities {
      .custom-checkbox { width: 40px; height: 40px; border: 3px solid black; border-radius: 0; }
      .custom-field { display: flex; gap: 19px; }
    }`;
    await page.setContent(`<style>@layer akaza-reset, utilities;</style>
      <style>${packageFirst ? packageCss : utilities}</style>
      <style>${packageFirst ? utilities : packageCss}</style>
      <div class="akaza-field custom-field"><button class="akaza-checkbox custom-checkbox">Check</button></div>`);
    const checkbox = page.locator("button");
    await expect(checkbox).toHaveCSS("width", "40px");
    await expect(checkbox).toHaveCSS("border-radius", "0px");
    await expect(page.locator(".akaza-field")).toHaveCSS("display", "flex");
    await expect(page.locator(".akaza-field")).toHaveCSS("gap", "19px");
  });
}
