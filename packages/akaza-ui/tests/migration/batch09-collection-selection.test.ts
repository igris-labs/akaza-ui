import type { AkazaChangeEventDetails } from "@/types";
import { checkPattern } from "@ui-sdk/core/testing";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { CheckboxGroup } from "@/components/checkbox-group";
import { ColorSwatchPicker } from "@/components/color-swatch-picker";
import { Combobox } from "@/components/combobox";
import { Listbox } from "@/components/listbox";
import { Select } from "@/components/select";
import { ToggleGroup } from "@/components/toggle-group";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
});

const options = [
  { value: "a", label: "Alpha" },
  { value: "disabled", label: "Disabled", disabled: true },
  { type: "label" as const, label: "Group" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Charlie" },
];

describe("batch 09 Listbox collection selection", () => {
  it("replaces Shift ranges even with Ctrl, then shrinks them after accepted highlight", async () => {
    const wrapper = mount(Listbox, { props: { options, multiple: true, modelValue: ["a", "disabled", "ghost"], ariaLabel: "Choices" } });
    mounted.push(wrapper);
    await wrapper.get('[role="listbox"]').trigger("focusin");
    await wrapper.get('[role="listbox"]').trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual(["a", "b"]);
    expect(wrapper.emitted("value-change")?.[0]?.[1]).toMatchObject({ reason: "range", event: expect.any(KeyboardEvent) });
    await wrapper.setProps({ modelValue: ["a", "b"] });
    await wrapper.findAll('[role="option"]')[3]!.trigger("click", { shiftKey: true, ctrlKey: true });
    expect(wrapper.emitted("value-change")?.[1]?.[0]).toEqual(["a", "b", "c"]);
    expect(wrapper.emitted("value-change")?.[1]?.[1]).toMatchObject({ reason: "select", event: expect.any(MouseEvent) });
    await wrapper.setProps({ modelValue: ["a", "b", "c"] });
    await wrapper.get('[role="listbox"]').trigger("keydown", { key: "ArrowUp", shiftKey: true });
    expect(wrapper.emitted("value-change")?.[2]?.[0]).toEqual(["a", "b"]);
  });

  it("does not request a canceled highlight range and retries a canceled value range", async () => {
    let cancelHighlight = true;
    let cancelValue = false;
    const wrapper = mount(Listbox, { props: {
      options, multiple: true, modelValue: ["a"], ariaLabel: "Choices", loop: false,
      onHighlightChange: (_option: unknown, details: AkazaChangeEventDetails) => { if (cancelHighlight) details.cancel(); },
      onValueChange: (_value: unknown, details: AkazaChangeEventDetails) => { if (cancelValue) details.cancel(); },
    } });
    mounted.push(wrapper);
    const list = wrapper.get('[role="listbox"]');
    await list.trigger("focusin");
    await list.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(wrapper.emitted("value-change")).toBeUndefined();
    cancelHighlight = false;
    cancelValue = true;
    await list.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(list.attributes("aria-activedescendant")).toContain("option-3");
    cancelValue = false;
    await list.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(wrapper.emitted("value-change")?.[1]?.[0]).toEqual(["a", "b", "c"]);
    await list.trigger("keydown", { key: "ArrowDown", shiftKey: true });
    expect(wrapper.emitted("value-change")).toHaveLength(2);
  });

  it("keeps select-all filter scoped, enabled only, non-toggling and repeated-event compatible", async () => {
    const wrapper = mount(Listbox, { props: { options, modelValue: ["disabled", "ghost"], multiple: true, filterable: true, search: "Beta", ariaLabel: "Choices" } });
    mounted.push(wrapper);
    const list = wrapper.get('[role="listbox"]');
    await list.trigger("keydown", { key: "a", ctrlKey: true });
    await list.trigger("keydown", { key: "a", metaKey: true });
    expect(wrapper.emitted("value-change")?.map(call => call[0])).toEqual([["b"], ["b"]]);
    expect(wrapper.emitted("value-change")?.map(call => (call[1] as AkazaChangeEventDetails).reason)).toEqual(["select-all", "select-all"]);
  });

  it("keeps toggle and replace policies separate, including modifiers and disabled selected values", async () => {
    const wrapper = mount(Listbox, { props: { options, modelValue: ["a", "disabled", "ghost"], "onUpdate:modelValue": vi.fn(), multiple: true, ariaLabel: "Choices" } });
    mounted.push(wrapper);
    await wrapper.findAll('[role="option"]')[2]!.trigger("click");
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual(["a", "disabled", "ghost", "b"]);
    await wrapper.setProps({ selectionBehavior: "replace" });
    await wrapper.findAll('[role="option"]')[2]!.trigger("click");
    expect(wrapper.emitted("value-change")?.[1]?.[0]).toEqual(["b"]);
    await wrapper.findAll('[role="option"]')[2]!.trigger("click", { ctrlKey: true });
    expect(wrapper.emitted("value-change")?.[2]?.[0]).toEqual(["a", "disabled", "ghost", "b"]);
    await wrapper.findAll('[role="option"]')[1]!.trigger("click");
    expect(wrapper.emitted("value-change")).toHaveLength(3);
  });

  it.each(["id", "function", "identity"])("keeps %s object equality and source references after reorder", async (mode) => {
    const old = { id: 1, label: "Old" };
    const fresh = { id: 1, label: "Fresh" };
    const ghost = { id: 9 };
    const wrapper = mount(Listbox, { props: {
      options: [{ value: fresh, label: "Fresh" }], modelValue: [old, ghost], multiple: true, ariaLabel: "Objects",
      "onUpdate:modelValue": vi.fn(),
      ...(mode === "id" ? { by: "id" } : mode === "function" ? { by: (a: unknown, b: unknown) => (a as typeof old).id === (b as typeof old).id } : {}),
    } });
    mounted.push(wrapper);
    await wrapper.get('[role="option"]').trigger("click");
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual(mode === "identity" ? [old, ghost, fresh] : [ghost]);
    await wrapper.setProps({ options: [{ value: { id: 2 }, label: "Other" }, { value: fresh, label: "Replaced" }] });
    await wrapper.findAll('[role="option"]')[1]!.trigger("click");
    expect(wrapper.emitted("value-change")?.[1]?.[0]).toEqual(mode === "identity" ? [old, ghost, fresh] : [ghost]);
  });

  it("distinguishes numeric and string values and permits required-empty validation", async () => {
    const wrapper = mount(Listbox, { props: {
      options: [{ value: 1, label: "Numeric" }, { value: "1", label: "String" }], modelValue: [1], multiple: true, required: true, ariaLabel: "Typed",
      "onUpdate:modelValue": vi.fn(),
    } });
    mounted.push(wrapper);
    await wrapper.findAll('[role="option"]')[1]!.trigger("click");
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual([1, "1"]);
    await wrapper.findAll('[role="option"]')[0]!.trigger("click");
    expect(wrapper.emitted("value-change")?.[1]?.[0]).toEqual([]);
    await wrapper.setProps({ modelValue: [] });
    expect((wrapper.get("input").element as HTMLInputElement).validity.valid).toBe(false);
  });

  it("emits repeated single choices and uses nullable clear without a second selection", async () => {
    const wrapper = mount(Listbox, { props: { options, modelValue: "a", nullableValue: "none", required: true, ariaLabel: "Single" } });
    mounted.push(wrapper);
    await wrapper.findAll('[role="option"]')[0]!.trigger("click");
    await wrapper.findAll('[role="option"]')[0]!.trigger("click");
    expect(wrapper.emitted("value-change")?.map(call => call[0])).toEqual(["a", "a"]);
    (wrapper.vm as unknown as { clear: () => void }).clear();
    expect(wrapper.emitted("value-change")?.[2]?.[0]).toBe("none");
    expect(wrapper.emitted("value-change")?.[2]?.[1]).toMatchObject({ reason: "clear" });
  });

  it("preserves positional range anchors after filtering shrinks the visible list", async () => {
    const wrapper = mount(Listbox, { props: { options, modelValue: [], multiple: true, filterable: true, ariaLabel: "Choices" } });
    mounted.push(wrapper);
    await wrapper.findAll('[role="option"]')[3]!.trigger("click");
    await wrapper.get('[type="search"]').setValue("Alpha");
    await wrapper.get('[role="option"]').trigger("click", { shiftKey: true });
    expect(wrapper.emitted("value-change")?.[1]?.[0]).toEqual(["a"]);
  });

  it("satisfies the SDK listbox pattern without SDK DOM binding", async () => {
    const wrapper = mount(Listbox, { attachTo: document.body, props: { options, ariaLabel: "Choices" } });
    mounted.push(wrapper);
    await checkPattern(wrapper.element as HTMLElement, "listbox");
    expect(wrapper.find("[data-slot]").exists()).toBe(false);
  });

  it("selects unmounted virtual rows without replacing the virtualizer or binding SDK DOM", async () => {
    const items = Array.from({ length: 1000 }, (_, value) => ({ value, label: `Item ${value}`, disabled: value === 500 }));
    const wrapper = mount(Listbox, { props: { options: items, multiple: true, modelValue: [0], virtualize: true, virtualHeight: 80, virtualItemHeight: 20, ariaLabel: "Virtual" } });
    mounted.push(wrapper);
    expect(wrapper.findAll('[role="option"]').length).toBeLessThan(1000);
    const list = wrapper.get<HTMLElement>('[role="listbox"]');
    list.element.scrollTo = vi.fn((options: ScrollToOptions) => {
      list.element.scrollTop = options.top ?? 0;
      list.element.dispatchEvent(new Event("scroll"));
    });
    await list.trigger("focusin");
    await list.trigger("keydown", { key: "End" });
    await list.trigger("keydown", { key: "ArrowUp", shiftKey: true });
    const range = wrapper.emitted("value-change")?.[0]?.[0] as number[];
    expect(range).toHaveLength(998);
    expect(range[0]).toBe(0);
    expect(range.at(-1)).toBe(998);
    expect(range).not.toContain(500);
    await list.trigger("keydown", { key: "a", ctrlKey: true });
    expect((wrapper.emitted("value-change")?.[1]?.[0] as number[])).toHaveLength(999);
  });
});

describe("batch 09 CheckboxGroup membership", () => {
  it("keeps the refused parent checkbox derived from accepted selection", async () => {
    const wrapper = mount(CheckboxGroup, { props: { parent: true, options: [{ value: "a" }], modelValue: [], "onUpdate:modelValue": vi.fn() } });
    mounted.push(wrapper);
    await wrapper.get(".akaza-checkbox-group-parent button").trigger("click");
    await wrapper.get(".akaza-checkbox-group-parent button").trigger("click");
    expect(wrapper.emitted("value-change")?.map(call => call[0])).toEqual([["a"], ["a"]]);
    expect(wrapper.get(".akaza-checkbox-group-parent button").attributes("aria-checked")).toBe("false");
  });

  it("keeps numeric/string keys distinct and retains disabled/unknown values on child changes", async () => {
    const wrapper = mount(CheckboxGroup, { props: { options: [{ value: 1, label: "Number" }, { value: "1", label: "String" }, { value: "locked", disabled: true }], modelValue: [1, "locked", "unknown"], legend: "Typed" } });
    mounted.push(wrapper);
    await wrapper.findAll('[role="checkbox"]')[1]!.trigger("keydown", { key: " " });
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual([1, "locked", "unknown", "1"]);
    expect(wrapper.emitted("value-change")?.[0]?.[1]).toMatchObject({ reason: "keyboard", event: expect.any(KeyboardEvent) });
    await wrapper.setProps({ options: [{ value: "1", label: "String" }, { value: 1, label: "Number" }] });
    expect(wrapper.findAll('[role="checkbox"]')[0]!.attributes("aria-checked")).toBe("true");
    expect(wrapper.findAll('[role="checkbox"]')[1]!.attributes("aria-checked")).toBe("true");
  });

  it("keeps parent allValues, disabled retention and clear semantics outside SDK toggleAll", async () => {
    const wrapper = mount(CheckboxGroup, { props: {
      parent: true, options: [{ value: "a", label: "A" }, { value: "locked", label: "Locked", disabled: true }],
      allValues: ["a", "absent", "locked"], modelValue: ["locked", "unknown"], legend: "Choices",
    } });
    mounted.push(wrapper);
    await wrapper.get(".akaza-checkbox-group-parent button").trigger("click");
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual(["locked", "unknown", "a", "absent"]);
    await wrapper.get(".akaza-checkbox-group-parent button").trigger("click");
    expect(wrapper.emitted("value-change")?.[1]?.[0]).toEqual(["locked", "unknown"]);
  });

  it("preserves asymmetric duplicate policies: additions deduplicate, removals do not", async () => {
    const wrapper = mount(CheckboxGroup, { props: { options: [{ value: "a" }, { value: "b" }], modelValue: ["a", "ghost", "ghost"] } });
    mounted.push(wrapper);
    await wrapper.findAll('[role="checkbox"]')[0]!.trigger("click");
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual(["ghost", "ghost"]);
    await wrapper.setProps({ modelValue: ["a", "ghost", "ghost"] });
    await wrapper.findAll('[role="checkbox"]')[1]!.trigger("click");
    expect(wrapper.emitted("value-change")?.[1]?.[0]).toEqual(["a", "ghost", "b"]);
  });

  it("propagates group cancellation into the child and rereads refused controlled updates", async () => {
    let canceled = true;
    const wrapper = mount(CheckboxGroup, { props: { options: [{ value: "a", label: "A" }], modelValue: [], "onUpdate:modelValue": vi.fn(), onValueChange: (_value: unknown, details: AkazaChangeEventDetails) => { if (canceled) details.cancel(); } } });
    mounted.push(wrapper);
    const checkbox = wrapper.get('[role="checkbox"]');
    await checkbox.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(checkbox.attributes("aria-checked")).toBe("false");
    canceled = false;
    await checkbox.trigger("click");
    await checkbox.trigger("click");
    expect(wrapper.emitted("value-change")?.map(call => call[0])).toEqual([["a"], ["a"], ["a"]]);
    expect(checkbox.attributes("aria-checked")).toBe("false");
  });

  it("keeps group required validity, every child's Space action, and native reset", async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const value = ref<Array<string | number>>([1]);
        return () => h("form", [h(CheckboxGroup, {
          options: [{ value: 1, label: "Number" }, { value: "1", label: "String" }],
          modelValue: value.value, name: "choice", required: true, legend: "Choices",
          "onUpdate:modelValue": (next: Array<string | number>) => { value.value = next; },
        })]);
      },
    }), { attachTo: document.body });
    mounted.push(wrapper);
    const form = wrapper.get("form").element as HTMLFormElement;
    for (const button of wrapper.findAll('[role="checkbox"]')) await button.trigger("keydown", { key: " " });
    expect(new FormData(form).getAll("choice")).toEqual(["1"]);
    await wrapper.findAll('[role="checkbox"]')[1]!.trigger("keydown", { key: " " });
    expect((wrapper.get(".akaza-checkbox-group-input").element as HTMLInputElement).validity.valid).toBe(false);
    form.reset();
    await flushPromises();
    expect(new FormData(form).getAll("choice")).toEqual(["1"]);
    expect(wrapper.findAll('[role="checkbox"]')[0]!.attributes("aria-checked")).toBe("true");
    expect(wrapper.findComponent(CheckboxGroup).emitted("value-change")).toHaveLength(3);
  });
});

