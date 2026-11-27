import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ColorAreaSection from "../../../../playground/src/sections/color-area/ColorAreaSection.vue";
import ColorSliderSection from "../../../../playground/src/sections/color-slider/ColorSliderSection.vue";
import NumberFieldSection from "../../../../playground/src/sections/number-field/NumberFieldSection.vue";
import SidebarSection from "../../../../playground/src/sections/sidebar/SidebarSection.vue";
import SliderSection from "../../../../playground/src/sections/slider/SliderSection.vue";
import { geometry, pointer, pointerFrames } from "./batch21b-pointer-fixture";

const examples: Array<{ name: string; component: Component; selector: string; geometry?: string }> = [
  { name: "Slider", component: SliderSection, selector: ".akaza-slider" },
  { name: "NumberField", component: NumberFieldSection, selector: ".akaza-number-field-scrub-area" },
  { name: "ColorSlider", component: ColorSliderSection, selector: ".akaza-color-slider", geometry: ".akaza-color-slider-track" },
  { name: "ColorArea", component: ColorAreaSection, selector: ".akaza-color-area", geometry: "canvas" },
  { name: "Sidebar", component: SidebarSection, selector: ".akaza-sidebar-resize-handle" },
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

describe.each(examples)("batch21b $name playground", (example) => {
  it("shows the final pointerup event through the real example wiring", async () => {
    const wrapper = mount(example.component, { attachTo: document.body });
    cleanups.push(() => wrapper.unmount());
    const surface = geometry(wrapper.get(example.selector).element);
    if (example.geometry) geometry(wrapper.get(example.geometry).element);
    pointer(surface, "pointerdown", { clientX: 10, clientY: 20 });
    pointer(document, "pointermove", { clientX: 30, clientY: 20 });
    await frame();
    pointer(document, "pointerup", { clientX: 80, clientY: 20 });
    await frame();
    expect(wrapper.text()).toContain("event: pointerup");
    expect(surface.hasPointerCapture(7)).toBe(false);
  });
});
