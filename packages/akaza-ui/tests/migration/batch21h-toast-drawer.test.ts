import * as sdk from "@ui-sdk/core";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { Drawer } from "@/components/drawer";
import { Toast } from "@/components/toast";
import { createToastManager } from "@/composables/toast";
import { settlePopup } from "../components/popover/popupTestEnvironment";
import { geometry, pointer, pointerFrames } from "./batch21b-pointer-fixture";

vi.mock("@ui-sdk/core", async (original) => {
  const sdk = await original<typeof import("@ui-sdk/core")>();
  return { ...sdk, bindDrag: vi.fn(sdk.bindDrag), bindPersistentLayer: vi.fn(sdk.bindPersistentLayer) };
});

enableAutoUnmount(afterEach);
let frame: () => Promise<void>;
beforeEach(() => { frame = pointerFrames(); });
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

function toastView(props: Record<string, unknown> = {}) {
  const manager = createToastManager({ removeDelay: 0 });
  const closed = vi.fn();
  manager.add({ id: "notice", title: "Saved", duration: 0, onClose: closed });
  const wrapper = mount(Toast, { attachTo: document.body, props: { manager, teleport: false, ...props } });
  const element = geometry(wrapper.get(".akaza-toast").element);
  return { manager, wrapper, element, closed };
}

function drawerView(props: Record<string, unknown> = {}) {
  const wrapper = mount(Drawer, {
    attachTo: document.body,
    props: { modelValue: true, modal: false, teleport: false, title: "Preview", ...props },
    slots: { body: () => h("button", "Keep working") },
  });
  const element = geometry(wrapper.get(".akaza-drawer").element);
  return { wrapper, element };
}