it("batch 09 Combobox keeps isEqual object membership and native serialization on recreated options", async () => {
  const wrapper = mount(Combobox, { props: {
    options: [{ value: { id: 1, revision: "new" }, label: "One" }, { value: { id: 2 }, label: "Two" }],
    modelValue: [{ id: 1, revision: "old" }, { id: 9 }], multiple: true, open: true, name: "object", ariaLabel: "Objects",
    isEqual: (a, b) => typeof a === "object" && typeof b === "object" && a.id === b.id,
    serializeValue: value => String((value as { id: number }).id),
    "onUpdate:modelValue": vi.fn(),
  } });
  mounted.push(wrapper);
  await wrapper.findAll('[role="option"]')[0]!.trigger("click");
  expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual([{ id: 9 }]);
  await wrapper.setProps({ options: [{ value: { id: 2 }, label: "Two" }, { value: { id: 1 }, label: "Recreated" }] });
  await wrapper.findAll('[role="option"]')[1]!.trigger("click");
  expect(wrapper.emitted("value-change")?.[1]?.[0]).toEqual([{ id: 9 }]);
  expect(wrapper.findAll('input[name="object"]').map(input => (input.element as HTMLInputElement).value)).toEqual(["1", "9"]);
});

it("batch 09 Select preserves normalized string values and duplicate/disabled selections", async () => {
  const wrapper = mount(Select, { props: {
    options: [{ value: 1, label: "Numeric option" }, { value: "b", label: "Beta" }, { value: "locked", disabled: true }],
    modelValue: ["1", "1", "locked", "unknown"], multiple: true, open: true, ariaLabel: "Select", "onUpdate:modelValue": vi.fn(),
  } });
  mounted.push(wrapper);
  await wrapper.findAll('[role="option"]')[1]!.trigger("click");
  expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual(["1", "1", "locked", "unknown", "b"]);
  await wrapper.findAll('[role="option"]')[0]!.trigger("click");
  expect(wrapper.emitted("value-change")?.[1]?.[0]).toEqual(["locked", "unknown"]);
});

