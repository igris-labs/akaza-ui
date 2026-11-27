import type { AkazaChangeEventDetails } from "@/types";
import { checkPattern } from "@ui-sdk/core/testing";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { ColorArea } from "@/components/color-area";
import { ColorField } from "@/components/color-field";
import { ColorSlider } from "@/components/color-slider";
import { NumberField } from "@/components/number-field";
import { Sidebar } from "@/components/sidebar";
import { Slider } from "@/components/slider";
import { Toast } from "@/components/toast";
import { createToastManager } from "@/composables/toast";
import { pointerFrames } from "./batch21b-pointer-fixture";

const cleanups: Array<() => void> = [];
let frame: () => Promise<void>;
beforeEach(() => { frame = pointerFrames(); });
afterEach(() => {
  cleanups.splice(0).reverse().forEach(cleanup => cleanup());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function pointer(element: Element, type: string, x = 0, pointerId = 7) {
  const event = new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 20, pointerId, pointerType: "touch" });
  element.dispatchEvent(event);
  return event;
}

function geometry(element: Element) {
  element.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100, toJSON: () => ({}),
  });
  const target = element as HTMLElement;
  target.setPointerCapture = vi.fn();
  target.releasePointerCapture = vi.fn();
  target.hasPointerCapture = () => true;
}

