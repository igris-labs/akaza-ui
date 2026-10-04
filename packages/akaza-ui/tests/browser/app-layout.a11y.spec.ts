import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("application shell examples have no automated WCAG violations", async ({ page }) => {
  await page.goto("/#app-layout");
  await expect(page.getByTestId("app-layout-fixed")).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include("#app-layout")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
});