for (const Component of [Listbox, Select, Combobox]) {
  describe(`batch 09 ${Component.__name} action boundaries`, () => {
    it("does not advance selection on controlled rejection or cancellation", async () => {
      let canceled = false;
      const wrapper = mount(Component, { props: {
        options, modelValue: ["a", "disabled"], multiple: true, open: true, ariaLabel: "Choices",
        "onUpdate:modelValue": vi.fn(),
        onValueChange: (_value: unknown, details: AkazaChangeEventDetails) => { if (canceled) details.cancel(); },
      } });
      mounted.push(wrapper);
      for (let i = 0; i < 2; i++) await wrapper.findAll('[role="option"]')[2]!.trigger("click");
      expect(wrapper.emitted("value-change")?.map(call => call[0])).toEqual([["a", "disabled", "b"], ["a", "disabled", "b"]]);
      expect(wrapper.findAll('[role="option"]')[2]!.attributes("aria-selected")).toBe("false");
      canceled = true;
      await wrapper.findAll('[role="option"]')[2]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")).toHaveLength(2);
      await wrapper.setProps({ modelValue: ["b", "disabled"] });
      canceled = false;
      await wrapper.findAll('[role="option"]')[2]!.trigger("click");
      expect(wrapper.emitted("value-change")?.[3]?.[0]).toEqual(["disabled"]);
    });

    it("preserves forms, required validation, canceled reset and silent native reset", async () => {
      const Wrapper = defineComponent({
        setup() {
          const value = ref(["a"]);
          return () => h("form", [h(Component, { options, multiple: true, modelValue: value.value, name: "choice", required: true, open: true, ariaLabel: "Choices", "onUpdate:modelValue": (next: unknown) => { value.value = next as string[]; } })]);
        },
      });
      const wrapper = mount(Wrapper, { attachTo: document.body });
      mounted.push(wrapper);
      const form = wrapper.get("form").element as HTMLFormElement;
      const component = wrapper.findComponent(Component);
      await wrapper.findAll('[role="option"]')[2]!.trigger("click");
      expect(new FormData(form).getAll("choice")).toEqual(["a", "b"]);
      const cancel = (event: Event) => event.preventDefault();
      form.addEventListener("reset", cancel);
      form.reset();
      await flushPromises();
      expect(new FormData(form).getAll("choice")).toEqual(["a", "b"]);
      form.removeEventListener("reset", cancel);
      form.reset();
      await flushPromises();
      expect(new FormData(form).getAll("choice")).toEqual(["a"]);
      expect(component.emitted("value-change")).toHaveLength(1);
    });
  });
}

