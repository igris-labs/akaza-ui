import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { Form } from ".";

describe("form", () => {
  it("marks the form submitted and invalid when native validation fires", async () => {
    const wrapper = mount(defineComponent({
      components: { Form },
      template: `
        <Form>
          <template #default="{ state, submitted }">
            <input class="required-input" required>
            <span class="state">{{ state }}</span>
            <span class="submitted">{{ submitted }}</span>
          </template>
        </Form>
      `,
    }));

    await wrapper.find(".required-input").trigger("invalid");

    expect(wrapper.find("form").attributes("data-akaza-state")).toBe("invalid");
    expect(wrapper.find(".state").text()).toBe("invalid");
    expect(wrapper.find(".submitted").text()).toBe("true");
  });
});
