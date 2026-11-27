import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";

function textContrast(target: Locator) {
  return target.evaluate((element) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const layers: string[] = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      layers.unshift(getComputedStyle(node).backgroundColor);
    }
    // The preview surface is translucent, so include the backgrounds behind it.
    for (const color of ["white", ...layers]) {
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
    }
    function luminance() {
      const pixels = context.getImageData(0, 0, 1, 1).data;
      return [0.2126, 0.7152, 0.0722].reduce((sum, weight, channel) => {
        const value = pixels[channel]! / 255;
        return sum + weight * (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      }, 0);
    }
    const surface = luminance();
    context.fillStyle = getComputedStyle(element).color;
    context.fillRect(0, 0, 1, 1);
    const text = luminance();
    return (Math.max(surface, text) + 0.05) / (Math.min(surface, text) + 0.05);
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test(`composable examples keep readable labels in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/composables/use-selection");
    await expect(page.locator("html")).toHaveCSS("color-scheme", colorScheme);
    const disabledLabel = page.getByRole("group", { name: "Pickup days" })
      .locator("label").filter({ hasText: "Tuesday" });
    expect(await textContrast(disabledLabel)).toBeGreaterThanOrEqual(4.5);
    expect(await textContrast(page.getByText("0 selected", { exact: true }))).toBeGreaterThanOrEqual(4.5);
    await expect(page.getByRole("button", { name: "Search documentation", exact: true }).filter({ visible: true })).toBeEnabled();
    await page.getByRole("checkbox", { name: "Monday", exact: true }).click();
    expect(await textContrast(page.getByText("1 selected", { exact: true }))).toBeGreaterThanOrEqual(4.5);

    await page.goto("/composables/use-roving-focus");
    await expect(page.locator("html")).toHaveCSS("color-scheme", colorScheme);
    const bold = page.getByRole("button", { name: "Bold", exact: true });
    expect(await textContrast(bold)).toBeGreaterThanOrEqual(4.5);
    await expect(page.getByRole("button", { name: "Search documentation", exact: true }).filter({ visible: true })).toBeEnabled();
    await bold.click();
    await expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(await textContrast(bold)).toBeGreaterThanOrEqual(4.5);
  });
}