describe("batch21h Toast SDK drag", () => {
  it.each([
    ["left", -50, 0], ["right", 50, 0], ["up", 0, -50], ["down", 0, 50],
  ] as const)("dismisses %s at the threshold using final pointerup coordinates", async (direction, x, y) => {
    const bind = vi.spyOn(sdk, "bindDrag");
    const { manager, wrapper, element, closed } = toastView({ swipeDirection: direction });
    pointer(element, "pointerdown");
    const release = pointer(document, "pointerup", { clientX: x, clientY: y });
    await nextTick();
    expect(bind).toHaveBeenCalledOnce();
    expect(wrapper.emitted("swipe-start")).toHaveLength(1);
    expect(wrapper.emitted("swipe-end")?.[0]?.[1]).toBe(release);
    expect(element.dataset.akazaSwipe).toBe("end");
    expect(element.style.getPropertyValue(`--akaza-toast-swipe-move-${x ? "x" : "y"}`)).toBe(`${x || y}px`);
    expect(closed).toHaveBeenCalledWith("swipe");
    expect(manager.toasts.value).toHaveLength(0);
  });

  it.each(["pointercancel", "lostpointercapture"])("snaps back on %s without dismissing", async (type) => {
    const { manager, wrapper, element } = toastView();
    pointer(element, "pointerdown");
    pointer(document, "pointermove", { clientX: 80 });
    await frame();
    expect(element.style.getPropertyValue("--akaza-toast-swipe-move-x")).toBe("80px");
    pointer(element, type, { clientX: 80 });
    await nextTick();
    expect(manager.toasts.value).toHaveLength(1);
    expect(element.dataset.akazaSwipe).toBe("cancel");
    expect(element.style.getPropertyValue("--akaza-toast-swipe-move-x")).toBe("");
    expect(wrapper.emitted("swipe-cancel")).toHaveLength(1);
    expect(wrapper.emitted("swipe-end")).toBeUndefined();
  });

  it("samples once per frame, ignores other pointers, and returns below threshold", async () => {
    const { manager, wrapper, element } = toastView();
    pointer(element, "pointerdown");
    pointer(document, "pointermove", { clientX: 100, pointerId: 99 });
    pointer(document, "pointerup", { clientX: 100, pointerId: 99 });
    pointer(document, "pointermove", { clientX: 20 });
    pointer(document, "pointermove", { clientX: 49 });
    expect(wrapper.emitted("swipe-move")).toBeUndefined();
    await frame();
    expect(wrapper.emitted("swipe-move")).toHaveLength(1);
    pointer(document, "pointerup", { clientX: 49 });
    await nextTick();
    expect(wrapper.emitted("swipe-cancel")).toHaveLength(1);
    expect(manager.toasts.value).toHaveLength(1);
  });

  it("keeps physical directions in RTL and never dismisses in reverse", async () => {
    const { manager, element } = toastView({ swipeDirection: "right" });
    element.dir = "rtl";
    pointer(element, "pointerdown");
    pointer(document, "pointerup", { clientX: -100 });
    await nextTick();
    expect(manager.toasts.value).toHaveLength(1);
    pointer(element, "pointerdown");
    pointer(document, "pointerup", { clientX: 50 });
    await nextTick();
    expect(manager.toasts.value).toHaveLength(0);
  });

  it("does not capture interactive, secondary, prevented, or nonprimary presses", () => {
    const bind = vi.spyOn(sdk, "bindDrag");
    const { wrapper, element } = toastView();
    pointer(wrapper.get("button").element, "pointerdown");
    pointer(element, "pointerdown", { button: 2 });
    pointer(element, "pointerdown", { isPrimary: false });
    element.addEventListener("pointerdown", event => event.preventDefault(), { capture: true, once: true });
    pointer(element, "pointerdown");
    expect(bind).not.toHaveBeenCalled();
  });

  it("cancels stale work on an update, a direction change, or unmount", async () => {
    const { manager, wrapper, element } = toastView();
    pointer(element, "pointerdown");
    pointer(document, "pointermove", { clientX: 80 });
    manager.update({ id: "notice", title: "Updated" });
    await nextTick();
    pointer(document, "pointerup", { clientX: 100 });
    await frame();
    expect(manager.toasts.value).toHaveLength(1);
    const updated = geometry(wrapper.get(".akaza-toast").element);
    pointer(updated, "pointerdown");
    await wrapper.setProps({ swipeDirection: "up" });
    pointer(document, "pointerup", { clientY: -100 });
    await nextTick();
    expect(manager.toasts.value).toHaveLength(1);
    pointer(updated, "pointerdown");
    pointer(document, "pointermove", { clientY: -100 });
    wrapper.unmount();
    await frame();
    pointer(document, "pointerup", { clientY: -100 });
    await nextTick();
    expect(manager.toasts.value).toHaveLength(1);
    expect(wrapper.emitted("swipe-end")).toBeUndefined();
  });

  it("holds a timed toast while swiping and resumes its remaining duration", async () => {
    vi.useFakeTimers();
    const { manager, element } = toastView();
    manager.update({ id: "notice", duration: 1000 });
    await nextTick();
    const current = geometry(document.querySelector(".akaza-toast")!);
    vi.advanceTimersByTime(400);
    pointer(current, "pointerdown");
    vi.advanceTimersByTime(2000);
    expect(manager.toasts.value).toHaveLength(1);
    pointer(current, "pointercancel");
    await nextTick();
    vi.advanceTimersByTime(599);
    expect(manager.toasts.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(manager.toasts.value).toHaveLength(0);
    expect(element.isConnected).toBe(false);
  });
});

describe("batch21h Toast region boundary", () => {
  it("presents the viewport in the native top layer and registers SDK persistence", async () => {
    const bind = vi.spyOn(sdk, "bindPersistentLayer");
    const show = vi.fn();
    vi.stubGlobal("HTMLElement", HTMLElement);
    const original = HTMLElement.prototype.showPopover;
    HTMLElement.prototype.showPopover = show;
    const { wrapper, element } = toastView();
    await nextTick();
    const region = wrapper.get(".akaza-toast-viewport").element;
    expect(bind).toHaveBeenCalledWith(region);
    expect(region.getAttribute("popover")).toBe("manual");
    expect(show).toHaveBeenCalled();
    const panel = document.createElement("div");
    document.body.append(panel);
    const dismiss = vi.fn();
    const stop = sdk.bindLayer(panel, { onDismiss: dismiss });
    try {
      pointer(element, "pointerdown");
      pointer(element, "pointerup");
      await nextTick();
      expect(dismiss).not.toHaveBeenCalled();
      wrapper.unmount();
      document.body.append(region);
      pointer(region, "pointerdown");
      (region as HTMLElement).click();
      expect(dismiss).toHaveBeenCalled();
    } finally {
      stop();
      HTMLElement.prototype.showPopover = original;
    }
  });

  it("keeps the SDK persistent toast region usable while a modal locks the page", async () => {
    const { wrapper } = toastView();
    const region = wrapper.get(".akaza-toast-viewport").element;
    const drawer = mount(Drawer, {
      attachTo: document.body,
      props: { modelValue: false, title: "Modal" },
      slots: { body: "<button>Modal action</button>" },
    });
    await drawer.setProps({ modelValue: true });
    await frame();
    await frame();
    await settlePopup();
    expect(region.closest('[inert], [aria-hidden="true"]')).toBeNull();
    expect(document.documentElement.style.overflow).toBe("hidden");
    await drawer.setProps({ modelValue: false });
    await frame();
    await frame();
    await settlePopup();
    expect(region.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("matches SDK shortcuts, keeps exposed live attributes, action slots, and errors", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    const failure = new Error("Retry failed");
    manager.add({ id: "retry", title: "Retry", priority: "high", duration: 0,
      action: { label: "Retry request", onSelect: () => Promise.reject(failure) } });
    const wrapper = mount(Toast, {
      attachTo: document.body,
      props: { manager, teleport: false, hotkey: ["Control", "Shift", "N"] },
      slots: { toast: ({ performAction }: { performAction: (event: Event) => void }) =>
        h("button", { onClick: performAction }, "Retry request") },
    });
    const item = wrapper.get(".akaza-toast");
    expect(item.attributes()).toMatchObject({ role: "alert", "aria-live": "assertive", "aria-atomic": "true" });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "N", code: "KeyN", ctrlKey: true, shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(wrapper.get(".akaza-toast-viewport").element);
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(wrapper.emitted("action-error")?.[0]?.[0]).toBe(failure);
    expect(manager.toasts.value).toHaveLength(1);
    manager.update({ id: "retry", action: { label: "Retry request", onSelect: () => undefined } });
    await nextTick();
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(manager.toasts.value).toHaveLength(0);
  });
});

describe("batch21h Drawer SDK swipe only", () => {
  it.each([
    ["left", -100, 0], ["right", 100, 0], ["top", 0, -100], ["bottom", 0, 100],
  ] as const)("requests %s dismissal at final release coordinates", async (side, x, y) => {
    const bind = vi.spyOn(sdk, "bindDrag");
    const { wrapper, element } = drawerView({ side });
    pointer(element, "pointerdown");
    const release = pointer(document, "pointerup", { clientX: x, clientY: y });
    await nextTick();
    expect(bind).toHaveBeenCalledOnce();
    expect(wrapper.emitted("open-change")?.[0]).toEqual([false, expect.objectContaining({ reason: "swipe", event: release })]);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
  });

  it.each(["pointercancel", "lostpointercapture"])("clears panel and backdrop progress on %s", async (type) => {
    const { wrapper, element } = drawerView({ modal: true });
    pointer(element, "pointerdown");
    pointer(document, "pointermove", { clientX: 140 });
    await frame();
    const overlay = wrapper.get(".akaza-drawer-overlay").element as HTMLElement;
    expect(element.style.getPropertyValue("--drawer-swipe-movement-x")).toBe("140px");
    expect(overlay.style.getPropertyValue("--drawer-swipe-progress")).toBe("1");
    pointer(element, type, { clientX: 140 });
    await nextTick();
    expect(wrapper.emitted("open-change")).toBeUndefined();
    expect(element.hasAttribute("data-swiping")).toBe(false);
    expect(element.style.getPropertyValue("--drawer-swipe-movement-x")).toBe("");
    expect(overlay.style.getPropertyValue("--drawer-swipe-progress")).toBe("");
  });

  it.each([false, true])("snaps back when a controlled parent refuses (cancel=%s)", async (cancel) => {
    const { wrapper, element } = drawerView({ "onUpdate:modelValue": () => {}, onOpenChange: (_open: boolean, details: { cancel: () => void }) => {
      if (cancel) details.cancel();
    } });
    pointer(element, "pointerdown");
    pointer(document, "pointermove", { clientX: 120 });
    await frame();
    pointer(document, "pointerup", { clientX: 140 });
    await nextTick();
    await nextTick();
    expect(wrapper.emitted("open-change")).toHaveLength(1);
    expect(Boolean(wrapper.emitted("update:modelValue"))).toBe(!cancel);
    expect(wrapper.find(".akaza-drawer").exists()).toBe(true);
    expect(element.hasAttribute("data-swiping")).toBe(false);
    expect(element.style.getPropertyValue("--drawer-swipe-movement-x")).toBe("");
  });

  it("resets when reversing and refuses subthreshold or wrong-direction releases", async () => {
    const { wrapper, element } = drawerView();
    pointer(element, "pointerdown");
    pointer(document, "pointermove", { clientX: 80 });
    await frame();
    expect(element.hasAttribute("data-swiping")).toBe(true);
    pointer(document, "pointermove", { clientX: -120 });
    await frame();
    expect(element.hasAttribute("data-swiping")).toBe(false);
    pointer(document, "pointerup", { clientX: -120 });
    await nextTick();
    pointer(element, "pointerdown");
    pointer(document, "pointerup", { clientX: 99 });
    await nextTick();
    expect(wrapper.emitted("open-change")).toBeUndefined();
  });

  it("does not capture controls and cancels on disabling or changing side", async () => {
    const bind = vi.spyOn(sdk, "bindDrag");
    const { wrapper, element } = drawerView();
    pointer(wrapper.get("button").element, "pointerdown");
    expect(bind).not.toHaveBeenCalled();
    pointer(element, "pointerdown");
    pointer(document, "pointermove", { clientX: 70 });
    await frame();
    await wrapper.setProps({ swipeToClose: false });
    expect(element.hasAttribute("data-swiping")).toBe(false);
    pointer(document, "pointerup", { clientX: 140 });
    await nextTick();
    pointer(element, "pointerdown");
    expect(bind).toHaveBeenCalledOnce();
    await wrapper.setProps({ swipeToClose: true });
    pointer(element, "pointerdown");
    await wrapper.setProps({ side: "bottom" });
    pointer(document, "pointerup", { clientY: 140 });
    await nextTick();
    expect(wrapper.emitted("open-change")).toBeUndefined();
  });

  it("drops queued moves on unmount", async () => {
    const { wrapper, element } = drawerView();
    pointer(element, "pointerdown");
    pointer(document, "pointermove", { clientX: 140 });
    wrapper.unmount();
    await frame();
    pointer(document, "pointerup", { clientX: 140 });
    await nextTick();
    expect(wrapper.emitted("open-change")).toBeUndefined();
  });

  it("has no second pointer engine when the SDK drag binding is unavailable", async () => {
    const bind = vi.spyOn(sdk, "bindDrag").mockImplementationOnce(() => () => {});
    const drawer = drawerView();
    pointer(drawer.element, "pointerdown");
    pointer(drawer.element, "pointermove", { clientX: 140 });
    pointer(drawer.element, "pointerup", { clientX: 140 });
    await frame();
    expect(drawer.wrapper.emitted("open-change")).toBeUndefined();
    bind.mockImplementationOnce(() => () => {});
    const toast = toastView();
    pointer(toast.element, "pointerdown");
    pointer(toast.element, "pointermove", { clientX: 140 });
    pointer(toast.element, "pointerup", { clientX: 140 });
    await frame();
    expect(toast.wrapper.emitted("swipe-end")).toBeUndefined();
    expect(toast.manager.toasts.value).toHaveLength(1);
  });
});
