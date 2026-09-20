import type { TreeKey, TreeSelection } from "@/components/tree";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { Tree } from "@/components/tree";

interface TestNode {
  id: string;
  label: string;
  disabled?: boolean;
  selectable?: boolean;
  slot?: string;
  children?: TestNode[];
}

const items: TestNode[] = [
  {
    id: "root",
    label: "Project",
    children: [
      {
        id: "src",
        label: "Source",
        children: [
          { id: "components", label: "Components" },
          { id: "utils", label: "Utilities" },
        ],
      },
      { id: "readme", label: "README" },
      { id: "disabled", label: "Disabled", disabled: true },
    ],
  },
];

describe("tree", () => {
  it("renders preloaded hierarchy and follows tree keyboard navigation", async () => {
    const wrapper = mount(defineComponent({
      components: { Tree },
      setup() {
        const selected = ref<TreeSelection>(null);
        const expanded = ref<TreeKey[]>(["root"]);
        return { expanded, items, selected };
      },
      template: `
        <Tree
          v-model="selected"
          v-model:expanded="expanded"
          :items="items"
          item-key="id"
          aria-label="Files"
        />
      `,
    }), { attachTo: document.body });

    const tree = wrapper.get("[role='tree']");
    expect(tree.attributes("aria-label")).toBe("Files");
    expect(wrapper.findAll("[role='treeitem']")).toHaveLength(4);
    expect(wrapper.get(`#${wrapper.findAll("[role='treeitem']")[0]!.attributes("id")}`).attributes("aria-level")).toBe("1");

    const root = wrapper.findAll("[role='treeitem']")[0]!;
    await root.get(".akaza-tree-row").trigger("click");
    expect((wrapper.vm as unknown as { expanded: TreeKey[] }).expanded).toEqual([]);
    expect(wrapper.findAll("[role='treeitem']")).toHaveLength(1);
    await root.get(".akaza-tree-row").trigger("click");
    expect((wrapper.vm as unknown as { expanded: TreeKey[] }).expanded).toEqual(["root"]);

    await root.trigger("focus");
    await root.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toContain("Source");

    const source = wrapper.findAll("[role='treeitem']")[1]!;
    expect(source.attributes("style")).toContain("--akaza-tree-indent-offset: 16px");
    await source.trigger("keydown", { key: "ArrowRight" });
    expect((wrapper.vm as unknown as { expanded: TreeKey[] }).expanded).toEqual(["root", "src"]);
    expect(wrapper.findAll("[role='treeitem']")).toHaveLength(6);

    await source.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement?.textContent).toContain("Components");
    await (wrapper.findAll("[role='treeitem']")[2]!).trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement?.textContent).toContain("Source");
    wrapper.unmount();
  });

  it("supports typeahead and skips disabled nodes during arrow navigation", async () => {
    const wrapper = mount(Tree<TestNode>, {
      attachTo: document.body,
      props: { items, itemKey: "id", expanded: ["root"], ariaLabel: "Files" },
    });
    const root = wrapper.findAll("[role='treeitem']")[0]!;
    await root.trigger("focus");
    await root.trigger("keydown", { key: "r" });
    expect(document.activeElement?.textContent).toContain("README");
    await wrapper.findAll("[role='treeitem']")[2]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toContain("README");
    wrapper.unmount();
  });

  it("keeps click selection with select-on-focus and omits selection semantics from non-selectable nodes", async () => {
    const wrapper = mount(Tree<TestNode>, {
      attachTo: document.body,
      props: {
        items: [
          { id: "selectable", label: "Selectable" },
          { id: "heading", label: "Heading", selectable: false },
        ],
        itemKey: "id",
        selectionMode: "multiple",
        selectOnFocus: true,
      },
    });

    const selectable = wrapper.findAll("[role='treeitem']")[0]!;
    await selectable.trigger("focus");
    await selectable.get(".akaza-tree-row").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(["selectable"]);
    expect(wrapper.findAll("[role='treeitem']")[1]!.attributes("aria-selected")).toBeUndefined();
    wrapper.unmount();
  });

  it("can restrict branch expansion to the toggle control", async () => {
    const wrapper = mount(Tree<TestNode>, {
      props: { items, itemKey: "id", expandOnClick: false },
    });

    await wrapper.get(".akaza-tree-row").trigger("click");
    expect(wrapper.emitted("update:expanded")).toBeUndefined();
    expect(wrapper.get("[role='treeitem']").attributes("aria-expanded")).toBe("false");

    await wrapper.get(".akaza-tree-toggle").trigger("click");
    expect(wrapper.emitted("update:expanded")?.at(-1)?.[0]).toEqual(["root"]);
  });

  it("propagates multiple selection and exposes indeterminate parents", async () => {
    const wrapper = mount(defineComponent({
      components: { Tree },
      setup() {
        const selected = ref<TreeKey[]>([]);
        const nested = [{ id: "group", label: "Group", children: [
          { id: "one", label: "One" },
          { id: "two", label: "Two" },
        ] }];
        return { nested, selected };
      },
      template: `
        <Tree
          v-model="selected"
          :items="nested"
          item-key="id"
          :default-expanded="['group']"
          selection-mode="multiple"
          selection-propagation="both"
        />
      `,
    }));

    const rows = wrapper.findAll(".akaza-tree-row");
    await rows[1]!.trigger("click");
    expect((wrapper.vm as unknown as { selected: TreeKey[] }).selected).toEqual(["one"]);
    expect(wrapper.findAll("[role='treeitem']")[0]!.attributes("data-akaza-indeterminate")).toBe("true");

    await rows[2]!.trigger("click");
    expect((wrapper.vm as unknown as { selected: TreeKey[] }).selected).toEqual(["group", "one", "two"]);
    expect(wrapper.findAll("[role='treeitem']")[0]!.attributes("aria-selected")).toBe("true");
  });

  it("extends multiple selection with Shift+click and Shift+keyboard navigation", async () => {
    const wrapper = mount(defineComponent({
      components: { Tree },
      setup() {
        const selected = ref<TreeKey[]>([]);
        const flatItems = [
          { id: "one", label: "One" },
          { id: "two", label: "Two" },
          { id: "three", label: "Three" },
          { id: "four", label: "Four" },
        ];
        return { flatItems, selected };
      },
      template: `
        <Tree
          v-model="selected"
          :items="flatItems"
          item-key="id"
          selection-mode="multiple"
        />
      `,
    }), { attachTo: document.body });

    let rows = wrapper.findAll(".akaza-tree-row");
    await rows[0]!.trigger("click");
    await rows[2]!.trigger("click", { shiftKey: true });
    expect((wrapper.vm as unknown as { selected: TreeKey[] }).selected).toEqual(["one", "two", "three"]);

    await wrapper.findAll("[role='treeitem']")[2]!.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect((wrapper.vm as unknown as { selected: TreeKey[] }).selected).toEqual(["one", "two", "three", "four"]);

    rows = wrapper.findAll(".akaza-tree-row");
    await rows[1]!.trigger("click");
    await rows[3]!.trigger("click", { ctrlKey: true, shiftKey: true });
    expect((wrapper.vm as unknown as { selected: TreeKey[] }).selected).toEqual(["one", "two", "three", "four"]);
    wrapper.unmount();
  });

  it("scopes visual selection independently from treeitem semantics", async () => {
    const wrapper = mount(Tree<TestNode>, {
      props: {
        items: [{ id: "one", label: "One" }],
        itemKey: "id",
        modelValue: "one",
      },
    });

    expect(wrapper.get("[role='treeitem']").attributes("aria-selected")).toBe("true");
    expect(wrapper.get(".akaza-tree-content").classes()).toContain("akaza-tree-selection");

    await wrapper.setProps({ selectionHighlight: "full" });
    expect(wrapper.get(".akaza-tree-row").classes()).toContain("akaza-tree-selection");

    await wrapper.setProps({ selectionHighlight: "label", transition: false });
    expect(wrapper.get(".akaza-tree-label").classes()).toContain("akaza-tree-selection");
    expect(wrapper.get(".akaza-tree").attributes("data-akaza-transition")).toBeUndefined();

    await wrapper.setProps({ selectionMode: "none" });
    expect(wrapper.get("[role='treeitem']").attributes("aria-selected")).toBeUndefined();
    expect(wrapper.get(".akaza-tree-label").attributes("data-akaza-selected")).toBeUndefined();
  });

  it("supports controlled loading for lazy children and node activation", async () => {
    const onActivate = vi.fn();
    const wrapper = mount(defineComponent({
      components: { Tree },
      setup() {
        const lazyItems = ref<TestNode[]>([{ id: "api", label: "API" }]);
        const expanded = ref<TreeKey[]>(["api"]);
        const loading = ref<TreeKey[]>(["api"]);
        const hasChildren = (item: TestNode) => item.id === "api";
        return { expanded, hasChildren, lazyItems, loading, onActivate };
      },
      template: `
        <Tree
          v-model:expanded="expanded"
          :items="lazyItems"
          item-key="id"
          :has-children="hasChildren"
          :loading-keys="loading"
          :expand-on-click="false"
          @activate="onActivate"
        />
      `,
    }));

    const item = wrapper.get("[role='treeitem']");
    expect(item.attributes("aria-busy")).toBe("true");
    expect(wrapper.get("[role='status']").text()).toContain("Loading API");
    await wrapper.get(".akaza-tree-row").trigger("click");
    expect(onActivate).toHaveBeenCalledOnce();
    expect(onActivate.mock.calls[0]?.[0]).toMatchObject({ id: "api" });

    (wrapper.vm as unknown as { lazyItems: TestNode[] }).lazyItems = [{
      id: "api",
      label: "API",
      children: [{ id: "endpoint", label: "Endpoint" }],
    }];
    (wrapper.vm as unknown as { loading: TreeKey[] }).loading = [];
    await nextTick();
    expect(wrapper.findAll("[role='treeitem']")).toHaveLength(2);
    expect(wrapper.find("[role='status']").exists()).toBe(false);
  });

  it("cancels selection and expansion before state changes", async () => {
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(Tree<TestNode>, {
      props: {
        items,
        itemKey: "id",
        modelValue: null,
        expanded: [],
        onSelectionChange: cancel,
        onExpandedChange: cancel,
      },
    });

    await wrapper.get(".akaza-tree-row").trigger("click");
    await wrapper.get(".akaza-tree-toggle").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("update:expanded")).toBeUndefined();
    expect(wrapper.get("[role='treeitem']").attributes("aria-expanded")).toBe("false");
  });

  it("renders dynamic item slots and a bounded virtual window", async () => {
    const manyItems = Array.from({ length: 100 }, (_, index) => ({
      id: `item-${index}`,
      label: `Item ${index}`,
      slot: index === 0 ? "special" : undefined,
    }));
    const wrapper = mount(Tree<(typeof manyItems)[number]>, {
      props: {
        items: manyItems,
        itemKey: "id",
        virtualize: { height: 80, itemHeight: 20, overscan: 2 },
      },
      slots: {
        "item-special": ({ item }: { item: { label: string } }) => `Custom ${item.label}`,
      },
    });
    await nextTick();

    expect(wrapper.text()).toContain("Custom Item 0");
    expect(wrapper.findAll("[role='treeitem']").length).toBeLessThan(manyItems.length);
    expect(wrapper.get("[role='tree']").attributes("style")).toContain("80px");
  });
});
