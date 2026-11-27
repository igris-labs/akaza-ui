// @vitest-environment node
import { CalendarDate, Time } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Calendar } from "@/components/calendar";
import { DateField } from "@/components/date-field";
import { DateRangeField } from "@/components/date-range-field";
import { DateRangePicker } from "@/components/date-range-picker";
import { MonthPicker } from "@/components/month-picker";
import { MonthRangePicker } from "@/components/month-range-picker";
import { TimeField } from "@/components/time-field";
import { TimeRangeField } from "@/components/time-range-field";
import { YearPicker } from "@/components/year-picker";
import { YearRangePicker } from "@/components/year-range-picker";

describe("batch 12 date focus without browser globals", () => {
  it("renders one canonical day tab stop across adjacent month grids", async () => {
    expect(typeof document).toBe("undefined");
    const html = await renderToString(createSSRApp({
      render: () => h(Calendar, { placeholder: new CalendarDate(2026, 8, 31), numberOfMonths: 2, initialFocus: true, dir: "rtl" }),
    }));
    expect(html.match(/<button[^>]*tabindex="0"/g)).toHaveLength(1);
    expect(html).toContain('dir="rtl"');
    expect(html).not.toContain("data-slot");
  });

  it("isolates period wrappers and keeps server focus deterministic", async () => {
    const render = (year: number) => renderToString(createSSRApp(defineComponent({
      render: () => h("div", [
        h(MonthPicker, { placeholder: new CalendarDate(year, 1, 1), initialFocus: true }),
        h(MonthRangePicker, { placeholder: new CalendarDate(year, 1, 1), initialFocus: true }),
        h(YearPicker, { placeholder: new CalendarDate(year, 1, 1), initialFocus: true }),
        h(YearRangePicker, { placeholder: new CalendarDate(year, 1, 1), initialFocus: true }),
      ]),
    })));
    const [first, second] = await Promise.all([render(2026), render(2040)]);
    expect(first.match(/<button[^>]*tabindex="0"/g)).toHaveLength(4);
    expect(second.match(/<button[^>]*tabindex="0"/g)).toHaveLength(4);
    expect(first).toContain('aria-label="January 2026"');
    expect(second).toContain('aria-label="January 2040"');
    expect(await render(2026)).toBe(first);
  });

  it("renders segmented fields and range composition with paired native values", async () => {
    const date = new CalendarDate(2026, 8, 12);
    const time = new Time(9, 30);
    const render = () => renderToString(createSSRApp({
      render: () => h("form", [
        h(DateField, { modelValue: date, locale: "en-GB", name: "date" }),
        h(TimeField, { modelValue: time, hourCycle: 24, name: "time" }),
        h(DateRangeField, { modelValue: { start: date, end: date.add({ days: 2 }) }, name: "trip" }),
        h(TimeRangeField, { modelValue: { start: time, end: time.add({ hours: 1 }) }, hourCycle: 24, name: "shift" }),
        h(DateRangePicker, { modelValue: { start: date }, placeholder: date, name: "picker" }),
      ]),
    }));
    const html = await render();
    expect(html).toContain('name="trip.start"');
    expect(html).toContain('name="trip.end"');
    expect(html).toContain('value="2026-08-14"');
    expect(html).toContain('name="shift.start"');
    expect(html).toContain('name="shift.end"');
    expect(html).toContain('value="10:30:00"');
    expect(html).toContain('data-slot="akaza-popover-popup-trigger"');
    expect(await render()).toBe(html);
  });
});
