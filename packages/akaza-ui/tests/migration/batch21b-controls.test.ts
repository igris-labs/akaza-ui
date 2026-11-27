import type { Component } from "vue";
import type { AkazaChangeEventDetails } from "@/types";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { ColorArea } from "@/components/color-area";
import { ColorSlider } from "@/components/color-slider";
import { NumberField } from "@/components/number-field";
import { Sidebar } from "@/components/sidebar";
import { Slider } from "@/components/slider";
import { geometry, pointer, pointerFrames } from "./batch21b-pointer-fixture";

const cases: Array<{
  name: string;
  component: Component;
  props: Record<string, unknown>;
  surface: string;
  input: string;
  initial: string;
  final: string;
  blocked: Record<string, unknown>;
}> = [
  { name: "Slider", component: Slider, props: { modelValue: 10, ariaLabel: "Volume" }, surface: ".akaza-slider", input: "[role='slider']", initial: "10", final: "80", blocked: { disabled: true } },
  { name: "NumberField", component: NumberField, props: { modelValue: 5, scrubLabel: "Amount", ariaLabel: "Amount" }, surface: ".akaza-number-field-scrub-area", input: "input", initial: "5", final: "13", blocked: { readonly: true } },
  { name: "ColorSlider", component: ColorSlider, props: { modelValue: "hsl(0 100% 50%)", format: "hsl", colorSpace: "hsl", ariaLabel: "Hue" }, surface: ".akaza-color-slider", input: "[type='range']", initial: "0", final: "288", blocked: { readOnly: true } },
  { name: "ColorArea", component: ColorArea, props: { modelValue: "hsl(0 100% 50%)", format: "hsl", colorSpace: "hsl", xChannel: "saturation", yChannel: "lightness", ariaLabel: "Color" }, surface: ".akaza-color-area", input: "[type='range']", initial: "100", final: "80", blocked: { disabled: true } },
  { name: "Sidebar", component: Sidebar, props: { mobile: false, resizable: true, defaultSize: 240, minSize: 200, maxSize: 400 }, surface: "[role='separator']", input: "[role='separator']", initial: "240", final: "310", blocked: { resizable: false } },
];
const cleanups: Array<() => void> = [];
let frame: () => Promise<void>;
beforeEach(() => {
  frame = pointerFrames();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => {
  cleanups.splice(0).reverse().forEach(cleanup => cleanup());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function fixture(config: typeof cases[number], extra: Record<string, unknown> = {}) {
  const proposals: Array<[unknown, AkazaChangeEventDetails]> = [];
  const changeKey = config.name === "Sidebar" ? "onSizeChange" : "onValueChange";
  const commit = vi.fn();
  const wrapper = mount(config.component, {
    props: {
      ...config.props,
      ...extra,
      [changeKey]: (value: unknown, details: AkazaChangeEventDetails) => {
        proposals.push([value, details]);
        (extra[changeKey] as ((value: unknown, details: AkazaChangeEventDetails) => void) | undefined)?.(value, details);
      },
      onValueCommit: commit,
    },
    attachTo: document.body,
  });
  cleanups.push(() => wrapper.unmount());
  const surface = geometry(wrapper.get(config.surface).element);
  if (config.name === "ColorSlider") geometry(wrapper.get(".akaza-color-slider-track").element);
  if (config.name === "ColorArea") geometry(wrapper.get("canvas").element);
  const read = () => {
    const element = wrapper.get(config.input).element;
    return element instanceof HTMLInputElement ? element.value : element.getAttribute("aria-valuenow");
  };
  const changes = () => proposals;
  return { wrapper, surface, read, changes, commit };
}

describe.each(cases)("batch21b $name pointer lifecycle", (config) => {
  it("samples frames, tracks outside the surface and preserves the final release position", async () => {
    const f = fixture(config);
    const down = pointer(f.surface, "pointerdown", { clientX: 10, clientY: 20, pointerType: "touch" });
    expect(f.surface.setPointerCapture).toHaveBeenCalledWith(7);
    const downCount = f.changes().length;
    pointer(document, "pointermove", { clientX: 20, clientY: 20 });
    const move = pointer(document, "pointermove", { clientX: 30, clientY: 20 });
    expect(f.changes()).toHaveLength(downCount);
    await frame();
    expect(f.changes()).toHaveLength(downCount + 1);
    expect((f.changes().at(-1)![1] as AkazaChangeEventDetails).event).toBe(move);
    pointer(document, "pointermove", { clientX: 40, clientY: 20 });
    const up = pointer(document, "pointerup", { clientX: 80, clientY: 20 });
    await nextTick();
    expect(f.read()).toBe(config.final);
    expect((f.changes().at(-1)![1] as AkazaChangeEventDetails).event).toBe(up);
    expect(f.surface.hasPointerCapture(7)).toBe(false);
    if (config.name !== "Sidebar") {
      expect(f.wrapper.emitted("value-commit")).toHaveLength(1);
      expect(f.wrapper.emitted("value-commit")![0]![1]).toMatchObject({ event: up, reason: config.name === "NumberField" ? "scrub" : "pointer" });
    }
    const finalCount = f.changes().length;
    await frame();
    expect(f.changes()).toHaveLength(finalCount);
    if (config.name.startsWith("Color")) expect(down.defaultPrevented).toBe(true);
  });

  it.each(["pointercancel", "lostpointercapture"])("ends %s once, ignores other pointers and does not commit", async (type) => {
    const f = fixture(config);
    pointer(f.surface, "pointerdown", { clientX: 10, clientY: 20 });
    const count = f.changes().length;
    pointer(f.surface, "pointerdown", { pointerId: 8, clientX: 99 });
    pointer(document, "pointermove", { pointerId: 8, clientX: 99 });
    pointer(document, "pointerup", { pointerId: 8, clientX: 99 });
    pointer(f.surface, "lostpointercapture", { pointerId: 8 });
    await frame();
    expect(f.changes()).toHaveLength(count);
    expect(f.surface.hasPointerCapture(7)).toBe(true);
    pointer(f.surface, type, { clientX: 90 });
    pointer(document, "pointerup", { clientX: 90 });
    await frame();
    expect(f.changes()).toHaveLength(count);
    expect(f.commit).not.toHaveBeenCalled();
    expect(f.surface.hasPointerCapture(7)).toBe(false);
  });

  it("releases an unmoved press and commits once where applicable", async () => {
    const f = fixture(config);
    pointer(f.surface, "pointerdown", { clientX: 10, clientY: 20 });
    const count = f.changes().length;
    pointer(document, "pointerup", { clientX: 10, clientY: 20 });
    await frame();
    expect(f.changes()).toHaveLength(count);
    if (config.name !== "Sidebar") expect(f.wrapper.emitted("value-commit")).toHaveLength(1);
    expect(f.surface.hasPointerCapture(7)).toBe(false);
  });

  it.each(["blocked", "unmount"])("drops queued samples and releases capture on %s", async (action) => {
    const f = fixture(config);
    pointer(f.surface, "pointerdown", { clientX: 10, clientY: 20 });
    const count = f.changes().length;
    pointer(document, "pointermove", { clientX: 40, clientY: 20 });
    if (action === "blocked") await f.wrapper.setProps(config.blocked);
    else f.wrapper.unmount();
    pointer(document, "pointerup", { clientX: 80, clientY: 20 });
    await frame();
    expect(f.changes()).toHaveLength(count);
    expect(f.commit).not.toHaveBeenCalled();
    expect(f.surface.hasPointerCapture(7)).toBe(false);
  });

  it("keeps canceled proposals out of the model and commits only the current value", async () => {
    const f = fixture(config, {
      onValueChange: (_value: unknown, details: AkazaChangeEventDetails) => details.cancel(),
      onSizeChange: (_value: unknown, details: AkazaChangeEventDetails) => details.cancel(),
    });
    pointer(f.surface, "pointerdown", { clientX: 10, clientY: 20 });
    pointer(document, "pointermove", { clientX: 40, clientY: 20 });
    pointer(document, "pointerup", { clientX: 80, clientY: 20 });
    await frame();
    expect(f.changes().length).toBeGreaterThan(0);
    expect(f.read()).toBe(config.initial);
    if (config.name !== "Sidebar") expect(f.wrapper.emitted("value-commit")![0]![0]).toBe(config.props.modelValue);
    else expect(f.changes().every(args => (args[1] as { previousSize: number }).previousSize === 240)).toBe(true);
  });

  it("commits the accepted controlled model when the parent rejects updates", async () => {
    const f = fixture(config, config.name === "Sidebar" ? { size: 240, "onUpdate:size": () => {} } : { "onUpdate:modelValue": () => {} });
    pointer(f.surface, "pointerdown", { clientX: 10, clientY: 20 });
    pointer(document, "pointerup", { clientX: 80, clientY: 20 });
    await frame();
    expect(f.read()).toBe(config.initial);
    if (config.name !== "Sidebar") expect(f.wrapper.emitted("value-commit")![0]![0]).toBe(config.props.modelValue);
    else expect(f.read()).toBe(config.initial);
  });

  if (config.name.startsWith("Color")) {
    it("retains the selected commit format after a rejected pointer proposal", async () => {
      const f = fixture(config, { modelValue: "#ff0000", "onUpdate:modelValue": () => {} });
      pointer(f.surface, "pointerdown", { clientX: 10, clientY: 20 });
      pointer(document, "pointerup", { clientX: 80, clientY: 20 });
      await frame();
      expect(f.commit).toHaveBeenCalledWith("hsl(0 100% 50%)", expect.objectContaining({ reason: "pointer" }));
      expect(f.wrapper.emitted("update:modelValue")).toHaveLength(f.changes().length);
    });
  }

  if (config.name === "ColorSlider") {
    it("allows fractional native values while retaining custom gesture, key and input steps", async () => {
      const f = fixture(config, { modelValue: "color(display-p3 1 0 0 / 0.42)", format: "display-p3", step: 10 });
      const axis = f.wrapper.get<HTMLInputElement>("[type='range']");
      expect(axis.attributes("step")).toBe("any");
      expect(Number.isInteger(axis.element.valueAsNumber)).toBe(false);
      expect(axis.element.validity.stepMismatch).toBe(false);
      expect(f.changes()).toHaveLength(0);
      await axis.trigger("keydown", { key: "Home" });
      await axis.trigger("keydown", { key: "ArrowRight" });
      expect(axis.element.valueAsNumber).toBe(10);
      await axis.setValue("26");
      expect(axis.element.valueAsNumber).toBe(30);
      pointer(f.surface, "pointerdown", { clientX: 10, clientY: 20 });
      pointer(document, "pointerup", { clientX: 17, clientY: 20 });
      await frame();
      expect(axis.element.valueAsNumber).toBe(60);
      expect(axis.element.checkValidity()).toBe(true);
    });
  }
});
