import type { TreeController, TreeKey, TreeProps, TreeSelection, TreeSelectionPropagation } from "@/components/tree";
import { checkPattern } from "@ui-sdk/core/testing";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { Tree } from "@/components/tree";

interface Item {
  id: TreeKey;
  label: string;
  children?: Item[];
  disabled?: boolean;
  selectable?: boolean;
  lazy?: boolean;
  slot?: string;
}

const mounted: { unmount: () => void }[] = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
});

function renderTree(props: Partial<TreeProps<Item>> & Record<string, unknown> = {}) {
  const wrapper = mount(Tree<Item>, {
    attachTo: document.body,
    props: { items: [], itemKey: "id", transition: false, ...props },
  });
  mounted.push(wrapper);
  return wrapper;
}

function controller(wrapper: ReturnType<typeof renderTree>): TreeController<Item> {
  return (wrapper.vm as unknown as { tree: TreeController<Item> }).tree;
}

const flat: Item[] = [
  { id: "a", label: "Alpha" },
  { id: "disabled", label: "Disabled", disabled: true },
  { id: "b", label: "Beta" },
  { id: "c", label: "Charlie" },
];

const nested: Item[] = [{ id: "root", label: "Root", children: [
  { id: "branch", label: "Branch", children: [{ id: "deep", label: "Deep" }] },
  { id: "leaf", label: "Leaf" },
] }];

describe("batch 10 Tree hierarchy contracts", () => {
  it("preserves numeric/string key identity, accessors, original items and sibling metadata", async () => {
    interface RecordItem { code: TreeKey; title: string; nodes: RecordItem[] }
    const source: readonly RecordItem[] = Object.freeze([{ code: 1, title: "Number", nodes: [
      { code: "1", title: "String", nodes: [] },
      { code: "number:1", title: "Prefixed", nodes: [] },
    ] }]);
    const wrapper = mount(Tree<(typeof source)[number]>, {
      props: {
        items: source,
        itemKey: item => item.code,
        labelKey: item => item.title,
        childrenKey: item => item.nodes,
        expanded: [1],
        modelValue: "1",
        transition: false,
      },
    });
    mounted.push(wrapper);
    const tree = (wrapper.vm as unknown as { tree: TreeController<(typeof source)[number]> }).tree;
    const rows = wrapper.findAll('[role="treeitem"]');
    expect(rows.map(row => row.attributes("aria-level"))).toEqual(["1", "2", "2"]);
    expect(rows.map(row => row.attributes("aria-posinset"))).toEqual(["1", "1", "2"]);
    expect(rows.map(row => row.attributes("aria-setsize"))).toEqual(["1", "2", "2"]);
    expect(rows.map(row => row.attributes("aria-selected"))).toEqual(["false", "true", "false"]);
    expect(rows[1]!.attributes("aria-expanded")).toBeUndefined();
    expect(tree.getItem(1)).toBe(source[0]);
    expect(tree.getItem("1")).toBe(source[0]!.nodes[0]);
    await wrapper.setProps({ expanded: ["1"] });
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(1);
    await wrapper.setProps({ expanded: [1] });
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3);
  });

  it.each(["duplicate", "cycle", "invalid"])("rejects %s input before passing nodes to SDK", (kind) => {
    const items: Item[] = [{ id: "root", label: "Root" }];
    if (kind === "duplicate") items.push({ id: "root", label: "Duplicate" });
    if (kind === "cycle") items[0]!.children = items;
    if (kind === "invalid") items[0]!.id = undefined as unknown as TreeKey;
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(() => renderTree({ items })).toThrow(kind === "invalid"
        ? "[akaza-ui] Tree itemKey must resolve to a string or number."
        : "[akaza-ui] Tree item keys must be unique. Duplicate key: root");
    } finally {
      warning.mockRestore();
    }
  });

  it("keeps visibility current after in-place expansion and lazy-child replacement", async () => {
    const data = ref<Item[]>([{ id: 1, label: "Remote", lazy: true }]);
    const expanded = ref<TreeKey[]>([1]);
    const loading = ref<TreeKey[]>([1]);
    const wrapper = mount(defineComponent({
      setup: () => () => h(Tree<Item>, {
        items: data.value, itemKey: "id", expanded: expanded.value,
        hasChildren: item => !!item.lazy, loadingKeys: loading.value,
        transition: false,
      }),
    }));
    mounted.push(wrapper);
    expect(wrapper.get('[role="treeitem"]').attributes("aria-expanded")).toBe("true");
    expect(wrapper.get('[role="status"]').text()).toBe("Loading Remote...");
    data.value[0]!.children = [{ id: "1", label: "Child" }];
    loading.value = [];
    await nextTick();
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
    expanded.value.splice(0);
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(1);
    expanded.value.push(1);
    await nextTick();
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
    data.value = [{ id: 1, label: "Replaced", children: [{ id: "new", label: "New child" }] }];
    await nextTick();
    expect(wrapper.findAll('.akaza-tree-label').map(label => label.text())).toEqual(["Replaced", "New child"]);
  });

  it("preserves empty branches, item defaults, and reordered sibling metadata", async () => {
    const wrapper = renderTree({
      items: [{ id: "root", label: "Root", children: [
        { id: "empty", label: "Empty", children: [] },
        { id: "lazy", label: "Lazy", lazy: true },
      ] }],
      defaultExpandedKey: item => item.id === "root",
      hasChildren: item => !!item.lazy,
    });
    expect(controller(wrapper).getNode("empty")?.isLeaf).toBe(true);
    expect(controller(wrapper).getNode("lazy")?.isBranch).toBe(true);
    await wrapper.setProps({ items: [{ id: "root", label: "Root", children: [
      { id: "lazy", label: "Renamed", lazy: true },
      { id: "empty", label: "Empty" },
    ] }] });
    expect(controller(wrapper).getNode("lazy")).toMatchObject({ siblingIndex: 0, siblingCount: 2, label: "Renamed" });
    expect(controller(wrapper).getNode("empty")).toMatchObject({ siblingIndex: 1, depth: 2 });
  });
});

