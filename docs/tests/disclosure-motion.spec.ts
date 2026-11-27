import { expect, test } from "@playwright/test";

for (const kind of ["accordion", "collapsible"] as const) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`${kind} docs demo preserves SDK height motion (${reducedMotion})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });
      await page.goto(`/components/${kind}`);
      // The header enables its search action only after initial hydration has finished.
      await expect(page.getByRole("button", { name: "Search documentation", exact: true }).filter({ visible: true })).toBeEnabled();
      const root = page.locator(`.akaza-${kind}`).first();
      const trigger = root.locator(`.akaza-${kind}-trigger`).first();
      const panel = root.locator(`.akaza-${kind}-content`).first();
      await expect(panel).toBeHidden();
      await trigger.scrollIntoViewIfNeeded();
      const gaps = await root.evaluate((element) => {
        const demo = element.parentElement!.getBoundingClientRect();
        const preview = element.closest("[data-ui]")!.getBoundingClientRect();
        return { top: demo.top - preview.top, bottom: preview.bottom - demo.bottom, left: demo.left - preview.left, right: preview.right - demo.right };
      });
      expect(gaps.top).toBeCloseTo(gaps.bottom, 0);
      expect(gaps.left).toBeCloseTo(gaps.right, 0);
      const position = () => trigger.evaluate(element => ({ top: element.getBoundingClientRect().top, scroll: window.scrollY }));
      const before = await position();
      if (reducedMotion === "no-preference") {
        await panel.evaluate(element => { (element as HTMLElement).style.transitionDuration = "400ms"; });
      }
      await trigger.click();
      if (reducedMotion === "no-preference") {
        await expect.poll(() => panel.evaluate(element => element.getAnimations().some(animation =>
          animation instanceof CSSTransition && animation.transitionProperty === "height",
        ))).toBe(true);
        const middle = await panel.evaluate((element) => {
          const animation = element.getAnimations().find(animation => animation instanceof CSSTransition && animation.transitionProperty === "height")!;
          animation.pause();
          animation.currentTime = 200;
          const height = element.getBoundingClientRect().height;
          const full = element.scrollHeight;
          animation.play();
          return { height, full };
        });
        expect(middle.height).toBeGreaterThan(0);
        expect(middle.height).toBeLessThan(middle.full);
        const during = await position();
        expect(during.top).toBeCloseTo(before.top, 0);
        expect(during.scroll).toBe(before.scroll);
      } else {
        expect(await panel.evaluate(element => element.getAnimations().length)).toBe(0);
      }
      await expect.poll(() => panel.evaluate((element, prefix) => (element as HTMLElement).style.getPropertyValue(`--akaza-${prefix}-content-height`), kind)).toBe("auto");
      await expect(panel).toBeVisible();
      const after = await position();
      expect(after.top).toBeCloseTo(before.top, 0);
      expect(after.scroll).toBe(before.scroll);
      await trigger.click();
      await expect(panel).toBeHidden();
      await expect(panel).toHaveAttribute("aria-hidden", "true");
      // Keyboard activation must not recenter the example either.
      await trigger.focus();
      await trigger.press("Enter");
      await expect.poll(() => panel.evaluate((element, prefix) => (element as HTMLElement).style.getPropertyValue(`--akaza-${prefix}-content-height`), kind)).toBe("auto");
      const keyboard = await position();
      expect(keyboard.top).toBeCloseTo(before.top, 0);
      expect(keyboard.scroll).toBe(before.scroll);
    });
  }
}
