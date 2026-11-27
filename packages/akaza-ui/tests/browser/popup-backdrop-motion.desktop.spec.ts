import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

interface Fade {
  duration: number | string;
  values: number[];
}

async function recordFades(page: Page, selector: string) {
  const fades = await page.evaluateHandle((selector) => {
    const fades: Fade[] = [];
    document.addEventListener("transitionrun", (event) => {
      const target = event.target;
      if (event.propertyName !== "opacity" || !(target instanceof Element) || !target.matches(selector)) return;
      const transition = target.getAnimations().find(animation =>
        animation instanceof CSSTransition && animation.transitionProperty === "opacity",
      );
      if (transition?.effect instanceof KeyframeEffect) {
        fades.push({
          duration: transition.effect.getTiming().duration,
          values: transition.effect.getKeyframes().map(frame => Number(frame.opacity)),
        });
      }
    }, true);
    return fades;
  }, selector);
  return () => fades.jsonValue();
}

const demos = [
  { kind: "dialog", open: "Open", close: "Cancel", duration: 100 },
  { kind: "alert-dialog", open: "Delete account", close: "Cancel", duration: 150 },
  { kind: "drawer", open: "Open right", close: "Close", duration: 300 },
] as const;

for (const { kind, open, close, duration } of demos) {
  const selector = `.akaza-${kind}-overlay`;

  test(`${kind} backdrop fades in and out`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openPlayground(page);
    const read = await recordFades(page, selector);
    const backdrop = page.locator(selector);
    const enter = { duration, values: [0, 1] };
    await section(page, kind).getByRole("button", { name: open, exact: true }).first().click();
    await expect.poll(read).toEqual([enter]);
    await expect(backdrop).toHaveCSS("opacity", "1");
    await page.getByRole(kind === "alert-dialog" ? "alertdialog" : "dialog")
      .getByRole("button", { name: close, exact: true }).click();
    await expect.poll(read).toEqual([enter, { duration, values: [1, 0] }]);
    await expect(backdrop).toHaveCount(0);
  });

  test(`${kind} backdrop skips fades with reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openPlayground(page);
    const read = await recordFades(page, selector);
    const backdrop = page.locator(selector);
    await section(page, kind).getByRole("button", { name: open, exact: true }).first().click();
    await expect(backdrop).toHaveCSS("opacity", "1");
    await page.getByRole(kind === "alert-dialog" ? "alertdialog" : "dialog")
      .getByRole("button", { name: close, exact: true }).click();
    await expect(backdrop).toHaveCount(0);
    expect(await read()).toEqual([]);
  });
}

test("Dialog backdrop respects transition=false", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openPlayground(page);
  const selector = ".akaza-dialog-overlay";
  const read = await recordFades(page, selector);
  const backdrop = page.locator(selector);
  await section(page, "dialog").getByText("No transition", { exact: true }).locator("..")
    .getByRole("button", { name: "Open", exact: true }).click();
  await expect(backdrop).toHaveCSS("opacity", "1");
  await page.getByRole("dialog", { name: "No animation" }).getByRole("button", { name: "Close" }).click();
  await expect(backdrop).toHaveCount(0);
  expect(await read()).toEqual([]);
});

test("Drawer backdrop reverses an interrupted close without flashing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openPlayground(page);
  const selector = ".akaza-drawer-overlay";
  const read = await recordFades(page, selector);
  const trigger = section(page, "drawer").getByRole("button", { name: "Open right", exact: true });
  const close = page.getByRole("dialog").getByRole("button", { name: "Close", exact: true });
  const backdrop = page.locator(selector);
  await trigger.click();
  await expect(backdrop).toHaveCSS("opacity", "1");

  // Reopen after a rendered closing frame, while there is still opacity to interpolate.
  await trigger.evaluate((button, selector) => {
    document.addEventListener("transitionrun", function reopen(event) {
      const target = event.target;
      if (event.propertyName !== "opacity" || !(target instanceof Element) || !target.matches(selector)) return;
      document.removeEventListener("transitionrun", reopen, true);
      function reopenMidFade() {
        if (!target.isConnected) return;
        const opacity = Number(getComputedStyle(target).opacity);
        if (opacity > 0.8) requestAnimationFrame(reopenMidFade);
        else if (opacity > 0) (button as HTMLButtonElement).click();
      }
      requestAnimationFrame(reopenMidFade);
    }, true);
  }, selector);
  await close.click();
  await expect.poll(async () => (await read()).length).toBe(3);
  const [enter, exit, reverse] = await read();
  expect(enter!.values).toEqual([0, 1]);
  expect(exit!.values).toEqual([1, 0]);
  expect(reverse!.values[0]).toBeGreaterThan(0);
  expect(reverse!.values[0]).toBeLessThan(1);
  expect(reverse!.values[1]).toBe(1);
  await expect(backdrop).toHaveCSS("opacity", "1");
});
