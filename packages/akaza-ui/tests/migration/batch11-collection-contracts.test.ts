import type { TreeController } from "@/components/tree";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, shallowRef } from "vue";
import { Listbox } from "@/components/listbox";
import { Tree } from "@/components/tree";

const mounted: { unmount: () => void }[] = [];
afterEach(() => mounted.splice(0).reverse().forEach(wrapper => wrapper.unmount()));

const options = Array.from({ length: 100 }, (_, value) => ({ value, label: `Item ${value}` }));
const items = options.map(option => ({ id: option.value, label: option.label }));
type Item = (typeof items)[number];

async function scroll(element: HTMLElement, top: number) {
  element.scrollTo = vi.fn((options: ScrollToOptions) => {
    element.scrollTop = options.top ?? 0;
    element.dispatchEvent(new Event("scroll"));
  });
  Object.defineProperty(element, "clientHeight", { value: 80, configurable: true });
  element.dispatchEvent(new WheelEvent("wheel", { deltaY: top - element.scrollTop, bubbles: true }));
  element.scrollTop = top;
  element.dispatchEvent(new Event("scroll"));
  await nextTick();
}

describe("sdk collection virtualization contracts", () => {
  it("does not snap manual Listbox wheel scroll to selection/highlight and only references mounted options", async () => {
    const wrapper = mount(Listbox, {
      attachTo: document.body,
      props: { options, modelValue: 80, virtualize: true, virtualHeight: 80, virtualItemHeight: 20, overscan: 2, ariaLabel: "Results" },
    });
    mounted.push(wrapper);
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    await scroll(content.element, 0);
    content.element.focus();
    await nextTick();
    expect(content.element.scrollTop).toBe(1600);
    const active = content.attributes("aria-activedescendant");
    expect(wrapper.findAll('[role="option"]').some(row => row.attributes("id") === active)).toBe(true);
    await scroll(content.element, 400);
    expect(content.element.scrollTop).toBe(400);
    expect(content.attributes("aria-activedescendant")).toBeUndefined();
    expect(wrapper.find('[data-akaza-selected="true"]').exists()).toBe(false);
    expect(wrapper.props("modelValue")).toBe(80);
    expect(wrapper.findAll('[role="option"]').length).toBeLessThan(15);
    await wrapper.get('[role="option"]').trigger("mouseenter");
    expect(content.element.scrollTop).toBe(400);
    const pointerActive = content.attributes("aria-activedescendant");
    expect(wrapper.findAll('[role="option"]').some(row => row.attributes("id") === pointerActive)).toBe(true);
  });

  it.each(["End", "z"])("scrolls only after an accepted Listbox %s highlight, preserving event and controlled rejection", async (key) => {
    let cancel = true;
    const onHighlightChange = vi.fn((_option, details) => { if (cancel) details.cancel(); });
    const wrapper = mount(Listbox, {
      props: {
        options: options.map(option => ({ ...option, label: option.value === 99 ? "Zebra" : option.label })),
        modelValue: 0, virtualize: true, virtualItemHeight: 20, overscan: 2, ariaLabel: "Results", onHighlightChange,
      },
    });
    mounted.push(wrapper);
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    await scroll(content.element, 400);
    await content.trigger("keydown", { key });
    expect(content.element.scrollTop).toBe(400);
    expect(content.attributes("aria-activedescendant")).toBeUndefined();
    expect(onHighlightChange.mock.calls[0]![1]).toMatchObject({ reason: key === "z" ? "typeahead" : "keyboard", event: expect.any(KeyboardEvent) });
    cancel = false;
    await content.trigger("keydown", { key });
    expect(content.element.scrollTop).toBe(1980);
    expect(wrapper.get(`[id="${content.attributes("aria-activedescendant")}"]`).text()).toContain("Zebra");
    await content.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe(99);
    expect(wrapper.props("modelValue")).toBe(0);
    expect(wrapper.get('[role="option"]').attributes("aria-selected")).toBe("false");
  });

  it("filters and shrinks Listbox without stale ARIA references or disabled keyboard scrolling", async () => {
    const wrapper = mount(Listbox, {
      props: { options, filterable: true, virtualize: true, virtualItemHeight: 20, overscan: 2, ariaLabel: "Results" },
    });
    mounted.push(wrapper);
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    await scroll(content.element, 0);
    await content.trigger("keydown", { key: "End" });
    await wrapper.setProps({ options: options.slice(0, 3) });
    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0);
    expect(wrapper.findAll('[role="option"]').length).toBeLessThanOrEqual(3);
    const active = content.attributes("aria-activedescendant");
    expect(active === undefined || wrapper.findAll('[role="option"]').some(row => row.attributes("id") === active)).toBe(true);
    await scroll(content.element, 0);
    await wrapper.setProps({ disabled: true });
    await content.trigger("keydown", { key: "End" });
    expect(content.element.scrollTop).toBe(0);
    await wrapper.setProps({ disabled: false });
    await wrapper.get(".akaza-listbox-filter").setValue("no match");
    expect(wrapper.findAll('[role="option"]')).toHaveLength(0);
    expect(content.attributes("aria-activedescendant")).toBeUndefined();
    expect(wrapper.get(".akaza-listbox-empty").text()).toBe("No options found.");
  });

  it("preserves virtual Listbox range cancellation, object identity and multiple native values", async () => {
    const values = Array.from({ length: 100 }, (_, id) => ({ id }));
    const selected = shallowRef([values[0]!]);
    let cancelHighlight = true;
    let cancelSelection = false;
    const wrapper = mount(defineComponent({
      setup: () => () => h("form", [h(Listbox, {
        options: values.map(value => ({ value, label: `Item ${value.id}`, disabled: value.id === 1 })),
        modelValue: selected.value, multiple: true, by: "id", name: "choices",
        serializeValue: value => String((value as { id: number }).id),
        virtualize: true, virtualHeight: 80, virtualItemHeight: 20, overscan: 2, ariaLabel: "Objects",
        onHighlightChange: (_option, details) => { if (cancelHighlight) details.cancel(); },
        onValueChange: (_value, details) => { if (cancelSelection) details.cancel(); },
        "onUpdate:modelValue": next => { selected.value = next as { id: number }[]; },
      })]),
    }), { attachTo: document.body });
    mounted.push(wrapper);
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    await scroll(content.element, 0);
    content.element.focus();
    await nextTick();
    const firstId = content.attributes("aria-activedescendant");
    await content.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(content.attributes("aria-activedescendant")).toBe(firstId);
    expect(content.element.scrollTop).toBe(0);
    expect(selected.value).toEqual([values[0]]);
    cancelHighlight = false;
    await content.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(selected.value).toEqual([values[0], values[2]]);
    expect(selected.value[0]).toBe(values[0]);
    expect(selected.value[1]).toBe(values[2]);
    expect(content.element.scrollTop).toBe(40);
    cancelSelection = true;
    await content.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(content.element.scrollTop).toBe(60);
    expect(wrapper.get(`[id="${content.attributes("aria-activedescendant")}"]`).text()).toContain("Item 3");
    expect(selected.value).toEqual([values[0], values[2]]);
    await scroll(content.element, 400);
    expect(content.attributes("aria-activedescendant")).toBeUndefined();
    expect(new FormData(wrapper.get("form").element).getAll("choices")).toEqual(["0", "2"]);
    await scroll(content.element, 0);
    expect(wrapper.findAll('[role="option"]')[0]!.attributes("id")).toBe(firstId);
  });

  it("keeps native Listbox values when selected rows are unmounted and reset is canceled", async () => {
    const value = ref(99);
    const wrapper = mount(defineComponent({
      setup: () => () => h("form", [h(Listbox, {
        options, modelValue: value.value, name: "choice", required: true,
        virtualize: true, virtualItemHeight: 20, overscan: 2, ariaLabel: "Results",
        "onUpdate:modelValue": next => { value.value = next as number; },
      })]),
    }), { attachTo: document.body });
    mounted.push(wrapper);
    const form = wrapper.get("form").element;
    await scroll(wrapper.get<HTMLElement>('[role="listbox"]').element, 400);
    expect(wrapper.find('[aria-selected="true"]').exists()).toBe(false);
    expect(new FormData(form).getAll("choice")).toEqual(["99"]);
    value.value = 40;
    await nextTick();
    const cancelReset = (event: Event) => event.preventDefault();
    form.addEventListener("reset", cancelReset);
    form.reset();
    await nextTick();
    expect(value.value).toBe(40);
    expect(new FormData(form).getAll("choice")).toEqual(["40"]);
    form.removeEventListener("reset", cancelReset);
    form.reset();
    await nextTick();
    await nextTick();
    expect(value.value).toBe(99);
    expect(new FormData(form).getAll("choice")).toEqual(["99"]);
  });

  it("does not snap Tree wheel scrolling to a selected/focused unmounted row", async () => {
    const wrapper = mount(Tree<Item>, {
      attachTo: document.body,
      props: { items, itemKey: "id", modelValue: 80, virtualize: { itemHeight: 20, height: 80, overscan: 2 }, transition: false, ariaLabel: "Tree" },
    });
    mounted.push(wrapper);
    const viewport = wrapper.get<HTMLElement>('[role="tree"]');
    await scroll(viewport.element, 0);
    const tree = (wrapper.vm as unknown as { tree: TreeController<Item> }).tree;
    expect(tree.focus(80)).toBe(true);
    await nextTick();
    expect(viewport.element.scrollTop).toBe(1600);
    const focusedId = wrapper.get('[data-akaza-focused="true"]').attributes("id");
    await scroll(viewport.element, 400);
    expect(viewport.element.scrollTop).toBe(400);
    expect(tree.focusedKey.value).toBe(80);
    expect(wrapper.find('[data-akaza-focused="true"]').exists()).toBe(false);
    expect(wrapper.findAll('[role="treeitem"]').length).toBeLessThan(15);
    expect(viewport.attributes("aria-activedescendant")).toBeUndefined();
    await scroll(viewport.element, 1600);
    const returned = wrapper.get('[data-akaza-focused="true"]');
    expect(returned.attributes("id")).toBe(focusedId);
    expect(returned.attributes("aria-posinset")).toBe("81");
    expect(returned.attributes("aria-setsize")).toBe("100");
  });

  it("rejects canceled Tree keyboard focus before scrolling and skips disabled final rows", async () => {
    let cancel = true;
    const onFocusChange = vi.fn((_key, details) => { if (cancel) details.cancel(); });
    const wrapper = mount(Tree<Item & { disabled?: boolean }>, {
      props: {
        items: items.map(item => ({ ...item, disabled: item.id === 99 })), itemKey: "id",
        virtualize: { itemHeight: 20, height: 80, overscan: 2 }, transition: false, ariaLabel: "Tree", onFocusChange,
      },
    });
    mounted.push(wrapper);
    const viewport = wrapper.get<HTMLElement>('[role="tree"]');
    await scroll(viewport.element, 0);
    await wrapper.get('[role="treeitem"]').trigger("keydown", { key: "End" });
    expect(viewport.element.scrollTop).toBe(0);
    expect(onFocusChange.mock.calls[0]![0]).toBe(98);
    expect(onFocusChange.mock.calls[0]![1]).toMatchObject({ reason: "keyboard", event: expect.any(KeyboardEvent) });
    cancel = false;
    await wrapper.get('[role="treeitem"]').trigger("keydown", { key: "End" });
    await nextTick();
    expect(viewport.element.scrollTop).toBe(1960);
    expect(wrapper.get('[data-akaza-focused="true"]').text()).toContain("Item 98");
  });

  it("updates expanded lazy Tree rows and empty data without introducing form serialization", async () => {
    interface LazyItem { id: number; label: string; children?: LazyItem[] }
    const wrapper = mount(Tree<LazyItem>, {
      props: {
        items: [{ id: 1, label: "Remote" }], itemKey: "id", hasChildren: item => item.id === 1,
        expanded: [1], loadingKeys: [1], virtualize: { itemHeight: 20, height: 80, overscan: 2 },
        transition: false, ariaLabel: "Tree",
      },
    });
    mounted.push(wrapper);
    const viewport = wrapper.get<HTMLElement>('[role="tree"]');
    await scroll(viewport.element, 0);
    expect(wrapper.get('[role="treeitem"]').attributes("aria-busy")).toBe("true");
    await wrapper.setProps({ items: [{ id: 1, label: "Remote", children: [{ id: 2, label: "Loaded" }] }], loadingKeys: [] });
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);
    expect(wrapper.findAll('[role="treeitem"]')[1]!.attributes("aria-level")).toBe("2");
    await wrapper.setProps({ expanded: [] });
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(1);
    await wrapper.setProps({ disabled: true });
    await wrapper.get('[role="treeitem"]').trigger("keydown", { key: "End" });
    expect(viewport.element.scrollTop).toBe(0);
    await wrapper.setProps({ items: [] });
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(0);
    expect(wrapper.find("input").exists()).toBe(false);
  });
});
