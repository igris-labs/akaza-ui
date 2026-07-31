import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { Rating } from "@/components/rating";

describe("rating", () => {
  it("supports fractional values with radio-group semantics", async () => {
    const wrapper = mount(defineComponent({
      components: { Rating },
      setup() {
        const value = ref(0);
        return { value };
      },
      template: `<Rating v-model="value" :step="0.5" aria-label="Quality" />`,
    }));

    expect(wrapper.get("[role='radiogroup']").attributes("aria-label")).toBe("Quality");
    expect(wrapper.findAll("[role='radio']")).toHaveLength(10);

    await wrapper.get(".akaza-rating-radio[data-akaza-value='2.5']").trigger("click");
    expect((wrapper.vm as unknown as { value: number }).value).toBe(2.5);
    expect(wrapper.get(".akaza-rating-radio[data-akaza-value='2.5']").attributes("aria-checked")).toBe("true");
    expect(wrapper.findAll(".akaza-rating-item")[2]!.attributes("data-akaza-state")).toBe("partial");
  });

  it("moves and selects with orientation-aware keyboard navigation", async () => {
    const wrapper = mount(defineComponent({
      components: { Rating },
      setup() {
        const value = ref(2);
        return { value };
      },
      template: `<Rating v-model="value" />`,
    }));

    await wrapper.get(".akaza-rating-radio[data-akaza-value='2']").trigger("keydown", { key: "ArrowRight" });
    expect((wrapper.vm as unknown as { value: number }).value).toBe(3);
  });

  it("previews on hover and clears the selected value", async () => {
    const wrapper = mount(defineComponent({
      components: { Rating },
      setup() {
        const value = ref(3);
        return { value };
      },
      template: `<Rating v-model="value" hoverable clearable />`,
    }));

    await wrapper.get(".akaza-rating-radio[data-akaza-value='5']").trigger("mouseenter");
    expect(wrapper.findAll(".akaza-rating-item")[4]!.attributes("data-akaza-state")).toBe("active");

    await wrapper.get(".akaza-rating-radio[data-akaza-value='3']").trigger("click");
    expect((wrapper.vm as unknown as { value: number }).value).toBe(0);
  });

  it("supports required forms and cancelable changes", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(Rating, {
      props: { modelValue: 0, name: "score", required: true, onValueChange },
    });

    await wrapper.get(".akaza-rating-hidden-input").trigger("invalid");
    expect(wrapper.get(".akaza-rating").attributes("data-akaza-invalid")).toBe("true");

    await wrapper.get(".akaza-rating-radio[data-akaza-value='1']").trigger("click");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.props("modelValue")).toBe(0);
  });

  it("does not preview read-only values or emit unchanged selections", async () => {
    const onValueChange = vi.fn();
    const wrapper = mount(Rating, {
      props: { modelValue: 3, hoverable: true, readOnly: true, onValueChange },
    });

    await wrapper.get(".akaza-rating-radio[data-akaza-value='5']").trigger("mouseenter");
    expect(wrapper.findAll(".akaza-rating-item")[4]!.attributes("data-akaza-state")).toBe("inactive");

    await wrapper.setProps({ readOnly: false });
    await wrapper.get(".akaza-rating-radio[data-akaza-value='3']").trigger("click");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
