import type { ChangeDetails, PopupContentProps } from "@ui-sdk/core";
import { bindLayer, position } from "@ui-sdk/core";
import { select } from "@ui-sdk/core/select";
import { checkPattern } from "@ui-sdk/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, onMounted, shallowRef, Teleport } from "vue";
import { renderToString } from "vue/server-renderer";
import { batch13Dialog, batch13Popover, bindBatch13Popup } from "./batch13-popup-fixture";

const cleanups: (() => void)[] = [];
const settle = async () => {
  await new Promise(resolve => setTimeout(resolve, 30));
};

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  Object.defineProperty(Element.prototype, "getAnimations", { configurable: true, value: () => [] });
  Object.defineProperty(Element.prototype, "checkVisibility", { configurable: true, value: () => true });
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: () => {} });
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList);
  Object.defineProperty(HTMLElement.prototype, "showPopover", { configurable: true, value: () => {} });
  Object.defineProperty(HTMLElement.prototype, "hidePopover", { configurable: true, value: () => {} });
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1024);
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(768);
  const computedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation(element => computedStyle(element));
});

afterEach(() => {
  cleanups.splice(0).reverse().forEach(cleanup => cleanup());
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function fixture(options: Parameters<typeof batch13Dialog>[0], primitive = batch13Dialog, parent = document.body, target = parent, contentProps: PopupContentProps = { initialFocus: "none" }) {
  const trigger = document.createElement("button");
  trigger.textContent = options.id;
  const content = document.createElement("div");
  content.setAttribute("role", "dialog");
  content.setAttribute("aria-label", options.id);
  content.innerHTML = '<button type="button">Inside</button>';
  parent.append(trigger);
  target.append(content);
  const view = bindBatch13Popup(primitive, options, trigger, content, contentProps);
  cleanups.push(() => view.destroy());
  return view;
}

describe("batch 13 public Core popup proof (not migration approval)", () => {
  it("creates initially-open per-instance state and cancels before changing it", () => {
    const canceled = vi.fn((_open: boolean, details: ChangeDetails<string>) => details.cancel());
    const first = batch13Dialog({ id: "initial", defaultOpen: true, onOpenChange: canceled });
    const second = batch13Dialog({ id: "separate" });
    cleanups.push(() => first.destroy(), () => second.destroy());
    expect(first.get()).toMatchObject({ open: true, mounted: true });
    expect(second.get()).toMatchObject({ open: false, mounted: false });
    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    expect(first.api.close({ reason: "escape-key", event })).toBe(false);
    expect(canceled).toHaveBeenCalledOnce();
    expect(canceled.mock.calls[0]?.[1]).toMatchObject({ reason: "escape-key", event });
    expect(first.api.isOpen()).toBe(true);
    expect(second.api.isOpen()).toBe(false);
  });

  it("keeps a controlled refusal closed until setOptions accepts it", () => {
    const onOpenChange = vi.fn();
    const instance = batch13Popover({ id: "controlled", open: false, onOpenChange });
    cleanups.push(() => instance.destroy());
    instance.api.setOpen(true, { reason: "imperative" });
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(instance.api.isOpen()).toBe(false);
    instance.setOptions({ id: "controlled", open: true, onOpenChange });
    expect(instance.api.isOpen()).toBe(true);
  });

  it("keeps an initially-open controlled refusal open until its parent accepts close", () => {
    const onOpenChange = vi.fn();
    const instance = batch13Dialog({ id: "controlled-initial", open: true, onOpenChange });
    cleanups.push(() => instance.destroy());
    instance.api.close({ reason: "imperative" });
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(instance.get()).toMatchObject({ open: true, mounted: true });
    instance.setOptions({ id: "controlled-initial", open: false, onOpenChange });
    expect(instance.api.isOpen()).toBe(false);
  });

  it("binds real public Parts, shares raw-layer Escape ordering, and cleans up", async () => {
    const view = fixture({ id: "bound", defaultOpen: true });
    await settle();
    expect(view.content.getAttribute("role")).toBe("dialog");
    expect(view.trigger.getAttribute("aria-expanded")).toBe("true");
    const raw = document.createElement("div");
    view.content.append(raw);
    const dismissed = vi.fn();
    const stop = bindLayer(raw, { onDismiss: dismissed });
    cleanups.push(stop);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await settle();
    expect(dismissed).toHaveBeenCalledWith("escape-key", expect.any(KeyboardEvent));
    expect(view.instance.api.isOpen()).toBe(true);
    stop();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await settle();
    expect(view.instance.api.isOpen()).toBe(false);
  });

  it("lets the SDK own presence through an exit animation", async () => {
    const view = fixture({ id: "presence", defaultOpen: true });
    await settle();
    let finish!: () => void;
    const finished = new Promise<void>(resolve => { finish = resolve; });
    vi.spyOn(view.content, "getAnimations").mockReturnValue([{ finished } as unknown as Animation]);
    view.instance.api.close({ reason: "imperative" });
    expect(view.instance.get()).toMatchObject({ open: false, mounted: true });
    expect(view.present()).toBe(true);
    finish();
    await settle();
    expect(view.instance.get()).toMatchObject({ open: false, mounted: false });
    expect(view.present()).toBe(false);
  });

  it("positions a raw element through the public cleanup without a popup owner", () => {
    const element = document.createElement("div");
    document.body.append(element);
    const stop = position({ x: 40, y: 50 }, element, { side: "bottom", align: "start", sideOffset: 6 });
    cleanups.push(stop);
    stop.place();
    expect(element.dataset.side).toBe("bottom");
    expect(element.dataset.align).toBe("start");
    expect(element.style.getPropertyValue("--available-width")).not.toBe("");
  });

  it("returns focus on close, but does not steal it from outside a nonmodal popup", async () => {
    const outside = document.createElement("button");
    document.body.append(outside);
    const view = fixture({ id: "focus", defaultOpen: true, modal: false });
    await settle();
    view.content.querySelector("button")!.focus();
    view.instance.api.close();
    await settle();
    expect(document.activeElement).toBe(view.trigger);
    view.instance.api.setOpen(true);
    await settle();
    outside.focus();
    view.instance.api.close();
    await settle();
    expect(document.activeElement).toBe(outside);
  });

  it("records the unresolved modal Tab gate in the minimal public-part fixture", async () => {
    const view = fixture({ id: "pattern", defaultOpen: true }, batch13Dialog, document.body, document.body, { initialFocus: "content" });
    await settle();
    // Negative compatibility evidence, not a passing modal-pattern certification.
    await expect(checkPattern(view.content, "dialog")).rejects.toThrow("is modal, but Tab moved focus out of it");
  });

  it("does not add SSR listeners or disturb an existing live layer with DOM globals present", async () => {
    const view = fixture({ id: "live", defaultOpen: true });
    await settle();
    const listen = vi.spyOn(document, "addEventListener");
    const windowListen = vi.spyOn(window, "addEventListener");
    const before = document.body.outerHTML;
    for (let index = 0; index < 3; index++) {
      const server = batch13Dialog({ id: "server", defaultOpen: true });
      try {
        const part = server.part("content", {});
        await renderToString(h("div", batch13Dialog.slots.content.attrs?.(server.get(), part), "Server"));
      } finally {
        server.destroy();
      }
    }
    expect(listen).not.toHaveBeenCalled();
    expect(windowListen).not.toHaveBeenCalled();
    expect(document.body.outerHTML).toBe(before);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await settle();
    expect(view.instance.api.isOpen()).toBe(false);
  });

  it.each([false, "body", "#batch13-target"] as const)("leaves Vue Teleport=%s placement under Vue ownership", async target => {
    const host = document.createElement("div");
    const portal = document.createElement("section");
    portal.id = "batch13-target";
    document.body.append(host, portal);
    const View = defineComponent({
      setup() {
        const trigger = shallowRef<HTMLButtonElement>();
        const content = shallowRef<HTMLDivElement>();
        let view: ReturnType<typeof bindBatch13Popup>;
        onMounted(() => {
          view = bindBatch13Popup(batch13Dialog, { id: "teleport", defaultOpen: true, modal: false },
            trigger.value!, content.value!, { initialFocus: "none" });
        });
        onBeforeUnmount(() => view.destroy());
        return () => h("main", [
          h("button", { ref: trigger }, "Open"),
          h(Teleport, { to: target || "body", disabled: target === false }, [
            h("div", { ref: content, class: "batch13-content", role: "dialog", "aria-label": "Popup" }),
          ]),
        ]);
      },
    });
    const app = createApp(View);
    app.mount(host);
    cleanups.push(() => app.unmount());
    await nextTick();
    await settle();
    const content = document.querySelector(".batch13-content")!;
    expect(content.parentElement).toBe(target === false ? host.querySelector("main") : target === "body" ? document.body : portal);
  });

  it("keeps a body-portaled SDK Select in a Dialog through a body-portaled nonmodal drawer-shaped popup", async () => {
    const dialog = fixture({ id: "outer", defaultOpen: true });
    await settle();
    const drawer = fixture({ id: "drawer", defaultOpen: true, modal: false }, batch13Dialog, dialog.content, document.body);
    await settle();
    const trigger = document.createElement("button");
    trigger.textContent = "Project";
    drawer.content.append(trigger);
    const content = document.createElement("div");
    const search = document.createElement("input");
    search.setAttribute("aria-label", "Search projects");
    content.append(search);
    document.body.append(content);
    const instance = select({ id: "nested-select", defaultOpen: true, modal: false });
    const triggerPart = instance.part("trigger", { id: "nested-trigger" });
    const contentPart = instance.part("content", { id: "nested-content" });
    const inputPart = instance.part("input", { id: "nested-input" });
    triggerPart.el = trigger;
    contentPart.el = content;
    inputPart.el = search;
    const slots = select.slots as ReturnType<typeof select>["types"]["slots"];
    const stopTrigger = slots.trigger.bind?.(trigger, triggerPart);
    const stopContent = slots.content.bind?.(content, contentPart);
    const stopInput = slots.input.bind?.(search, inputPart);
    cleanups.push(() => {
      stopInput?.();
      stopContent?.();
      stopTrigger?.();
      instance.destroy();
    });
    await settle();
    expect(content.closest('[inert], [aria-hidden="true"]')).toBeNull();
    search.focus();
    expect(document.activeElement).toBe(search);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await settle();
    expect(instance.api.isOpen()).toBe(false);
    expect(drawer.instance.api.isOpen()).toBe(true);
    expect(dialog.instance.api.isOpen()).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await settle();
    expect(drawer.instance.api.isOpen()).toBe(false);
    expect(dialog.instance.api.isOpen()).toBe(true);
  });
});