describe("batch 10 explicit selection and propagation", () => {
  it.each<{ mode: TreeSelectionPropagation; expected: TreeKey[] }>([
    { mode: "none", expected: ["branch"] },
    { mode: "up", expected: ["branch"] },
    { mode: "down", expected: ["branch", "deep"] },
    { mode: "both", expected: ["branch", "deep"] },
  ])("preserves $mode propagation and ordering", async ({ mode, expected }) => {
    const wrapper = renderTree({ items: nested, selectionMode: "multiple", selectionPropagation: mode });
    expect(controller(wrapper).select("branch")).toBe(true);
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(expected);
    expect(controller(wrapper).getNode("root")?.isIndeterminate).toBe(mode === "up" || mode === "both");
    controller(wrapper).select("leaf");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(mode === "both"
      ? ["root", "branch", "deep", "leaf"]
      : [...expected, "leaf"]);
  });

  it("skips disabled/non-selectable nodes but traverses their descendants", async () => {
    const wrapper = renderTree({
      items: [{ id: "root", label: "Root", children: [
        { id: "locked", label: "Locked", disabled: true, children: [{ id: "child", label: "Child" }] },
        { id: "heading", label: "Heading", selectable: false, children: [{ id: "other", label: "Other" }] },
      ] }],
      selectionMode: "multiple", selectionPropagation: "both",
      defaultValue: ["unknown", "locked"],
    });
    controller(wrapper).select("root");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["root", "locked", "child", "other", "unknown"]);
    expect(controller(wrapper).select("locked")).toBe(false);
    expect(controller(wrapper).select("heading")).toBe(false);
    controller(wrapper).toggleSelection("root");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["locked", "unknown"]);
  });

  it("does not infer descendants from an explicitly selected branch after lazy loading", async () => {
    const wrapper = renderTree({
      items: [{ id: "root", label: "Root", lazy: true }],
      hasChildren: item => !!item.lazy,
      selectionMode: "multiple", selectionPropagation: "both", defaultValue: ["root"],
    });
    await wrapper.setProps({ items: nested });
    expect(controller(wrapper).getNode("root")?.isSelected).toBe(true);
    expect(controller(wrapper).getNode("deep")?.isSelected).toBe(false);
    expect(controller(wrapper).getNode("root")?.isIndeterminate).toBe(false);
  });

  it("uses nearest-first upward propagation through multiple ancestor levels", async () => {
    const wrapper = renderTree({
      items: [{ id: "root", label: "Root", children: [nested[0]!.children![0]!] }],
      selectionMode: "multiple", selectionPropagation: "up",
    });
    controller(wrapper).select("deep");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["root", "branch", "deep"]);
    controller(wrapper).toggleSelection("deep");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual([]);
  });

  it("keeps forced select idempotent and single selection non-toggleable on Space", async () => {
    const wrapper = renderTree({ items: flat, defaultValue: "a" });
    controller(wrapper).select("a");
    await wrapper.findAll('[role="treeitem"]')[0]!.trigger("keydown", { key: " " });
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    controller(wrapper).select("b");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe("b");
  });

  it("honors replace versus modifier toggles and unknown selected keys", async () => {
    const wrapper = renderTree({
      items: [{ id: 1, label: "Number" }, { id: "1", label: "String" }],
      selectionMode: "multiple", selectionBehavior: "replace", defaultValue: ["unknown", 1],
    });
    const rows = wrapper.findAll('.akaza-tree-row');
    await rows[1]!.trigger("click", { ctrlKey: true });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual([1, "1", "unknown"]);
    await rows[0]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual([1]);
    controller(wrapper).select(1);
    await nextTick();
    expect(wrapper.emitted("update:modelValue")).toHaveLength(2);
  });

  it("uses current controlled values after rejection and external replacement", async () => {
    const wrapper = renderTree({
      items: flat, modelValue: ["a"], selectionMode: "multiple",
      "onUpdate:modelValue": vi.fn(),
    });
    controller(wrapper).toggleSelection("b");
    await nextTick();
    controller(wrapper).toggleSelection("b");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.map(event => event[0])).toEqual([["a", "b"], ["a", "b"]]);
    expect(controller(wrapper).getNode("b")?.isSelected).toBe(false);
    await wrapper.setProps({ modelValue: ["c"] });
    controller(wrapper).toggleSelection("b");
    await nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["b", "c"]);
  });

  it("cancels selection before commits and preserves item, reason, and native event", async () => {
    const cancel = vi.fn((_keys, details) => details.cancel());
    const wrapper = renderTree({ items: flat, selectionMode: "multiple", onSelectionChange: cancel });
    const row = wrapper.findAll('.akaza-tree-row')[2]!;
    await row.trigger("click");
    expect(cancel).toHaveBeenCalledWith(["b"], expect.objectContaining({
      key: "b", item: expect.objectContaining({ id: "b" }), reason: "pointer", event: expect.any(MouseEvent),
    }));
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(controller(wrapper).getNode("b")?.isSelected).toBe(false);
  });

  it("keeps Shift range limited to visible selectable nodes and additive modifiers", async () => {
    const wrapper = renderTree({ items: flat, selectionMode: "multiple" });
    const rows = wrapper.findAll('.akaza-tree-row');
    await rows[0]!.trigger("click");
    await rows[2]!.trigger("click", { shiftKey: true });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["a", "b"]);
    await wrapper.findAll('[role="treeitem"]')[2]!.trigger("keydown", { key: "End", shiftKey: true });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["a", "b", "c"]);
    await rows[2]!.trigger("click");
    await rows[3]!.trigger("click", { shiftKey: true, metaKey: true });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["a", "b", "c"]);
    expect(wrapper.emitted("selection-change")?.at(-1)?.[1]).toMatchObject({ reason: "range" });
  });

  it("keeps repeated select-all additive rather than toggling it off", async () => {
    const wrapper = renderTree({ items: flat, selectionMode: "multiple" });
    const row = wrapper.findAll('[role="treeitem"]')[0]!;
    await row.trigger("keydown", { key: "a", ctrlKey: true });
    await row.trigger("keydown", { key: "a", metaKey: true });
    expect(wrapper.emitted("update:modelValue")?.map(event => event[0])).toEqual([["a", "b", "c"]]);
    expect(wrapper.emitted("selection-change")?.at(-1)?.[1]).toMatchObject({ reason: "select-all" });
  });

  it("keeps an accepted focus move independent of canceled Shift-range selection", async () => {
    const wrapper = renderTree({ items: flat, selectionMode: "multiple", defaultValue: ["a"] });
    controller(wrapper).focus("a");
    await nextTick();
    await wrapper.setProps({ onSelectionChange: (_value: TreeSelection, details: { cancel: () => void }) => details.cancel() });
    await wrapper.findAll('[role="treeitem"]')[0]!.trigger("keydown", { key: "End", shiftKey: true });
    expect(document.activeElement).toBe(wrapper.findAll('[role="treeitem"]')[3]!.element);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(controller(wrapper).getNode("a")?.isSelected).toBe(true);
    expect(controller(wrapper).getNode("c")?.isSelected).toBe(false);
    expect(wrapper.emitted("selection-change")?.at(-1)?.[1]).toMatchObject({ reason: "range", key: "c" });
  });
});

