import type { ColorFormat as SdkColorFormat } from "@ui-sdk/core/color";
import type { ColorChannel, ColorFormat } from "../../src/composables/color";
import type { AkazaChangeEventDetails } from "../../src/types";
import { convertColor, formatColor, parseColor } from "@ui-sdk/core/color";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, effectScope, nextTick, ref } from "vue";
import { ColorField } from "../../src/components/color-field";
import { ColorPicker } from "../../src/components/color-picker";
import { COLOR_FORMATS, useColor } from "../../src/composables/color";

enableAutoUnmount(afterEach);
const scopes: ReturnType<typeof effectScope>[] = [];
afterEach(() => scopes.splice(0).forEach((scope) => scope.stop()));
function scopedColor(value: string, format: ColorFormat = "oklch") {
  const scope = effectScope();
  scopes.push(scope);
  return scope.run(() => useColor(ref(value), { format }))!;
}

const sdkFormats = {
  hex: "hex",
  hexa: "hex",
  rgb: "srgb",
  rgba: "srgb",
  hsl: "hsl",
  hsla: "hsl",
  hwb: "hwb",
  lab: "lab",
  lch: "lch",
  oklab: "oklab",
  oklch: "oklch",
  "display-p3": "display-p3",
  "a98-rgb": null,
  "prophoto-rgb": null,
  rec2020: null,
  "xyz-d50": "xyz-d50",
  "xyz-d65": "xyz-d65",
} satisfies Record<ColorFormat, SdkColorFormat | null>;

describe("batch22g beta.17 public SDK color capabilities", () => {
  it("covers every public Akaza format in the SDK support matrix", () => {
    expect(Object.keys(sdkFormats)).toEqual([...COLOR_FORMATS]);
  });

  it.each(COLOR_FORMATS)("checks %s parsing, conversion, serialization, and alpha", (format) => {
    const color = scopedColor("oklch(0.65 0.12 250 / 0.42)", format);
    const input = color.toString();
    expect(color.isValid.value).toBe(true);
    expect(scopedColor(input).isValid.value).toBe(true);
    const parsedInput = parseColor(input);
    const sdkFormat = sdkFormats[format];
    if (sdkFormat === null) {
      // These supported Akaza literals still lack public SDK spaces in beta.17.
      expect(parsedInput).toBeNull();
      expect(input).toMatch(new RegExp(`^color\\(${format} `));
      expect(scopedColor(input).getChannel("hsb", "alpha")).toBeCloseTo(42);
      return;
    }
    expect(parsedInput).not.toBeNull();
    expect(parsedInput!.alpha).toBeCloseTo(0.42, sdkFormat === "hex" ? 2 : 5);
    const source = parseColor("oklch(0.65 0.12 250 / 0.42)")!;
    const output = formatColor(source, sdkFormat);
    const parsed = parseColor(output)!;
    expect(parsed).not.toBeNull();
    expect(parsed.alpha).toBeCloseTo(0.42, sdkFormat === "hex" ? 2 : 5);
    for (const value of [parsedInput!, parsed]) {
      const restored = convertColor(value, "oklch");
      const tolerances = sdkFormat === "hex" ? [0.003, 0.003, 1] : [0.0002, 0.0002, 0.05];
      source.coords.forEach((channel, index) => {
        expect(restored.coords[index]).not.toBeNull();
        expect(Math.abs(restored.coords[index]! - channel!)).toBeLessThan(tolerances[index]!);
      });
    }
  });

  it("keeps explicit HSV drafts but leaves achromatic hue memory to its caller", () => {
    const black = { space: "hsv", coords: [360, 73, 0], alpha: 0.42 } as const;
    const color = { ...black, coords: [...black.coords] as [number, number, number] };
    expect(convertColor(color, "hsv")).toEqual(color);
    expect(formatColor(color, "hex")).toBe("#0000006b");
    expect(convertColor(parseColor("gray")!, "hsv").coords[0]).toBeNull();
    expect(parseColor("oklch(0.7 0.1 none)")?.coords[2]).toBeNull();
  });

  it("omits opaque alpha by default, so forced-alpha aliases still need an adapter", () => {
    const red = parseColor("red")!;
    expect(formatColor(red, "hex")).toBe("#ff0000");
    expect(formatColor(red, "srgb")).not.toContain("/");
    expect(formatColor(red, "hsl")).not.toContain("/");
  });
});

