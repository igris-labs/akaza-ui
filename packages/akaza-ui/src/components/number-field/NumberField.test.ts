import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { NumberField } from ".";

describe("number field", () => {
  it("emits value commit after button changes", async () => {
    const wrapper = mount(NumberField, {
      props: {
        modelValue: 2,
        "onUpdate:modelValue": (value: number | null) => wrapper.setProps({ modelValue: value }),
      },
    });

    await wrapper.find(".akaza-number-field-increment").trigger("click");

    expect(wrapper.emitted("value-change")?.[0]?.[0]).toBe(3);
    expect(wrapper.emitted("value-commit")?.[0]?.[0]).toBe(3);
  });
});
