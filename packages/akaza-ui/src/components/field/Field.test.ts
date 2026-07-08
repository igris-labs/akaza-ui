import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { Field } from ".";

describe("field", () => {
  it("renders the default slot when the field has a name", () => {
    const wrapper = mount(defineComponent({
      components: { Field },
      template: `
        <Field name="username" label="Username">
          <template #default="{ fieldName, controlProps }">
            <input class="test-input" v-bind="controlProps">
            <span class="test-field-name">{{ fieldName }}</span>
          </template>
        </Field>
      `,
    }));

    expect(wrapper.find(".test-input").exists()).toBe(true);
    expect(wrapper.find(".test-input").attributes("name")).toBe("username");
    expect(wrapper.find(".test-field-name").text()).toBe("username");
  });

  it("renders explicit error text in the field error element", () => {
    const wrapper = mount(defineComponent({
      components: { Field },
      template: `
        <Field name="workspaceSlug" label="Workspace slug" error="admin is reserved.">
          <input>
        </Field>
      `,
    }));

    expect(wrapper.find(".akaza-field-error").text()).toBe("admin is reserved.");
  });
});
