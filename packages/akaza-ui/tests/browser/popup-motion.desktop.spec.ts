import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

interface TransitionRecord {
  property: string;
  values: unknown[];
}

const namedPhase = /\b(?:po-slide|akaza-\w+)-(?:enter|leave)-(?:active|from|to)\b/;

async function recordTransitions(page: Page, selector: string) {
  await page.evaluate((selector) => {
    const properties: TransitionRecord[] = [];
    Object.assign(window, { popupTransitions: properties });
    document.addEventListener("transitionrun", (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.matches(selector)) return;
      const transition = target.getAnimations().find(animation =>
        animation instanceof CSSTransition && animation.transitionProperty === event.propertyName,
      );
      if (transition?.effect instanceof KeyframeEffect) {
        properties.push({
          property: event.propertyName,
          values: transition.effect.getKeyframes().map(frame => frame[event.propertyName]),
        });
      }
    }, true);
  }, selector);
  return () => page.evaluate(() => Reflect.get(window, "popupTransitions") as TransitionRecord[]);
}

test.beforeEach(async ({ page }) => openPlayground(page));

for (const [kind, triggerSelector, interaction] of [
  ["menu", "button[aria-haspopup=menu]", "click"],
  ["select", ".akaza-select-trigger", "click"],
  ["dialog", "button", "click"],
  ["tooltip", ".akaza-tooltip-trigger button", "hover"],
] as const) {
  test(`${kind} visibly fades in and out with its default CSS`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const trigger = section(page, kind).locator(triggerSelector).first();
    const selector = `.akaza-${kind}-content`;
    const content = page.locator(selector).filter({ visible: true });
    const read = await recordTransitions(page, selector);
    await trigger[interaction]();
    await expect(content).toBeVisible();
    const id = kind === "tooltip" ? await content.getAttribute("id") : undefined;
    await expect.poll(read).toContainEqual({ property: "opacity", values: ["0", "1"] });
    await expect(content).toHaveCSS("opacity", "1");
    await expect(content).not.toHaveClass(namedPhase);
    if (interaction === "hover") await page.mouse.move(0, 0);
    else await page.keyboard.press("Escape");
    await expect.poll(read).toContainEqual({ property: "opacity", values: ["1", "0"] });
    await expect(content).toBeHidden();
    if (id) {
      const hidden = page.locator(`[id="${id}"]`);
      await expect(hidden).toHaveCount(1);
      await expect(hidden).not.toHaveClass(namedPhase);
    }
  });
}

test("Popover preserves the custom named entry and transition opt-out", async ({ page }) => {
  await page.addStyleTag({ content: ".po-slide-enter-active { pointer-events: none; }" });
  const demo = section(page, "popover");
  const read = await recordTransitions(page, ".akaza-popover-content");
  const trigger = demo.getByRole("button", { name: "Slide transition", exact: true });
  await trigger.click();
  const custom = page.locator(".akaza-popover-content").filter({ hasText: "Custom slide" });
  await expect(custom).toBeVisible();
  await expect.poll(read).toContainEqual({ property: "opacity", values: ["0", "1"] });
  await expect(custom).toHaveCSS("opacity", "1");
  await expect(custom).not.toHaveClass(namedPhase);
  await custom.getByText("Custom slide").click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const departing = await custom.elementHandle();
  await page.keyboard.press("Escape");
  await expect(custom).toHaveCount(0);
  expect(await departing!.evaluate(element => element.className)).not.toMatch(namedPhase);
  const before = await read();
  await demo.getByRole("button", { name: "No transition", exact: true }).click();
  const instant = page.locator(".akaza-popover-content").filter({ hasText: "No animation" });
  await expect(instant).toBeVisible();
  await expect(instant).toHaveCSS("opacity", "1");
  await expect(instant).not.toHaveClass(namedPhase);
  await page.keyboard.press("Escape");
  await expect(instant).toBeHidden();
  expect(await read()).toEqual(before);
});

