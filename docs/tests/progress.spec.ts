import { expect, test } from "@playwright/test";

test("indeterminate progress sweeps across the track and respects reduced motion", async ({
  page,
}) => {
  await page.goto("/components/progress", { waitUntil: "networkidle" });
  const loading = page.getByRole("progressbar", { name: "Loading", exact: true });
  const indicator = loading.locator(".akaza-progress-indicator");
  await expect(loading).not.toHaveAttribute("aria-valuenow");
  await expect.poll(() => indicator.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
  const samples = await indicator.evaluate((el) => {
    const animation = el.getAnimations().find((animation) => animation instanceof CSSAnimation)!;
    animation.pause();
    return [150, 700, 1250].map((time) => {
      animation.currentTime = time;
      const rect = el.getBoundingClientRect();
      return { x: rect.left, width: rect.width };
    });
  });
  expect(samples[1]!.x).toBeGreaterThan(samples[0]!.x);
  expect(samples[2]!.x).toBeGreaterThan(samples[1]!.x);
  expect(samples[1]!.width).toBeGreaterThan(samples[0]!.width);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => indicator.evaluate((el) => getComputedStyle(el).animationName))
    .toBe("none");
  const demo = page.locator(".docs-prose");
  await demo.getByRole("button", { name: "+ 20%", exact: true }).click();
  await expect(demo.getByRole("progressbar").first()).toHaveAttribute("aria-valuenow", "85");
});
