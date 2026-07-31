import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { Accordion } from "@/components/accordion";
import { Collapsible } from "@/components/collapsible";
import { Tabs } from "@/components/tabs";

describe("disclosure components", () => {
  it("keeps accordion ids unique and hidden panels inert", async () => {
    const wrapper = mount(defineComponent({
      components: { Accordion },
      setup() {
        const items = [{ value: "shared", label: "Shared", content: "Content" }];
        return { items };
      },
      template: `<div><Accordion :items="items" /><Accordion :items="items" /></div>`,
    }));
    const triggers = wrapper.findAll(".akaza-accordion-trigger");
    const panels = wrapper.findAll("[role='region']");

    expect(triggers[0]!.attributes("id")).not.toBe(triggers[1]!.attributes("id"));
    expect(panels[0]!.attributes("aria-hidden")).toBe("true");
    expect(panels[0]!.attributes()).toHaveProperty("inert");

    await triggers[0]!.trigger("click");
    expect(triggers[0]!.attributes("aria-expanded")).toBe("true");
    expect(panels[0]!.attributes("aria-labelledby")).toBe(triggers[0]!.attributes("id"));
  });

  it("moves accordion focus, skips disabled items, and supports cancellation", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(Accordion, {
      props: {
        items: [
          { value: "one", label: "One" },
          { value: "two", label: "Two", disabled: true },
          { value: "three", label: "Three" },
        ],
        onValueChange,
      },
      attachTo: document.body,
    });
    const triggers = wrapper.findAll(".akaza-accordion-trigger");

    triggers[0]!.element.focus();
    await triggers[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(triggers[2]!.element);

    await triggers[2]!.trigger("click");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(triggers[2]!.attributes("aria-expanded")).toBe("false");
    wrapper.unmount();
  });

  it("supports native-event slot actions and unmounting in Collapsible", async () => {
    const wrapper = mount(defineComponent({
      components: { Collapsible },
      setup() {
        const open = ref(false);
        return { open };
      },
      template: `
        <Collapsible v-model="open" unmount-on-hide>
          <template #trigger="{ toggle }"><button class="custom-trigger" @click.stop="toggle">Toggle</button></template>
          <template #content>Details</template>
        </Collapsible>
      `,
    }));

    expect(wrapper.text()).not.toContain("Details");
    await wrapper.find(".custom-trigger").trigger("click");
    expect(wrapper.text()).toContain("Details");
    expect(wrapper.find("[role='region']").attributes("aria-hidden")).toBeUndefined();
  });

  it("keeps tabs ids unique and manual activation separate from focus", async () => {
    const wrapper = mount(defineComponent({
      components: { Tabs },
      setup() {
        const value = ref("one");
        const items = [
          { value: "one", label: "One" },
          { value: "disabled", label: "Disabled", disabled: true },
          { value: "two", label: "Two" },
        ];
        return { items, value };
      },
      template: `
        <div>
          <Tabs v-model="value" :items="items" activation-mode="manual" aria-label="First" />
          <Tabs model-value="one" :items="items" aria-label="Second" />
        </div>
      `,
    }), { attachTo: document.body });
    await nextTick();
    const tabs = wrapper.findAll("[role='tab']");

    expect(tabs[0]!.attributes("id")).not.toBe(tabs[3]!.attributes("id"));
    tabs[0]!.element.focus();
    await tabs[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[2]!.element);
    expect((wrapper.vm as unknown as { value: string }).value).toBe("one");

    await tabs[2]!.trigger("keydown", { key: "Enter" });
    expect((wrapper.vm as unknown as { value: string }).value).toBe("two");
    expect(wrapper.get(`#${tabs[2]!.attributes("aria-controls")}`).attributes("data-akaza-state")).toBe("active");
    wrapper.unmount();
  });
});
