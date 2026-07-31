import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { Editable } from "@/components/editable";

describe("editable", () => {
  it("keeps focus in the replacement input and selects its value", async () => {
    const wrapper = mount(Editable, {
      attachTo: document.body,
      props: {
        modelValue: "Select this value",
        selectOnFocus: true,
      },
    });

    const preview = wrapper.get(".akaza-editable-preview").element as HTMLButtonElement;
    preview.focus();
    await nextTick();
    await nextTick();

    const input = wrapper.get(".akaza-editable-input").element as HTMLInputElement;
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
    expect(wrapper.get(".akaza-editable").attributes("data-akaza-state")).toBe("editing");

    wrapper.unmount();
  });

  it("selects the value when pointer focus activates editing", async () => {
    const wrapper = mount(Editable, {
      attachTo: document.body,
      props: {
        modelValue: "Pointer selection",
        selectOnFocus: true,
      },
    });

    await wrapper.get(".akaza-editable-preview").trigger("pointerdown");
    await nextTick();

    const input = wrapper.get(".akaza-editable-input").element as HTMLInputElement;
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);

    wrapper.unmount();
  });

  it("enters edit mode on focus and submits with Enter", async () => {
    const wrapper = mount(defineComponent({
      components: { Editable },
      setup() {
        const value = ref("Draft");
        return { value };
      },
      template: `<Editable v-model="value" submit-mode="enter" />`,
    }));

    await wrapper.get(".akaza-editable-preview").trigger("focus");
    expect(wrapper.get(".akaza-editable").attributes("data-akaza-state")).toBe("editing");

    const input = wrapper.get(".akaza-editable-input");
    await input.setValue("Published");
    await input.trigger("keydown", { key: "Enter" });

    expect((wrapper.vm as unknown as { value: string }).value).toBe("Published");
    expect(wrapper.get(".akaza-editable").attributes("data-akaza-state")).toBe("preview");
  });

  it("cancels a draft without mutating the committed value", async () => {
    const wrapper = mount(defineComponent({
      components: { Editable },
      setup() {
        const value = ref("Original");
        return { value };
      },
      template: `<Editable v-model="value" activation-mode="click" submit-mode="none" />`,
    }));

    await wrapper.get(".akaza-editable-preview").trigger("click");
    await wrapper.get(".akaza-editable-input").setValue("Changed");
    await wrapper.get(".akaza-editable-cancel").trigger("click");

    expect((wrapper.vm as unknown as { value: string }).value).toBe("Original");
    expect(wrapper.get(".akaza-editable-preview").text()).toBe("Original");
  });

  it("submits on blur and participates in native required validation", async () => {
    const wrapper = mount(defineComponent({
      components: { Editable },
      setup() {
        const value = ref("");
        return { value };
      },
      template: `<form><Editable v-model="value" name="title" required start-with-edit-mode /></form>`,
    }));
    const hidden = wrapper.get(".akaza-editable-hidden-input");

    await hidden.trigger("invalid");
    expect(wrapper.get(".akaza-editable").attributes("data-akaza-invalid")).toBe("true");

    await wrapper.get(".akaza-editable-input").setValue("Ready");
    await wrapper.get(".akaza-editable").trigger("focusout", { relatedTarget: null });
    expect((wrapper.vm as unknown as { value: string }).value).toBe("Ready");

    const data = new FormData(wrapper.get("form").element as HTMLFormElement);
    expect(data.get("title")).toBe("Ready");
  });

  it("allows value submission to be canceled", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(Editable, {
      props: {
        modelValue: "Original",
        startWithEditMode: true,
        submitMode: "enter",
        onValueChange,
      },
    });

    await wrapper.get(".akaza-editable-input").setValue("Blocked");
    await wrapper.get(".akaza-editable-input").trigger("keydown", { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.props("modelValue")).toBe("Original");
    expect(wrapper.get(".akaza-editable").attributes("data-akaza-state")).toBe("editing");
  });
});
