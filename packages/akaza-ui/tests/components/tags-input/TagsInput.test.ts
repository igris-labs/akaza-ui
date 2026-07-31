import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { TagsInput } from "@/components/tags-input";

describe("tags input", () => {
  it("adds with Enter and rejects duplicates", async () => {
    const wrapper = mount(defineComponent({
      components: { TagsInput },
      setup() {
        const value = ref<string[]>([]);
        return { value };
      },
      template: `<TagsInput v-model="value" />`,
    }));
    const input = wrapper.find(".akaza-tags-input-input");
    const component = wrapper.getComponent(TagsInput);

    await input.setValue("vue");
    await input.trigger("keydown", { key: "Enter" });
    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["vue"]);

    await input.setValue("vue");
    await input.trigger("keydown", { key: "Enter" });
    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["vue"]);
    expect(component.emitted("invalid-value")?.[0]?.[1]).toMatchObject({ reason: "duplicate" });
  });

  it("adds pasted delimiters as one atomic update and respects max", async () => {
    const wrapper = mount(defineComponent({
      components: { TagsInput },
      setup() {
        const value = ref<string[]>([]);
        return { value };
      },
      template: `<TagsInput v-model="value" add-on-paste :max="2" />`,
    }));
    const component = wrapper.getComponent(TagsInput);

    await wrapper.find(".akaza-tags-input-input").trigger("paste", {
      clipboardData: { getData: () => "vue,nuxt,vite" },
    });

    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["vue", "nuxt"]);
    expect(component.emitted("invalid-value")?.at(-1)?.[1]).toMatchObject({ reason: "max" });
  });

  it("supports keyboard tag focus and removal", async () => {
    const wrapper = mount(defineComponent({
      components: { TagsInput },
      setup() {
        const value = ref<string[]>(["vue", "nuxt"]);
        return { value };
      },
      template: `<TagsInput v-model="value" />`,
    }), { attachTo: document.body });
    const input = wrapper.find(".akaza-tags-input-input");
    (input.element as HTMLInputElement).focus();

    await input.trigger("keydown", { key: "Backspace" });
    const items = wrapper.findAll(".akaza-tags-input-item");
    expect(document.activeElement).toBe(items[1]!.element);

    await items[1]!.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["vue"]);
    wrapper.unmount();
  });

  it("supports object conversion and native form serialization", async () => {
    const wrapper = mount(defineComponent({
      components: { TagsInput },
      setup() {
        const value = ref<Record<string, unknown>[]>([]);
        const convertValue = (label: string) => ({ id: label.toLowerCase(), label });
        const displayValue = (item: Record<string, unknown>) => String(item.label);
        const serializeValue = (item: Record<string, unknown>) => String(item.id);
        return { convertValue, displayValue, serializeValue, value };
      },
      template: `
        <form>
          <TagsInput
            v-model="value"
            name="framework"
            :convert-value="convertValue"
            :display-value="displayValue"
            :serialize-value="serializeValue"
          />
        </form>
      `,
    }));
    const input = wrapper.find(".akaza-tags-input-input");
    await input.setValue("Vue");
    await input.trigger("keydown", { key: "Enter" });

    expect(wrapper.find(".akaza-tags-input-item-text").text()).toBe("Vue");
    const data = new FormData(wrapper.find("form").element as HTMLFormElement);
    expect(data.get("framework")).toBe("vue");
  });

  it("supports required validation and cancelable additions", async () => {
    const onAdd = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(TagsInput, {
      props: { modelValue: [], required: true, onAdd },
    });

    await wrapper.find(".akaza-tags-input-hidden-input").trigger("invalid");
    expect(wrapper.find(".akaza-tags-input").attributes("data-akaza-invalid")).toBe("true");

    const input = wrapper.find(".akaza-tags-input-input");
    await input.setValue("vue");
    await input.trigger("keydown", { key: "Enter" });
    expect(onAdd).toHaveBeenCalledOnce();
    expect(wrapper.props("modelValue")).toEqual([]);
  });

  it("forwards maxLength and can autofocus the editor", async () => {
    const wrapper = mount(TagsInput, {
      attachTo: document.body,
      props: { autoFocus: true, maxLength: 12 },
    });
    await nextTick();
    const input = wrapper.get(".akaza-tags-input-input");

    expect(input.attributes("maxlength")).toBe("12");
    expect(document.activeElement).toBe(input.element);
    wrapper.unmount();
  });

  it("supports regex delimiters, Tab addition, and clearing", async () => {
    const wrapper = mount(defineComponent({
      components: { TagsInput },
      setup() {
        const value = ref<string[]>([]);
        return { value };
      },
      template: `<TagsInput v-model="value" :delimiter="/[;,]/" add-on-tab clearable />`,
    }));
    const input = wrapper.get(".akaza-tags-input-input");

    await input.setValue("vue");
    await input.trigger("keydown", { key: "Tab" });
    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["vue"]);

    await wrapper.get(".akaza-tags-input-clear").trigger("click");
    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual([]);
  });
});
