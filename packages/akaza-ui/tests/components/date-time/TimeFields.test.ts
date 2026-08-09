import { Time } from "@internationalized/date";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, shallowRef } from "vue";
import { Field } from "@/components/field";
import { TimeField } from "@/components/time-field";
import { TimeRangeField } from "@/components/time-range-field";

describe("time field", () => {
  it("renders requested segments and updates through keyboard", async () => {
    const wrapper = mount(TimeField, {
      attachTo: document.body,
      props: {
        modelValue: new Time(9, 30),
        hourCycle: 24,
        granularity: "second",
        "onUpdate:modelValue": value => wrapper.setProps({ modelValue: value }),
      },
    });

    expect(wrapper.findAll("[role='spinbutton']").map(item => item.attributes("data-akaza-segment")))
      .toEqual(["hour", "minute", "second"]);
    await wrapper.get("[data-akaza-segment='minute']").trigger("keydown", { key: "ArrowUp" });
    expect(wrapper.props("modelValue")?.toString()).toBe("09:31:00");
    await wrapper.get("[data-akaza-segment='minute']").trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement?.getAttribute("data-akaza-segment")).toBe("second");
    wrapper.unmount();
  });

  it("supports 12-hour day-period pointer changes", async () => {
    const wrapper = mount(TimeField, {
      props: {
        modelValue: new Time(9, 30),
        hourCycle: 12,
        "onUpdate:modelValue": value => wrapper.setProps({ modelValue: value }),
      },
    });

    await wrapper.get(".akaza-time-field-day-period").trigger("click");
    expect(wrapper.props("modelValue")?.toString()).toBe("21:30:00");
  });

  it("moves focus in locale-rendered segment order", async () => {
    const wrapper = mount(TimeField, {
      attachTo: document.body,
      props: {
        modelValue: new Time(9, 30),
        hourCycle: 12,
        locale: "zh-CN",
      },
    });

    const dayPeriod = wrapper.get(".akaza-time-field-day-period");
    await dayPeriod.element.focus();
    await dayPeriod.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement?.getAttribute("data-akaza-segment")).toBe("hour");
    wrapper.unmount();
  });

  it("keeps partial text internal and restores canceled changes", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(TimeField, {
      props: {
        modelValue: new Time(9, 30),
        hourCycle: 24,
        onValueChange,
      },
    });

    const hour = wrapper.get<HTMLInputElement>("[data-akaza-segment='hour']");
    await hour.setValue("1");
    expect(hour.element.value).toBe("1");
    expect(onValueChange).not.toHaveBeenCalled();
    await hour.setValue("10");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(hour.element.value).toBe("09");
  });

  it("integrates required errors and form names with Field", async () => {
    const wrapper = mount(defineComponent({
      components: { Field, TimeField },
      template: `
        <form>
          <Field label="Start time" name="start" required>
            <TimeField :hour-cycle="24" />
          </Field>
        </form>
      `,
    }));

    await wrapper.get("[data-akaza-segment='hour']").trigger("focus");
    await wrapper.get(".akaza-time-field").trigger("focusout", { relatedTarget: null });
    expect(wrapper.get(".akaza-time-field").attributes("data-akaza-invalid")).toBe("true");
    expect(wrapper.get(".akaza-field-error").text()).toContain("time");
    expect(wrapper.get(".akaza-time-field-hidden-input").attributes("name")).toBe("start");
  });

  it("does not apply required validation to read-only fields", () => {
    const wrapper = mount(defineComponent({
      components: { TimeField },
      template: `<form><TimeField name="time" required read-only /></form>`,
    }));

    expect((wrapper.get("form").element as HTMLFormElement).checkValidity()).toBe(true);
  });

  it("snaps complete values to configured steps", async () => {
    const wrapper = mount(TimeField, {
      props: {
        modelValue: new Time(9, 7),
        hourCycle: 24,
        step: { minute: 15 },
        stepSnapping: true,
      },
    });
    await wrapper.get("[data-akaza-segment='minute']").setValue("08");
    const updates = wrapper.emitted("update:modelValue");
    expect(updates).toBeDefined();
    expect((updates![0]![0] as Time).toString()).toBe("09:15:00");
  });
});

describe("time range field", () => {
  it("updates endpoints and submits separate values", async () => {
    const wrapper = mount(defineComponent({
      components: { TimeRangeField },
      setup() {
        return { value: shallowRef({ start: new Time(9), end: new Time(17) }) };
      },
      template: `<form><TimeRangeField v-model="value" name="shift" :hour-cycle="24" /></form>`,
    }), { attachTo: document.body });

    await wrapper.get(".akaza-time-range-field-end [data-akaza-segment='minute']").setValue("30");
    expect((wrapper.vm as unknown as { value: { end: Time } }).value.end.toString()).toBe("17:30:00");
    const data = new FormData(wrapper.get("form").element as HTMLFormElement);
    expect(data.get("shift.start")).toBe("09:00:00");
    expect(data.get("shift.end")).toBe("17:30:00");
    wrapper.unmount();
  });

  it("allows endpoint changes to be canceled", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(TimeRangeField, {
      props: {
        modelValue: { start: new Time(9), end: new Time(17) },
        hourCycle: 24,
        onValueChange,
      },
    });
    await wrapper.get(".akaza-time-range-field-start [data-akaza-segment='hour']").setValue("10");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.get<HTMLInputElement>(".akaza-time-range-field-start [data-akaza-segment='hour']").element.value).toBe("09");
  });

  it("reports reversed ranges through Field after interaction", async () => {
    const wrapper = mount(defineComponent({
      components: { Field, TimeRangeField },
      template: `
        <Field label="Shift" required>
          <TimeRangeField :model-value="{ start: new Time(17), end: new Time(9) }" :hour-cycle="24" />
        </Field>
      `,
      setup: () => ({ Time }),
    }));

    await wrapper.get(".akaza-time-range-field").trigger("focusout", { relatedTarget: null });
    await nextTick();
    expect(wrapper.get(".akaza-time-range-field").attributes("data-akaza-invalid")).toBe("true");
    expect(wrapper.get(".akaza-field-error").text()).toContain("on or after");
  });
});
