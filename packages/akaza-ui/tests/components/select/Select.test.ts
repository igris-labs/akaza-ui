import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { Field } from "@/components/field";
import { Select } from "@/components/select";

enableAutoUnmount(afterEach);

describe("select", () => {
  it("restores focus when a scrollbar press focuses an ancestor", async () => {
    const ancestor = document.createElement("main");
    ancestor.tabIndex = -1;
    document.body.append(ancestor);
    const wrapper = mount(Select, { attachTo: ancestor, props: { ariaLabel: "Framework", options: [{ label: "Vue", value: "vue" }] } });
    try {
      const trigger = wrapper.get(".akaza-select-trigger");
      (trigger.element as HTMLElement).focus();
      await trigger.trigger("click");
      await wrapper.get(".akaza-select-viewport").trigger("pointerdown");
      ancestor.focus();
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".akaza-select-content").exists()).toBe(true);
      document.dispatchEvent(new Event("pointerup", { bubbles: true }));
      expect(document.activeElement).toBe(trigger.element);
    } finally {
      wrapper.unmount();
      ancestor.remove();
    }
  });

  it.each([false, true])("keeps scrollbar blur internal with autocomplete=%s", async (autocomplete) => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { autocomplete, ariaLabel: "Framework", options: [{ value: "vue", label: "Vue" }] },
    });
    try {
      const trigger = wrapper.get(".akaza-select-trigger");
      (trigger.element as HTMLButtonElement).focus();
      await trigger.trigger("click");
      await flushPromises();
      const focusOwner = autocomplete ? wrapper.get(".akaza-select-search-input") : trigger;
      await wrapper.get(".akaza-select-viewport").trigger("pointerdown");
      (focusOwner.element as HTMLElement).blur();
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".akaza-select-content").exists()).toBe(true);

      document.dispatchEvent(new Event("pointerup", { bubbles: true }));
      expect(document.activeElement).toBe(focusOwner.element);
      (focusOwner.element as HTMLElement).blur();
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".akaza-select-content").exists()).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  it("does not expose native invalid state before interaction", async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: "",
        ariaLabel: "Plan",
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
          <Select v-model="value" :options="options" aria-label="Plan" />
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
      template: `<Select v-model="value" multiple :options="options" aria-label="Permissions" />`,
    }));

    await wrapper.find(".akaza-select-trigger").trigger("click");

    expect(wrapper.find(".akaza-select-group-label").text()).toBe("Project");
    expect(wrapper.find(".akaza-select-separator").exists()).toBe(true);

    await wrapper.findAll(".akaza-select-option")[1]!.trigger("click");

    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["read", "write"]);
    expect(wrapper.find(".akaza-select-content").exists()).toBe(true);
  });

  it("moves autocomplete focus and keyboard ownership to the search input", async () => {
    const wrapper = mount(defineComponent({
      components: { Select },
      setup() {
        const value = ref("");
        const options = [
          { value: "vue", label: "Vue" },
          { value: "nuxt", label: "Nuxt" },
        ];
        return { options, value };
      },
      template: `<Select v-model="value" autocomplete :options="options" aria-label="Framework" />`,
    }), { attachTo: document.body });

    await wrapper.find(".akaza-select-trigger").trigger("click");
    const search = wrapper.find(".akaza-select-search-input");
    expect(document.activeElement).toBe(search.element);

    await search.trigger("keydown", { key: "ArrowDown" });
    await search.trigger("keydown", { key: "Enter" });
    expect((wrapper.vm as unknown as { value: string }).value).toBe("nuxt");

    wrapper.unmount();
  });

  it("closes an open popup when disabled", async () => {
    const wrapper = mount(Select, {
      props: {
        open: true,
        ariaLabel: "Framework",
        options: [{ value: "vue", label: "Vue" }],
      },
    });

    expect(wrapper.find(".akaza-select-content").exists()).toBe(true);
    await wrapper.setProps({ disabled: true });
    expect(wrapper.find(".akaza-select-content").exists()).toBe(false);
  });

  it("supports native required validity without a name", async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: "",
        ariaLabel: "Plan",
        required: true,
        options: [{ value: "vue", label: "Vue" }],
      },
    });

    await wrapper.find(".akaza-select-trigger").trigger("focus");
    await wrapper.find(".akaza-select-trigger").trigger("blur");
    expect(wrapper.find(".akaza-select-trigger").attributes("data-akaza-invalid")).toBe("true");
  });

  it("does not expose or select hidden options while loading", async () => {
    const wrapper = mount(Select, {
      props: {
        open: true,
        ariaLabel: "Framework",
        loading: true,
        options: [{ value: "vue", label: "Vue" }],
      },
    });
    const trigger = wrapper.find(".akaza-select-trigger");

    expect(trigger.attributes("aria-activedescendant")).toBeUndefined();
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await trigger.trigger("keydown", { key: "Enter" });

    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("treats a custom nullable sentinel as empty for required validation", async () => {
    const wrapper = mount(Select, {
      props: {
        modelValue: "none",
        ariaLabel: "Framework",
        nullableValue: "none",
        required: true,
        options: [{ value: "vue", label: "Vue" }],
      },
    });
    const trigger = wrapper.find(".akaza-select-trigger");

    await trigger.trigger("blur");
    expect(trigger.attributes("data-akaza-invalid")).toBe("true");
  });
});
