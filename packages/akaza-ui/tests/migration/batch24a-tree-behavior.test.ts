import type { TreeController, TreeKey, TreeProps, TreeSelection } from "@/components/tree";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { Tree } from "@/components/tree";

interface Item {
  id: TreeKey;
  label: string;
  disabled?: boolean;
  selectable?: boolean;
  children?: Item[];
}

const items: Item[] = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
  { id: "d", label: "D" },
];
const mounted: ReturnType<typeof mount>[] = [];
afterEach(() => { mounted.splice(0).forEach(wrapper => wrapper.unmount()); });

function renderTree(props: Partial<TreeProps<Item>> & Record<string, unknown> = {}) {
  const wrapper = mount(Tree<Item>, {
    attachTo: document.body,
    props: { items, itemKey: "id", transition: false, selectionMode: "multiple", ...props },
  });
  mounted.push(wrapper);
  return wrapper;
}

function controller(wrapper: ReturnType<typeof renderTree>) {
  return (wrapper.vm as unknown as { tree: TreeController<Item> }).tree;
}

describe("batch 24a Tree ranges", () => {
  it("ignores navigation and activation during legacy IME composition", async () => {
    const wrapper = renderTree();
    controller(wrapper).focus("a");
    await nextTick();
    const first = wrapper.findAll('[role="treeitem"]')[0]!;
    for (const key of ["ArrowDown", "End", " ", "Enter"]) await first.trigger("keydown", { key, keyCode: 229 });
    expect(document.activeElement).toBe(first.element);
    expect(wrapper.emitted("selection-change")).toBeUndefined();
    expect(wrapper.emitted("activate")).toBeUndefined();
  });
  it.each(["ArrowDown", "Home", "End"])("canceled focus blocks Shift+%s selection", async (key) => {
    const wrapper = renderTree({ defaultValue: ["b"] });
    controller(wrapper).focus("b");
    await nextTick();
    const before = document.activeElement;
    await wrapper.setProps({ onFocusChange: (_value: TreeKey, details: { cancel: () => void }) => details.cancel() });
    await wrapper.findAll('[role="treeitem"]')[1]!.trigger("keydown", { key, shiftKey: true });
    expect(document.activeElement).toBe(before);
    expect(wrapper.emitted("selection-change")).toBeUndefined();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("a canceled first range does not establish a hidden anchor", async () => {
    const wrapper = renderTree({ defaultValue: ["b"], onSelectionChange: (_value: TreeSelection, details: { cancel: () => void }) => details.cancel() });
    const rows = wrapper.findAll('[role="treeitem"]');
    await rows[3]!.get('.akaza-tree-row').trigger("click", { shiftKey: true });
    await wrapper.setProps({ modelValue: ["c"], onSelectionChange: vi.fn() });
    await rows[0]!.get('.akaza-tree-row').trigger("click", { shiftKey: true });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["a", "b", "c", "d"]);
  });

  it("rebuilds reverse and additive ranges from accepted typed keys and visible selectable nodes", async () => {
    const wrapper = renderTree({
      items: [{ id: 1, label: "Number" }, { id: "locked", label: "Locked", disabled: true },
        { id: "heading", label: "Heading", selectable: false }, { id: "1", label: "String" }, { id: "end", label: "End" }],
      modelValue: ["unknown", "end"], "onUpdate:modelValue": vi.fn(),
    });
    controller(wrapper).select("1");
    await nextTick();
    const rows = wrapper.findAll('[role="treeitem"]');
    await rows[0]!.get('.akaza-tree-row').trigger("click", { shiftKey: true, ctrlKey: true });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual([1, "1", "end", "unknown"]);
    await wrapper.setProps({ modelValue: ["locked", "unknown"] });
    await rows[4]!.get('.akaza-tree-row').trigger("click", { shiftKey: true, metaKey: true });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["locked", "1", "end", "unknown"]);
    await rows[0]!.get('.akaza-tree-row').trigger("click", { shiftKey: true });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual([1, "1"]);
  });

  it("keeps range propagation explicit while traversing disabled parents", async () => {
    const wrapper = renderTree({
      items: [{ id: "root", label: "Root", children: [
        { id: "locked", label: "Locked", disabled: true, children: [{ id: 1, label: "Number" }] },
        { id: "1", label: "String" },
      ] }],
      defaultExpanded: ["root", "locked"], selectionPropagation: "both",
      defaultValue: ["locked", "unknown"],
    });
    controller(wrapper).select(1);
    await nextTick();
    await wrapper.findAll('[role="treeitem"]')[3]!.get('.akaza-tree-row').trigger("click", { shiftKey: true, ctrlKey: true });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["root", "locked", 1, "1", "unknown"]);
  });

  it("canceled pointer focus blocks a Shift range", async () => {
    const wrapper = renderTree({ defaultValue: ["a"] });
    controller(wrapper).focus("a");
    await nextTick();
    await wrapper.setProps({ onFocusChange: (_value: TreeKey, details: { cancel: () => void }) => details.cancel() });
    await wrapper.findAll('.akaza-tree-row')[3]!.trigger("click", { shiftKey: true });
    expect(wrapper.emitted("selection-change")).toBeUndefined();
    expect(document.activeElement).toBe(wrapper.findAll('[role="treeitem"]')[0]!.element);
  });

  it("does not reselect the target when Shift focus reaches the DOM with select-on-focus", async () => {
    const wrapper = renderTree({ selectOnFocus: true });
    controller(wrapper).focus("a");
    await nextTick();
    await wrapper.findAll('[role="treeitem"]')[0]!.trigger("keydown", { key: "End", shiftKey: true });
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["a", "b", "c", "d"]);
    expect(wrapper.emitted("selection-change")?.at(-1)?.[1]).toMatchObject({ reason: "range" });
  });

  it("does not turn a canceled range into a select-on-focus request", async () => {
    const wrapper = renderTree({
      selectOnFocus: true,
      onSelectionChange: (_value: TreeSelection, details: { reason: string; cancel: () => void }) => {
        if (details.reason === "range") details.cancel();
      },
    });
    controller(wrapper).focus("a");
    await nextTick();
    await wrapper.findAll('[role="treeitem"]')[0]!.trigger("keydown", { key: "End", shiftKey: true });
    await nextTick();
    expect(document.activeElement).toBe(wrapper.findAll('[role="treeitem"]')[3]!.element);
    expect(wrapper.emitted("update:modelValue")?.map(event => event[0])).toEqual([["a"]]);
  });

  it("keeps read-only ranges and select-all from committing", async () => {
    const wrapper = renderTree({ readOnly: true, defaultValue: ["b"] });
    const rows = wrapper.findAll('[role="treeitem"]');
    await rows[0]!.get('.akaza-tree-row').trigger("click", { shiftKey: true });
    await rows[0]!.trigger("keydown", { key: "End", shiftKey: true });
    await rows[3]!.trigger("keydown", { key: "a", ctrlKey: true });
    expect(wrapper.emitted("selection-change")).toBeUndefined();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});

