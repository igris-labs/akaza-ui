import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { Combobox } from "@/components/combobox";

describe("combobox", () => {
  it("treats focus falling back to a focusable ancestor as scrollbar interaction", async () => {
    const ancestor = document.createElement("main");
    ancestor.tabIndex = -1;
    document.body.append(ancestor);
    const wrapper = mount(Combobox, { attachTo: ancestor, props: { options: [{ label: "Vue", value: "vue" }] } });
    try {
      const input = wrapper.get(".akaza-combobox-input").element as HTMLInputElement;
      input.focus();
      await wrapper.vm.$nextTick();
      await wrapper.get(".akaza-combobox-viewport").trigger("pointerdown");
      ancestor.focus();
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".akaza-combobox-content").exists()).toBe(true);
      document.dispatchEvent(new Event("pointerup", { bubbles: true }));
      expect(document.activeElement).toBe(input);
    } finally {
      wrapper.unmount();
      ancestor.remove();
    }
  });

  it.each(["pointerup", "pointercancel"])("keeps scrollbar blur internal and restores input focus on %s", async (eventType) => {
    const wrapper = mount(Combobox, {
      attachTo: document.body,
      props: { resetSearchOnBlur: true, options: [{ value: "vue", label: "Vue" }] },
    });
    try {
      const input = wrapper.get(".akaza-combobox-input");
      (input.element as HTMLInputElement).focus();
      await input.setValue("V");
      const viewport = wrapper.get(".akaza-combobox-viewport");
      await viewport.trigger("pointerdown");
      (input.element as HTMLInputElement).blur();
      await wrapper.vm.$nextTick();

      expect(wrapper.find(".akaza-combobox-content").exists()).toBe(true);
      expect((input.element as HTMLInputElement).value).toBe("V");
      expect(wrapper.emitted("open-change")?.some(args => args[0] === false)).not.toBe(true);

      document.dispatchEvent(new Event(eventType, { bubbles: true }));
      expect(document.activeElement).toBe(input.element);
      // The gesture guard must not suppress a subsequent real blur or its search reset.
      (input.element as HTMLInputElement).blur();
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".akaza-combobox-content").exists()).toBe(false);
      expect(wrapper.emitted("update:search")?.at(-1)).toEqual([""]);
    } finally {
      wrapper.unmount();
    }
  });

  it("still dismisses for an outside pointer press after scrolling", async () => {
    const wrapper = mount(Combobox, { attachTo: document.body, props: { options: [{ label: "Vue", value: "vue" }] } });
    try {
      (wrapper.get(".akaza-combobox-input").element as HTMLInputElement).focus();
      await wrapper.vm.$nextTick();
      await wrapper.get(".akaza-combobox-viewport").trigger("pointerdown");
      document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".akaza-combobox-content").exists()).toBe(false);
      expect(wrapper.emitted("open-change")?.at(-1)?.[1]).toMatchObject({ reason: "outside-click" });
    } finally {
      wrapper.unmount();
    }
  });

  it("does not suppress a real outside focus target during a popup pointer gesture", async () => {
    const outside = document.createElement("button");
    document.body.append(outside);
    const wrapper = mount(Combobox, { attachTo: document.body, props: { options: [{ label: "Vue", value: "vue" }] } });
    try {
      (wrapper.get(".akaza-combobox-input").element as HTMLInputElement).focus();
      await wrapper.vm.$nextTick();
      await wrapper.get(".akaza-combobox-viewport").trigger("pointerdown");
      outside.focus();
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".akaza-combobox-content").exists()).toBe(false);
      expect(document.activeElement).toBe(outside);
    } finally {
      wrapper.unmount();
      outside.remove();
    }
  });

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

  it("uses the custom comparator when toggling a multiple value off", async () => {
    const selected = { id: 1, name: "Selected Vue" };
    const optionValue = { id: 1, name: "Vue" };
    const wrapper = mount(defineComponent({
      components: { Combobox },
      setup() {
        const value = ref([selected]);
        const options = [{ value: optionValue, label: "Vue" }];
        return { options, value };
      },
      template: `<Combobox v-model="value" multiple :options="options" :is-equal="(a, b) => a.id === b.id" />`,
    }));

    await wrapper.find(".akaza-combobox-input").trigger("focus");
    await wrapper.find(".akaza-combobox-option").trigger("click");

    expect((wrapper.vm as unknown as { value: unknown[] }).value).toEqual([]);
  });

  it("does not select hidden options while loading", async () => {
    const wrapper = mount(Combobox, {
      props: {
        open: true,
        loading: true,
        options: [{ value: "vue", label: "Vue" }],
      },
    });
    const input = wrapper.find(".akaza-combobox-input");

    expect(input.attributes("aria-activedescendant")).toBeUndefined();
    await input.trigger("keydown", { key: "ArrowDown" });
    await input.trigger("keydown", { key: "Enter" });

    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("treats a custom nullable sentinel as empty for required validation", async () => {
    const wrapper = mount(Combobox, {
      props: {
        modelValue: "none",
        nullableValue: "none",
        required: true,
        options: [{ value: "vue", label: "Vue" }],
      },
    });

    await wrapper.find(".akaza-combobox").trigger("focusout", { relatedTarget: document.body });
    expect(wrapper.find(".akaza-combobox-input").attributes("data-akaza-invalid")).toBe("true");
  });
});
