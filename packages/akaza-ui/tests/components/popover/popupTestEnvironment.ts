import { afterEach, beforeEach, vi } from "vitest";
import { nextTick } from "vue";

export function installPopupTestEnvironment() {
  const methods = [
    [Element.prototype, "getAnimations", () => []],
    [Element.prototype, "checkVisibility", () => true],
    [HTMLElement.prototype, "showPopover", () => {}],
    [HTMLElement.prototype, "hidePopover", () => {}],
  ] as const;
  const original = methods.map(([prototype, name]) => Object.getOwnPropertyDescriptor(prototype, name));

  beforeEach(() => {
    methods.forEach(([prototype, name, value]) => Object.defineProperty(prototype, name, { configurable: true, value }));
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    vi.stubGlobal("PointerEvent", class PointerEvent extends MouseEvent {
      pointerType: string;
      constructor(type: string, options: PointerEventInit = {}) {
        super(type, options);
        this.pointerType = options.pointerType ?? "mouse";
      }
    });
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList);
    const computedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation(element => computedStyle(element));
  });

  afterEach(() => {
    methods.forEach(([prototype, name], index) => {
      const descriptor = original[index];
      if (descriptor) Object.defineProperty(prototype, name, descriptor);
      else Reflect.deleteProperty(prototype, name);
    });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
}

export async function settlePopup() {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 40));
  await nextTick();
}

export function pointer(element: Element, type: string, pointerType = "mouse", relatedTarget?: Element) {
  const event = new PointerEvent(type, { bubbles: true, cancelable: true, clientX: 10, clientY: 10, relatedTarget, pointerType });
  element.dispatchEvent(event);
  return event;
}

export function keyboardFocus(element: HTMLElement) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
  element.focus();
}
