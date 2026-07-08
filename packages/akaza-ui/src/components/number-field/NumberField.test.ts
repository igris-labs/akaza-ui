import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { NumberField } from ".";
import { Field } from "../field";

describe("number field", () => {
  it("does not expose native invalid state before interaction", async () => {
    const wrapper = mount(NumberField, {
      props: {
        modelValue: 3,
        name: "seats",
        min: 5,
      },
    });

    const root = wrapper.find(".akaza-number-field");

    expect(root.attributes("data-akaza-invalid")).toBeUndefined();

    await wrapper.find(".akaza-number-field-input").trigger("blur");

    expect(root.attributes("data-akaza-invalid")).toBe("true");
  });

  it("exposes invalid state when below min inside a field after blur", async () => {
    const wrapper = mount(defineComponent({
      components: { Field, NumberField },
      setup() {
        const value = ref(3);
        return { value };
      },
      template: `
        <Field name="seats" required>
          <NumberField v-model="value" :min="5" />
        </Field>
      `,
    }));

    const root = wrapper.find(".akaza-number-field");

    expect(root.attributes("data-akaza-invalid")).toBeUndefined();

    await wrapper.find(".akaza-number-field-input").trigger("blur");

    expect(root.attributes("data-akaza-invalid")).toBe("true");
  });

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
