import { describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { COLOR_FORMATS, useColor } from "../../src/composables/color";
import { colorEquals, parseColor } from "../../src/composables/color/engine";

describe("color state", () => {
  it("returns independent channel metadata and rejects unsupported channel pairs", () => {
    const scope = effectScope();
    scope.run(() => {
      const color = useColor();
      const hue = color.getChannelInfo("hsb", "hue")!;
      expect(hue).toMatchObject({ min: 0, max: 360 });
      hue.max = 10;
      expect(color.getChannelInfo("hsb", "hue")?.max).toBe(360);
      expect(color.getChannelInfo("rgb", "chroma")).toBeNull();
    });
    scope.stop();
  });
  it.each(COLOR_FORMATS)("serializes %s as a parseable color with alpha", (format) => {
    const scope = effectScope();
    scope.run(() => {
      const value = ref("rgb(230 40 75 / 0.42)");
      const color = useColor(value, { format });
      expect(parseColor(color.value.value)).not.toBeNull();
      expect(color.getChannel("hsb", "alpha")).toBeCloseTo(42, 4);
      expect(parseColor(color.value.value)?.alpha).toBeCloseTo(
        0.42,
        format.startsWith("hex") ? 2 : 5,
      );
      expect(color.setValue("rebeccapurple")).toBe(true);
      expect(value.value).toBe(color.value.value);
    });
    scope.stop();
  });
  it("keeps hue and saturation through black and format changes", async () => {
    const scope = effectScope();
    const model = ref("#ff0000");
    const format = ref<"hex" | "oklch">("hex");
    const color = scope.run(() => useColor(model, { format }))!;
    color.setChannels("hsb", { hue: 218, saturation: 73, brightness: 0 });
    expect(model.value).toBe("#000000");
    color.setChannels("hsb", { hue: 145 });
    expect(color.getChannel("hsb", "hue")).toBe(145);
    expect(color.getChannel("hsb", "saturation")).toBe(73);
    format.value = "oklch";
    await nextTick();
    color.setChannels("hsb", { brightness: 80 });
    expect(color.getChannel("hsb", "hue")).toBeCloseTo(145);
    expect(color.getChannel("hsb", "saturation")).toBeCloseTo(73);
    expect(model.value).toMatch(/^oklch\(/);
    scope.stop();
  });
  it("preserves wide gamut internally when formatting to HEX and back", async () => {
    const scope = effectScope();
    const format = ref<"hex" | "oklch">("oklch");
    const model = ref("oklch(0.7 0.3 145 / 0.5)");
    const color = scope.run(() => useColor(model, { format }))!;
    const chroma = color.getChannel("oklch", "chroma");
    expect(color.isOutOfGamut.value).toBe(true);
    format.value = "hex";
    await nextTick();
    expect(model.value).toMatch(/^#[\da-f]{8}$/);
    expect(color.getChannel("oklch", "chroma")).toBeCloseTo(chroma, 10);
    format.value = "oklch";
    await nextTick();
    expect(parseColor(model.value)).toMatchObject({ mode: "oklch", c: 0.3, alpha: 0.5 });
    scope.stop();
  });
  it("rejects unresolved or malicious CSS without changing the last valid value", () => {
    const scope = effectScope();
    scope.run(() => {
      const value = ref("#336699");
      const color = useColor(value);
      for (const invalid of [
        "#",
        "oklch(",
        "var(--brand)",
        "currentColor",
        "url(javascript:alert(1))",
        "rgb(NaN 0 0)",
      ]) {
        expect(color.setValue(invalid)).toBe(false);
        expect(value.value).toBe("#336699");
      }
      expect(color.setValue("transparent")).toBe(true);
      expect(color.isEmpty.value).toBe(false);
      expect(color.getChannel("hsb", "alpha")).toBe(0);
      expect(color.setValue("")).toBe(true);
      expect(color.isEmpty.value).toBe(true);
    });
    scope.stop();
  });
  it("honors canceled updates, external replacements, and commit reasons", () => {
    const scope = effectScope();
    scope.run(() => {
      const model = ref("red");
      const onCommit = vi.fn();
      const color = useColor(model, { onChange: (_, details) => details.cancel(), onCommit });
      expect(color.setChannels("hsb", { hue: 120 }, "keyboard")).toBe(false);
      expect(model.value).toBe("red");
      expect(color.getChannel("hsb", "hue")).toBe(0);
      model.value = "blue";
      expect(color.getChannel("hsb", "hue")).toBeCloseTo(240);
      color.commit("keyboard");
      expect(onCommit).toHaveBeenCalledWith(
        "#0000ff",
        expect.objectContaining({ reason: "keyboard" }),
      );
      expect(colorEquals("red", "#ff0000")).toBe(true);
      expect(colorEquals("transparent", "#ff0000")).toBe(false);
    });
    scope.stop();
  });
});