describe("batch 24a explicit mixed state", () => {
  it("counts unselected intermediate branches and excludes locked nodes, without inferring lazy selections", async () => {
    const wrapper = renderTree({
      items: [{ id: "root", label: "Root", children: [
        { id: "branch", label: "Branch", children: [{ id: "deep", label: "Deep" }] },
        { id: "leaf", label: "Leaf" }, { id: "locked", label: "Locked", disabled: true },
      ] }],
      modelValue: ["deep", "leaf"], selectionPropagation: "up",
    });
    expect(controller(wrapper).getNode("root")).toMatchObject({ isSelected: false, isIndeterminate: true });
    expect(controller(wrapper).getNode("branch")).toMatchObject({ isSelected: false, isIndeterminate: false });
    await wrapper.setProps({ modelValue: ["branch", "deep", "leaf"] });
    expect(controller(wrapper).getNode("root")?.isIndeterminate).toBe(false);
    await wrapper.setProps({ modelValue: ["root", "unknown"] });
    expect(controller(wrapper).getNode("root")).toMatchObject({ isSelected: true, isIndeterminate: false });
    expect(controller(wrapper).getNode("deep")?.isSelected).toBe(false);
    await wrapper.setProps({ selectionPropagation: "down", modelValue: ["deep"] });
    expect(controller(wrapper).getNode("root")?.isIndeterminate).toBe(false);
  });
});

