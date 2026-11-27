import { CalendarDate } from "@internationalized/date";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { Calendar } from "@/components/calendar";
import { MonthPicker } from "@/components/month-picker";
import { MonthRangePicker } from "@/components/month-range-picker";
import { YearPicker } from "@/components/year-picker";
import { YearRangePicker } from "@/components/year-range-picker";

enableAutoUnmount(afterEach);

describe("batch 12 calendar focus contract", () => {
  it.each(["ltr", "rtl"] as const)("moves across rendered months without selecting (%s)", async (dir) => {
    const wrapper = mount(Calendar, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 8, 15), numberOfMonths: 2, dir },
    });
    const august = wrapper.get<HTMLButtonElement>("button[aria-label*='August 31, 2026']");
    august.element.focus();
    await august.trigger("keydown", { key: dir === "rtl" ? "ArrowLeft" : "ArrowRight" });
    expect(document.activeElement?.getAttribute("aria-label")).toContain("September 1, 2026");
    expect(document.activeElement?.hasAttribute("data-akaza-outside-view")).toBe(false);
    expect(wrapper.emitted("value-change")).toBeUndefined();
    expect(wrapper.emitted("placeholder-change")).toBeUndefined();
    const september = wrapper.findAll<HTMLButtonElement>("button[aria-label*='September 1, 2026']")
      .find(day => day.element === document.activeElement)!;
    await september.trigger("keydown", { key: dir === "rtl" ? "ArrowRight" : "ArrowLeft" });
    expect(document.activeElement?.getAttribute("aria-label")).toContain("August 31, 2026");
    expect(document.activeElement?.hasAttribute("data-akaza-outside-view")).toBe(false);
    expect(wrapper.findAll(".akaza-calendar-cell-trigger[tabindex='0']")).toHaveLength(1);
  });

  it("keeps canceled paging at the current DOM focus and forwards the original event", async () => {
    const onPlaceholderChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(Calendar, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 8, 1), onPlaceholderChange },
    });
    const first = wrapper.get<HTMLButtonElement>("button[aria-label*='August 1, 2026']");
    first.element.focus();
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true });
    first.element.dispatchEvent(event);
    await nextTick();
    expect(onPlaceholderChange).toHaveBeenCalledExactlyOnceWith(expect.any(CalendarDate), expect.objectContaining({ reason: "keyboard", event }));
    expect(wrapper.emitted("update:placeholder")).toBeUndefined();
    expect(document.activeElement).toBe(first.element);
    expect(first.attributes("tabindex")).toBe("0");
  });

  it("uses the accepted controlled page after rejection and a later parent update", async () => {
    const wrapper = mount(Calendar, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 8, 1), "onUpdate:placeholder": () => {} },
    });
    const first = wrapper.get<HTMLButtonElement>("button[aria-label*='August 1, 2026']");
    first.element.focus();
    await first.trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.get(".akaza-calendar-heading").text()).toContain("August 2026");
    expect(document.activeElement).toBe(first.element);
    await wrapper.setProps({ placeholder: new CalendarDate(2026, 7, 1) });
    expect(wrapper.get("button[aria-label*='July 1, 2026']:not([data-akaza-outside-view])").attributes("tabindex")).toBe("0");
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("keeps week boundaries and month/year paging as date operations", async () => {
    const wrapper = mount(Calendar, {
      attachTo: document.body,
      props: {
        placeholder: new CalendarDate(2026, 8, 12), weekStartsOn: "mon",
        "onUpdate:placeholder": value => wrapper.setProps({ placeholder: value }),
      },
    });
    const day = wrapper.get<HTMLButtonElement>("button[aria-label*='August 12, 2026']");
    day.element.focus();
    await day.trigger("keydown", { key: "Home" });
    expect(document.activeElement?.getAttribute("aria-label")).toContain("August 10, 2026");
    await wrapper.get("button[aria-label*='August 10, 2026']").trigger("keydown", { key: "End" });
    expect(document.activeElement?.getAttribute("aria-label")).toContain("August 16, 2026");
    await wrapper.get("button[aria-label*='August 16, 2026']").trigger("keydown", { key: "PageDown", shiftKey: true });
    expect(document.activeElement?.getAttribute("aria-label")).toContain("August 16, 2027");
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it.each(["Enter", " "])("keeps unavailable dates discoverable but not selectable (%s)", async (key) => {
    const wrapper = mount(Calendar, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 8, 11), isDateUnavailable: date => date.day === 12 },
    });
    const day = wrapper.get<HTMLButtonElement>("button[aria-label*='August 11, 2026']");
    day.element.focus();
    await day.trigger("keydown", { key: "ArrowRight" });
    const unavailable = wrapper.get("button[aria-label*='August 12, 2026']");
    expect(document.activeElement).toBe(unavailable.element);
    expect(unavailable.attributes("data-akaza-unavailable")).toBe("true");
    await unavailable.trigger("keydown", { key });
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("has one day tab stop when a focused date repeats across month grids", () => {
    const wrapper = mount(Calendar, { props: { placeholder: new CalendarDate(2026, 8, 31), numberOfMonths: 2 } });
    expect(wrapper.findAll(".akaza-calendar-cell-trigger[tabindex='0']")).toHaveLength(1);
  });

  it("keeps canonical refs after a displayed month is removed", async () => {
    const wrapper = mount(Calendar, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 8, 31), numberOfMonths: 2 },
    });
    await wrapper.vm.focusDate(new CalendarDate(2026, 8, 31));
    const august = wrapper.get("button[aria-label*='August 31, 2026']:not([data-akaza-outside-view])");
    expect(document.activeElement).toBe(august.element);
    await wrapper.setProps({ numberOfMonths: 1 });
    await wrapper.vm.focusDate(new CalendarDate(2026, 8, 31));
    expect(document.activeElement).toBe(august.element);
    expect(wrapper.findAll(".akaza-calendar-cell-trigger[tabindex='0']")).toHaveLength(1);
  });

  it("has no day tab stop when every day is disabled", async () => {
    const wrapper = mount(Calendar, { props: { placeholder: new CalendarDate(2026, 8, 31), numberOfMonths: 2 } });
    await wrapper.setProps({ isDateDisabled: () => true });
    expect(wrapper.findAll(".akaza-calendar-cell-trigger[tabindex='0']")).toHaveLength(0);
    expect(wrapper.get(".akaza-calendar-next").attributes("disabled")).toBeUndefined();
  });

  it("hydrates the canonical tab stop and refs without taking unrelated focus", async () => {
    const root = { render: () => h(Calendar, { placeholder: new CalendarDate(2026, 8, 31), numberOfMonths: 2 }) };
    const host = document.createElement("div");
    host.innerHTML = await renderToString(createSSRApp(root));
    const outside = document.createElement("button");
    document.body.append(outside, host);
    outside.focus();
    const warning = vi.spyOn(console, "warn");
    const app = createSSRApp(root);
    try {
      app.mount(host);
      await nextTick();
      expect(document.activeElement).toBe(outside);
      expect(host.querySelectorAll(".akaza-calendar-cell-trigger[tabindex='0']")).toHaveLength(1);
      const august = host.querySelector<HTMLButtonElement>("button[aria-label*='August 31, 2026']:not([data-akaza-outside-view])")!;
      august.focus();
      august.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await nextTick();
      expect(document.activeElement?.getAttribute("aria-label")).toContain("September 1, 2026");
      expect(document.activeElement?.hasAttribute("data-akaza-outside-view")).toBe(false);
      expect(warning.mock.calls.filter(args => String(args[0]).includes("Hydration"))).toEqual([]);
    } finally {
      app.unmount();
      warning.mockRestore();
      host.remove();
      outside.remove();
    }
  });
});

