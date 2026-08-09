import { CalendarDate } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref, shallowRef } from "vue";
import { DateRangeField } from "@/components/date-range-field";
import { Field } from "@/components/field";

describe("date range field", () => {
  it("renders two locale-ordered date fields and updates each endpoint", async () => {
    const wrapper = mount(defineComponent({
      components: { DateRangeField },
      setup() {
        return {
          value: shallowRef({
            start: new CalendarDate(2026, 8, 12),
            end: new CalendarDate(2026, 8, 18),
          }),
        };
      },
      template: `<DateRangeField v-model="value" locale="en-US" />`,
    }));

    expect(wrapper.findAll("[role='spinbutton']")).toHaveLength(6);
    expect(wrapper.get(".akaza-date-range-field").attributes("data-akaza-state")).toBe("complete");
    await wrapper.get(".akaza-date-range-field-end [data-akaza-segment='day']").setValue("20");
    expect((wrapper.vm as unknown as { value: { end: CalendarDate } }).value.end.toString()).toBe("2026-08-20");
  });

  it("keeps partial child text without committing an incomplete endpoint", async () => {
    const wrapper = mount(DateRangeField);
    await wrapper.get(".akaza-date-range-field-start [data-akaza-segment='month']").setValue("08");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.get(".akaza-date-range-field").attributes("data-akaza-state")).toBe("partial");
  });

  it("allows endpoint changes to be canceled", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(DateRangeField, {
      props: {
        modelValue: {
          start: new CalendarDate(2026, 8, 12),
          end: new CalendarDate(2026, 8, 18),
        },
        onValueChange,
      },
    });

    await wrapper.get(".akaza-date-range-field-start [data-akaza-segment='day']").setValue("15");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.get<HTMLInputElement>(".akaza-date-range-field-start [data-akaza-segment='day']").element.value).toBe("12");
  });

  it("integrates aggregate validation with Field after interaction", async () => {
    const wrapper = mount(defineComponent({
      components: { DateRangeField, Field },
      template: `
        <Field label="Travel dates" name="travel" required>
          <DateRangeField />
        </Field>
      `,
    }));

    expect(wrapper.get(".akaza-date-range-field").attributes("data-akaza-invalid")).toBeUndefined();
    await wrapper.get(".akaza-date-range-field-start [data-akaza-segment='month']").trigger("focus");
    await wrapper.get(".akaza-date-range-field").trigger("focusout", { relatedTarget: null });
    await nextTick();
    expect(wrapper.get(".akaza-date-range-field").attributes("data-akaza-invalid")).toBe("true");
    expect(wrapper.get(".akaza-field-error").text()).toContain("start and end");
  });

  it("submits separate ISO endpoints and omits them while disabled", async () => {
    const wrapper = mount(defineComponent({
      components: { DateRangeField },
      setup() {
        return {
          disabled: ref(false),
          value: shallowRef({
            start: new CalendarDate(2026, 8, 12),
            end: new CalendarDate(2026, 8, 18),
          }),
        };
      },
      template: `<form><DateRangeField v-model="value" name="travel" :disabled="disabled" /></form>`,
    }), { attachTo: document.body });

    const form = wrapper.get("form").element as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get("travel.start")).toBe("2026-08-12");
    expect(data.get("travel.end")).toBe("2026-08-18");
    (wrapper.vm as unknown as { disabled: boolean }).disabled = true;
    await nextTick();
    expect(Array.from(new FormData(form).keys())).toEqual([]);
    wrapper.unmount();
  });

  it("keeps a fixed endpoint read-only", () => {
    const wrapper = mount(DateRangeField, {
      props: {
        fixedDate: "start",
        modelValue: {
          start: new CalendarDate(2026, 8, 12),
          end: new CalendarDate(2026, 8, 18),
        },
      },
    });
    expect(wrapper.get(".akaza-date-range-field-start [data-akaza-segment='month']").attributes("readonly")).toBeDefined();
    expect(wrapper.get(".akaza-date-range-field-end [data-akaza-segment='month']").attributes("readonly")).toBeUndefined();
  });

  it("reports unavailable dates and maximum range length independently", async () => {
    const wrapper = mount(DateRangeField, {
      props: {
        modelValue: {
          start: new CalendarDate(2026, 8, 10),
          end: new CalendarDate(2026, 8, 15),
        },
        maximumDays: 10,
        isDateUnavailable: date => date.day === 12,
      },
    });
    await wrapper.get(".akaza-date-range-field").trigger("focusout", { relatedTarget: null });
    expect(wrapper.get(".akaza-date-range-field-hidden-input").element.validationMessage).toContain("unavailable");

    await wrapper.setProps({
      modelValue: {
        start: new CalendarDate(2026, 8, 1),
        end: new CalendarDate(2026, 8, 15),
      },
      isDateUnavailable: undefined,
    });
    await nextTick();
    expect(wrapper.get(".akaza-date-range-field-hidden-input").element.validationMessage).toContain("10 days");
  });
});
