import { CalendarDate, HebrewCalendar, Time } from "@internationalized/date";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { Calendar } from "@/components/calendar";
import { DateField } from "@/components/date-field";
import { MonthPicker } from "@/components/month-picker";
import { MonthRangePicker } from "@/components/month-range-picker";
import { TimeField } from "@/components/time-field";
import { YearPicker } from "@/components/year-picker";
import { YearRangePicker } from "@/components/year-range-picker";

enableAutoUnmount(afterEach);
afterEach(() => vi.restoreAllMocks());
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

describe("batch 24B date grids", () => {
  it("does not change the Calendar tab stop or range preview after canceled paging", async () => {
    const wrapper = mount(Calendar, {
      attachTo: document.body,
      props: {
        placeholder: new CalendarDate(2026, 8, 12), selectionMode: "range",
        modelValue: { start: new CalendarDate(2026, 8, 10) },
        onPlaceholderChange: (_value, details) => details.cancel(),
      },
    });
    const day = wrapper.get<HTMLButtonElement>("button[aria-label*='August 12, 2026']");
    day.element.focus();
    await day.trigger("keydown", { key: "PageDown" });
    expect(document.activeElement).toBe(day.element);
    expect(day.attributes("tabindex")).toBe("0");
    expect(wrapper.get("button[aria-label*='August 13, 2026']").attributes("data-akaza-highlighted")).toBeUndefined();
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it.each([MonthPicker, MonthRangePicker, YearPicker, YearRangePicker])("keeps a tab stop on external period pages and canceled moves ($__name)", async (component) => {
    const wrapper = mount(component, {
      attachTo: document.body,
      props: {
        placeholder: new CalendarDate(2026, 1, 1),
        onPlaceholderChange: (_value, details) => details.cancel(),
      },
    });
    const second = wrapper.findAll<HTMLButtonElement>("[role='gridcell'] button")[1]!;
    second.element.focus();
    await second.trigger("keydown", { key: "PageDown" });
    expect(document.activeElement).toBe(second.element);
    expect(second.attributes("tabindex")).toBe("0");
    await wrapper.setProps({ placeholder: new CalendarDate(2040, 1, 1) });
    await settle();
    const stop = wrapper.get("button[tabindex='0']");
    expect(document.activeElement).toBe(stop.element);
    expect(wrapper.findAll("button[tabindex='0']")).toHaveLength(1);
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("recovers only removed canonical day focus, never navigation-button or external focus", async () => {
    const wrapper = mount(Calendar, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 8, 12), numberOfMonths: 2 },
    });
    const day = wrapper.get<HTMLButtonElement>("button[aria-label*='August 12, 2026']");
    day.element.focus();
    await wrapper.setProps({ placeholder: new CalendarDate(2026, 9, 12) });
    await settle();
    expect(document.activeElement?.getAttribute("aria-label")).toContain("September 12, 2026");
    expect(wrapper.findAll(".akaza-calendar-cell-trigger[tabindex='0']")).toHaveLength(1);
    const next = wrapper.get<HTMLButtonElement>(".akaza-calendar-next");
    next.element.focus();
    await wrapper.setProps({ placeholder: new CalendarDate(2026, 10, 12) });
    await settle();
    expect(document.activeElement).toBe(next.element);
    const outside = document.createElement("button");
    document.body.append(outside);
    try {
      wrapper.get<HTMLButtonElement>("button[aria-label*='October 12, 2026']").element.focus();
      const pending = wrapper.setProps({ placeholder: new CalendarDate(2026, 11, 12) });
      outside.focus();
      await pending;
      await settle();
      expect(document.activeElement).toBe(outside);
    } finally {
      outside.remove();
    }
  });

  it("keeps newer focus while an explicit date move waits for Vue", async () => {
    const wrapper = mount(Calendar, { attachTo: document.body, props: { placeholder: new CalendarDate(2026, 8, 12) } });
    const next = wrapper.get<HTMLButtonElement>(".akaza-calendar-next");
    const pending = wrapper.vm.focusDate(new CalendarDate(2026, 8, 20));
    next.element.focus();
    await pending;
    expect(document.activeElement).toBe(next.element);
  });

  it.each([Calendar, MonthPicker, YearPicker])("does not move focus or its tab stop when the parent refuses paging ($__name)", async (component) => {
    const wrapper = mount(component, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 1, 12), "onUpdate:placeholder": () => {} },
    });
    const second = wrapper.findAll<HTMLButtonElement>("[role='gridcell'] button:not([data-akaza-outside-view])")[1]!;
    second.element.focus();
    await second.trigger("keydown", { key: "PageDown" });
    await nextTick();
    expect(document.activeElement).toBe(second.element);
    expect(second.attributes("tabindex")).toBe("0");
    expect(wrapper.findAll("button[tabindex='0']")).toHaveLength(1);
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("retains calendar arithmetic across Hebrew leap-year month 13", async () => {
    const date = new CalendarDate(new HebrewCalendar(), 5784, 13, 29);
    const wrapper = mount(Calendar, { attachTo: document.body, props: { placeholder: date } });
    const stop = wrapper.get<HTMLButtonElement>(".akaza-calendar-cell-trigger[tabindex='0']");
    stop.element.focus();
    await stop.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:placeholder")?.[0]?.[0].calendar.identifier).toBe("hebrew");
    expect(wrapper.emitted("update:placeholder")?.[0]?.[0].year).toBe(5785);
    expect(document.activeElement?.getAttribute("data-akaza-outside-view")).toBeNull();
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it.each([Calendar, MonthPicker])("ignores composing, modified and pre-consumed grid keys ($__name)", async (component) => {
    const wrapper = mount(component, { attachTo: document.body, props: { placeholder: new CalendarDate(2026, 8, 12) } });
    const stop = wrapper.get<HTMLButtonElement>("button[tabindex='0']");
    stop.element.focus();
    for (const init of [{ isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      await stop.trigger("keydown", { key: "ArrowRight", ...init });
      await stop.trigger("keydown", { key: "Enter", ...init });
    }
    const event = new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true, bubbles: true });
    event.preventDefault();
    stop.element.dispatchEvent(event);
    await nextTick();
    expect(document.activeElement).toBe(stop.element);
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });
});

describe("batch 24B native date/time segments", () => {
  it.each(["date", "time"] as const)("does not edit or advance during IME composition (%s)", async (kind) => {
    const wrapper = kind === "date"
      ? mount(DateField, { attachTo: document.body, props: { modelValue: new CalendarDate(2026, 8, 12) } })
      : mount(TimeField, { attachTo: document.body, props: { modelValue: new Time(9, 30), hourCycle: 24 } });
    const input = wrapper.findAll<HTMLInputElement>("[role='spinbutton']")[0]!;
    input.element.focus();
    await nextTick();
    input.element.value = "10";
    input.element.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
    for (const init of [{ isComposing: true }, { keyCode: 229 }]) {
      await input.trigger("keydown", { key: "ArrowUp", ...init });
      await input.trigger("keydown", { key: "ArrowRight", ...init });
    }
    expect(input.element.value).toBe("10");
    expect(document.activeElement).toBe(input.element);
    expect(wrapper.emitted("value-change")).toBeUndefined();
    input.element.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await nextTick();
    expect(wrapper.emitted("value-change")).toHaveLength(1);
  });

  it.each(["date", "time"] as const)("restores canceled and parent-refused edits without auto-advance (%s)", async (kind) => {
    for (const cancel of [false, true]) {
      const onValueChange = vi.fn((_value, details) => { if (cancel) details.cancel(); });
      const wrapper = kind === "date"
        ? mount(DateField, { attachTo: document.body, props: {
          modelValue: new CalendarDate(2026, 8, 12), "onUpdate:modelValue": () => {}, onValueChange,
        } })
        : mount(TimeField, { attachTo: document.body, props: {
          modelValue: new Time(9, 30), "onUpdate:modelValue": () => {}, onValueChange, hourCycle: 24,
        } });
      const input = wrapper.findAll<HTMLInputElement>("[role='spinbutton']")[0]!;
      const original = input.element.value;
      input.element.focus();
      await input.setValue("10");
      await nextTick();
      expect(input.element.value).toBe(original);
      expect(document.activeElement).toBe(input.element);
      expect(wrapper.emitted("value-commit")?.length ?? 0).toBe(cancel ? 0 : 1);
      expect(wrapper.get<HTMLInputElement>("input[aria-hidden='true']").element.value).toBe(kind === "date" ? "2026-08-12" : "09:30:00");
      wrapper.unmount();
    }
  });

  it.each(["date", "time"] as const)("advances accepted edits but leaves native caret shortcuts alone (%s)", async (kind) => {
    const wrapper = kind === "date"
      ? mount(DateField, { attachTo: document.body, props: { modelValue: new CalendarDate(2026, 8, 12),
        "onUpdate:modelValue": value => wrapper.setProps({ modelValue: value }) } })
      : mount(TimeField, { attachTo: document.body, props: { modelValue: new Time(9, 30), hourCycle: 24,
        "onUpdate:modelValue": value => wrapper.setProps({ modelValue: value }) } });
    const inputs = wrapper.findAll<HTMLInputElement>("[role='spinbutton']");
    inputs[0]!.element.focus();
    const key = new KeyboardEvent("keydown", { key: "ArrowRight", ctrlKey: true, bubbles: true, cancelable: true });
    inputs[0]!.element.dispatchEvent(key);
    expect(key.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(inputs[0]!.element);
    await inputs[0]!.setValue("10");
    await nextTick();
    expect(document.activeElement).toBe(inputs[1]!.element);
    expect(inputs.every(input => input.element.tabIndex === 0)).toBe(true);
  });

  it("steps an entered zero, not the time model fallback", async () => {
    const wrapper = mount(TimeField, { props: { modelValue: new Time(9, 30), hourCycle: 24 } });
    const minute = wrapper.get<HTMLInputElement>("[data-akaza-segment='minute']");
    await minute.setValue("0");
    await minute.trigger("keydown", { key: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toMatchObject({ minute: 1 });
  });

  it("uses the value calendar's month count in date segment bounds", async () => {
    const wrapper = mount(DateField, { props: { modelValue: new CalendarDate(new HebrewCalendar(), 5784, 12, 12) } });
    const month = wrapper.get<HTMLInputElement>("[data-akaza-segment='month']");
    expect(month.attributes("aria-valuemax")).toBe("13");
    await month.trigger("keydown", { key: "End" });
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toMatchObject({ month: 13 });
  });

  it.each(["second", "dayPeriod"] as const)("recovers a removed time part without making a roving composite (%s)", async (part) => {
    const wrapper = mount(TimeField, { attachTo: document.body, props: { granularity: "second", hourCycle: 12, locale: "zh-CN" } });
    const input = wrapper.get<HTMLElement>(part === "second" ? "[data-akaza-segment='second']" : ".akaza-time-field-day-period");
    input.element.focus();
    await wrapper.setProps(part === "second" ? { granularity: "minute" } : { hourCycle: 24 });
    await settle();
    expect(document.activeElement?.getAttribute("data-akaza-segment")).toBe(part === "second" ? "minute" : "hour");
    expect(wrapper.findAll<HTMLInputElement>("[role='spinbutton']").every(input => input.element.tabIndex === 0)).toBe(true);
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("does not recover removed parts into disabled fields or after unmount", async () => {
    const wrapper = mount(TimeField, { attachTo: document.body, props: { granularity: "second", hourCycle: 24 } });
    wrapper.get<HTMLInputElement>("[data-akaza-segment='second']").element.focus();
    const hour = wrapper.get<HTMLInputElement>("[data-akaza-segment='hour']").element;
    const focus = vi.spyOn(hour, "focus");
    await wrapper.setProps({ granularity: "hour", disabled: true });
    await settle();
    expect(focus).not.toHaveBeenCalled();
    wrapper.unmount();
    await settle();
    expect(focus).not.toHaveBeenCalled();
  });
});
