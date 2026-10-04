import { expect, test } from "@playwright/test";

test("mobile shell releases sidebar space and opens its modal navigation", async ({ page }) => {
  await page.goto("/#app-layout");
  const root = page.getByTestId("app-layout-fixed").locator(".akaza-app-layout");
  await root.scrollIntoViewIfNeeded();
  const sidebar = root.locator(".akaza-sidebar-root").first();
  await expect(sidebar).toHaveAttribute("data-akaza-mobile");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const trigger = root.getByRole("button", { name: "Navigation", exact: true });
  await trigger.tap();
  const dialog = page.getByRole("dialog", { name: "Workspace navigation", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close navigation" }).tap();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
