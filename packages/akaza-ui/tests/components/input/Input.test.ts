import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { Input } from "@/components/input";

describe("input", () => {
  it("does not expose native invalid state before interaction", async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: "",
        required: true,
      },
    });

    const input = wrapper.find("input");

    expect(input.attributes("data-akaza-invalid")).toBeUndefined();

    await input.trigger("blur");

    expect(input.attributes("data-akaza-invalid")).toBe("true");
  });

  it("restores its initial model and interaction state on native form reset", async () => {
    const wrapper = mount(defineComponent({
      components: { Input },
      setup() {
        return { value: ref("Initial") };
      },
      template: `
        <form>
          <Input v-model="value" required />
          <button type="reset">Reset</button>
        </form>
      `,
    }), { attachTo: document.body });
    const input = wrapper.find("input");
    await input.setValue("Changed");
    await input.trigger("blur");
    await wrapper.find("button").trigger("click");
    await nextTick();

    expect(input.element.value).toBe("Initial");
    expect(input.attributes("data-akaza-dirty")).toBeUndefined();
    expect(input.attributes("data-akaza-touched")).toBeUndefined();
    expect(input.attributes("data-akaza-invalid")).toBeUndefined();
    wrapper.unmount();
  });
});