describe("batch21g Akaza public color contracts", () => {
  it.each(COLOR_FORMATS)(
    "round-trips %s as a CSS string without changing working state",
    (format) => {
      const color = scopedColor("oklch(0.65 0.12 250 / 0.42)");
      const before = color.value.value;
      const output = color.toString(format);
      expect(typeof output).toBe("string");
      expect(color.value.value).toBe(before);
      const restored = scopedColor(output);
      expect(restored.isValid.value).toBe(true);
      expect(restored.isEmpty.value).toBe(false);
      for (const channel of ["lightness", "a", "b"] as const) {
        const tolerance = channel === "lightness" ? 0.2 : 0.002;
        expect(
          Math.abs(restored.getChannel("oklab", channel) - color.getChannel("oklab", channel)),
        ).toBeLessThan(tolerance);
      }
      expect(restored.getChannel("hsb", "alpha")).toBeCloseTo(42, format.startsWith("hex") ? 0 : 4);
    },
  );

  it.each(["hexa", "rgba", "hsla"] as const)("forces opaque alpha for %s", (format) => {
    const color = scopedColor("red", format);
    expect(color.toString()).toMatch(format === "hexa" ? /^#[\da-f]{6}ff$/ : /\/\s*1\)$/);
    expect(color.getChannel("hsb", "alpha")).toBe(100);
  });

  it.each([
    "color(display-p3 1 0 0 / 0.42)",
    "lab(65 90 -80 / 0.42)",
    "lch(65 120 320 / 0.42)",
    "oklab(0.7 0.3 -0.2 / 0.42)",
    "oklch(0.7 0.3 145 / 0.42)",
  ])("keeps wide-gamut channels through HEX formatting: %s", async (input) => {
    const scope = effectScope();
    scopes.push(scope);
    const format = ref<ColorFormat>("oklch");
    const model = ref(input);
    const color = scope.run(() => useColor(model, { format }))!;
    const chroma = color.getChannel("oklch", "chroma");
    expect(color.isOutOfGamut.value).toBe(true);
    format.value = "hex";
    await nextTick();
    expect(model.value).toMatch(/^#[\da-f]{8}$/);
    expect(color.getChannel("oklch", "chroma")).toBeCloseTo(chroma, 10);
    format.value = "oklch";
    await nextTick();
    expect(color.getChannel("oklch", "chroma")).toBeCloseTo(chroma, 10);
    expect(color.getChannel("hsb", "alpha")).toBeCloseTo(42, 10);
  });

  it.each(["hsl", "hsb"] as const)(
    "keeps %s hue endpoints and saturation through black, gray, and alpha edits",
    (space) => {
      const color = scopedColor("red");
      const light = space === "hsb" ? "brightness" : "lightness";
      expect(color.setChannels(space, { hue: 360, saturation: 73, [light]: 0 })).toBe(true);
      color.setChannels(space, { alpha: 0 });
      expect(color.getChannel(space, "hue")).toBe(360);
      expect(color.getChannel(space, "saturation")).toBeCloseTo(73);
      color.setChannels(space, { saturation: 0, [light]: 50 });
      color.setChannels(space, { hue: 218 });
      color.setChannels(space, { saturation: 73, alpha: 42 });
      expect(color.getChannel(space, "hue")).toBe(218);
      expect(color.getChannel(space, "saturation")).toBeCloseTo(73);
      expect(color.getChannel(space, "alpha")).toBeCloseTo(42);
    },
  );

  it.each(["lab", "lch", "oklab", "oklch"] as const)(
    "edits %s in public channel units",
    (space) => {
      const color = scopedColor("red", space);
      const polar = space === "lch" || space === "oklch";
      const changes = polar
        ? { lightness: 65, chroma: space === "lch" ? 40 : 0.12, hue: 218, alpha: 42 }
        : {
            lightness: 65,
            a: space === "lab" ? -20 : -0.1,
            b: space === "lab" ? 30 : 0.1,
            alpha: 42,
          };
      expect(color.setChannels(space, changes)).toBe(true);
      for (const [channel, value] of Object.entries(changes)) {
        expect(color.getChannel(space, channel as ColorChannel)).toBeCloseTo(value, 8);
      }
    },
  );
});

describe("batch21g field and picker color output", () => {
  it.each([
    { name: "ColorField", component: ColorField },
    { name: "ColorPicker", component: ColorPicker },
  ])(
    "preserves drafts, cancellation, native output, and reset for $name",
    async ({ component }) => {
      const onChange = vi.fn((_value: string, details: AkazaChangeEventDetails) => {
        if (details.reason === "input") details.cancel();
      });
      const onCommit = vi.fn();
      const wrapper = mount(
        defineComponent({
          components: { Control: component },
          setup: () => ({ model: ref("color(display-p3 1 0 0 / 0.42)"), onChange, onCommit }),
          template:
            '<form><Control v-model="model" name="brand" format="display-p3" aria-label="Brand" @value-change="onChange" @value-commit="onCommit" /></form>',
        }),
        { attachTo: document.body },
      );
      const input = wrapper.get<HTMLInputElement>(".akaza-color-field-input");
      const form = wrapper.get<HTMLFormElement>("form");
      const initial = new FormData(form.element).get("brand");
      expect(initial).toMatch(/^color\(display-p3 /);
      await input.trigger("focus");
      for (const draft of ["oklch(", "lab(65", "color(display-p3"]) {
        await input.setValue(draft);
        expect(input.element.value).toBe(draft);
        expect(wrapper.vm.model).toBe("color(display-p3 1 0 0 / 0.42)");
      }
      expect(onChange).not.toHaveBeenCalled();
      await input.trigger("keydown", { key: "Enter" });
      await input.trigger("blur");
      expect(onCommit).not.toHaveBeenCalled();
      expect(form.element.checkValidity()).toBe(false);
      await input.trigger("keydown", { key: "Escape" });
      expect(input.element.checkValidity()).toBe(true);
      await input.setValue("lab(65 40 -30 / 0.25)");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith(
        expect.stringMatching(/^color\(display-p3 /),
        expect.objectContaining({ reason: "input" }),
      );
      expect(wrapper.vm.model).toBe("color(display-p3 1 0 0 / 0.42)");
      expect(input.element.value).toBe(initial);
      expect(new FormData(form.element).getAll("brand")).toEqual([initial]);
      onChange.mockImplementation(() => {});
      await input.setValue("lab(65 40 -30 / 0.25)");
      await input.trigger("keydown", { key: "Enter" });
      expect(typeof wrapper.vm.model).toBe("string");
      expect(wrapper.vm.model).toMatch(/^color\(display-p3 /);
      expect(new FormData(form.element).getAll("brand")).toEqual([wrapper.vm.model]);
      expect(scopedColor(wrapper.vm.model).getChannel("hsb", "alpha")).toBeCloseTo(25);
      expect(onCommit).toHaveBeenLastCalledWith(
        wrapper.vm.model,
        expect.objectContaining({ reason: "enter" }),
      );
      form.element.reset();
      await flushPromises();
      expect(new FormData(form.element).getAll("brand")).toEqual([initial]);
      expect(input.element.value).toBe(initial);
    },
  );

  it("keeps a picker's untouched P3 color natively valid", () => {
    const wrapper = mount(
      defineComponent({
        components: { ColorPicker },
        template:
          '<form><ColorPicker model-value="color(display-p3 1 0 0 / 0.42)" name="brand" /></form>',
      }),
    );
    const hue = wrapper.get<HTMLInputElement>('.akaza-color-slider-axis[aria-label="Hue"]');
    expect(hue.attributes("step")).toBe("any");
    expect(hue.element.valueAsNumber).toBe(
      scopedColor("color(display-p3 1 0 0 / 0.42)").getChannel("hsb", "hue"),
    );
    expect(Number.isInteger(hue.element.valueAsNumber)).toBe(false);
    expect(hue.element.validity.stepMismatch).toBe(false);
    expect(wrapper.get<HTMLFormElement>("form").element.checkValidity()).toBe(true);
    expect(wrapper.findComponent(ColorPicker).emitted("update:modelValue")).toBeUndefined();
  });
});
