// @vitest-environment node
import { expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { ColorArea } from "@/components/color-area";
import { ColorField } from "@/components/color-field";
import { ColorSlider } from "@/components/color-slider";
import { NumberField } from "@/components/number-field";
import { Sidebar } from "@/components/sidebar";
import { Slider } from "@/components/slider";

it("keeps deterministic numeric/color/native-input SSR without DOM globals or SDK attrs", async () => {
  expect(typeof document).toBe("undefined");
  const render = () => renderToString(createSSRApp({
    render: () => h("form", [
      h(Slider, { modelValue: [2e-7, 8e-7], min: 0, max: 1e-6, step: 1e-7, name: "range", ariaLabels: ["Start", "End"] }),
      h(NumberField, { modelValue: null, name: "amount", scrubLabel: "Amount" }),
      h(ColorArea, { modelValue: "#3b82f6", colorSpace: "oklch", xChannel: "chroma", yChannel: "lightness" }),
      h(ColorSlider, { modelValue: "#3b82f6", colorSpace: "oklch", channel: "chroma", dir: "rtl" }),
      h(ColorField, { modelValue: "color(display-p3 1 0 0)", format: "display-p3", name: "color" }),
      h(Sidebar, { mobile: false, resizable: true, defaultSize: 999, maxSize: 300 }),
    ]),
  }));
  const html = await render();
  expect(await render()).toBe(html);
  expect(html).toContain('value="0.188015"');
  expect(html).toContain('name="range" value="2e-7"');
  expect(html).toMatch(/name="amount" value(?:=""|\s)/);
  expect(html).toContain('aria-valuenow="300"');
  expect(html).toContain("color(display-p3 1 0 0)");
  expect(html).not.toMatch(/data-slot|NaN|data-ui-sdk/);
});
