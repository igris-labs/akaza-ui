import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { Checkbox } from "@/components/checkbox";
import { CheckboxGroup } from "@/components/checkbox-group";
import { RadioGroup } from "@/components/radio-group";
import { Switch } from "@/components/switch";
import { Toggle } from "@/components/toggle";
import { ToggleGroup } from "@/components/toggle-group";

describe("selection controls", () => {
  it("submits Checkbox custom values and supports its label", async () => {
    const wrapper = mount(defineComponent({
      components: { Checkbox },
      setup() {
        const value = ref<string | boolean>(false);
        return { value };
      },
      template: `
        <form>
          <Checkbox v-model="value" name="role" true-value="admin" :false-value="false" label="Administrator" />
        </form>
      `,
    }));

    await wrapper.get(".akaza-checkbox-label").trigger("click");
    expect((wrapper.vm as unknown as { value: string | boolean }).value).toBe("admin");
    expect(wrapper.get("[role='checkbox']").attributes("aria-checked")).toBe("true");
    expect(new FormData(wrapper.get("form").element as HTMLFormElement).get("role")).toBe("admin");
  });

  it("renders an indeterminate Checkbox and honors canceled changes", async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(Checkbox, {
      props: { modelValue: "indeterminate", onValueChange },
    });

    expect(wrapper.get("[role='checkbox']").attributes("aria-checked")).toBe("mixed");
    await wrapper.get("[role='checkbox']").trigger("click");
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(wrapper.get("[role='checkbox']").attributes("aria-checked")).toBe("mixed");
  });

  it("keeps CheckboxGroup parent state synchronized and skips disabled options", async () => {
    const wrapper = mount(defineComponent({
      components: { CheckboxGroup },
      setup() {
        const value = ref<string[]>(["read"]);
        const options = [
          { value: "read", label: "Read" },
          { value: "write", label: "Write" },
          { value: "admin", label: "Admin", disabled: true },
        ];
        return { options, value };
      },
      template: `<CheckboxGroup v-model="value" :options="options" parent name="permission" />`,
    }));

    expect(wrapper.get(".akaza-checkbox-group-parent").attributes("data-akaza-state")).toBe("indeterminate");
    await wrapper.findAll("[role='checkbox']")[0]!.trigger("click");
    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["read", "write"]);
    expect(wrapper.get(".akaza-checkbox-group-parent").attributes("data-akaza-state")).toBe("checked");
  });

  it("uses RadioGroup roving focus and selects while navigating", async () => {
    const wrapper = mount(defineComponent({
      components: { RadioGroup },
      setup() {
        const value = ref("one");
        const options = [
          { value: "one", label: "One" },
          { value: "disabled", label: "Disabled", disabled: true },
          { value: "two", label: "Two" },
        ];
        return { options, value };
      },
      template: `<form><RadioGroup v-model="value" :options="options" name="choice" /></form>`,
    }), { attachTo: document.body });
    const radios = wrapper.findAll("[role='radio']");

    radios[0]!.element.focus();
    await radios[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(radios[2]!.element);
    expect((wrapper.vm as unknown as { value: string }).value).toBe("two");
    expect(new FormData(wrapper.get("form").element as HTMLFormElement).get("choice")).toBe("two");
    wrapper.unmount();
  });

  it("toggles Switch from keyboard and submits its custom value", async () => {
    const wrapper = mount(defineComponent({
      components: { Switch },
      setup() {
        const value = ref<string | boolean>(false);
        return { value };
      },
      template: `<form><Switch v-model="value" name="alerts" true-value="enabled" :false-value="false" aria-label="Alerts" /></form>`,
    }));
    const control = wrapper.get("[role='switch']");

    await control.trigger("keydown", { key: "Enter" });
    expect((wrapper.vm as unknown as { value: string | boolean }).value).toBe("enabled");
    expect(control.attributes("aria-checked")).toBe("true");
    expect(new FormData(wrapper.get("form").element as HTMLFormElement).get("alerts")).toBe("enabled");
  });

  it("makes non-button Toggle roots keyboard accessible", async () => {
    const wrapper = mount(defineComponent({
      components: { Toggle },
      setup() {
        const pressed = ref(false);
        return { pressed };
      },
      template: `<Toggle v-model="pressed" as="div">Bold</Toggle>`,
    }));
    const toggle = wrapper.get("[role='button']");

    expect(toggle.attributes("tabindex")).toBe("0");
    await toggle.trigger("keydown", { key: " " });
    expect((wrapper.vm as unknown as { pressed: boolean }).pressed).toBe(true);
    expect(toggle.attributes("aria-pressed")).toBe("true");
  });

  it("supports ToggleGroup multiple values, form data, and disabled-item navigation", async () => {
    const wrapper = mount(defineComponent({
      components: { ToggleGroup },
      setup() {
        const value = ref<string[]>(["bold"]);
        const options = [
          { value: "bold", label: "Bold" },
          { value: "italic", label: "Italic", disabled: true },
          { value: "underline", label: "Underline" },
        ];
        return { options, value };
      },
      template: `<form><ToggleGroup v-model="value" type="multiple" :options="options" name="format" /></form>`,
    }), { attachTo: document.body });
    const toggles = wrapper.findAll("button");

    toggles[0]!.element.focus();
    await toggles[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(toggles[2]!.element);
    await toggles[2]!.trigger("click");
    expect((wrapper.vm as unknown as { value: string[] }).value).toEqual(["bold", "underline"]);
    expect(new FormData(wrapper.get("form").element as HTMLFormElement).getAll("format")).toEqual(["bold", "underline"]);
    wrapper.unmount();
  });
});
