import { ariaKeyshortcuts, createPreview, definePrimitive, inputHints, matchesShortcut } from "@ui-sdk/core";
import { button } from "@ui-sdk/core/button";
import { paginationRange } from "@ui-sdk/core/pagination";
import { toggle } from "@ui-sdk/core/toggle";
import { afterEach, describe, expect, it, vi } from "vitest";

const cleanups: Array<() => void> = [];
afterEach(() => cleanups.splice(0).reverse().forEach(cleanup => cleanup()));

function surface(tag = "div") {
  const element = document.createElement(tag);
  element.tabIndex = 0;
  document.body.append(element);
  cleanups.push(() => element.remove());
  const click = vi.fn((event: MouseEvent) => event.preventDefault());
  element.addEventListener("click", click);
  return { element, click };
}

function send(element: HTMLElement, type: "keydown" | "keyup", key: string, options: KeyboardEventInit = {}) {
  const event = new KeyboardEvent(type, { key, bubbles: true, cancelable: true, ...options });
  element.dispatchEvent(event);
  return event;
}

function buttonKeys(element: HTMLElement) {
  const instance = button({ id: "batch24d-button" });
  const part = instance.part("root");
  part.el = element;
  const down = (event: KeyboardEvent) => {
    if (!event.defaultPrevented) button.slots.root.on?.keydown?.(event, part);
  };
  const up = (event: KeyboardEvent) => {
    if (!event.defaultPrevented) button.slots.root.on?.keyup?.(event, part);
  };
  element.addEventListener("keydown", down);
  element.addEventListener("keyup", up);
  cleanups.push(() => {
    element.removeEventListener("keydown", down);
    element.removeEventListener("keyup", up);
    instance.destroy();
  });
  return instance;
}

function toggleKeys(element: HTMLElement) {
  const instance = toggle({ id: "batch24d-toggle", pressed: false });
  const part = instance.part("root");
  part.el = element;
  const down = (event: KeyboardEvent) => {
    if (!event.defaultPrevented) toggle.slots.root.on?.keydown?.(event, part);
  };
  const up = (event: KeyboardEvent) => {
    if (!event.defaultPrevented) toggle.slots.root.on?.keyup?.(event, part);
  };
  element.addEventListener("keydown", down);
  element.addEventListener("keyup", up);
  cleanups.push(() => {
    element.removeEventListener("keydown", down);
    element.removeEventListener("keyup", up);
    instance.destroy();
  });
  return instance;
}

describe("batch24d public activation handlers without SDK bind or press", () => {
  for (const [name, keys] of [["button", buttonKeys], ["toggle", toggleKeys]] as const) {
    it(`${name}: custom roots click on Space release and Enter press`, () => {
      const { element, click } = surface();
      keys(element);
      expect(send(element, "keydown", " ").defaultPrevented).toBe(true);
      expect(click).not.toHaveBeenCalled();
      send(element, "keyup", " ");
      expect(click).toHaveBeenCalledTimes(1);
      expect(send(element, "keydown", "Enter").defaultPrevented).toBe(true);
      expect(click).toHaveBeenCalledTimes(2);
      send(element, "keyup", "Enter");
      expect(click).toHaveBeenCalledTimes(2);
    });

    it(`${name}: native button keyboard events remain browser-owned`, () => {
      const { element, click } = surface("button");
      keys(element);
      for (const key of [" ", "Enter"]) {
        expect(send(element, "keydown", key).defaultPrevented).toBe(false);
        expect(send(element, "keyup", key).defaultPrevented).toBe(false);
      }
      expect(click).not.toHaveBeenCalled();
    });

    it(`${name}: linked anchors retain native link behavior, even with role=button`, () => {
      const { element, click } = surface("a");
      element.setAttribute("href", "#batch24d");
      element.setAttribute("role", "button");
      keys(element);
      expect(send(element, "keydown", " ").defaultPrevented).toBe(false);
      send(element, "keyup", " ");
      send(element, "keydown", "Enter");
      send(element, "keyup", "Enter");
      expect(click).not.toHaveBeenCalled();
    });

    it(`${name}: the adapter can preserve consumer preventDefault`, () => {
      const { element, click } = surface();
      element.addEventListener("keydown", event => event.preventDefault());
      element.addEventListener("keyup", event => event.preventDefault());
      keys(element);
      send(element, "keydown", "Enter");
      send(element, "keyup", " ");
      expect(click).not.toHaveBeenCalled();
    });
  }

  it("button keyboard-only use does not adopt async pending ownership", () => {
    const { element } = surface();
    const instance = buttonKeys(element);
    let resolve!: () => void;
    const promise = new Promise<void>((done) => { resolve = done; });
    const action = vi.fn(() => promise);
    element.addEventListener("click", action);
    send(element, "keydown", "Enter");
    expect(action).toHaveBeenCalledOnce();
    expect(instance.get().pending).toBe(false);
    resolve();
  });

  it("toggle keyboard-only use does not write a second pressed state", () => {
    const { element, click } = surface();
    const instance = toggleKeys(element);
    send(element, "keydown", "Enter");
    expect(click).toHaveBeenCalledOnce();
    expect(instance.api.isPressed()).toBe(false);
  });
});

