import { expect, test } from "@playwright/test";

for (const [name, label, selector] of [
  ["menu", "Actions", ".akaza-menu-content"],
  ["popover", "Learn more", ".akaza-popover-content"],
]) {
  test(`${name} demo floats above the code disclosure`, async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/components/${name}`, { waitUntil: "networkidle" });
      const trigger = page.locator(".docs-prose").getByRole("button", { name: label, exact: true });
      await trigger.evaluate((el) => el.scrollIntoView({ block: "center" }));
      await trigger.click();
      const panel = page.locator(selector!);
      await expect(panel).toBeVisible();
      await expect
        .poll(() =>
          panel.evaluate((el) => {
            const panel = el.getBoundingClientRect();
            const button = Array.from(document.querySelectorAll("button"))
              .find((button) => button.textContent?.trim() === "Show code")!
              .getBoundingClientRect();
            const top = Math.max(panel.top, button.top);
            const bottom = Math.min(panel.bottom, button.bottom);
            if (bottom <= top) return false;
            const hit = document.elementFromPoint(panel.left + panel.width / 2, (top + bottom) / 2);
            return hit !== null && el.contains(hit);
          }),
        )
        .toBe(true);
      await page.keyboard.press("Escape");
      await expect(panel).not.toBeVisible();
    }
  });
}
