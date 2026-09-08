import { CalendarDate, HebrewCalendar, Time } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref, Teleport } from "vue";
import { Checkbox, CheckboxGroup, Combobox, DateField, DateRangeField, Dialog, Editable, Field, Form, Input, Listbox, Meter, MonthPicker, NumberField, PinInput, Progress, Rating, Select, Slider, Switch, TagsInput, TimeField, TimeRangeField, ToggleGroup, Toolbar } from "@/index";
import { useFocusBranch } from "@/utils/focusScope";

const mounted: Array<{ unmount: () => void }> = [];
function track<T extends { unmount: () => void }>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}
afterEach(() => {
  mounted.splice(0).reverse().forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

describe("review regressions", () => {
  it("uses the same clamped Progress value for ARIA and visual state", async () => {
    const wrapper = track(mount(Progress, { props: { modelValue: 200, max: 100 } }));
    expect(wrapper.attributes("aria-valuenow")).toBe("100");
    expect(wrapper.attributes("data-akaza-state")).toBe("complete");
    await wrapper.setProps({ modelValue: Number.NaN });
    expect(wrapper.attributes("aria-valuenow")).toBeUndefined();
    expect(wrapper.attributes("data-akaza-state")).toBe("indeterminate");
  });

  it("recognizes an optimum Meter region below the low threshold", () => {
    const wrapper = track(mount(Meter, { props: { value: 10, low: 20, high: 80, optimum: 5 } }));
    expect(wrapper.attributes("data-akaza-state")).toBe("optimum");
  });

  it.each([
    { component: Select, initial: "a", changed: "b", props: { options: [{ value: "a" }, { value: "b" }] } },
    { component: Combobox, initial: "a", changed: "b", props: { options: [{ value: "a" }, { value: "b" }] } },
    { component: Listbox, initial: "a", changed: "b", props: { options: [{ value: "a" }, { value: "b" }] } },
    { component: ToggleGroup, initial: "a", changed: "b", props: { options: [{ value: "a" }, { value: "b" }] } },
    { component: PinInput, initial: "1234", changed: "5678", props: {} },
    { component: Editable, initial: "before", changed: "after", props: {} },
    { component: TagsInput, initial: ["a"], changed: ["b"], props: {} },
    { component: Rating, initial: 2, changed: 4, props: {} },
    { component: Slider, initial: [10, 30], changed: [20, 40], props: {} },
  ])("resets $component.__name models and respects canceled resets", async ({ component, initial, changed, props }) => {
    const value = ref(initial);
    const wrapper = track(mount(defineComponent({
      setup: () => () => h("form", [h(component as import("vue").Component, {
        ...props,
        modelValue: value.value,
        "onUpdate:modelValue": (next: typeof initial) => { value.value = next; },
      })]),
    }), { attachTo: document.body }));
    value.value = changed;
    await nextTick();
    const form = wrapper.get("form").element;
    form.addEventListener("reset", event => event.preventDefault(), { once: true });
    form.reset();
    await nextTick();
    expect(value.value).toEqual(changed);
    form.reset();
    await nextTick();
    await nextTick();
    expect(value.value).toEqual(initial);
  });

  it("keeps an active Combobox option by identity and handles empty async results", async () => {
    const wrapper = track(mount(Combobox, { props: { open: true, options: [{ value: "a" }, { value: "b" }] } }));
    const input = wrapper.get(".akaza-combobox-input");
    await input.trigger("keydown", { key: "ArrowDown" });
    await wrapper.setProps({ options: [] });
    expect(input.attributes("aria-activedescendant")).toBeUndefined();
    await input.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("does not select while confirming IME text", async () => {
    const wrapper = track(mount(Combobox, { props: { open: true, options: [{ value: "a" }] } }));
    await wrapper.get(".akaza-combobox-input").trigger("keydown", { key: "ArrowDown" });
    await wrapper.get(".akaza-combobox-input").trigger("keydown", { key: "Enter", isComposing: true });
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("matches fractional Rating radio values to the accepted model", async () => {
    const wrapper = track(mount(Rating, { props: { step: 0.3 } }));
    for (const radio of wrapper.findAll('[role="radio"]')) {
      await radio.trigger("click");
      const accepted = wrapper.emitted("value-change")!.slice(-1)[0]![0] as number;
      expect(accepted).toBeLessThanOrEqual(5);
      expect(wrapper.findAll('[aria-checked="true"]')).toHaveLength(1);
    }
  });

  it("inherits Field metadata and reveals checkable validation only after interaction", async () => {
    const wrapper = track(mount(defineComponent({ render: () => h(Field, { name: "consent", label: "Consent", required: true }, () => h(Checkbox)) })));
    const button = wrapper.get('[role="checkbox"]');
    expect(button.attributes("aria-invalid")).toBeUndefined();
    expect(wrapper.get("input").attributes("name")).toBe("consent");
    await button.trigger("blur");
    expect(button.attributes("aria-invalid")).toBe("true");
    expect(wrapper.find(".akaza-field-error").exists()).toBe(true);
  });

  it("does not toggle a checkbox when following an embedded link", async () => {
    const wrapper = track(mount(Checkbox, { slots: { label: () => h("a", { href: "#terms" }, "Terms") } }));
    await wrapper.get("a").trigger("click");
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("preserves disabled selections through group select-all", async () => {
    const wrapper = track(mount(CheckboxGroup, { props: { modelValue: ["a"], parent: true, options: [{ value: "a", disabled: true }, { value: "b" }] } }));
    await wrapper.get(".akaza-checkbox-group-parent button").trigger("click");
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual(["a", "b"]);
  });

  it("includes the clicked submit button in FormData", async () => {
    const wrapper = track(mount(Form, { slots: { default: () => h("button", { name: "intent", value: "save" }, "Save") }, attachTo: document.body }));
    await wrapper.get("button").trigger("click");
    const details = wrapper.emitted("submit")?.[0]?.[0] as { formData: FormData };
    expect(details.formData.get("intent")).toBe("save");
  });

  it("honors canceled reset and otherwise restores NumberField", async () => {
    const cancel = ref(true);
    const value = ref<number | null>(3);
    const wrapper = track(mount(defineComponent({ render: () => h("form", { onReset: (event: Event) => { if (cancel.value) event.preventDefault(); } }, h(NumberField, { modelValue: value.value, "onUpdate:modelValue": next => { value.value = next; } })) }), { attachTo: document.body }));
    await wrapper.get("input").setValue("4");
    wrapper.get("form").element.reset();
    await nextTick();
    await nextTick();
    expect(value.value).toBe(4);
    cancel.value = false;
    wrapper.get("form").element.reset();
    await nextTick();
    await nextTick();
    expect(value.value).toBe(3);
  });

  it("preserves custom Toolbar slot component identity", async () => {
    let mounts = 0;
    const Child = defineComponent({ setup() { mounts++; return () => h("span", "Stable"); } });
    const wrapper = track(mount(Toolbar, { props: { items: [{ value: "one", slot: "custom" }] }, slots: { custom: () => h(Child) } }));
    await wrapper.setProps({ disabled: true });
    expect(mounts).toBe(1);
  });
  it("does not restore a scroll lock it never acquired", () => {
    document.body.style.overflow = "clip";
    track(mount(Dialog));
    expect(document.body.style.overflow).toBe("clip");
  });

  it("keeps a modal's logically owned portal focusable", async () => {
    const Branch = defineComponent({
      setup() {
        const input = ref<HTMLElement | null>(null);
        useFocusBranch(input);
        return () => h(Teleport, { to: "body" }, h("input", { ref: input, id: "owned-input" }));
      },
    });
    track(mount(Dialog, { props: { modelValue: true }, slots: { body: () => [h("button", "inside"), h(Branch)] }, attachTo: document.body }));
    await nextTick();
    await nextTick();
    const input = document.getElementById("owned-input")!;
    input.focus();
    expect(document.activeElement).toBe(input);
    expect(input.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("restores canceled input text before submission", async () => {
    const wrapper = track(mount(Input, { props: { modelValue: "accepted", "onValue-change": (_value, details) => details.cancel() } }));
    await wrapper.get("input").setValue("rejected");
    expect(wrapper.get("input").element.value).toBe("accepted");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("allows a numeric draft below min and stepping from empty", async () => {
    const wrapper = track(mount(NumberField, { props: { min: 10, max: 100 } }));
    expect(wrapper.get(".akaza-number-field-increment").attributes("disabled")).toBeUndefined();
    await wrapper.get("input").setValue("1");
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toBe(1);
    await wrapper.get("input").setValue("12");
    expect(wrapper.emitted("value-change")?.[1]?.[0]).toBe(12);
  });

  it("preserves empty PIN positions during edits and deletion", async () => {
    const wrapper = track(mount(PinInput));
    const inputs = wrapper.findAll(".akaza-pin-input-input");
    await inputs[2]!.setValue("7");
    expect(inputs.map(input => (input.element as HTMLInputElement).value)).toEqual(["", "", "7", ""]);
    await inputs[1]!.setValue("4");
    await inputs[1]!.trigger("keydown", { key: "Delete" });
    expect(inputs.map(input => (input.element as HTMLInputElement).value)).toEqual(["", "", "7", ""]);
  });

  it.each([Checkbox, Switch])("respects native disabled fieldsets and interactive label descendants", async (Control) => {
    const wrapper = track(mount(defineComponent({
      render: () => h("fieldset", { disabled: true }, h(Control, { label: "Consent" })),
    })));
    await wrapper.get("span[class$='-text']").trigger("click");
    expect(wrapper.findComponent(Control).emitted("update:modelValue")).toBeUndefined();
  });

  it("requires an enabled checkbox when the first option is disabled", () => {
    const wrapper = track(mount(defineComponent({ render: () => h("form", h(CheckboxGroup, {
      required: true, options: [{ value: "a", disabled: true }, { value: "b" }],
    })) })));
    expect(wrapper.get("form").element.checkValidity()).toBe(false);
  });

  it("uses unique slider IDs and disables every range proxy", () => {
    const wrapper = track(mount(Slider, { props: { id: "range", modelValue: [20, 80], name: "range", disabled: true } }));
    expect(wrapper.findAll('[role="slider"]').map(thumb => thumb.attributes("id"))).toEqual(["range", "range-2"]);
    expect(wrapper.findAll("input").every(input => input.element.disabled)).toBe(true);
  });

  it("associates a slot-only Meter label", () => {
    const wrapper = track(mount(Meter, { props: { value: 10 }, slots: { label: "Usage" } }));
    expect(wrapper.attributes("aria-labelledby")).toBe(wrapper.get(".akaza-meter-label").attributes("id"));
  });

  it.each([
    { component: DateField, value: new CalendarDate(2026, 8, 12), min: new CalendarDate(2026, 8, 13) },
    { component: DateRangeField, value: { start: new CalendarDate(2026, 8, 12), end: new CalendarDate(2026, 8, 14) }, min: new CalendarDate(2026, 8, 13) },
    { component: TimeField, value: new Time(10), min: new Time(11) },
    { component: TimeRangeField, value: { start: new Time(10), end: new Time(12) }, min: new Time(11) },
  ])("updates native validity when constraints change: $component.__name", async ({ component, value, min }) => {
    const wrapper = track(mount(component as typeof DateField, { props: { modelValue: value as CalendarDate } }));
    await wrapper.setProps({ minValue: min as CalendarDate });
    const inputs = wrapper.findAll<HTMLInputElement>('input[tabindex="-1"]');
    expect(inputs.some(input => !input.element.validity.valid)).toBe(true);
  });

  it("advances an entire Hebrew leap year in MonthPicker", async () => {
    const wrapper = track(mount(MonthPicker, { props: { placeholder: new CalendarDate(new HebrewCalendar(), 5784, 1, 1) } }));
    await wrapper.get(".akaza-month-picker-next").trigger("click");
    const next = wrapper.emitted("update:placeholder")?.[0]?.[0] as CalendarDate;
    expect(next.year).toBe(5785);
  });
});
