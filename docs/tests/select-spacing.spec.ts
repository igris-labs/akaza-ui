import { expect, test } from "@playwright/test";

for (const mode of ["light", "dark"] as const) {
  for (const width of [390, 1440]) {
    for (const portaled of [false, true]) {
      test(`Select search fits its ${portaled ? "portaled" : "inline"} popup at ${width}px in ${mode} mode`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.addInitScript((mode) => localStorage.setItem("nuxt-color-mode", mode), mode);
        await page.goto("/components/select", { waitUntil: "networkidle" });
        if (portaled) {
          await page.getByRole("button", { name: "Open project dialog", exact: true }).click();
        }
        const trigger = page.getByRole("combobox", {
          name: portaled ? "Project" : "Framework suggestion",
          exact: true,
        });
        await trigger.click();
        const popup = page.locator(".akaza-select-content");
        const search = popup.getByRole("searchbox");
        await expect(search).toBeFocused();
        await expect.poll(() => popup.evaluate(el => getComputedStyle(el).opacity)).toBe("1");

        const spacing = await popup.evaluate(el => {
          const input = el.querySelector("input")!.getBoundingClientRect();
          const list = el.querySelector('[role="listbox"]')!.getBoundingClientRect();
          const popup = el.getBoundingClientRect();
          return {
            left: input.left - popup.left,
            right: popup.right - input.right,
            top: input.top - popup.top,
            gap: list.top - input.bottom,
            listLeft: Math.abs(list.left - input.left),
            listRight: Math.abs(list.right - input.right),
            overflow: el.scrollWidth - el.clientWidth,
          };
        });
        expect(spacing.left).toBeGreaterThanOrEqual(5);
        expect(spacing.right).toBeGreaterThanOrEqual(5);
        expect(Math.abs(spacing.left - spacing.right)).toBeLessThan(1);
        expect(spacing.top).toBeGreaterThanOrEqual(5);
        expect(spacing.gap).toBeGreaterThanOrEqual(4);
        expect(spacing.listLeft).toBeLessThan(1);
        expect(spacing.listRight).toBeLessThan(1);
        expect(spacing.overflow).toBe(0);

        if (portaled) {
          await popup.getByRole("option", { name: "Project 12", exact: true }).scrollIntoViewIfNeeded();
          await expect(search).toBeInViewport();
        }
        await search.fill(portaled ? "Project 12" : "Nuxt");
        await expect(popup.getByRole("option")).toHaveCount(1);
        await search.press("Enter");
        await expect(popup).toBeHidden();
        await expect(trigger).toContainText(portaled ? "Project 12" : "Nuxt");
      });
    }
  }
}