describe("batch 10 focus and rendering", () => {
  it.each([
    { orientation: "vertical" as const, dir: "ltr" as const, next: "ArrowDown", previous: "ArrowUp", expand: "ArrowRight", collapse: "ArrowLeft" },
    { orientation: "vertical" as const, dir: "rtl" as const, next: "ArrowDown", previous: "ArrowUp", expand: "ArrowLeft", collapse: "ArrowRight" },
    { orientation: "horizontal" as const, dir: "ltr" as const, next: "ArrowRight", previous: "ArrowLeft", expand: "ArrowDown", collapse: "ArrowUp" },
    { orientation: "horizontal" as const, dir: "rtl" as const, next: "ArrowLeft", previous: "ArrowRight", expand: "ArrowDown", collapse: "ArrowUp" },
  ])("preserves $orientation $dir focus, disclosure, and one tab stop", async ({ orientation, dir, next, previous, expand, collapse }) => {
    const wrapper = renderTree({ items: nested, orientation, dir });
    const rows = () => wrapper.findAll<HTMLElement>('[role="treeitem"]');
    rows()[0]!.element.focus();
    await rows()[0]!.trigger("keydown", { key: expand });
    expect(rows()).toHaveLength(3);
    await rows()[0]!.trigger("keydown", { key: expand });
    expect(document.activeElement).toBe(rows()[1]!.element);
    await rows()[1]!.trigger("keydown", { key: next });
    expect(document.activeElement).toBe(rows()[2]!.element);
    await rows()[2]!.trigger("keydown", { key: previous });
    expect(document.activeElement).toBe(rows()[1]!.element);
    await rows()[1]!.trigger("keydown", { key: collapse });
    expect(document.activeElement).toBe(rows()[0]!.element);
    expect(wrapper.findAll('[role="treeitem"][tabindex="0"]')).toHaveLength(1);
    expect(wrapper.attributes("dir")).toBe(dir);
  });

  it("keeps canceled focus from changing DOM focus or selecting on focus", async () => {
    const wrapper = renderTree({
      items: flat, selectOnFocus: true,
      onFocusChange: (_key: TreeKey, details: { cancel: () => void }) => details.cancel(),
    });
    const before = document.activeElement;
    expect(controller(wrapper).focus("b")).toBe(false);
    await nextTick();
    expect(document.activeElement).toBe(before);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.findAll('[data-akaza-focused="true"]')).toHaveLength(0);
  });

  it("restores the tab stop to a collapsed ancestor and skips disabled rows", async () => {
    const wrapper = renderTree({ items: nested, defaultExpanded: ["root", "branch"] });
    controller(wrapper).focus("deep");
    await nextTick();
    controller(wrapper).collapse("branch");
    await nextTick();
    await nextTick();
    expect(wrapper.get('[tabindex="0"]').text()).toContain("Branch");
    await wrapper.setProps({ items: flat });
    const rows = wrapper.findAll<HTMLElement>('[role="treeitem"]');
    rows[0]!.element.focus();
    await rows[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(rows[2]!.element);
    await rows[2]!.trigger("keydown", { key: "ArrowUp" });
    expect(document.activeElement).toBe(rows[0]!.element);
  });

  it("keeps canceled and rejected expansion at the accepted hierarchy", async () => {
    const change = vi.fn((_keys, details) => details.cancel());
    const wrapper = renderTree({ items: nested, expanded: [], "onUpdate:expanded": vi.fn(), onExpandedChange: change });
    await wrapper.get('.akaza-tree-toggle').trigger("click");
    expect(wrapper.emitted("update:expanded")).toBeUndefined();
    await wrapper.setProps({ onExpandedChange: vi.fn() });
    await wrapper.get('.akaza-tree-toggle').trigger("click");
    await wrapper.get('.akaza-tree-toggle').trigger("click");
    expect(wrapper.emitted("update:expanded")?.map(event => event[0])).toEqual([["root"], ["root"]]);
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(1);
    await wrapper.setProps({ expanded: ["root"] });
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3);
  });

  it("keeps read-only navigation and expansion without pointer or exposed selection changes", async () => {
    const wrapper = renderTree({ items: nested, readOnly: true });
    expect(controller(wrapper).select("leaf")).toBe(false);
    await wrapper.get('.akaza-tree-row').trigger("click");
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.findAll('[role="treeitem"]')[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(wrapper.findAll('[role="treeitem"]')[1]!.element);
    expect(wrapper.get('[role="tree"]').attributes("aria-readonly")).toBe("true");
  });

  it("keeps disabled and selection-none interaction policies", async () => {
    const wrapper = renderTree({ items: nested, disabled: true });
    expect(controller(wrapper).focus("root")).toBe(false);
    expect(controller(wrapper).expand("root")).toBe(false);
    expect(controller(wrapper).select("root")).toBe(false);
    await wrapper.get('.akaza-tree-row').trigger("click");
    expect(wrapper.emitted("activate")).toBeUndefined();
    await wrapper.setProps({ disabled: false, selectionMode: "none" });
    await wrapper.get('.akaza-tree-row').trigger("click");
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3);
    expect(wrapper.emitted("activate")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.find('[aria-selected]').exists()).toBe(false);
  });

  it.each(["full", "indented", "label"] as const)("preserves %s highlight classes and leaf alignment", (selectionHighlight) => {
    const wrapper = renderTree({
      items: flat, defaultValue: "a", selectionHighlight,
      ui: { root: "custom-root", item: "custom-item", selection: "custom-selection", leafSpacer: "custom-leaf" },
    });
    const row = wrapper.findAll('[role="treeitem"]')[0]!;
    const part = selectionHighlight === "full" ? ".akaza-tree-row" : selectionHighlight === "indented" ? ".akaza-tree-content" : ".akaza-tree-label";
    expect(wrapper.classes()).toContain("custom-root");
    expect(row.classes()).toContain("custom-item");
    expect(row.get(part).classes()).toContain("custom-selection");
    expect(row.get(part).attributes("data-akaza-selected")).toBe("true");
    expect(row.get('.akaza-tree-toggle-spacer').classes()).toContain("custom-leaf");
    expect(row.get('.akaza-tree-toggle-spacer').attributes("aria-hidden")).toBe("true");
    expect(wrapper.find('[data-slot]').exists()).toBe(false);
  });

  it("passes the SDK tree pattern checker on compatible leaf-only Akaza markup", async () => {
    const wrapper = renderTree({ items: flat.filter(item => !item.disabled), ariaLabel: "Hierarchy" });
    await nextTick();
    await checkPattern(wrapper.element, "tree");
  });

  it("keeps native form controls slot-owned across form reset", async () => {
    const value = ref<TreeSelection>("a");
    const wrapper = mount(defineComponent({
      setup: () => () => h("form", [h(Tree<Item>, {
        items: flat, itemKey: "id", modelValue: value.value,
        "onUpdate:modelValue": next => { value.value = next; },
        transition: false,
      }, { trailing: ({ item }: { item: Item }) => h("input", { name: String(item.id), defaultValue: item.label }) })]),
    }));
    mounted.push(wrapper);
    await wrapper.findAll('.akaza-tree-row')[2]!.trigger("click");
    expect(value.value).toBe("b");
    const form = wrapper.get("form").element as HTMLFormElement;
    expect(new FormData(form).get("b")).toBe("Beta");
    form.reset();
    await nextTick();
    expect(value.value).toBe("b");
  });
});
