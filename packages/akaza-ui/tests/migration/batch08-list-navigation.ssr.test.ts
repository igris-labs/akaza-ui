// @vitest-environment node
import { expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Combobox } from "@/components/combobox";
import { Select } from "@/components/select";

it("batch 08 renders isolated initially open navigation without browser globals", async () => {
  expect(typeof document).toBe("undefined");
  const render = (value: string) => renderToString(createSSRApp({
    render: () => h("form", [
      h(Select, { options: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }], modelValue: value, open: true, name: "select", ariaLabel: "Select" }),
      h(Combobox, { options: [{ value: 1, label: "One" }, { value: 2, label: "Two" }], modelValue: 2, open: true, name: "combo", ariaLabel: "Combobox" }),
    ]),
  }));
  const first = await render("a");
  const second = await render("b");
  expect(await render("a")).toBe(first);
  expect(first).toContain('value="a" selected');
  expect(second).toContain('value="b" selected');
  expect(first).toContain('name="combo" value="2"');
  expect((first.match(/aria-activedescendant=/g) ?? [])).toHaveLength(2);
  expect(first).toContain('data-slot="akaza-select-popup-content"');
  expect(first).toContain('data-slot="akaza-combobox-popup-content"');
  expect(first).not.toContain("akaza-list-navigation");
});
