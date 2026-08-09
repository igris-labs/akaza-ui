import { CalendarDate } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { DateRangePicker } from "@/components/date-range-picker";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("date range picker", () => {
  it("opens an accessible range calendar and selects both endpoints", async () => {
    const wrapper = mount(DateRangePicker, {
      attachTo: document.body,
      props: {
        placeholder: new CalendarDate(2026, 8, 1),
        "onUpdate:modelValue": value => wrapper.setProps({ modelValue: value }),
      },
    });

    await wrapper.get(".akaza-date-range-picker-trigger").trigger("click");
    await nextTick();
    expect(document.body.querySelector(".akaza-date-range-picker-content")?.getAttribute("role")).toBe("dialog");
    expect(wrapper.get(".akaza-date-range-picker-trigger").attributes("aria-expanded")).toBe("true");

    document.body.querySelector<HTMLButtonElement>("button[aria-label*='August 12, 2026']")!.click();
    await nextTick();
    document.body.querySelector<HTMLButtonElement>("button[aria-label*='August 18, 2026']")!.click();
    await nextTick();

    const value = wrapper.props("modelValue")!;
    expect(value.start?.toString()).toBe("2026-08-12");
    expect(value.end?.toString()).toBe("2026-08-18");
    expect(document.body.querySelector(".akaza-date-range-picker-content")).not.toBeNull();
    wrapper.unmount();
  });

  it("closes after a complete selection when closeOnSelect is enabled", async () => {
    const wrapper = mount(DateRangePicker, {
      attachTo: document.body,
      props: {
        closeOnSelect: true,
        open: true,
        placeholder: new CalendarDate(2026, 8, 1),
        "onUpdate:modelValue": value => wrapper.setProps({ modelValue: value }),
        "onUpdate:open": value => wrapper.setProps({ open: value }),
      },
    });

    document.body.querySelector<HTMLButtonElement>("button[aria-label*='August 12, 2026']")!.click();
    await nextTick();
    expect(wrapper.props("open")).toBe(true);
    document.body.querySelector<HTMLButtonElement>("button[aria-label*='August 18, 2026']")!.click();
    await nextTick();
    expect(wrapper.props("open")).toBe(false);
    wrapper.unmount();
  });

  it("supports cancelable selection and opening", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const onOpenChange = vi.fn((_open, details) => details.cancel());
    const wrapper = mount(DateRangePicker, {
      props: {
        placeholder: new CalendarDate(2026, 8, 1),
        onValueChange,
        onOpenChange,
      },
    });

    await wrapper.get(".akaza-date-range-picker-trigger").trigger("click");
    expect(wrapper.emitted("update:open")).toBeUndefined();
    await wrapper.setProps({ open: true, onOpenChange: () => {} });
    await nextTick();
    document.body.querySelector<HTMLButtonElement>("button[aria-label*='August 12, 2026']")!.click();
    await nextTick();
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    wrapper.unmount();
  });

  it("closes the top layer with Escape and restores trigger focus", async () => {
    const wrapper = mount(DateRangePicker, {
      attachTo: document.body,
      props: {
        open: true,
        placeholder: new CalendarDate(2026, 8, 1),
        "onUpdate:open": value => wrapper.setProps({ open: value }),
      },
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    expect(wrapper.props("open")).toBe(false);
    expect(document.activeElement).toBe(wrapper.get(".akaza-date-range-picker-trigger").element);
    wrapper.unmount();
  });

  it("exposes flat styling hooks and fixed endpoint state", () => {
    const wrapper = mount(DateRangePicker, {
      props: {
        fixedDate: "start",
        modelValue: { start: new CalendarDate(2026, 8, 12) },
        ui: {
          root: "custom-root",
          trigger: "custom-trigger",
          field: { separator: "custom-separator" },
        },
      },
    });
    expect(wrapper.get(".akaza-date-range-picker").classes()).toContain("custom-root");
    expect(wrapper.get(".akaza-date-range-picker-trigger").classes()).toContain("custom-trigger");
    expect(wrapper.get(".akaza-date-range-field-separator").classes()).toContain("custom-separator");
    expect(wrapper.get(".akaza-date-range-field").attributes("data-akaza-fixed-date")).toBe("start");
  });
});
