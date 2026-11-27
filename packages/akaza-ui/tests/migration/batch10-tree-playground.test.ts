import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import TreeSection from "../../../../playground/src/sections/tree/TreeSection.vue";

it("batch 10 wires the playground cancellation toggle and distinct numeric/string selections", async () => {
  const wrapper = mount(TreeSection, { attachTo: document.body });
  try {
    const tree = wrapper.get('[role="tree"][aria-label="Typed key selection"]');
    const rows = tree.findAll('[role="treeitem"]');
    expect(rows[0]!.attributes("aria-selected")).toBe("true");
    expect(rows[1]!.attributes("aria-selected")).toBe("false");
    await rows[1]!.get('.akaza-tree-row').trigger("click");
    expect(rows[1]!.attributes("aria-selected")).toBe("false");
    expect(wrapper.text()).toContain('Canceled: [1,"1"], reason: pointer');
    await wrapper.get('input[type="checkbox"]').setValue(false);
    await rows[1]!.get('.akaza-tree-row').trigger("click");
    expect(rows[0]!.attributes("aria-selected")).toBe("true");
    expect(rows[1]!.attributes("aria-selected")).toBe("true");
    expect(wrapper.text()).toContain('Accepted: [1,"1"], reason: pointer');
    await rows[0]!.get('.akaza-tree-row').trigger("click");
    expect(rows[0]!.attributes("aria-selected")).toBe("false");
    expect(rows[1]!.attributes("aria-selected")).toBe("true");
  } finally {
    wrapper.unmount();
  }
});