describe("batch 24a Tree focus recovery", () => {
  const nested: Item[] = [{ id: "root", label: "Root", children: [
    { id: "branch", label: "Branch", children: [{ id: "child", label: "Child" }] },
  ] }, { id: "other", label: "Other" }];

  it("refreshes a retained row's ancestor path when items are reparented", async () => {
    const child = { id: "child", label: "Child" };
    const wrapper = renderTree({
      items: [{ id: "a", label: "A", children: [child] }, { id: "b", label: "B" }], defaultExpanded: ["a", "b"],
    });
    await wrapper.setProps({ items: [{ id: "a", label: "A" }, { id: "b", label: "B", children: [child] }] });
    controller(wrapper).focus("child");
    await nextTick();
    await wrapper.setProps({ items: [{ id: "a", label: "A" }, { id: "b", label: "B" }] });
    await Promise.resolve();
    expect(document.activeElement).toBe(wrapper.findAll('[role="treeitem"]')[1]!.element);
  });

  it("recovers actual DOM focus to the nearest collapsed ancestor", async () => {
    const wrapper = renderTree({ items: nested, defaultExpanded: ["root", "branch"] });
    controller(wrapper).focus("child");
    await nextTick();
    controller(wrapper).collapse("branch");
    await nextTick();
    await Promise.resolve();
    expect(document.activeElement).toBe(wrapper.findAll('[role="treeitem"]')[1]!.element);
    expect(controller(wrapper).focusedKey.value).toBe("branch");
    expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1);
  });

  it("retains the old ancestor path when a focused subtree is removed", async () => {
    const wrapper = renderTree({ items: nested, defaultExpanded: ["root", "branch"], defaultValue: ["other"] });
    controller(wrapper).focus("child");
    await nextTick();
    await wrapper.setProps({ items: [{ id: "root", label: "Root" }, { id: "other", label: "Other" }] });
    await Promise.resolve();
    expect(document.activeElement).toBe(wrapper.findAll('[role="treeitem"]')[0]!.element);
  });

  it("does not recover after an outside control takes focus", async () => {
    const wrapper = renderTree({ items: nested, defaultExpanded: ["root", "branch"] });
    const outside = document.createElement("button");
    document.body.append(outside);
    try {
      controller(wrapper).focus("child");
      await nextTick();
      outside.focus();
      controller(wrapper).collapse("branch");
      await nextTick();
      await Promise.resolve();
      expect(document.activeElement).toBe(outside);
    } finally {
      outside.remove();
    }
  });

  it("moves the tab stop away from newly disabled rows and globally disabled trees", async () => {
    const wrapper = renderTree();
    controller(wrapper).focus("b");
    await nextTick();
    await wrapper.setProps({ items: items.map(item => ({ ...item, disabled: item.id === "b" })) });
    await nextTick();
    expect(wrapper.get('[tabindex="0"]').text()).toContain("A");
    await wrapper.setProps({ disabled: true });
    await nextTick();
    expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(0);
  });

  it("honors recovery cancellation without changing selection", async () => {
    const wrapper = renderTree({ items: nested, defaultExpanded: ["root", "branch"], defaultValue: ["child"] });
    controller(wrapper).focus("child");
    await nextTick();
    const cancel = vi.fn((_key: TreeKey, details: { cancel: () => void }) => details.cancel());
    await wrapper.setProps({ onFocusChange: cancel });
    controller(wrapper).collapse("branch");
    await nextTick();
    await Promise.resolve();
    expect(cancel).toHaveBeenCalledWith("branch", expect.objectContaining({ reason: "focus" }));
    expect(document.activeElement).toBe(document.body);
    expect(wrapper.emitted("selection-change")).toBeUndefined();
  });

  it("does not recover after the whole Tree unmounts", async () => {
    const onFocusChange = vi.fn();
    const wrapper = renderTree({ items: nested, defaultExpanded: ["root", "branch"], onFocusChange });
    controller(wrapper).focus("child");
    await nextTick();
    onFocusChange.mockClear();
    wrapper.unmount();
    mounted.splice(mounted.indexOf(wrapper), 1);
    await Promise.resolve();
    expect(onFocusChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });
});
