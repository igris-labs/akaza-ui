import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openPlayground(page);
  await page.setViewportSize({ width: 640, height: 600 });
});

async function expectInsideViewport(popup: Locator) {
  await expect.poll(async () => popup.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.left >= 7 && rect.top >= 7 && rect.right <= innerWidth - 7 && rect.bottom <= innerHeight - 7;
  })).toBe(true);
}

for (const kind of ["menu", "context-menu", "menubar"] as const) {
  test(`${kind} flips a right-edge submenu and keeps logical keyboard focus`, async ({ page }) => {
    if (kind === "menu") await section(page, kind).getByRole("button", { name: "File", exact: true }).click();
    else if (kind === "context-menu") await section(page, kind).getByText("Right-click here", { exact: true }).click({ button: "right" });
    else await section(page, kind).getByRole("menuitem", { name: "View", exact: true }).click();

    const root = page.locator(kind === "menu" ? ".akaza-menu-content:not(.akaza-menu-submenu-content)" : `.akaza-${kind}-content`).first();
    await expect(root).toBeVisible();
    await root.evaluate(element => element.setAttribute("data-edge-test", ""));
    await page.addStyleTag({ content: '[data-edge-test] { position: fixed !important; top: 60px !important; left: auto !important; right: 8px !important; width: 180px !important; min-width: 0 !important; transform: none !important; scale: none !important; translate: none !important; }' });
    const trigger = root.locator(".akaza-menu-submenu-trigger").first();
    await trigger.focus();
    await trigger.press("ArrowRight");
    const submenu = root.locator(".akaza-menu-submenu-content").first();
    await expect(submenu).toHaveAttribute("data-akaza-side", "left");
    await expectInsideViewport(submenu);
    await expect(submenu.getByRole("menuitem").first()).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(submenu).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(root).toBeVisible();

    await trigger.hover();
    await expect(submenu).toBeVisible();
    await expectInsideViewport(submenu);
    // Exercise sizing separately from consumer styling: the positioner must limit both dimensions.
    await page.addStyleTag({ content: '.akaza-menu-submenu-content { width: 1000px; height: 1000px; }' });
    await expectInsideViewport(submenu);
    await expect(submenu).toHaveCSS("overflow", "auto");
    await page.setViewportSize({ width: 480, height: 400 });
    await expectInsideViewport(submenu);
  });
}

test("deep submenus remain visible outside a scroll-constrained parent", async ({ page }) => {
  await section(page, "menu").getByRole("button", { name: "Deep menu" }).click();
  await page.locator(".akaza-menu-submenu-trigger").filter({ hasText: "Level 1 — B" }).hover();
  const parent = page.locator('.akaza-menu-submenu-content[data-akaza-submenu="Level 1 — B"]');
  await expect(parent).toBeVisible();
  await parent.locator(".akaza-menu-submenu-trigger").hover();
  const child = page.locator('.akaza-menu-submenu-content[data-akaza-submenu="Level 2 — B"]');
  await expect(child).toBeVisible();
  await expectInsideViewport(child);
  const visible = await child.getByRole("menuitem", { name: "Level 3 — A", exact: true }).evaluate(element => {
    const rect = element.getBoundingClientRect();
    return element.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2));
  });
  expect(visible).toBe(true);
});

for (const kind of ["context-menu", "menubar"] as const) {
  test(`${kind} opened inside a popover joins its floating stack`, async ({ page }) => {
    await section(page, "popover").getByRole("button", { name: "Open popover", exact: true }).click();
    const popover = page.locator(".akaza-popover-content").first();
    await expect(popover).toBeVisible();
    // Move the existing demo into the popover to reproduce nested DOM without a test-only app component.
    await page.evaluate((type) => {
      const popup = document.querySelector(".akaza-popover-content")!;
      const menu = document.querySelector(type === "context-menu" ? "#context-menu .akaza-context-menu-root" : "#menubar .akaza-menubar")!;
      popup.append(menu);
      (popup as HTMLElement).style.setProperty("--akaza-z-layer-base", "2400");
      document.documentElement.style.setProperty("--akaza-z-layer-base", "2400");
    }, kind);
    if (kind === "context-menu") await popover.getByRole("button", { name: "Keyboard target" }).click({ button: "right" });
    else await popover.getByRole("menuitem", { name: "View", exact: true }).click();
    const content = page.locator(`.akaza-${kind}-content`).first();
    await expect(content).toBeVisible();
    await expect(popover).toBeVisible();
    const rootOrder = await popover.evaluate(el => Number(el.style.getPropertyValue("--akaza-layer-order")));
    const menuOrder = await content.evaluate(el => Number(el.style.getPropertyValue("--akaza-layer-order")));
    expect(menuOrder).toBeGreaterThan(rootOrder);
    expect(await content.evaluate(el => Number(getComputedStyle(el).zIndex))).toBeGreaterThan(await popover.evaluate(el => Number(getComputedStyle(el).zIndex)));
    if (kind === "menubar") {
      expect(await popover.evaluate((element, popup) => element.contains(popup), await content.elementHandle())).toBe(false);
    }
    await expect.poll(() => content.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return element.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2));
    })).toBe(true);
    const submenuTrigger = content.locator(".akaza-menu-submenu-trigger").first();
    await submenuTrigger.focus();
    await submenuTrigger.press("ArrowRight");
    const submenu = content.locator(".akaza-menu-submenu-content");
    await expect(submenu).toBeVisible();
    expect(await submenu.evaluate(el => Number(getComputedStyle(el).zIndex))).toBeGreaterThanOrEqual(2400 + menuOrder);
    await page.keyboard.press("Escape");
    await expect(submenu).toBeHidden();
    await expect(content).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(content).toBeHidden();
    await expect(popover).toBeVisible();
  });
}
