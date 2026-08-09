import { CalendarDate } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { MonthPicker } from "@/components/month-picker";
import { MonthRangePicker } from "@/components/month-range-picker";
import { YearPicker } from "@/components/year-picker";
import { YearRangePicker } from "@/components/year-range-picker";

describe("period pickers", () => {
  it("selects months and moves roving focus by keyboard", async () => {
    const wrapper = mount(MonthPicker, {
      attachTo: document.body,
      props: {
        modelValue: new CalendarDate(2026, 8, 1),
        placeholder: new CalendarDate(2026, 1, 1),
        "onUpdate:modelValue": value => wrapper.setProps({ modelValue: value }),
      },
    });

    const august = wrapper.get("button[aria-label='August 2026']");
    expect(august.attributes("aria-selected")).toBeUndefined();
    expect(august.element.closest("[role='gridcell']")?.getAttribute("aria-selected")).toBe("true");
    await august.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("September 2026");
    await wrapper.get("button[aria-label='September 2026']").trigger("click");
    expect(wrapper.props("modelValue")?.toString()).toBe("2026-09-01");
    wrapper.unmount();
  });

  it("supports multiple month selection and unavailable months", async () => {
    const wrapper = mount(MonthPicker, {
      props: {
        multiple: true,
        placeholder: new CalendarDate(2026, 1, 1),
        isMonthUnavailable: date => date.month === 3,
      },
    });

    await wrapper.get("button[aria-label='February 2026']").trigger("click");
    const value = wrapper.emitted("update:modelValue")?.[0]?.[0] as CalendarDate[];
    expect(value.map(date => date.toString())).toEqual(["2026-02-01"]);
    await wrapper.get("button[aria-label='March 2026']").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
  });

  it("keeps a roving tab stop on the controlled page", async () => {
    const wrapper = mount(MonthPicker, {
      props: {
        modelValue: new CalendarDate(2027, 8, 1),
        placeholder: new CalendarDate(2026, 1, 1),
      },
    });

    expect(wrapper.get("button[aria-label='January 2026']").attributes("tabindex")).toBe("0");
    await wrapper.get(".akaza-month-picker-next").trigger("click");
    expect(wrapper.get("button[aria-label='January 2026']").attributes("tabindex")).toBe("0");
  });

  it("selects bounded month ranges", async () => {
    const wrapper = mount(MonthRangePicker, {
      props: {
        placeholder: new CalendarDate(2026, 1, 1),
        maximumMonths: 3,
        "onUpdate:modelValue": value => wrapper.setProps({ modelValue: value }),
      },
    });

    await wrapper.get("button[aria-label='March 2026']").trigger("click");
    await wrapper.get("button[aria-label='May 2026']").trigger("click");
    expect(wrapper.props("modelValue").start?.toString()).toBe("2026-03-01");
    expect(wrapper.props("modelValue").end?.toString()).toBe("2026-05-01");
    await wrapper.get("button[aria-label='January 2026']").trigger("click");
    await wrapper.get("button[aria-label='May 2026']").trigger("click");
    expect(wrapper.props("modelValue").end).toBeUndefined();
  });

  it("pages and selects years", async () => {
    const wrapper = mount(YearPicker, {
      props: {
        placeholder: new CalendarDate(2026, 1, 1),
        yearsPerPage: 12,
        "onUpdate:placeholder": value => wrapper.setProps({ placeholder: value }),
      },
    });

    expect(wrapper.findAll("[role='gridcell']")).toHaveLength(12);
    await wrapper.get("button[aria-label='2027']").trigger("click");
    const updates = wrapper.emitted("update:modelValue");
    expect(updates).toBeDefined();
    expect((updates![0]![0] as CalendarDate).toString()).toBe("2027-01-01");
    await wrapper.get(".akaza-year-picker-next").trigger("click");
    expect(wrapper.get(".akaza-year-picker-heading").text()).toContain("2038");
  });

  it("supports cancelable year range changes", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(YearRangePicker, {
      props: {
        placeholder: new CalendarDate(2026, 1, 1),
        onValueChange,
      },
    });

    await wrapper.get("button[aria-label='2028']").trigger("click");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});
