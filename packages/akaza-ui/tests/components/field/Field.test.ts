import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { Field } from "@/components/field";
import { Input } from "@/components/input";

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

  it("renders the native validation message after interaction", async () => {
    const wrapper = mount(defineComponent({
      components: { Field, Input },
      template: `
        <Field label="Email" required>
          <Input />
        </Field>
      `,
    }), { attachTo: document.body });
    await nextTick();
    const input = wrapper.find("input");
    (input.element as HTMLInputElement).setCustomValidity("Email is required.");
    await input.trigger("invalid");
    await nextTick();
    await nextTick();

    expect(wrapper.find(".akaza-field-error").text()).toBe("Email is required.");
    wrapper.unmount();
  });
});
