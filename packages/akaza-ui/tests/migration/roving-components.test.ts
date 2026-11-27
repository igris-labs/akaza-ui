import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { Field } from "@/components/field";
import { RadioGroup } from "@/components/radio-group";
import { Stepper } from "@/components/stepper";
import { Tabs } from "@/components/tabs";
import { ToggleGroup } from "@/components/toggle-group";
import { Toolbar } from "@/components/toolbar";

const options = [
  { value: "a", label: "Alpha" },
  { value: "skip", label: "Disabled", disabled: true },
  { value: "b", label: "Beta" },
];
const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
});
function track<T extends { unmount: () => void }>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}

describe("sdk roving component compatibility", () => {
  it("keeps automatic Tabs cancelable and manual Tabs focus-only", async () => {
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(Tabs, {
      props: { items: options, modelValue: "a", onValueChange: cancel },
      attachTo: document.body,
    }));
    const tabs = wrapper.findAll('[role="tab"]');
    tabs[0]!.element.focus();
    await tabs[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[2]!.element);
    expect(cancel).toHaveBeenCalledOnce();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(tabs[0]!.attributes("aria-selected")).toBe("true");
    expect(tabs[0]!.attributes("tabindex")).toBe("0");
    await wrapper.setProps({ activationMode: "manual" });
    await tabs[2]!.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(tabs[0]!.element);
    expect(cancel).toHaveBeenCalledOnce();
    await tabs[0]!.trigger("keydown", { key: "End" });
    await tabs[2]!.trigger("keydown", { key: " " });
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it("uses inherited RTL for Tabs without processing keys from another control", async () => {
    const wrapper = track(mount(defineComponent({
      render: () => h("div", { dir: "rtl" }, [h(Tabs, { items: options, modelValue: "a" }), h("input")]),
    }), { attachTo: document.body }));
    const tabs = wrapper.findAll('[role="tab"]');
    tabs[0]!.element.focus();
    await tabs[0]!.trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tabs[2]!.element);
    const input = wrapper.get("input");
    input.element.focus();
    await input.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(input.element);
  });

  it("preserves RadioGroup form values and canceled selection while focus moves", async () => {
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(defineComponent({
      render: () => h("form", { dir: "rtl" }, h(RadioGroup, {
        options, modelValue: "a", name: "choice", orientation: "horizontal", loop: false, onValueChange: cancel,
      })),
    }), { attachTo: document.body }));
    const radios = wrapper.findAll('[role="radio"]');
    // jsdom does not inherit computed direction from the form.
    radios.forEach(radio => { radio.element.style.direction = "rtl"; });
    radios[0]!.element.focus();
    await radios[0]!.trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(radios[2]!.element);
    expect(radios[0]!.attributes("aria-checked")).toBe("true");
    expect(new FormData(wrapper.get("form").element).get("choice")).toBe("a");
    expect(cancel).toHaveBeenCalledOnce();
    await radios[2]!.trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(radios[2]!.element);
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("keeps empty, missing, and disabled RadioGroup values out of the tab sequence", async () => {
    const wrapper = track(mount(RadioGroup, { props: { options, modelValue: "skip" } }));
    const stops = () => wrapper.findAll('[role="radio"][tabindex="0"]');
    expect(stops()).toHaveLength(1);
    expect(stops()[0]!.text()).toBe("Alpha");
    await wrapper.setProps({ disabled: true });
    expect(stops()).toHaveLength(0);
    await wrapper.setProps({ disabled: false, options: [] });
    expect(stops()).toHaveLength(0);
  });

  it("keeps ToggleGroup selection separate and supports rovingFocus=false", async () => {
    const wrapper = track(mount(ToggleGroup, {
      props: { options, type: "multiple", modelValue: ["a"] },
      attachTo: document.body,
    }));
    const buttons = wrapper.findAll("button");
    buttons[0]!.element.focus();
    await buttons[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[2]!.element);
    expect(wrapper.emitted("value-change")).toBeUndefined();
    await buttons[2]!.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toEqual(["a", "b"]);
    await wrapper.setProps({ rovingFocus: false });
    expect(buttons.map(button => button.attributes("tabindex"))).toEqual(["0", "-1", "0"]);
    await buttons[2]!.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(buttons[2]!.element);
  });

  it("keeps ToggleGroup remembered focus keyed when options reorder or disappear", async () => {
    const wrapper = track(mount(ToggleGroup, { props: { options, modelValue: "a" }, attachTo: document.body }));
    const beta = wrapper.findAll("button")[2]!;
    beta.element.focus();
    await nextTick();
    await wrapper.setProps({ options: [options[2]!, options[0]!] });
    expect(wrapper.findAll("button")[0]!.attributes("tabindex")).toBe("0");
    expect(document.activeElement).toBe(beta.element);
    await wrapper.setProps({ options: [options[0]!] });
    await nextTick();
    await vi.waitFor(() => expect(wrapper.findAll("button")[0]!.attributes("tabindex")).toBe("0"), { timeout: 100 });
  });

  it("keeps Field labels on the selected ToggleGroup control without roving focus", () => {
    const wrapper = track(mount(defineComponent({
      render: () => h(Field, { label: "Formatting" }, () => h(ToggleGroup, { options, modelValue: "b", rovingFocus: false })),
    })));
    const target = wrapper.get("label").attributes("for");
    expect(wrapper.get(`[id="${target}"]`).text()).toBe("Beta");
    expect(wrapper.findAll('button[tabindex="0"]')).toHaveLength(2);
  });

  it.each([{ component: Tabs, name: "Tabs" }, { component: RadioGroup, name: "RadioGroup" }, { component: ToggleGroup, name: "ToggleGroup" }])("ignores IME confirmation on $name", async ({ component }) => {
    const props = component === Tabs ? { items: options } : { options };
    const wrapper = track(mount(component, { props: { ...props, modelValue: "a" }, attachTo: document.body }));
    const first = wrapper.findAll("button")[0]!;
    first.element.focus();
    for (const key of [" ", "Enter", "ArrowRight"]) {
      await first.trigger("keydown", { key, isComposing: true });
      await first.trigger("keydown", { key, keyCode: 229 });
    }
    expect(wrapper.emitted("value-change")).toBeUndefined();
    expect(document.activeElement).toBe(first.element);
  });

  it("hydrates selected tab stops without SDK markup, duplicate IDs, or mismatches", async () => {
    const view = defineComponent({
      setup() {
        const value = ref("b");
        return () => h("div", [
          h(Tabs, { items: options, modelValue: value.value, ariaLabel: "Tabs" }),
          h(RadioGroup, { options, modelValue: value.value, ariaLabel: "Radios" }),
          h(ToggleGroup, { options, modelValue: value.value, ariaLabel: "Toggles" }),
          h(Toolbar, { items: options, ariaLabel: "Commands" }),
          h(Stepper, { items: options.map(option => ({ value: option.value, title: option.label })), modelValue: value.value }),
        ]);
      },
    });
    const html = await renderToString(createSSRApp(view));
    const root = document.createElement("div");
    root.innerHTML = html;
    document.body.append(root);
    expect(root.querySelectorAll('button[tabindex="0"]')).toHaveLength(5);
    const stopLabels = [...root.querySelectorAll('button[tabindex="0"]')].map(button => button.textContent?.trim());
    expect(stopLabels.slice(0, 4)).toEqual(["Beta", "Beta", "Beta", "Alpha"]);
    expect(stopLabels[4]).toContain("Beta");
    const ids = [...root.querySelectorAll("[id]")].map(element => element.id);
    const warn = vi.fn();
    const app = createSSRApp(view);
    app.config.warnHandler = warn;
    app.mount(root);
    mounted.push(app);
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
    expect([...root.querySelectorAll("[id]")].map(element => element.id)).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
    expect(root.querySelector("[data-slot]")).toBeNull();
    expect(root.querySelectorAll('button[tabindex="0"]')).toHaveLength(5);
  });
});