describe("batch 12 period focus contract", () => {
  it("moves by configured columns and row boundaries, independent of selection", async () => {
    const wrapper = mount(MonthPicker, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 1, 1), columns: 4, dir: "rtl" },
    });
    const february = wrapper.get<HTMLButtonElement>("button[aria-label='February 2026']");
    february.element.focus();
    await february.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("June 2026");
    await wrapper.get("button[aria-label='June 2026']").trigger("keydown", { key: "Home" });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("May 2026");
    await wrapper.get("button[aria-label='May 2026']").trigger("keydown", { key: "End" });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("August 2026");
    await wrapper.get("button[aria-label='August 2026']").trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("July 2026");
    await wrapper.get("button[aria-label='July 2026']").trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("August 2026");
    expect(wrapper.findAll("button[tabindex='0']")).toHaveLength(1);
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("retains the month tab stop when controlled paging is rejected", async () => {
    const wrapper = mount(MonthPicker, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 1, 1), "onUpdate:placeholder": () => {} },
    });
    const january = wrapper.get<HTMLButtonElement>("button[aria-label='January 2026']");
    january.element.focus();
    await january.trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.findAll("button[tabindex='0']")).toHaveLength(1);
    expect(document.activeElement).toBe(january.element);
  });

  it("forwards focusValue through year wrappers without normalizing selection", async () => {
    const wrapper = mount(YearPicker, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 1, 1), yearsPerPage: 6, columns: 2 },
    });
    await wrapper.vm.focusValue(new CalendarDate(2028, 8, 12));
    expect(document.activeElement?.getAttribute("aria-label")).toBe("2028");
    await wrapper.get("button[aria-label='2028']").trigger("keydown", { key: "ArrowUp" });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("2026");
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("preserves fixed month endpoints and canceled keyboard selection", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(MonthRangePicker, {
      attachTo: document.body,
      props: {
        placeholder: new CalendarDate(2026, 1, 1), fixedDate: "start",
        modelValue: { start: new CalendarDate(2026, 3, 1) }, onValueChange,
      },
    });
    await wrapper.vm.focusValue(new CalendarDate(2026, 5, 1));
    await wrapper.get("button[aria-label='May 2026']").trigger("keydown", { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      start: new CalendarDate(2026, 3, 1), end: new CalendarDate(2026, 5, 1),
    }), expect.objectContaining({ reason: "range-end" }));
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("keeps year-range focus separate from range selection", async () => {
    const wrapper = mount(YearRangePicker, {
      attachTo: document.body,
      props: { placeholder: new CalendarDate(2026, 1, 1), modelValue: { start: new CalendarDate(2027, 1, 1) } },
    });
    await wrapper.vm.focusValue(new CalendarDate(2029, 1, 1));
    expect(document.activeElement?.getAttribute("aria-label")).toBe("2029");
    expect(wrapper.emitted("value-change")).toBeUndefined();
    expect(wrapper.get("button[aria-label='2028']").attributes("data-akaza-highlighted")).toBe("true");
  });
});