describe("batch15 retained pointer and migrated numeric contracts", () => {
  it("samples Slider moves per frame and commits once on release", async () => {
    const wrapper = mount(Slider, { props: { modelValue: 10, ariaLabel: "Volume" }, attachTo: document.body });
    cleanups.push(() => wrapper.unmount());
    geometry(wrapper.element);
    pointer(wrapper.element, "pointerdown", 20);
    pointer(wrapper.element, "pointermove", 30);
    pointer(wrapper.element, "pointermove", 40);
    await frame();
    expect(wrapper.emitted("value-change")?.map(args => args[0])).toEqual([20, 40]);
    expect(wrapper.emitted("value-commit")).toBeUndefined();
    pointer(wrapper.element, "pointerup", 40);
    await nextTick();
    expect(wrapper.emitted("value-commit")).toHaveLength(1);
    expect((wrapper.emitted("value-commit")![0]![1] as AkazaChangeEventDetails).reason).toBe("pointer");
  });

  it("keeps Slider min/max, decimal multithumb gaps, cancellation and disabled behavior", async () => {
    const wrapper = mount(Slider, { props: {
      modelValue: [0.2, 0.5], min: 0, max: 0.7, step: 0.1, minStepsBetweenThumbs: 2,
      ariaLabels: ["Minimum", "Maximum"],
      onValueChange: (_value, details) => details.cancel(),
    } });
    cleanups.push(() => wrapper.unmount());
    const thumb = wrapper.get("[role='slider']");
    await thumb.trigger("keydown", { key: "End" });
    expect(wrapper.emitted("value-change")![0]![0]).toEqual([0.3, 0.5]);
    expect(thumb.attributes("aria-valuenow")).toBe("0.2");
    await wrapper.setProps({ disabled: true });
    await thumb.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("value-change")).toHaveLength(1);
  });

  it("passes the SDK slider pattern on Vue-owned single-thumb markup", async () => {
    vi.unstubAllGlobals();
    const wrapper = mount(defineComponent({
      components: { Slider },
      setup: () => ({ value: ref(50) }),
      template: `<Slider v-model="value" aria-label="Volume" />`,
    }), { attachTo: document.body });
    cleanups.push(() => wrapper.unmount());
    await checkPattern(wrapper.element as HTMLElement, "slider");
  });

  it("samples NumberField scrub proposals and retains no-movement commit and cancellation", async () => {
    const wrapper = mount(NumberField, { props: { modelValue: null, min: 0.1, step: 0.1, scrubLabel: "Amount" }, attachTo: document.body });
    cleanups.push(() => wrapper.unmount());
    const scrub = wrapper.get(".akaza-number-field-scrub-area").element;
    geometry(scrub);
    pointer(scrub, "pointerdown");
    pointer(scrub, "pointermove", 8);
    pointer(scrub, "pointermove", 16);
    await frame();
    expect(wrapper.emitted("value-change")?.map(args => args[0])).toEqual([0.3]);
    pointer(scrub, "pointerup", 16);
    await nextTick();
    expect(wrapper.emitted("value-commit")).toHaveLength(1);
    pointer(scrub, "pointerdown");
    pointer(scrub, "pointerup");
    await nextTick();
    expect(wrapper.emitted("value-commit")).toHaveLength(2);
    pointer(scrub, "pointerdown");
    pointer(scrub, "pointercancel");
    pointer(scrub, "pointerup");
    await nextTick();
    expect(wrapper.emitted("value-commit")).toHaveLength(2);
  });

  it("preserves NumberField off-grid native typing, null and form reset", async () => {
    const wrapper = mount(defineComponent({
      components: { NumberField },
      setup: () => ({ value: ref<number | null>(1) }),
      template: `<form><NumberField v-model="value" name="amount" :step="1" aria-label="Amount" /></form>`,
    }), { attachTo: document.body });
    cleanups.push(() => wrapper.unmount());
    const input = wrapper.get("input");
    await input.setValue("1.5");
    expect(new FormData(wrapper.element as HTMLFormElement).get("amount")).toBe("1.5");
    await input.trigger("keydown", { key: "ArrowUp" });
    expect((input.element as HTMLInputElement).value).toBe("3");
    await input.setValue("");
    expect((wrapper.vm as unknown as { value: number | null }).value).toBeNull();
    (wrapper.element as HTMLFormElement).reset();
    await nextTick();
    await nextTick();
    expect((input.element as HTMLInputElement).value).toBe("1");
  });

  it.each([ColorArea, ColorSlider])("samples color moves and retains pointer identity and cancellation: %s", async (Control) => {
    const wrapper = mount(Control, { props: { modelValue: "#ff0000", format: "hsl" }, attachTo: document.body });
    cleanups.push(() => wrapper.unmount());
    geometry(wrapper.element);
    geometry(wrapper.get(Control === ColorArea ? "canvas" : ".akaza-color-slider-track").element);
    pointer(wrapper.element, "pointerdown", 10);
    pointer(wrapper.element, "pointermove", 20);
    pointer(wrapper.element, "pointermove", 30);
    await frame();
    expect(wrapper.emitted("value-change")).toHaveLength(2);
    pointer(wrapper.element, "pointermove", 40, 99);
    pointer(wrapper.element, "pointerup", 40, 99);
    await frame();
    expect(wrapper.emitted("value-change")).toHaveLength(2);
    expect(wrapper.emitted("value-commit")).toBeUndefined();
    pointer(wrapper.element, "pointercancel", 30);
    pointer(wrapper.element, "pointerup", 30);
    await nextTick();
    expect(wrapper.emitted("value-commit")).toBeUndefined();
  });

  it("keeps color RTL endpoints, hue 360, readonly and partial drafts", async () => {
    const slider = mount(ColorSlider, { props: { modelValue: "hsl(120 100% 50%)", format: "hsl", colorSpace: "hsl", dir: "rtl" } });
    cleanups.push(() => slider.unmount());
    await slider.get("[type='range']").trigger("keydown", { key: "ArrowLeft" });
    expect(slider.emitted("value-change")![0]![0]).toBe("hsl(121 100% 50%)");
    await slider.get("[type='range']").trigger("keydown", { key: "End" });
    expect(slider.emitted("value-change")!.at(-1)![0]).toBe("hsl(360 100% 50%)");
    await slider.setProps({ readOnly: true });
    await slider.get("[type='range']").trigger("keydown", { key: "ArrowRight" });
    expect(slider.emitted("value-change")).toHaveLength(2);
    const field = mount(ColorField, { props: { modelValue: "#ff0000", channel: "hue", colorSpace: "hsl" } });
    cleanups.push(() => field.unmount());
    await field.get("[role='spinbutton']").setValue("-");
    expect(field.emitted("value-change")).toBeUndefined();
    expect((field.get("[role='spinbutton']").element as HTMLInputElement).value).toBe("-");
  });

  it("samples Sidebar proposals and retains right-side bounds and cancel policy", async () => {
    const wrapper = mount(Sidebar, { props: {
      mobile: false, resizable: true, side: "right", defaultSize: 240, minSize: 200, maxSize: 300,
      onSizeChange: (_value, details) => details.cancel(),
    }, attachTo: document.body });
    cleanups.push(() => wrapper.unmount());
    const handle = wrapper.get("[role='separator']");
    geometry(handle.element);
    pointer(handle.element, "pointerdown", 50);
    pointer(handle.element, "pointermove", 40);
    pointer(handle.element, "pointermove", -100);
    await frame();
    expect(wrapper.emitted("size-change")?.map(args => args[0])).toEqual([300]);
    expect(handle.attributes("aria-valuenow")).toBe("240");
  });

  it("retains Sidebar Control/Command shortcuts, Shift acceptance and editable-target exclusions", async () => {
    const wrapper = mount(Sidebar, { props: { mobile: false, keyboardShortcut: "b", collapsible: "icon" } });
    cleanups.push(() => wrapper.unmount());
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true, shiftKey: true }));
    await nextTick();
    expect(wrapper.attributes("data-akaza-state")).toBe("collapsed");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", metaKey: true }));
    await nextTick();
    expect(wrapper.attributes("data-akaza-state")).toBe("expanded");
    const input = document.createElement("input");
    document.body.append(input);
    cleanups.push(() => input.remove());
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true, bubbles: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true, altKey: true }));
    await nextTick();
    expect(wrapper.emitted("collapsed-change")).toHaveLength(2);
    expect((wrapper.emitted("collapsed-change")![0]![1] as AkazaChangeEventDetails).reason).toBe("shortcut");
  });

  it("retains Toast swipe events and its distance threshold with SDK frame timing", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "proof", title: "Proof", duration: 0 });
    const wrapper = mount(Toast, { attachTo: document.body, props: { manager, teleport: false, swipeThreshold: 50 } });
    cleanups.push(() => wrapper.unmount());
    const toast = wrapper.get(".akaza-toast").element;
    geometry(toast);
    pointer(toast, "pointerdown");
    pointer(toast, "pointermove", 20);
    pointer(toast, "pointermove", 49);
    await frame();
    expect(wrapper.emitted("swipe-move")).toHaveLength(1);
    pointer(toast, "pointerup", 49);
    await nextTick();
    expect(wrapper.emitted("swipe-cancel")).toHaveLength(1);
    expect(manager.toasts.value).toHaveLength(1);
    pointer(toast, "pointerdown");
    pointer(toast, "pointerup", 50);
    await nextTick();
    expect(wrapper.emitted("swipe-end")).toHaveLength(1);
    expect(manager.toasts.value).toHaveLength(0);
  });
});
