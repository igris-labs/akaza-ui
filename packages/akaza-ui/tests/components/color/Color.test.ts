import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  Field,
} from "../../../src";

enableAutoUnmount(afterEach);

describe("color primitives", () => {
  it.each([ColorArea, ColorSlider])("leaves thumb backgrounds under consumer control", (component) => {
    const wrapper = mount(component, { props: { modelValue: "#56d799", ui: { thumb: "bg-white" } } });
    const thumb = wrapper.get<HTMLElement>('[aria-hidden="true"][style*="--akaza-color"]');
    expect(thumb.classes()).toContain("bg-white");
    expect(thumb.element.style.backgroundColor).toBe("");
    expect(thumb.element.style.getPropertyValue("--akaza-color")).toMatch(/^oklch\(/);
  });
  it("retains partial field drafts and submits normalized colors", async () => {
    const wrapper = mount(
      defineComponent({
        components: { ColorField, Field },
        setup: () => ({ value: ref("red") }),
        template:
          '<form><Field name="brand" label="Brand"><ColorField v-model="value" format="oklch" /></Field></form>',
      }),
      { attachTo: document.body },
    );
    const input = wrapper.get<HTMLInputElement>(".akaza-color-field-input");
    await input.trigger("focus");
    await input.setValue("#");
    expect(input.element.value).toBe("#");
    expect(wrapper.vm.value).toBe("red");
    await input.trigger("blur");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.element.checkValidity()).toBe(false);
    await input.setValue("rgb(10 20 30 / 0.5)");
    await input.trigger("blur");
    expect(input.element.checkValidity()).toBe(true);
    expect(new FormData(wrapper.get("form").element).get("brand")).toMatch(/^oklch\(/);
    expect(wrapper.get("label").attributes("for")).toBe(input.attributes("id"));
  });
  it("supports channel keys, cancellation, and draft Escape", async () => {
    const field = mount(ColorField, {
      props: { modelValue: "red", channel: "hue", colorSpace: "hsb", format: "hsl" },
    });
    const input = field.get("input[type=text]");
    await input.trigger("keydown", { key: "End" });
    expect(input.attributes("aria-valuenow")).toBe("360");
    await input.setValue("-");
    await input.trigger("keydown", { key: "Escape" });
    expect((input.element as HTMLInputElement).value).toBe("360");
    const canceled = mount(ColorSlider, {
      props: { modelValue: "red", onValueChange: (_value, details) => details.cancel() },
    });
    await canceled.get("input[type=range]").trigger("keydown", { key: "End" });
    expect(canceled.get("input[type=range]").element.value).toBe("0");
  });
  it("shares HSL channels between an area, lightness, and opacity through achromatic values", async () => {
    const wrapper = mount(defineComponent({
      components: { ColorArea, ColorPicker, ColorSlider },
      setup: () => ({ color: ref("#56d799") }),
      template: '<ColorPicker v-model="color"><ColorArea color-space="hsl" x-channel="hue" y-channel="saturation" /><ColorSlider channel="lightness" color-space="hsl" aria-label="Lightness" /><ColorSlider channel="alpha" color-space="hsl" aria-label="Opacity" /></ColorPicker>',
    }));
    const axes = wrapper.findAll<HTMLInputElement>(".akaza-color-area input[type=range]");
    const hue = axes[0]!.element.value;
    const saturation = axes[1]!.element.value;
    const lightness = wrapper.get<HTMLInputElement>('[aria-label="Lightness"]');
    const opacity = wrapper.get<HTMLInputElement>('[aria-label="Opacity"]');
    await lightness.trigger("keydown", { key: "Home" });
    expect(wrapper.vm.color).toBe("#000000");
    await lightness.trigger("keydown", { key: "End" });
    expect(wrapper.vm.color).toBe("#ffffff");
    await opacity.trigger("keydown", { key: "Home" });
    expect(wrapper.vm.color).toBe("#ffffff00");
    await lightness.setValue("50");
    await opacity.trigger("keydown", { key: "End" });
    expect(axes[0]!.element.value).toBe(hue);
    expect(axes[1]!.element.value).toBe(saturation);
    expect(wrapper.vm.color).not.toBe("#808080");
  });
  it("exposes two named area axes with keyboard and readonly-safe Tab navigation", async () => {
    const wrapper = mount(ColorArea, {
      props: { modelValue: "red", ariaLabel: "Brand", format: "hsl", dir: "rtl" },
    });
    const axes = wrapper.findAll<HTMLInputElement>("input[type=range]");
    expect(axes).toHaveLength(2);
    expect(axes[0]!.attributes("aria-label")).toBe("Brand Saturation");
    await axes[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(Number(axes[0]!.element.value)).toBe(99);
    await axes[1]!.trigger("keydown", { key: "Home" });
    expect(axes[1]!.element.value).toBe("0");
    await wrapper.setProps({ readOnly: true });
    const tab = new KeyboardEvent("keydown", { key: "Tab", cancelable: true, bubbles: true });
    axes[0]!.element.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    await axes[0]!.trigger("keydown", { key: "Home" });
    expect(axes[0]!.element.value).toBe("99");
  });
  it("shares full precision across the flat picker's children and serializes one field", async () => {
    const wrapper = mount(
      defineComponent({
        components: { ColorPicker, Field },
        setup: () => ({ value: ref("#000000") }),
        template:
          '<form><Field label="Brand" name="brand"><ColorPicker v-model="value" format="oklch" /></Field><button type="reset">Reset</button></form>',
      }),
      { attachTo: document.body },
    );
    const hue = wrapper.get<HTMLInputElement>('.akaza-color-slider-axis[aria-label="Hue"]');
    await hue.trigger("keydown", { key: "End" });
    const axes = wrapper.findAll<HTMLInputElement>(".akaza-color-area input[type=range]");
    await axes[1]!.trigger("keydown", { key: "End" });
    expect(hue.element.value).toBe("360");
    expect(new FormData(wrapper.get("form").element).getAll("brand")).toHaveLength(1);
    expect(wrapper.findAll("[id]").map((item) => item.attributes("id")).length).toBe(
      new Set(wrapper.findAll("[id]").map((item) => item.attributes("id"))).size,
    );
    (wrapper.get("form").element as HTMLFormElement).reset();
    await flushPromises();
    expect(wrapper.vm.value).toMatch(/^oklch\(0 /);
  });
  it("provides single/multiple semantic palette selection and skips disabled colors", async () => {
    const wrapper = mount(ColorSwatchPicker, {
      props: {
        modelValue: [],
        multiple: true,
        items: ["red", { value: "blue", label: "Blue", disabled: true }, "green"],
        format: "oklch",
        ariaLabel: "Palette",
      },
    });
    const options = wrapper.findAll('[role="option"]');
    await options[0]!.trigger("click");
    await options[2]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")!.at(-1)![0]).toHaveLength(2);
    await options[1]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")!.at(-1)![0]).toHaveLength(2);
    expect(options[1]!.attributes("aria-disabled")).toBe("true");
  });
  it("clears invalid drafts on reset even when the selected color did not change", async () => {
    const wrapper = mount(defineComponent({
      components: { ColorField },
      setup: () => ({ color: ref("red") }),
      template: '<form><ColorField v-model="color" name="brand" aria-label="Brand" /><button type="reset">Reset</button></form>',
    }), { attachTo: document.body });
    const input = wrapper.get<HTMLInputElement>("input[type=text]");
    await input.setValue("#");
    await input.trigger("blur");
    expect(input.element.checkValidity()).toBe(false);
    (wrapper.get("form").element as HTMLFormElement).reset();
    await flushPromises();
    expect(input.element.value).toBe("#ff0000");
    expect(input.element.checkValidity()).toBe(true);
    expect(input.attributes("data-akaza-touched")).toBeUndefined();
  });
  it("keeps empty required channels empty and validates them natively", async () => {
    const wrapper = mount(ColorField, { props: { channel: "hue", required: true, ariaLabel: "Hue" } });
    const input = wrapper.get<HTMLInputElement>("input[type=text]");
    expect(input.element.value).toBe("");
    expect(input.element.checkValidity()).toBe(false);
    await input.setValue("120");
    expect(input.element.checkValidity()).toBe(true);
    await input.setValue("");
    expect(input.element.checkValidity()).toBe(false);
    expect(wrapper.emitted("update:modelValue")!.at(-1)![0]).toBe("");
  });
  it("keeps swatch markup unstyled and rejects unresolvable colors", () => {
    const wrapper = mount(ColorSwatch, {
      props: { color: "url(bad)", ariaLabel: "Brand" },
      attrs: { class: "custom" },
    });
    expect(wrapper.attributes("data-akaza-empty")).toBe("true");
    expect(wrapper.attributes("class")).toContain("custom");
    expect(wrapper.attributes("style")).not.toContain("url");
  });
});
