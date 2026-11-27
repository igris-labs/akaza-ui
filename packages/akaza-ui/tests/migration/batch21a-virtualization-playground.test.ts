import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import ListboxSection from "../../../../playground/src/sections/listbox/ListboxSection.vue";
import TreeSection from "../../../../playground/src/sections/tree/TreeSection.vue";

it.each(["Listbox", "Tree"] as const)("wires %s virtualization and overscan playground controls without losing selection", async (kind) => {
  const wrapper = kind === "Listbox" ? mount(ListboxSection) : mount(TreeSection);
  try {
    const list = wrapper.get(kind === "Listbox"
      ? '[role="listbox"][aria-label="Large result set"]'
      : '[role="tree"][aria-label="Virtualized results"]');
    const rowSelector = kind === "Listbox" ? '[role="option"]' : '[role="treeitem"]';
    const toggle = wrapper.get(`input[aria-label="Virtualize ${kind} results"]`);
    const scan = wrapper.get(`input[aria-label="${kind} overscan"]`);
    const initialCount = list.findAll(rowSelector).length;
    expect(initialCount).toBeGreaterThan(0);
    expect(initialCount).toBeLessThanOrEqual(20);
    await scan.setValue(0);
    expect(list.findAll(rowSelector).length).toBeGreaterThan(0);
    expect(list.findAll(rowSelector).length).toBeLessThan(initialCount);
    await toggle.setValue(false);
    expect(list.findAll(rowSelector)).toHaveLength(1000);
    const selectedId = list.get('[aria-selected="true"]').attributes("id");
    await toggle.setValue(true);
    expect(list.findAll(rowSelector).length).toBeLessThanOrEqual(20);
    await toggle.setValue(false);
    expect(list.get('[aria-selected="true"]').attributes("id")).toBe(selectedId);
  } finally {
    wrapper.unmount();
  }
});
