import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function openPlayground(page: Page) {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
}

export function section(page: Page, id: string): Locator {
  return page.locator(`#${id}`);
}

export async function tap(page: Page, locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("Cannot tap an element without a bounding box");
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

export async function longPress(
  page: Page,
  locator: Locator,
  duration = 1000,
  dispatchTarget = locator,
) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("Cannot long-press an element without a bounding box");
  const clientX = box.x + box.width / 2;
  const clientY = box.y + box.height / 2;
  const pointer = {
    button: 0,
    buttons: 1,
    clientX,
    clientY,
    isPrimary: true,
    pointerId: 1,
    pointerType: "touch",
  };
  const pointerType = await dispatchTarget.evaluate((element, init) => {
    const event = new PointerEvent("pointerdown", { ...init, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    return event.pointerType;
  }, pointer);
  if (pointerType !== "touch") throw new Error(`Expected a touch pointer, received "${pointerType}"`);
  await page.waitForTimeout(duration);
  await dispatchTarget.evaluate((element, init) => {
    element.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0, bubbles: true, cancelable: true }));
  }, pointer);
}

export async function dragTouch(
  page: Page,
  locator: Locator,
  deltaX: number,
  deltaY: number,
  position = { x: 0.5, y: 0.5 },
) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("Cannot drag an element without a bounding box");
  const client = await page.context().newCDPSession(page);
  const viewport = page.viewportSize();
  const start = { x: box.x + box.width * position.x, y: box.y + box.height * position.y };
  const end = {
    x: Math.min((viewport?.width ?? Infinity) - 1, Math.max(1, start.x + deltaX)),
    y: Math.min((viewport?.height ?? Infinity) - 1, Math.max(1, start.y + deltaY)),
  };

  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
  await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [end] });
  await page.waitForTimeout(50);
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await client.detach();

  // CDP occasionally omits pointerup for a captured touch pointer.
  if (await locator.getAttribute("data-swiping") !== null) {
    await locator.dispatchEvent("pointerup", {
      buttons: 0,
      clientX: end.x,
      clientY: end.y,
      isPrimary: true,
      pointerId: 1,
      pointerType: "touch",
    });
  }
}

export async function expectBooleanAttributeToToggle(
  locator: Locator,
  attribute: string,
  interact: () => Promise<void>,
) {
  const before = await locator.getAttribute(attribute);
  await interact();
  await expect(locator).not.toHaveAttribute(attribute, before ?? "");
}
