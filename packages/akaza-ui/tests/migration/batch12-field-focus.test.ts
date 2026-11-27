import { CalendarDate, Time } from "@internationalized/date";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, shallowRef } from "vue";
import { DateField } from "@/components/date-field";
import { DateRangeField } from "@/components/date-range-field";
import { TimeField } from "@/components/time-field";
import { TimeRangeField } from "@/components/time-range-field";

enableAutoUnmount(afterEach);

describe("batch 12 retained native segment focus", () => {
  it.each(["ltr", "rtl"] as const)("follows locale order in both directions without editing (%s)", async (dir) => {
    const wrapper = mount(DateField, {
      attachTo: document.body,
      props: { locale: "en-GB", dir, modelValue: new CalendarDate(2026, 8, 12) },
    });
    const segments = wrapper.findAll<HTMLInputElement>("[role='spinbutton']");
    expect(segments.map(segment => segment.attributes("data-akaza-segment"))).toEqual(["day", "month", "year"]);
    expect(segments.every(segment => segment.element.tabIndex === 0)).toBe(true);
    segments[0]!.element.focus();
    await segments[0]!.trigger("keydown", { key: dir === "rtl" ? "ArrowLeft" : "ArrowRight" });
    expect(document.activeElement).toBe(segments[1]!.element);
    await segments[1]!.trigger("keydown", { key: dir === "rtl" ? "ArrowRight" : "ArrowLeft" });
    expect(document.activeElement).toBe(segments[0]!.element);
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("keeps null drafts and empty Backspace navigation separate from the date model", async () => {
    const wrapper = mount(DateField, { attachTo: document.body, props: { locale: "en-GB" } });
    const day = wrapper.get<HTMLInputElement>("[data-akaza-segment='day']");
    const month = wrapper.get<HTMLInputElement>("[data-akaza-segment='month']");
    day.element.focus();
    await day.setValue("12");
    expect(document.activeElement).toBe(month.element);
    await month.trigger("keydown", { key: "Backspace" });
    expect(document.activeElement).toBe(day.element);
    expect(day.element.value).toBe("12");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    const year = wrapper.get<HTMLInputElement>("[data-akaza-segment='year']");
    await year.setValue("2");
    await wrapper.setProps({ modelValue: new CalendarDate(2027, 9, 18) });
    expect(year.element.value).toBe("2027");
    expect(month.element.value).toBe("09");
  });

  it("keeps Home/End editing within the focused year and month segments", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(DateField, {
      attachTo: document.body,
      props: { modelValue: new CalendarDate(2026, 8, 12), onValueChange },
    });
    const month = wrapper.get<HTMLInputElement>("[data-akaza-segment='month']");
    month.element.focus();
    await month.trigger("keydown", { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ month: 12 }), expect.objectContaining({ reason: "keyboard" }));
    expect(document.activeElement).toBe(month.element);
    expect(month.element.value).toBe("08");
    const year = wrapper.get<HTMLInputElement>("[data-akaza-segment='year']");
    year.element.focus();
    await year.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(year.element);
    expect(year.element.value).toBe("2026");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("keeps the locale-leading day period and time segments in native Tab order", async () => {
    const wrapper = mount(TimeField, {
      attachTo: document.body,
      props: { locale: "zh-CN", hourCycle: 12, granularity: "second", modelValue: new Time(9, 30, 15), dir: "rtl" },
    });
    const period = wrapper.get<HTMLButtonElement>(".akaza-time-field-day-period");
    const hour = wrapper.get<HTMLInputElement>("[data-akaza-segment='hour']");
    expect(period.element.tabIndex).toBe(0);
    expect(wrapper.findAll<HTMLInputElement>("[role='spinbutton']").every(segment => segment.element.tabIndex === 0)).toBe(true);
    period.element.focus();
    await period.trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(hour.element);
    await hour.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(period.element);
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("preserves partial time input and autoAdvance=false without a new focus owner", async () => {
    const wrapper = mount(TimeField, {
      attachTo: document.body,
      props: { hourCycle: 24, autoAdvance: false, granularity: "second" },
    });
    const hour = wrapper.get<HTMLInputElement>("[data-akaza-segment='hour']");
    hour.element.focus();
    await hour.setValue("09");
    expect(document.activeElement).toBe(hour.element);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.get("[data-akaza-segment='minute']").setValue("3");
    await wrapper.setProps({ modelValue: new Time(17, 45, 12) });
    expect(wrapper.get<HTMLInputElement>("[data-akaza-segment='minute']").element.value).toBe("45");
    expect(hour.element.value).toBe("17");
  });

  it("retains date endpoint focus methods, fixed endpoints, and paired form values", async () => {
    const wrapper = mount(defineComponent({
      components: { DateRangeField },
      setup: () => ({ value: shallowRef({ start: new CalendarDate(2026, 8, 12), end: new CalendarDate(2026, 8, 18) }) }),
      template: `<form><DateRangeField v-model="value" name="trip" fixed-date="start" locale="en-GB" /></form>`,
    }), { attachTo: document.body });
    const field = wrapper.getComponent(DateRangeField);
    field.vm.focusEnd();
    expect(document.activeElement).toBe(wrapper.get(".akaza-date-range-field-end [data-akaza-segment='day']").element);
    field.vm.focusStart();
    const start = wrapper.get<HTMLInputElement>(".akaza-date-range-field-start [data-akaza-segment='day']");
    expect(document.activeElement).toBe(start.element);
    expect(start.element.readOnly).toBe(true);
    expect(Object.fromEntries(new FormData(wrapper.get("form").element as HTMLFormElement))).toEqual({
      "trip.start": "2026-08-12", "trip.end": "2026-08-18",
    });
  });

  it("keeps invalid time-range focus on the incomplete endpoint", async () => {
    const wrapper = mount(TimeRangeField, {
      attachTo: document.body,
      props: { modelValue: { start: new Time(9) }, hourCycle: 24, required: true },
    });
    wrapper.vm.focusStart();
    const validation = wrapper.get<HTMLInputElement>(".akaza-time-range-field-hidden-input");
    await validation.trigger("invalid");
    expect(document.activeElement).toBe(wrapper.get(".akaza-time-range-field-end [data-akaza-segment='hour']").element);
    expect(wrapper.attributes("data-akaza-invalid")).toBe("true");
    expect(validation.element.validationMessage).not.toBe("");
  });

  it("honors canceled native reset before clearing date and time drafts", async () => {
    const wrapper = mount(defineComponent({
      components: { DateField, TimeField },
      template: `<form><DateField name="date" /><TimeField name="time" :hour-cycle="24" /></form>`,
    }), { attachTo: document.body });
    const day = wrapper.get<HTMLInputElement>("[data-akaza-segment='day']");
    const hour = wrapper.get<HTMLInputElement>("[data-akaza-segment='hour']");
    await day.setValue("12");
    await hour.setValue("09");
    const form = wrapper.get("form").element as HTMLFormElement;
    form.addEventListener("reset", event => event.preventDefault(), { once: true });
    form.reset();
    await nextTick();
    await nextTick();
    expect(day.element.value).toBe("12");
    expect(hour.element.value).toBe("09");
    form.reset();
    await nextTick();
    await nextTick();
    expect(day.element.value).toBe("");
    expect(hour.element.value).toBe("");
  });
});
