import { expect, test } from "@playwright/test";

test("swatches wait for hydration and the first accepted click stays selected", async ({ page }) => {
  let release!: () => void;
  const startup = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/_nuxt/**", async (route) => {
    if (route.request().resourceType() === "script") await startup;
    await route.continue();
  });
  await page.goto("/components/color-swatch-picker", { waitUntil: "commit" });
  const single = page.getByRole("listbox", { name: "Brand palette" });
  try {
    await expect(single).toBeDisabled();
  } finally {
    release();
  }
  await expect(single).toBeEnabled();
  const red = single.getByRole("option", { name: "Red", exact: true });
  await red.click();
  await expect(red).toHaveAttribute("aria-selected", "true");
  const environment = page.getByRole("listbox", { name: "Environment colors" });
  await environment.getByRole("option", { name: "Production" }).click();
  await expect(red).toHaveAttribute("aria-selected", "true");
});

for (const width of [1440, 390]) {
  test(`LTR and RTL palettes stay aligned with room for indicators at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 920 });
    await page.goto("/components/color-swatch-picker");
    const single = page.getByRole("listbox", { name: "Brand palette" });
    const multiple = page.getByRole("listbox", { name: "Multiple colors" });
    await expect(multiple).toBeEnabled();
    const red = multiple.getByRole("option", { name: "Red", exact: true });
    const orange = multiple.getByRole("option", { name: "Orange", exact: true });
    await red.click();
    await expect(red).toHaveAttribute("aria-selected", "true");
    const viewport = (await multiple.boundingBox())!;
    const first = (await red.boundingBox())!;
    expect(viewport.x).toBeCloseTo((await single.boundingBox())!.x, 0);
    expect(first.x).toBeGreaterThan((await orange.boundingBox())!.x);
    expect(viewport.x + viewport.width - first.x - first.width).toBeGreaterThanOrEqual(5);
    await expect(red.locator(".akaza-color-swatch-picker-indicator > *")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
