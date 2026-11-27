import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

for (const kind of ["accordion", "collapsible"] as const) {
  test(`${kind} animates measured opening and closing rather than jumping`, async ({ page }) => {
    const demo = section(page, kind);
    const root = demo.locator(`.akaza-${kind}`).nth(kind === "accordion" ? 1 : 0);
    const trigger = root.locator(`.akaza-${kind}-trigger`).first();
    const panel = root.locator(`.akaza-${kind}-content`).first();
    await trigger.scrollIntoViewIfNeeded();
    await expect(panel).toBeHidden();
    // A longer consumer duration makes intermediate frames observable on slower CI hosts.
    await panel.evaluate(element => { (element as HTMLElement).style.transitionDuration = "400ms"; });
    await trigger.click();
    await expect.poll(() => panel.evaluate((element, prefix) => element.getAnimations().some(animation =>
      animation instanceof CSSTransition && animation.transitionProperty === "height"
      && Number.parseFloat((element as HTMLElement).style.getPropertyValue(`--${prefix}-content-height`)) > 0,
    ), `akaza-${kind}`)).toBe(true);
    const middle = await panel.evaluate((element) => {
      const animation = element.getAnimations().find(animation => animation instanceof CSSTransition && animation.transitionProperty === "height")!;
      animation.pause();
      animation.currentTime = 200;
      return { height: element.getBoundingClientRect().height, full: element.scrollHeight };
    });
    expect(middle.height).toBeGreaterThan(0);
    expect(middle.height).toBeLessThan(middle.full);
    await panel.evaluate(async (element) => {
      const animations = element.getAnimations();
      animations.forEach(animation => animation.play());
      await Promise.all(animations.map(animation => animation.finished));
    });
    await expect.poll(() => panel.evaluate((element, prefix) => (element as HTMLElement).style.getPropertyValue(`--${prefix}-content-height`), `akaza-${kind}`)).toBe("auto");
    const height = await panel.evaluate(element => element.getBoundingClientRect().height);
    expect(height).toBeGreaterThan(0);
    await trigger.click();
    await expect.poll(() => panel.evaluate(element => element.getAnimations().some(animation =>
      animation instanceof CSSTransition && animation.transitionProperty === "height",
    ))).toBe(true);
    expect(await panel.evaluate(element => (element as HTMLElement).hidden)).toBe(false);
    await expect(panel).toHaveAttribute("inert", "");
    await expect(panel).toBeHidden();
  });

  test(`${kind} respects reduced motion while preserving visibility and accessibility`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const demo = section(page, kind);
    const root = demo.locator(`.akaza-${kind}`).nth(kind === "accordion" ? 1 : 0);
    const trigger = root.locator(`.akaza-${kind}-trigger`).first();
    const panel = root.locator(`.akaza-${kind}-content`).first();
    await trigger.click();
    await expect(panel).toBeVisible();
    expect(await panel.evaluate(element => element.getAnimations().length)).toBe(0);
    expect(await panel.getAttribute("inert")).toBeNull();
    await trigger.click();
    await expect(panel).toBeHidden();
    await expect(panel).toHaveAttribute("aria-hidden", "true");
  });
}