test("Popover replaces an interrupted phase and cleans up after reopening", async ({ page }) => {
  await page.addStyleTag({
    content: `
      .po-slide-enter-active { transition-duration: 800ms; }
      .po-slide-leave-active { transition-duration: 2s; }
    `,
  });
  const trigger = section(page, "popover").getByRole("button", { name: "Slide transition", exact: true });
  const content = page.locator(".akaza-popover-content").filter({ hasText: "Custom slide" });
  await trigger.click();
  await expect(content).toHaveClass(/\bpo-slide-enter-to\b/);
  await expect.poll(() => content.evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.35);
  await content.evaluate(element => element.setAttribute("data-motion-test", ""));
  await page.keyboard.press("Escape");
  await expect(content).toHaveClass(/\bpo-slide-leave-to\b/);
  await trigger.evaluate((element: HTMLButtonElement) => element.click());
  await expect(content).toHaveAttribute("data-motion-test");
  await expect(content).toHaveClass(/\bpo-slide-enter-to\b/);
  await expect(content).not.toHaveClass(namedPhase);
  await expect(content).toBeVisible();
});

for (const canceled of [false, true]) {
  test(`Popover cleans up ${canceled ? "canceled" : "completed"} keyframes without waiting for infinite animation`, async ({ page }) => {
    await page.addStyleTag({
      content: `
        @keyframes popup-entry { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popup-spinner { from { rotate: 0deg; } to { rotate: 360deg; } }
        .po-slide-enter-active {
          transition: none;
          animation: popup-entry 800ms linear both, popup-spinner 1s linear infinite;
        }
      `,
    });
    const trigger = section(page, "popover").getByRole("button", { name: "Slide transition", exact: true });
    const content = page.locator(".akaza-popover-content").filter({ hasText: "Custom slide" });
    await trigger.click();
    await expect(content).toHaveClass(/\bpo-slide-enter-to\b/);
    expect(await content.evaluate((element, canceled) => {
      const entry = element.getAnimations().find(animation =>
        animation instanceof CSSAnimation && animation.animationName === "popup-entry" && animation.playState === "running",
      );
      if (canceled) entry?.cancel();
      return Boolean(entry);
    }, canceled)).toBe(true);
    await expect(content).not.toHaveClass(namedPhase);
    await expect(content).toHaveCSS("opacity", "1");
  });
}

test("Popover clears named phases when CSS has no motion", async ({ page }) => {
  await page.addStyleTag({
    content: ".po-slide-enter-active,.po-slide-leave-active { transition: none; }",
  });
  const trigger = section(page, "popover").getByRole("button", { name: "Slide transition", exact: true });
  const content = page.locator(".akaza-popover-content").filter({ hasText: "Custom slide" });
  const read = await recordTransitions(page, ".akaza-popover-content");
  await trigger.click();
  await expect(content).toBeVisible();
  await expect(content).not.toHaveClass(namedPhase);
  await page.keyboard.press("Escape");
  await expect(content).toHaveCount(0);
  expect(await read()).toEqual([]);
});

test("Navigation Menu moves and resizes its flyout while the next panel slides in", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const demo = section(page, "navigation-menu");
  const first = demo.getByRole("button", { name: "Products", exact: true });
  const next = demo.getByRole("button", { name: "Docs", exact: true });
  const content = page.locator(".akaza-navigation-menu-content");
  await first.hover();
  await expect(content).toHaveCSS("opacity", "1");
  const x = (await content.boundingBox())!.x;
  const read = await recordTransitions(page, [
    ".akaza-navigation-menu-content",
    ".akaza-navigation-menu-viewport",
    '.akaza-navigation-menu-panel[data-akaza-state="open"]',
  ].join(","));
  await next.hover();
  await expect(next).toHaveAttribute("aria-expanded", "true");
  await expect.poll(async () => (await read()).map(entry => entry.property)).toEqual(expect.arrayContaining([
    "left", "height", "transform",
  ]));
  await expect.poll(async () => (await content.boundingBox())!.x).toBeGreaterThan(x + 20);
});
