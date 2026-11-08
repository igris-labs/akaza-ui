import { expect, test } from "@playwright/test";

for (const mode of ["light", "dark"] as const) {
  test(`submenu alignment demo follows its trigger row in ${mode} mode`, async ({ page }) => {
    await page.addInitScript((mode) => localStorage.setItem("nuxt-color-mode", mode), mode);
    await page.goto("/components/menu", { waitUntil: "networkidle" });
    const trigger = page.getByRole("button", { name: "Aligned account menu", exact: true });
    await trigger.evaluate(element => element.scrollIntoView({ block: "center" }));
    await trigger.click();
    const parent = page.locator(".akaza-menu-content:not(.akaza-menu-submenu-content)");
    const submenu = page.locator(".akaza-menu-submenu-content");

    for (const label of ["Theme", "Help"]) {
      const item = parent.getByRole("menuitem", { name: label, exact: true });
      await item.hover();
      await expect(submenu).toBeVisible();
      await expect.poll(async () => {
        const a = await item.boundingBox();
        const b = await submenu.boundingBox();
        if (!a || !b) return Infinity;
        return Math.abs(a.y - b.y);
      }).toBeLessThan(1);
      await expect.poll(async () => {
        const a = await parent.boundingBox();
        const b = await submenu.boundingBox();
        if (!a || !b) return Infinity;
        const side = await submenu.getAttribute("data-akaza-side");
        const gap = side === "left" ? a.x - b.x - b.width : b.x - a.x - a.width;
        return Math.abs(gap - 4);
      }).toBeLessThan(1);
      await submenu.hover();
      await expect(submenu).toBeVisible();
      await submenu.getByRole("menuitem").first().focus();
      await page.keyboard.press("ArrowLeft");
      await expect(submenu).toBeHidden();
      await expect(item).toBeFocused();
    }
  });
}