describe("batch24d shortcut compatibility", () => {
  function shortcut(event: KeyboardEvent) {
    return [event.ctrlKey ? "Control" : "", event.metaKey ? "Meta" : "", event.shiftKey ? "Shift" : "", "b"]
      .filter(Boolean).join("+");
  }

  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { ctrlKey: true, shiftKey: true },
    { metaKey: true, shiftKey: true },
    { ctrlKey: true, metaKey: true },
    { ctrlKey: true, metaKey: true, shiftKey: true },
  ])("preserves explicit pressed modifiers: %j", (modifiers) => {
    const event = new KeyboardEvent("keydown", { key: "b", code: "KeyB", ...modifiers });
    expect(matchesShortcut(event, shortcut(event))).toBe(true);
    expect(ariaKeyshortcuts(shortcut(event))).toBe(shortcut(event).replace(/b$/, "B"));
  });

  it("needs the caller's Ctrl/Meta guard and rejects unlisted Alt", () => {
    const bare = new KeyboardEvent("keydown", { key: "b", code: "KeyB" });
    expect(matchesShortcut(bare, shortcut(bare))).toBe(true);
    const alt = new KeyboardEvent("keydown", { key: "b", code: "KeyB", ctrlKey: true, altKey: true });
    expect(matchesShortcut(alt, shortcut(alt))).toBe(false);
  });

  it("records physical-key expansion relative to Sidebar's current event.key policy", () => {
    const event = new KeyboardEvent("keydown", { key: "\u03B2", code: "KeyB", ctrlKey: true });
    expect(event.key.toLocaleLowerCase() === "b").toBe(false);
    expect(matchesShortcut(event, shortcut(event))).toBe(true);
  });
});

describe("batch24d helper boundaries", () => {
  it("inputHints supplies defaults rather than equivalent per-cell PIN policy", () => {
    const otp = inputHints("one-time-code");
    expect(otp).toMatchObject({ inputMode: "numeric", autoComplete: "one-time-code", spellCheck: "false" });
    expect(inputHints("decimal")).toEqual({ inputMode: "decimal", autoComplete: "off" });
  });

  it("paginationRange boundaries=0 still adds gaps unlike Akaza's no-edges window", () => {
    expect(paginationRange({ page: 5, pageCount: 10, siblings: 2, boundaries: 0 }))
      .toEqual(["ellipsis-start", 3, 4, 5, 6, 7, "ellipsis-end"]);
  });

  it("createPreview supports hover-only show/clear but suppresses the chosen value", () => {
    const definition = definePrimitive({
      name: "batch24d-preview",
      state: () => ({ preview: null as string | null }),
      api: context => ({ preview: createPreview(context, {
        key: "preview", slot: "item", value: () => "2", choose: () => true,
      }) }),
      slots: slot => ({ item: slot({}) }),
    });
    const instance = definition({ id: "batch24d-preview" });
    cleanups.push(() => instance.destroy());
    instance.api.preview.show("3", { reason: "item-hover" });
    expect(instance.get().preview).toBe("3");
    instance.api.preview.clear({ reason: "item-hover" });
    expect(instance.get().preview).toBeNull();
    instance.api.preview.show("2", { reason: "item-hover" });
    expect(instance.get().preview).toBeNull();
  });
});
