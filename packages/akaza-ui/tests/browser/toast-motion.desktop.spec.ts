import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

async function recordFrontmostTransforms(page: Page) {
  await page.evaluate(() => {
    const frames: number[] = [];
    Object.assign(window, { toastEntryFrames: frames });
    document.addEventListener("transitionrun", (event) => {
      const target = event.target;
      if (event.propertyName !== "transform" || !(target instanceof HTMLElement) || !target.matches('.akaza-toast[data-akaza-index="0"]')) return;
      const transition = target.getAnimations().find(animation =>
        animation instanceof CSSTransition && animation.transitionProperty === "transform",
      );
      if (transition?.effect instanceof KeyframeEffect) {
        const start = transition.effect.getKeyframes()[0]?.transform;
        if (typeof start !== "string") return;
        const height = target.offsetHeight;
        const pixels = start.replace(/(-?\d+(?:\.\d+)?)%/, (_, percent: string) => `${Number(percent) * height / 100}px`);
        frames.push(Math.round(new DOMMatrixReadOnly(pixels).m42 / height * 100));
      }
    }, true);
  });
  return () => page.evaluate(() => Reflect.get(window, "toastEntryFrames") as number[]);
}

for (const [side, buttonName, start, direction] of [
  ["top", "Show custom toast", -150, 1],
  ["bottom", "Action toast", 150, -1],
] as const) {
  test(`first and subsequent ${side} Toast entries start offscreen and stack inward`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openPlayground(page);
    const readFrames = await recordFrontmostTransforms(page);
    const button = section(page, "toast").getByRole("button", { name: buttonName, exact: true });
    const viewport = page.locator(`.akaza-toast-viewport[data-akaza-side="${side}"]`);
    const front = viewport.locator('.akaza-toast[data-akaza-index="0"]');
    for (const count of [1, 2]) {
      await button.click();
      await expect(viewport.locator(".akaza-toast")).toHaveCount(count);
      await expect.poll(readFrames).toHaveLength(count);
      await expect.poll(() => front.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(true);
      expect(await readFrames()).toEqual(Array.from({ length: count }, () => start));
    }

    const behind = viewport.locator('.akaza-toast[data-akaza-index="1"]');
    const inwardOffset = async () => ((await behind.boundingBox())!.y - (await front.boundingBox())!.y) * direction;
    await expect.poll(inwardOffset).toBeGreaterThan(5);
    await front.hover();
    await expect(viewport).toHaveAttribute("data-akaza-expanded", "true");
    const height = (await front.boundingBox())!.height;
    await expect.poll(inwardOffset).toBeGreaterThan(height);
  });
}

test("first top Toast honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPlayground(page);
  await section(page, "toast").getByRole("button", { name: "Show custom toast", exact: true }).click();
  const toast = page.locator('.akaza-toast-viewport[data-akaza-side="top"] .akaza-toast');
  await expect(toast).toBeVisible();
  const maxDuration = await toast.evaluate(el => Math.max(...getComputedStyle(el).transitionDuration.split(",").map(Number.parseFloat)));
  expect(maxDuration).toBeLessThan(0.001);
  await expect.poll(() => toast.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(true);
});
