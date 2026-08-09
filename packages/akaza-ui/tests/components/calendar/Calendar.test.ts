import { CalendarDate } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "@/components/calendar";

describe("calendar", () => {
  it("renders an ARIA grid and selects a date", async () => {
    const wrapper = mount(Calendar, {
      props: {
        placeholder: new CalendarDate(2026, 8, 1),
        "onUpdate:modelValue": (value) => wrapper.setProps({ modelValue: value }),
      },
    });

    expect(wrapper.get("[role='grid']").attributes("aria-label")).toContain("August 2026");
    await wrapper.get("button[aria-label*='August 12, 2026']").trigger("click");
    expect(wrapper.emitted("value-change")?.[0]?.[0]?.toString()).toBe("2026-08-12");
    expect(wrapper.get("[aria-selected='true']").text()).toBe("12");
  });

  it("supports multiple selection and preventDeselect", async () => {
    const wrapper = mount(Calendar, {
      props: {
        modelValue: [new CalendarDate(2026, 8, 3)],
        placeholder: new CalendarDate(2026, 8, 1),
        multiple: true,
        preventDeselect: true,
      },
    });

    await wrapper.get("button[aria-label*='August 3, 2026']").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.get("button[aria-label*='August 4, 2026']").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toHaveLength(2);
  });

  it("honors constraints and unavailable dates", async () => {
    const wrapper = mount(Calendar, {
      props: {
        placeholder: new CalendarDate(2026, 8, 1),
        minValue: new CalendarDate(2026, 8, 5),
        maxValue: new CalendarDate(2026, 8, 20),
        isDateUnavailable: (date) => date.day === 12,
      },
    });

    expect(wrapper.get("button[aria-label*='August 2, 2026']").attributes("aria-disabled")).toBe("true");
    expect(wrapper.get("button[aria-label*='August 12, 2026']").attributes("data-akaza-unavailable")).toBe("true");
    await wrapper.get("button[aria-label*='August 12, 2026']").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("uses roving focus and navigates across months with the keyboard", async () => {
    const wrapper = mount(Calendar, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 8, 1) },
    });
    const day = wrapper.get("button[aria-label*='August 1, 2026']");
    await day.trigger("focus");
    await day.trigger("keydown", { key: "ArrowLeft" });

    expect(wrapper.emitted("update:placeholder")?.[0]?.[0].toString()).toBe("2026-07-01");
    expect(document.activeElement?.getAttribute("aria-label")).toContain("July 31, 2026");
    wrapper.unmount();
  });

  it("supports paged multi-month navigation and cancelable updates", async () => {
    const onPlaceholderChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(Calendar, {
      props: {
        placeholder: new CalendarDate(2026, 8, 1),
        numberOfMonths: 2,
        pagedNavigation: true,
        onPlaceholderChange,
      },
    });
    expect(wrapper.findAll("[role='grid']")).toHaveLength(2);
    await wrapper.get(".akaza-calendar-next").trigger("click");
    expect(onPlaceholderChange).toHaveBeenCalledOnce();
    expect(wrapper.emitted("update:placeholder")).toBeUndefined();
  });

  it("puts read-only semantics on its grids while keeping days discoverable", () => {
    const wrapper = mount(Calendar, {
      props: {
        placeholder: new CalendarDate(2026, 8, 1),
        readOnly: true,
      },
    });
    expect(wrapper.get(".akaza-calendar").attributes("role")).toBe("group");
    expect(wrapper.get(".akaza-calendar-grid").attributes("aria-readonly")).toBe("true");
    expect(wrapper.get(".akaza-calendar-cell-trigger").attributes("aria-disabled")).toBeUndefined();
  });

  it("selects normalized ranges and exposes range boundaries", async () => {
    const wrapper = mount(Calendar, {
      props: {
        selectionMode: "range",
        placeholder: new CalendarDate(2026, 8, 1),
        "onUpdate:modelValue": (value) => wrapper.setProps({ modelValue: value }),
      },
    });

    await wrapper.get("button[aria-label*='August 12, 2026']").trigger("click");
    expect(wrapper.get(".akaza-calendar").attributes("data-akaza-state")).toBe("selecting");
    await wrapper.get("button[aria-label*='August 8, 2026']").trigger("click");

    const range = wrapper.emitted("update:modelValue")?.[1]?.[0] as { start: CalendarDate; end: CalendarDate };
    expect(range.start.toString()).toBe("2026-08-08");
    expect(range.end.toString()).toBe("2026-08-12");
    expect(wrapper.get("button[aria-label*='August 8, 2026']").attributes("data-akaza-range-start")).toBe("true");
    expect(wrapper.get("button[aria-label*='August 10, 2026']").attributes("data-akaza-in-range")).toBe("true");
    expect(wrapper.get("button[aria-label*='August 12, 2026']").attributes("data-akaza-range-end")).toBe("true");
  });

  it("previews ranges and rejects unavailable dates inside them by default", async () => {
    const wrapper = mount(Calendar, {
      props: {
        selectionMode: "range",
        placeholder: new CalendarDate(2026, 8, 1),
        isDateUnavailable: (date) => date.day === 10,
        "onUpdate:modelValue": (value) => wrapper.setProps({ modelValue: value }),
      },
    });

    await wrapper.get("button[aria-label*='August 8, 2026']").trigger("click");
    await wrapper.get("button[aria-label*='August 12, 2026']").trigger("pointerenter");
    expect(wrapper.get("button[aria-label*='August 9, 2026']").attributes("data-akaza-highlighted")).toBe("true");

    await wrapper.get("button[aria-label*='August 12, 2026']").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);

    await wrapper.setProps({ allowNonContiguousRanges: true });
    await wrapper.get("button[aria-label*='August 12, 2026']").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(2);
  });

  it("keeps a fixed range endpoint unchanged", async () => {
    const wrapper = mount(Calendar, {
      props: {
        selectionMode: "range",
        fixedDate: "start",
        modelValue: {
          start: new CalendarDate(2026, 8, 8),
          end: new CalendarDate(2026, 8, 12),
        },
        placeholder: new CalendarDate(2026, 8, 1),
        "onUpdate:modelValue": value => wrapper.setProps({ modelValue: value }),
      },
    });

    await wrapper.get("button[aria-label*='August 15, 2026']").trigger("click");
    const range = wrapper.props("modelValue") as { start: CalendarDate; end: CalendarDate };
    expect(range.start.toString()).toBe("2026-08-08");
    expect(range.end.toString()).toBe("2026-08-15");

    await wrapper.get("button[aria-label*='August 4, 2026']").trigger("click");
    expect((wrapper.props("modelValue") as { end: CalendarDate }).end.toString()).toBe("2026-08-15");
  });
});
