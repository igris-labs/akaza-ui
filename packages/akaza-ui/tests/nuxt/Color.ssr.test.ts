import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
// @vitest-environment node
import { renderToString } from "vue/server-renderer";
import { ColorArea, ColorPicker, ColorSlider, ColorSwatch } from "../../src";

describe("color SSR", () => {
  it("uses stable precision for serialized channel values and thumb positions", async () => {
    const html = await renderToString(createSSRApp({
      render: () => h("div", [
        h(ColorArea, { modelValue: "#3b82f6", colorSpace: "oklch", xChannel: "chroma", yChannel: "lightness" }),
        h(ColorSlider, { modelValue: "#3b82f6", colorSpace: "oklch", channel: "chroma" }),
      ]),
    }));
    expect(html).toContain('value="0.188015"');
    expect(html).toContain("left:47.003684%");
    expect(html).not.toContain("0.188014734");
  });
  it("renders named controls and wide-gamut previews without browser globals", async () => {
    const html = await renderToString(createSSRApp({ render: () => h("div", [h(ColorPicker, { modelValue: "oklch(0.7 0.3 145 / 0.5)", format: "oklch", name: "brand", ariaLabel: "Brand" }), h(ColorSwatch, { color: "color(display-p3 1 0 0)" })]) }));
    expect(html).toContain("oklch(");
    expect(html).toContain('name="brand"');
    expect(html).toContain('aria-label="Hue"');
    expect(html).not.toContain("NaN");
  });
});
