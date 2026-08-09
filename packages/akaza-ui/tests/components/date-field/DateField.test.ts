import { CalendarDate } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick, shallowRef } from "vue";
import { DateField } from "@/components/date-field";
import { Field } from "@/components/field";

describe("date field", () => {
  it("renders locale-ordered spinbutton segments and updates the model", async () => {
    const wrapper = mount(defineComponent({
      components: { DateField },
      setup() {
        return { value: shallowRef(new CalendarDate(2026, 8, 12)) };
      },
      template: `<DateField v-model="value" locale="en-US" />`,
    }));
    const segments = wrapper.findAll("[role='spinbutton']");
    expect(segments.map((segment) => segment.attributes("data-akaza-segment"))).toEqual(["month", "day", "year"]);

    await wrapper.get("[data-akaza-segment='day']").setValue("15");
    expect((wrapper.vm as unknown as { value: CalendarDate }).value.toString()).toBe("2026-08-15");
  });

  it("keeps partial segment text internal until the date is complete", async () => {
    const wrapper = mount(DateField, {
      props: {
        modelValue: new CalendarDate(2026, 8, 12),
        "onUpdate:modelValue": value => wrapper.setProps({ modelValue: value }),
      },
    });
    const year = wrapper.get<HTMLInputElement>("[data-akaza-segment='year']");

    await year.setValue("2");
    expect(year.element.value).toBe("2");
    expect(wrapper.props("modelValue")?.toString()).toBe("2026-08-12");

    await year.setValue("2027");
    expect(wrapper.props("modelValue")?.toString()).toBe("2027-08-12");
  });

  it("supports keyboard stepping and segment focus movement", async () => {
    const wrapper = mount(DateField, {
      attachTo: document.body,
      props: {
        modelValue: new CalendarDate(2026, 8, 12),
        "onUpdate:modelValue": (value) => wrapper.setProps({ modelValue: value }),
      },
    });
    const month = wrapper.get("[data-akaza-segment='month']");
    await month.trigger("keydown", { key: "ArrowUp" });
    expect(wrapper.props("modelValue")?.toString()).toBe("2026-09-12");
    await month.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement?.getAttribute("data-akaza-segment")).toBe("day");
    wrapper.unmount();
  });

  it("moves horizontal segment focus in RTL visual order", async () => {
    const wrapper = mount(DateField, {
      attachTo: document.body,
      props: { dir: "rtl", modelValue: new CalendarDate(2026, 8, 12) },
    });
    const month = wrapper.get("[data-akaza-segment='month']");
    await month.trigger("focus");
    await month.trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement?.getAttribute("data-akaza-segment")).toBe("day");
    wrapper.unmount();
  });

  it("distributes pasted ISO dates", async () => {
    const wrapper = mount(DateField);
    await wrapper.get("[data-akaza-segment='month']").trigger("paste", {
      clipboardData: { getData: () => "2026-11-24" },
    });
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0].toString()).toBe("2026-11-24");
  });

  it("inherits Field metadata and reveals validation after interaction", async () => {
    const wrapper = mount(defineComponent({
      components: { DateField, Field },
      template: `
        <Field label="Start date" name="start" required>
          <DateField />
        </Field>
      `,
    }));
    const root = wrapper.get(".akaza-date-field");
    expect(root.attributes("data-akaza-invalid")).toBeUndefined();
    await wrapper.get("[data-akaza-segment='month']").trigger("focus");
    await root.trigger("focusout", { relatedTarget: null });
    expect(root.attributes("data-akaza-invalid")).toBe("true");
    expect(wrapper.get(".akaza-date-field-hidden-input").attributes("name")).toBe("start");
    expect(wrapper.get(".akaza-field-error").text()).not.toBe("");
  });

  it("marks out-of-range and unavailable complete dates invalid", async () => {
    const wrapper = mount(DateField, {
      props: {
        modelValue: new CalendarDate(2026, 8, 12),
        minValue: new CalendarDate(2026, 8, 15),
      },
    });
    await wrapper.get(".akaza-date-field").trigger("focusout", { relatedTarget: null });
    expect(wrapper.get(".akaza-date-field").attributes("data-akaza-invalid")).toBe("true");
  });

  it("restores segment text when a value change is canceled", async () => {
    const value = new CalendarDate(2026, 8, 12);
    const wrapper = mount(DateField, {
      props: {
        modelValue: value,
        onValueChange: (_next, details) => details.cancel(),
      },
    });
    await wrapper.get("[data-akaza-segment='day']").setValue("15");
    expect(wrapper.get("[data-akaza-segment='day']").element.value).toBe("12");
    expect(wrapper.props("modelValue")?.toString()).toBe("2026-08-12");
  });

  it("clears partial segments when its form resets", async () => {
    const wrapper = mount(defineComponent({
      components: { DateField },
      template: `<form><DateField name="start" /></form>`,
    }), { attachTo: document.body });
    await wrapper.get("[data-akaza-segment='month']").setValue("08");
    (wrapper.get("form").element as HTMLFormElement).reset();
    await nextTick();
    expect(wrapper.get("[data-akaza-segment='month']").element.value).toBe("");
    wrapper.unmount();
  });

  it("opens its optional calendar and commits a selected date", async () => {
    const wrapper = mount(DateField, {
      attachTo: document.body,
      props: {
        showCalendar: true,
        placeholder: new CalendarDate(2026, 8, 1),
        "onUpdate:modelValue": (value) => wrapper.setProps({ modelValue: value }),
      },
    });

    await wrapper.get(".akaza-date-field-calendar-trigger").trigger("click");
    await nextTick();
    expect(document.body.querySelector(".akaza-date-field-calendar-content")).not.toBeNull();
    expect(wrapper.get(".akaza-date-field-calendar-trigger").attributes("aria-expanded")).toBe("true");

    const day = document.body.querySelector<HTMLButtonElement>("button[aria-label*='August 12, 2026']")!;
    day.click();
    await nextTick();
    expect(wrapper.props("modelValue")?.toString()).toBe("2026-08-12");
    expect(document.body.querySelector(".akaza-date-field-calendar-content")).toBeNull();
    expect(wrapper.get("[data-akaza-segment='day']").element.value).toBe("12");
    wrapper.unmount();
  });

  it("allows calendar opening to be canceled", async () => {
    const wrapper = mount(DateField, {
      props: {
        showCalendar: true,
        onCalendarOpenChange: (_open, details) => details.cancel(),
      },
    });
    await wrapper.get(".akaza-date-field-calendar-trigger").trigger("click");
    expect(wrapper.emitted("update:calendarOpen")).toBeUndefined();
  });
});
