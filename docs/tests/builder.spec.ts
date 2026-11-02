import { expect, test } from "@playwright/test";

test("IPEX builder controls preserve layout settings, disabled state, generated code, and reset", async ({
  page,
}) => {
  await page.goto("/builders/layout-builder", { waitUntil: "networkidle" });
  const builder = page.locator("[data-layout-builder]");
  await builder.getByRole("button", { name: "Full-height sidebars", exact: true }).click();
  await expect(builder.locator('[data-layout-region="right"]')).toBeVisible();
  await builder.getByRole("combobox", { name: "Left collapse", exact: true }).click();
  await page.getByRole("option", { name: "Do not collapse", exact: true }).click();
  await expect(
    builder
      .locator("[data-layout-structure]")
      .getByRole("button", { name: "Left sidebar", exact: true }),
  ).toBeDisabled();
  await builder.getByRole("combobox", { name: "Scrolling", exact: true }).click();
  await page.getByRole("option", { name: "Scroll whole layout", exact: true }).click();
  await builder.getByRole("checkbox", { name: "Sticky header", exact: true }).check();
  await builder.getByRole("button", { name: "Show code", exact: true }).click();
  await expect(builder.locator("pre")).toContainText('scroll="page" sticky-header');
  await expect(builder.locator("pre")).toContainText(':collapsible="false"');
  const tokens = builder.locator("pre [class^='shj-syn-']");
  await expect.poll(() => tokens.count()).toBeGreaterThan(5);
  for (const theme of ["dark", "light"]) {
    await page.getByRole("button", { name: `Use ${theme} theme`, exact: true }).click();
    expect(
      await tokens.evaluateAll(
        (nodes) => new Set(nodes.map((node) => getComputedStyle(node).color)).size,
      ),
    ).toBeGreaterThan(2);
  }

  await builder.getByRole("switch", { name: "Header", exact: true }).click();
  await expect(builder.getByRole("combobox", { name: "Header width", exact: true })).toBeDisabled();
  await builder.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(builder.getByRole("combobox", { name: "Scrolling", exact: true })).toContainText(
    "Scroll main only",
  );
  await expect(
    builder.getByRole("switch", { name: "Right sidebar", exact: true }),
  ).not.toBeChecked();
  await expect(builder.getByRole("combobox", { name: "Header width", exact: true })).toBeEnabled();
});

test("builder region colors remain distinct in both themes", async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await page.addInitScript((value) => localStorage.setItem("nuxt-color-mode", value), theme);
    await page.goto("/builders/layout-builder", { waitUntil: "networkidle" });
    const builder = page.locator("[data-layout-builder]");
    await builder.getByRole("button", { name: "Full-height sidebars", exact: true }).click();
    const colors = await builder.locator("[data-layout-region]").evaluateAll((regions) =>
      regions.map((region) => {
        const surface = region.closest(
          ".akaza-app-layout-header, .akaza-app-layout-main, .akaza-app-layout-footer, .akaza-sidebar-panel",
        )!;
        return getComputedStyle(surface).backgroundColor;
      }),
    );
    expect(colors).toHaveLength(5);
    expect(new Set(colors).size).toBe(5);
    expect(colors).not.toContain("rgba(0, 0, 0, 0)");
  }
});

test("documentation status badges appear on desktop and mobile", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/components/sidebar", { waitUntil: "networkidle" });
    if (width === 390)
      await page.getByRole("button", { name: "Open documentation navigation" }).click();
    const navigation = page
      .getByRole("navigation", { name: "Documentation", exact: true })
      .filter({ visible: true });
    await expect(
      navigation.getByRole("link", { name: "App Layout NEW", exact: true }),
    ).toBeVisible();
    await expect(
      navigation.getByRole("link", { name: "Sidebar UPDATED", exact: true }),
    ).toBeVisible();
    await expect(
      navigation.getByRole("link", { name: "Color Slider NEW", exact: true }),
    ).toBeVisible();
  }
});
