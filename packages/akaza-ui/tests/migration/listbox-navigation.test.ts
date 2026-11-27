import type { ListboxModelValue, ListboxProps } from "@/components/listbox";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { ColorSwatchPicker } from "@/components/color-swatch-picker";
import { Listbox } from "@/components/listbox";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
});
function track<T extends { unmount: () => void }>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}
const options = [
  { type: "label" as const, label: "Options" },
  { value: "a", label: "Alpha" },
  { value: "skip", label: "Unavailable", disabled: true },
  { value: "b", label: "Beta" },
  { type: "separator" as const },
  { value: "c", label: "Charlie" },
];

describe("sdk Listbox navigation compatibility", () => {
  it.each([
    { orientation: "vertical", dir: "ltr", next: "ArrowDown", previous: "ArrowUp" },
    { orientation: "horizontal", dir: "ltr", next: "ArrowRight", previous: "ArrowLeft" },
    { orientation: "horizontal", dir: "rtl", next: "ArrowLeft", previous: "ArrowRight" },
  ] as const)("preserves $orientation/$dir focus, disabled skipping, and wrapping", async ({ orientation, dir, next, previous }) => {
    const wrapper = track(mount(Listbox, { props: { options, modelValue: "a", orientation, dir, ariaLabel: "Options" }, attachTo: document.body }));
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    expect(wrapper.get(".akaza-listbox").attributes("dir")).toBe(dir);
    content.element.focus();
    await nextTick();
    const active = () => wrapper.get(`[id="${content.attributes("aria-activedescendant")}"]`).get(".akaza-listbox-option-label").text();
    expect(active()).toBe("Alpha");
    await content.trigger("keydown", { key: next });
    expect(active()).toBe("Beta");
    await content.trigger("keydown", { key: previous });
    expect(active()).toBe("Alpha");
    await content.trigger("keydown", { key: previous });
    expect(active()).toBe("Charlie");
    await content.trigger("keydown", { key: "Home" });
    expect(active()).toBe("Alpha");
    await content.trigger("keydown", { key: "End" });
    expect(active()).toBe("Charlie");
    expect(document.activeElement).toBe(content.element);
    expect(wrapper.emitted("value-change")).toBeUndefined();
    expect(wrapper.get('[aria-selected="true"]').get(".akaza-listbox-option-label").text()).toBe("Alpha");
  });

  it("retries canceled highlights from accepted state without scrolling or selecting a range", async () => {
    const cancel = vi.fn((_option, details) => details.cancel());
    const wrapper = track(mount(Listbox, { props: { options, modelValue: ["a"], multiple: true, onHighlightChange: cancel }, attachTo: document.body }));
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    content.element.focus();
    await nextTick();
    const before = content.attributes("aria-activedescendant");
    content.element.scrollTop = 42;
    await content.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    await content.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(cancel.mock.calls.map(call => call[0].value)).toEqual(["b", "b"]);
    expect(cancel.mock.calls[0]![1]).toMatchObject({ reason: "keyboard", event: expect.any(KeyboardEvent) });
    expect(content.attributes("aria-activedescendant")).toBe(before);
    expect(content.element.scrollTop).toBe(42);
    expect(wrapper.emitted("value-change")).toBeUndefined();
    await wrapper.setProps({ onHighlightChange: undefined });
    await content.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(wrapper.emitted("value-change")![0]![0]).toEqual(["a", "b"]);
    expect(wrapper.emitted("value-change")![0]![1]).toMatchObject({ reason: "range" });
  });

  it("keeps focus independent of canceled or refused value changes", async () => {
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(Listbox, { props: {
      options, modelValue: ["a"], multiple: true, onValueChange: cancel, "onUpdate:modelValue": vi.fn(),
    }, attachTo: document.body }));
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    content.element.focus();
    await content.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(content.attributes("aria-activedescendant")).toContain("option-3");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.setProps({ onValueChange: undefined });
    await content.trigger("keydown", { key: "ArrowDown" });
    expect(content.attributes("aria-activedescendant")).toContain("option-5");
    await content.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")!.at(-1)).toEqual([["a", "c"]]);
    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(1);
    expect(document.activeElement).toBe(content.element);
  });

  it("enters at the last enabled option after leaving, and stops without looping", async () => {
    const wrapper = track(mount(Listbox, { props: { options, modelValue: "a", loop: false }, attachTo: document.body }));
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    content.element.focus();
    await content.trigger("pointerleave");
    expect(content.attributes("aria-activedescendant")).toBeUndefined();
    await content.trigger("keydown", { key: "ArrowUp" });
    expect(content.attributes("aria-activedescendant")).toContain("option-5");
    await content.trigger("keydown", { key: "ArrowDown" });
    expect(content.attributes("aria-activedescendant")).toContain("option-5");
    await content.trigger("keydown", { key: "Home" });
    await content.trigger("keydown", { key: "ArrowUp" });
    expect(content.attributes("aria-activedescendant")).toContain("option-1");
  });

  it("reconciles shrinking, disabled, and empty results without stealing focus", async () => {
    const wrapper = track(mount(Listbox, { props: { options, modelValue: "a" }, attachTo: document.body }));
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    content.element.focus();
    await content.trigger("keydown", { key: "End" });
    await wrapper.setProps({ options: [options[1]!] });
    await nextTick();
    expect(content.attributes("aria-activedescendant")).toContain("option-0");
    await wrapper.setProps({ options: [{ ...options[1]!, disabled: true }] });
    await nextTick();
    expect(content.attributes("aria-activedescendant")).toBeUndefined();
    await wrapper.setProps({ options: [] });
    await content.trigger("keydown", { key: "End" });
    expect(content.attributes("aria-activedescendant")).toBeUndefined();
    expect(document.activeElement).toBe(content.element);
  });

  it("preserves custom filtering, search cancellation, visible select-all, and repeated select-all", async () => {
    const value = ref<ListboxModelValue>(["a"]);
    const cancelSearch = ref(false);
    const wrapper = track(mount(defineComponent({
      setup: () => () => h(Listbox, {
        options, modelValue: value.value, multiple: true, filterable: true,
        filter: option => option.value === "b" || option.value === "c",
        "onUpdate:modelValue": next => { value.value = next; },
        onSearchChange: (_value, details) => { if (cancelSearch.value) details.cancel(); },
      }),
    }), { attachTo: document.body }));
    const filter = wrapper.get<HTMLInputElement>(".akaza-listbox-filter");
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    await filter.setValue("custom");
    await filter.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(content.element);
    expect(wrapper.get('[data-akaza-highlighted="true"]').get(".akaza-listbox-option-label").text()).toBe("Beta");
    await content.trigger("keydown", { key: "a", ctrlKey: true });
    expect(value.value).toEqual(["b", "c"]);
    await content.trigger("keydown", { key: "a", metaKey: true });
    expect(value.value).toEqual(["b", "c"]);
    cancelSearch.value = true;
    await filter.setValue("denied");
    expect(filter.element.value).toBe("custom");
  });

  it("leaves IME, prevented events, and modified navigation/activation alone in list and filter", async () => {
    const wrapper = track(mount(Listbox, { props: { options, modelValue: "a", filterable: true, multiple: true }, attachTo: document.body }));
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    content.element.focus();
    await nextTick();
    const before = content.attributes("aria-activedescendant");
    for (const key of ["ArrowDown", "Home", "End", " ", "Enter", "a"]) {
      const guards = [{ isComposing: true }, { keyCode: 229 }, { altKey: true }, ...(key === "a" ? [] : [{ ctrlKey: true }, { metaKey: true }])];
      for (const guard of guards) await content.trigger("keydown", { key, ...guard });
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      event.preventDefault();
      content.element.dispatchEvent(event);
    }
    expect(content.attributes("aria-activedescendant")).toBe(before);
    expect(wrapper.emitted("value-change")).toBeUndefined();
    const filter = wrapper.get<HTMLInputElement>(".akaza-listbox-filter");
    filter.element.focus();
    for (const guard of [{ isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      await filter.trigger("keydown", { key: "ArrowDown", ...guard });
      expect(document.activeElement).toBe(filter.element);
    }
  });

  it.each(["id", "function"])("keeps object equality (%s), primitive type identity, and serialization outside SDK", async byKind => {
    const value = ref<ListboxModelValue>({ id: 1 });
    const by: ListboxProps["by"] = byKind === "id" ? "id" : (left, right) => typeof left === "object" && typeof right === "object" && left.id === right.id;
    const wrapper = track(mount(defineComponent({
      setup: () => () => h("form", h(Listbox, {
        options: [{ value: { id: 1 }, label: "One" }, { value: { id: 2 }, label: "Two" }],
        modelValue: value.value, by, name: "choice", serializeValue: item => String((item as { id: number }).id),
        "onUpdate:modelValue": next => { value.value = next; },
      })),
    }), { attachTo: document.body }));
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    content.element.focus();
    await content.trigger("keydown", { key: "End" });
    await content.trigger("keydown", { key: "Enter" });
    expect(value.value).toEqual({ id: 2 });
    expect(new FormData(wrapper.get<HTMLFormElement>("form").element).get("choice")).toBe("2");
    const primitive = track(mount(Listbox, { props: { options: [{ value: 0, label: "Number" }, { value: "0", label: "String" }], modelValue: 0 }, attachTo: document.body }));
    const primitiveContent = primitive.get<HTMLElement>('[role="listbox"]');
    primitiveContent.element.focus();
    await primitiveContent.trigger("keydown", { key: "End" });
    await primitiveContent.trigger("keydown", { key: "Enter" });
    expect(primitive.emitted("value-change")![0]![0]).toBe("0");
  });

  it("allows read-only navigation but blocks selection and disabled fieldset actions", async () => {
    const wrapper = track(mount(Listbox, { props: { options, modelValue: ["a"], multiple: true, readOnly: true }, attachTo: document.body }));
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    content.element.focus();
    await content.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(content.attributes("aria-activedescendant")).toContain("option-3");
    await content.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("value-change")).toBeUndefined();
    const disabled = track(mount(defineComponent({ render: () => h("fieldset", { disabled: true }, h(Listbox, { options, modelValue: "a" })) }), { attachTo: document.body }));
    const group = disabled.getComponent(Listbox);
    await group.get('[role="listbox"]').trigger("keydown", { key: "End" });
    await group.findAll('[role="option"]')[2]!.trigger("click");
    group.vm.clear();
    expect(group.emitted("value-change")).toBeUndefined();
  });

  it("does not scroll virtual rows when a keyboard highlight is canceled", async () => {
    const wrapper = track(mount(Listbox, { props: {
      options: Array.from({ length: 1000 }, (_, index) => ({ value: index, label: `Result ${index + 1}` })),
      modelValue: 0, virtualize: true, virtualHeight: 80, virtualItemHeight: 20,
      onHighlightChange: (_option, details) => details.cancel(),
    }, attachTo: document.body }));
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    content.element.focus();
    await nextTick();
    const before = content.attributes("aria-activedescendant");
    await content.trigger("keydown", { key: "End" });
    expect(content.element.scrollTop).toBe(0);
    expect(content.attributes("aria-activedescendant")).toBe(before);
    expect(wrapper.findAll('[role="option"]').length).toBeLessThan(1000);
  });

  it("preserves inherited ColorSwatchPicker RTL, cancellation, format, and native values", async () => {
    const cancel = ref(true);
    const wrapper = track(mount(defineComponent({
      render: () => h("form", h(ColorSwatchPicker, {
        modelValue: "#ff0000", format: "hsl", name: "color", dir: "rtl",
        items: ["red", { value: "blue", disabled: true }, "lime"],
        onValueChange: (_value, details) => { if (cancel.value && details.reason === "select") details.cancel(); },
      })),
    }), { attachTo: document.body }));
    const content = wrapper.get<HTMLElement>('[role="listbox"]');
    content.element.focus();
    await content.trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.get(".akaza-color-swatch-picker").attributes("dir")).toBe("rtl");
    expect(content.attributes("aria-activedescendant")).toContain("option-2");
    await content.trigger("keydown", { key: "Enter" });
    expect(wrapper.findAll('[aria-selected="true"]')[0]!.attributes("id")).toContain("option-0");
    cancel.value = false;
    await content.trigger("keydown", { key: "Enter" });
    expect(new FormData(wrapper.get<HTMLFormElement>("form").element).get("color")).toMatch(/^hsl\(120 /);
  });
});