it("batch 09 ColorSwatchPicker inherits replacement range/cancellation with one selection engine", async () => {
  const wrapper = mount(ColorSwatchPicker, { props: { items: ["red", "green", { value: "blue", disabled: true }, "white"], modelValue: ["#ff0000"], multiple: true, ariaLabel: "Colors" } });
  mounted.push(wrapper);
  const list = wrapper.get('[role="listbox"]');
  await list.trigger("focusin");
  await list.trigger("keydown", { key: "ArrowRight", shiftKey: true });
  expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual(["#ff0000", "#008000"]);
  expect(wrapper.emitted("value-commit")).toHaveLength(1);
});

it("batch 09 preserves ToggleGroup required and disallowed-empty event policies", async () => {
  const wrapper = mount(ToggleGroup, { props: { options: [{ value: "a" }], modelValue: "a", allowEmpty: false } });
  mounted.push(wrapper);
  await wrapper.get("button").trigger("click");
  expect(wrapper.emitted("value-change")?.[0]?.[0]).toBe("a");
  await wrapper.setProps({ required: true, allowEmpty: true });
  await wrapper.get("button").trigger("click");
  expect(wrapper.emitted("value-change")).toHaveLength(1);
});

it("batch 09 hydrates all four consumers with stable IDs, native values and popup metadata", async () => {
  const View = defineComponent({
    render: () => h("form", [
      h(Listbox, { options, modelValue: ["a"], multiple: true, name: "list", ariaLabel: "List" }),
      h(CheckboxGroup, { options: [{ value: 1, label: "Number" }, { value: "1", label: "String" }], modelValue: [1], name: "check", legend: "Check" }),
      h(Select, { options, modelValue: "b", name: "select", ariaLabel: "Select" }),
      h(Combobox, { options, modelValue: "c", name: "combo", ariaLabel: "Combo" }),
    ]),
  });
  const host = document.createElement("div");
  host.innerHTML = await renderToString(createSSRApp(View));
  document.body.append(host);
  const ids = [...host.querySelectorAll("[id]")].map(element => element.id);
  const popupSlots = [...host.querySelectorAll("[data-slot]")].map(element => element.getAttribute("data-slot"));
  const warn = vi.fn();
  const app = createSSRApp(View);
  app.config.warnHandler = warn;
  try {
    app.mount(host);
    await nextTick();
    await flushPromises();
    expect(warn).not.toHaveBeenCalled();
    expect([...host.querySelectorAll("[id]")].map(element => element.id)).toEqual(ids);
    expect(popupSlots).toEqual(["akaza-select-popup-trigger", "akaza-combobox-popup-trigger"]);
    expect([...host.querySelectorAll("[data-slot]")].map(element => element.getAttribute("data-slot"))).toEqual(popupSlots);
    for (const trigger of host.querySelectorAll(".akaza-select-trigger, .akaza-combobox-input")) {
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(trigger.hasAttribute("aria-controls")).toBe(false);
    }
    expect(host.querySelector(".akaza-select-content, .akaza-combobox-content")).toBeNull();
    expect([...new FormData(host.querySelector("form")!).entries()]).toEqual([["list", "a"], ["check", "1"], ["select", "b"], ["combo", "c"]]);
  } finally {
    app.unmount();
    host.remove();
  }
});
