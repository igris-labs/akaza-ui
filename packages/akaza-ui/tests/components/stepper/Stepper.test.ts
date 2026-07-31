import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { Stepper } from "@/components/stepper";

const items = [
  { value: 1, title: "Account", content: "Account details" },
  { value: 2, title: "Workspace", content: "Workspace details" },
  { value: 3, title: "Review", content: "Review request" },
];

describe("stepper", () => {
  it("enforces linear progression and exposes previous/next controls", async () => {
    const wrapper = mount(defineComponent({
      components: { Stepper },
      setup() {
        const value = ref(1);
        return { items, value };
      },
      template: `<Stepper v-model="value" :items="items" show-controls />`,
    }));

    expect(wrapper.findAll(".akaza-stepper-trigger")[2]!.attributes()).toHaveProperty("disabled");
    await wrapper.get(".akaza-stepper-next").trigger("click");
    expect((wrapper.vm as unknown as { value: number }).value).toBe(2);
    expect(wrapper.findAll(".akaza-stepper-trigger")[2]!.attributes()).not.toHaveProperty("disabled");
    expect(wrapper.findAll(".akaza-stepper-item")[0]!.attributes("data-akaza-state")).toBe("completed");
  });

  it("uses roving focus without activating in manual mode", async () => {
    const wrapper = mount(defineComponent({
      components: { Stepper },
      setup() {
        const value = ref(1);
        return { items, value };
      },
      template: `<Stepper v-model="value" :items="items" :linear="false" />`,
    }), { attachTo: document.body });
    const triggers = wrapper.findAll(".akaza-stepper-trigger");

    await triggers[0]!.trigger("keydown", { key: "ArrowRight" });
    await nextTick();
    expect(document.activeElement).toBe(triggers[1]!.element);
    expect((wrapper.vm as unknown as { value: number }).value).toBe(1);

    await triggers[1]!.trigger("keydown", { key: "Enter" });
    expect((wrapper.vm as unknown as { value: number }).value).toBe(2);
    wrapper.unmount();
  });

  it("renders associated panels and unique accessibility ids", () => {
    const wrapper = mount(defineComponent({
      components: { Stepper },
      setup: () => ({ items }),
      template: `<Stepper :items="items" :model-value="1" /><Stepper :items="items" :model-value="1" />`,
    }));
    const steppers = wrapper.findAllComponents(Stepper);
    const trigger = steppers[0]!.get(".akaza-stepper-trigger");

    expect(steppers[0]!.get(".akaza-stepper-panel").attributes("aria-labelledby")).toBe(trigger.attributes("id"));
    expect(trigger.attributes("id")).not.toBe(steppers[1]!.get(".akaza-stepper-trigger").attributes("id"));
  });

  it("allows step changes to be canceled", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(Stepper, {
      props: { items, modelValue: 1, linear: false, onValueChange },
    });

    await wrapper.findAll(".akaza-stepper-trigger")[1]!.trigger("click");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.props("modelValue")).toBe(1);
  });

  it("does not treat the current item as a loop destination", () => {
    const wrapper = mount(Stepper, {
      props: { items: [{ value: 1, title: "Only" }], modelValue: 1, linear: false, loop: true, showControls: true },
    });

    expect(wrapper.get(".akaza-stepper-previous").attributes()).toHaveProperty("disabled");
    expect(wrapper.get(".akaza-stepper-next").attributes()).toHaveProperty("disabled");
  });
});
