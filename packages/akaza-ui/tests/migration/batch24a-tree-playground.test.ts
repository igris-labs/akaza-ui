import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { nextTick } from "vue";
import TreeSection from "../../../../playground/src/sections/tree/TreeSection.vue";

it("wires Tree demo focus cancellation, replacement ranges, and controlled refusal", async () => {
  const wrapper = mount(TreeSection, { attachTo: document.body });
  try {
    const tree = wrapper.get('[role="tree"][aria-label="Typed key selection"]');
    const rows = tree.findAll<HTMLElement>('[role="treeitem"]');
    expect(rows.map(row => row.text())).toEqual(["Numeric key: 1", "String key: 1", "Range end"]);
    await wrapper.get('input[type="checkbox"]').setValue(false);
    rows[0]!.element.focus();
    await nextTick();
    await wrapper.get('[aria-label="Cancel Tree focus changes"]').setValue(true);
    await rows[0]!.trigger("keydown", { key: "End", shiftKey: true });
    expect(document.activeElement).toBe(rows[0]!.element);
    expect(rows.map(row => row.attributes("aria-selected"))).toEqual(["true", "false", "false"]);
    expect(wrapper.text()).toContain('Canceled focus: "end"');
    await wrapper.get('[aria-label="Cancel Tree focus changes"]').setValue(false);
    await wrapper.get('[aria-label="Refuse Tree selection updates"]').setValue(true);
    await rows[0]!.trigger("keydown", { key: "End", shiftKey: true });
    expect(document.activeElement).toBe(rows[2]!.element);
    expect(rows.map(row => row.attributes("aria-selected"))).toEqual(["true", "false", "false"]);
    expect(wrapper.text()).toContain('Refused: [1,"1","end"], reason: range');
    await rows[2]!.trigger("keydown", { key: "Home", shiftKey: true });
    expect(rows.map(row => row.attributes("aria-selected"))).toEqual(["true", "false", "false"]);
    await wrapper.get('[aria-label="Refuse Tree selection updates"]').setValue(false);
    await rows[0]!.trigger("keydown", { key: "End", shiftKey: true });
    expect(rows.map(row => row.attributes("aria-selected"))).toEqual(["true", "true", "true"]);
    expect(wrapper.text()).toContain('Accepted: [1,"1","end"], reason: range');
  } finally {
    wrapper.unmount();
  }
});

it("wires the permission demo's mixed indicator and branch propagation", async () => {
  const wrapper = mount(TreeSection, { attachTo: document.body });
  try {
    const tree = wrapper.get('[role="tree"][aria-label="Workspace permissions"]');
    const rows = tree.findAll('[role="treeitem"]');
    expect(rows[0]!.attributes("data-akaza-indeterminate")).toBe("true");
    expect(rows[0]!.get('.akaza-tree-indicator').text()).toBe("-");
    await rows[2]!.get('.akaza-tree-row').trigger("click");
    await rows[3]!.get('.akaza-tree-row').trigger("click");
    expect(rows.map(row => row.attributes("aria-selected"))).toEqual(["true", "true", "true", "true"]);
    expect(rows[0]!.attributes("data-akaza-indeterminate")).toBeUndefined();
    expect(rows[0]!.get('.akaza-tree-indicator').text()).toBe("x");
  } finally {
    wrapper.unmount();
  }
});
