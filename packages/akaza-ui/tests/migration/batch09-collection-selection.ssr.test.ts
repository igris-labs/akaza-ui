// @vitest-environment node
import { expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { CheckboxGroup } from "@/components/checkbox-group";
import { Combobox } from "@/components/combobox";
import { Listbox } from "@/components/listbox";
import { Select } from "@/components/select";

it("batch 09 selection renders isolated deterministic native forms without browser globals", async () => {
  expect(typeof document).toBe("undefined");
  const render = (id: number) => renderToString(createSSRApp({
    render: () => h("form", [
      h(Listbox, { options: [{ value: { id: 1 }, label: "One" }, { value: { id: 2 }, label: "Two" }], modelValue: [{ id }], multiple: true, by: "id", name: "list", ariaLabel: "Objects" }),
      h(CheckboxGroup, { options: [{ value: 1, label: "Number" }, { value: "1", label: "String" }], modelValue: [id], name: "check", legend: "Check" }),
      h(Select, { options: [{ value: "a", label: "Alpha" }], modelValue: "a", name: "select", ariaLabel: "Select" }),
      h(Combobox, { options: [{ value: id, label: "Number" }], modelValue: id, name: "combo", ariaLabel: "Combo" }),
    ]),
  }));
  const first = await render(1);
  const second = await render(2);
  expect(await render(1)).toBe(first);
  expect(second).not.toBe(first);
  expect(first).toContain('name="list" value="{&quot;id&quot;:1}"');
  expect(first).toContain('name="combo" value="1"');
  expect(first).toContain('data-slot="akaza-select-popup-trigger"');
  expect(first).not.toContain("akaza-selection-group");
});
