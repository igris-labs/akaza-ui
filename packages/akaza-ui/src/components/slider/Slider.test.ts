import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { Slider } from ".";

describe("slider", () => {
  it("supports range values with keyboard stepping", async () => {
    const wrapper = mount(defineComponent({
      components: { Slider },
      setup() {
        const value = ref([20, 80]);
        return { value };
      },
      template: `<Slider v-model="value" :min="0" :max="100" :step="10" :aria-labels="['Minimum', 'Maximum']" />`,
    }));

    const thumbs = wrapper.findAll(".akaza-slider-thumb");

    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]!.attributes("aria-valuenow")).toBe("20");

    await thumbs[0]!.trigger("keydown", { key: "ArrowRight" });

    expect((wrapper.vm as unknown as { value: number[] }).value).toEqual([30, 80]);
  });
});
