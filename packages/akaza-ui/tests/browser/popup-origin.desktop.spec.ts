import { expect, test } from "@playwright/test";
import { openPlayground } from "./helpers";

const popups = [
  ["select", '#select .akaza-select-trigger[aria-label="Plan"]', ".akaza-select", "click", "top", "ltr"],
  ["combobox", '#combobox input[aria-label="Framework or skill"]', ".akaza-combobox", "click", "top", "ltr"],
  ["context-menu", '#context-menu button:has-text("Keyboard target")', null, "right-click", "left", "ltr"],
  ["menubar", '[aria-label="RTL application menu"] [role="menuitem"]', null, "click", "top", "rtl"],
  ["navigation-menu", '[aria-label="RTL navigation"] .akaza-navigation-menu-trigger', null, "hover", "top", "rtl"],
] as const;

for (const [kind, selector, anchorSelector, action, side, direction] of popups) {
  test(`${kind} defaults to the resolved origin after collision and allows a CSS override`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openPlayground(page);
    const trigger = page.locator(selector).first();
    await trigger.evaluate((target: HTMLElement, anchorSelector) => {
      // Leave no room on the preferred bottom or right side.
      const el = anchorSelector ? target.closest<HTMLElement>(anchorSelector)! : target;
      Object.assign(el.style, { position: "fixed", zIndex: "999", bottom: "1px", right: "8px", width: "100px" });
    }, anchorSelector);
    if (action === "right-click") await trigger.click({ button: "right" });
    else await trigger[action]();

    const contentClass = `.akaza-${kind}-content`;
    const content = page.locator(`${contentClass}[data-akaza-state="open"]`);
    await expect(content).toBeVisible();
    await expect(content).toHaveAttribute("data-akaza-side", side);
    await expect(content).toHaveCSS("direction", direction);
    const hook = `--akaza-${kind}-transform-origin`;
    const readOrigin = () => content.evaluate((el: HTMLElement, hook) => {
      const style = getComputedStyle(el);
      return {
        mapped: style.getPropertyValue(hook).trim(),
        computed: style.transformOrigin,
        width: el.offsetWidth,
        height: el.offsetHeight,
      };
    }, hook);

    await expect(async () => {
      const { mapped, computed, width, height } = await readOrigin();
      const [x, y] = mapped.split(" ").map(Number.parseFloat);
      expect(x).toBe(side === "left" || direction === "rtl" ? width : 0);
      if (side === "top") expect(y).toBe(height);
      expect(computed).toBe(mapped);
    }).toPass({ timeout: 5000 });

    await page.addStyleTag({ content: `${contentClass} { transform-origin: 13px 17px; }` });
    await expect(content).toHaveCSS("transform-origin", "13px 17px");
  });
}
