// @vitest-environment node
import { expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { ColorSwatchPicker, Listbox } from "@/index";

it("renders isolated Listbox/ColorSwatchPicker data and virtual windows without browser globals", async () => {
  const render = (value: number) => renderToString(createSSRApp({
    render: () => h("form", [
      h(Listbox, { options: [{ value: 1, label: "One" }, { value: 2, label: "Two" }], modelValue: value, name: "choice", ariaLabel: "Choice" }),
      h(Listbox, { options: Array.from({ length: 1000 }, (_, index) => ({ value: index, label: `Result ${index + 1}` })), modelValue: 999, virtualize: true, name: "virtual", ariaLabel: "Results" }),
      h(ColorSwatchPicker, { items: ["red", "lime"], modelValue: "#ff0000", name: "color", format: "hsl", ariaLabel: "Palette" }),
    ]),
  }));
  const first = await render(1);
  const second = await render(2);
  expect(await render(1)).toBe(first);
  expect(first).toContain('name="choice" value="1"');
  expect(second).toContain('name="choice" value="2"');
  expect(first).toContain('name="virtual" value="999"');
  expect(first).not.toContain("aria-activedescendant=");
  expect(first).not.toContain("data-slot");
  expect((first.match(/role="option"/g) ?? []).length).toBeLessThan(30);
});
