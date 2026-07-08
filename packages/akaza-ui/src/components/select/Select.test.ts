import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { Select } from ".";
import { Field } from "../field";

describe("select", () => {
  it("does not expose native invalid state before interaction", async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: "",
        name: "plan",
        required: true,
        options: [{ value: "startup", label: "Startup" }],
      },
    });

    const trigger = wrapper.find(".akaza-select-trigger");

    expect(trigger.attributes("data-akaza-invalid")).toBeUndefined();

    await trigger.trigger("blur");

    expect(trigger.attributes("data-akaza-invalid")).toBe("true");
  });

  it("exposes invalid state when required inside a field after blur", async () => {
    const wrapper = mount(defineComponent({
      components: { Field, Select },
      setup() {
        const value = ref("");
        const options = [{ value: "startup", label: "Startup" }];
        return { options, value };
      },
      template: `
        <Field name="plan" required>
          <Select v-model="value" :options="options" />
        </Field>
      `,
    }));

    const trigger = wrapper.find(".akaza-select-trigger");

    expect(trigger.attributes("data-akaza-invalid")).toBeUndefined();

    await trigger.trigger("blur");

    expect(trigger.attributes("data-akaza-invalid")).toBe("true");
  });

  it("supports multiple values with label and separator rows", async () => {
    const wrapper = mount(defineComponent({
      components: { Select },
      setup() {
        const value = ref(["read"]);
        const options = [
          { type: "label", label: "Project" },
          { value: "read", label: "Read" },
          { type: "separator" },
          { value: "write", label: "Write" },
        ];
        return { options, value };
      },
      template: `<Select v-model="value" multiple :options="options" />`,
    }));

    await wrapper.find(".akaza-select-trigger").trigger("click");

    expect(wrapper.find(".akaza-select-group-label").text()).toBe("Project");
    expect(wrapper.find(".akaza-select-separator").exists()).toBe(true);

    await wrapper.findAll(".akaza-select-option")[1]!.trigger("click");

    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["read", "write"]);
    expect(wrapper.find(".akaza-select-content").exists()).toBe(true);
  });
});
