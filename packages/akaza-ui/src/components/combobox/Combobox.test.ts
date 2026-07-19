import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { Combobox } from ".";

describe("combobox", () => {
  it("restores the selected label after an unmatched query closes", async () => {
    const wrapper = mount(defineComponent({
      components: { Combobox },
      setup() {
        const value = ref("vue");
        const options = [{ value: "vue", label: "Vue" }, { value: "nuxt", label: "Nuxt" }];
        return { options, value };
      },
      template: `<Combobox v-model="value" :options="options" />`,
    }));
    const input = wrapper.find(".akaza-combobox-input");

    await input.trigger("focus");
    await input.setValue("missing");
    await wrapper.find(".akaza-combobox").trigger("focusout", { relatedTarget: document.body });

    expect((input.element as HTMLInputElement).value).toBe("Vue");
  });

  it("supports object values with a serializer", async () => {
    const first = { id: 1, name: "Vue" };
    const wrapper = mount(defineComponent({
      components: { Combobox },
      setup() {
        const value = ref<Record<string, unknown> | string>("");
        const options = [{ value: first, label: "Vue" }];
        return { options, value };
      },
      template: `<Combobox v-model="value" name="framework" :options="options" :serialize-value="value => String(value.id)" />`,
    }));

    await wrapper.find(".akaza-combobox-input").trigger("focus");
    await wrapper.find(".akaza-combobox-option").trigger("click");

    expect((wrapper.vm as unknown as { value: unknown }).value).toStrictEqual(first);
    expect((wrapper.find(".akaza-combobox-hidden-input").element as HTMLInputElement).value).toBe("1");
  });

  it("emits creation for an unmatched query", async () => {
    const wrapper = mount(Combobox, {
      props: {
        creatable: true,
        options: [{ value: "vue", label: "Vue" }],
      },
    });
    const input = wrapper.find(".akaza-combobox-input");

    await input.trigger("focus");
    await input.setValue("Svelte");
    await input.trigger("keydown", { key: "Enter" });

    expect(wrapper.emitted("create")?.[0]?.[0]).toBe("Svelte");
  });
});
