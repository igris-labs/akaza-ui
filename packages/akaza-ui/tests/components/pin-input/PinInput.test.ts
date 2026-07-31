import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { PinInput } from "@/components/pin-input";

describe("pin input", () => {
  it("distributes OTP paste and emits complete", async () => {
    const wrapper = mount(defineComponent({
      components: { PinInput },
      setup() {
        const value = ref("");
        return { value };
      },
      template: `<PinInput v-model="value" :length="4" otp type="number" />`,
    }));
    const inputs = wrapper.findAll(".akaza-pin-input-input");
    const component = wrapper.getComponent(PinInput);

    await inputs[0]!.trigger("paste", {
      clipboardData: { getData: () => "12 34" },
    });

    expect((wrapper.vm as unknown as { value: string }).value).toBe("1234");
    expect(component.emitted("complete")?.[0]?.[0]).toBe("1234");
    expect(wrapper.find(".akaza-pin-input").attributes("data-akaza-state")).toBe("complete");
  });

  it("rejects invalid numeric characters and supports Backspace", async () => {
    const wrapper = mount(defineComponent({
      components: { PinInput },
      setup() {
        const value = ref("12");
        return { value };
      },
      template: `<PinInput v-model="value" :length="4" type="number" />`,
    }));
    const inputs = wrapper.findAll(".akaza-pin-input-input");

    await inputs[1]!.setValue("x");
    expect((wrapper.vm as unknown as { value: string }).value).toBe("12");

    await inputs[1]!.trigger("keydown", { key: "Backspace" });
    expect((wrapper.vm as unknown as { value: string }).value).toBe("1");
  });

  it("participates in required form validation and submission", async () => {
    const wrapper = mount(defineComponent({
      components: { PinInput },
      setup() {
        const value = ref("");
        return { value };
      },
      template: `<form><PinInput v-model="value" name="code" required :length="4" /></form>`,
    }));

    await wrapper.find(".akaza-pin-input-hidden-input").trigger("invalid");
    expect(wrapper.find(".akaza-pin-input").attributes("data-akaza-invalid")).toBe("true");

    await wrapper.findAll(".akaza-pin-input-input")[0]!.trigger("paste", {
      clipboardData: { getData: () => "AKZA" },
    });
    const data = new FormData(wrapper.find("form").element as HTMLFormElement);
    expect(data.get("code")).toBe("AKZA");
  });

  it("allows value changes to be canceled", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(PinInput, {
      props: { modelValue: "", length: 4, onValueChange },
    });

    await wrapper.find(".akaza-pin-input-input").setValue("1");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.props("modelValue")).toBe("");
  });

  it("can autofocus the first cell", async () => {
    const wrapper = mount(PinInput, {
      attachTo: document.body,
      props: { autoFocus: true, length: 4 },
    });
    await nextTick();

    expect(document.activeElement).toBe(wrapper.findAll(".akaza-pin-input-input")[0]!.element);
    wrapper.unmount();
  });

  it("supports masking, custom character validation, and RTL arrows", async () => {
    const wrapper = mount(PinInput, {
      attachTo: document.body,
      props: {
        modelValue: "A",
        length: 3,
        mask: true,
        dir: "rtl",
        allowedChars: /^[A-Z]$/,
      },
    });
    const inputs = wrapper.findAll(".akaza-pin-input-input");

    expect(inputs[0]!.attributes("type")).toBe("password");
    await inputs[0]!.trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(inputs[1]!.element);

    await inputs[1]!.setValue("1");
    expect(wrapper.props("modelValue")).toBe("A");
    wrapper.unmount();
  });
});
