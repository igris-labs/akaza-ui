import type { Pattern } from "@ui-sdk/core/testing";
import type { Component } from "vue";
import { checkPattern } from "@ui-sdk/core/testing";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { Listbox } from "@/components/listbox";
import { Menubar } from "@/components/menubar";
import { RadioGroup } from "@/components/radio-group";
import { Tabs } from "@/components/tabs";
import { Toolbar } from "@/components/toolbar";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
});

describe("sdk pattern checks on Akaza markup", () => {
  const cases: Array<{ name: string; component: Component; pattern: Pattern; props: Record<string, unknown> }> = [
    { name: "listbox", component: Listbox, pattern: "listbox", props: { ariaLabel: "Frameworks", options: [
      { value: "a", label: "Angular" }, { value: "b", label: "Backbone" }, { value: "c", label: "CanJS" },
    ] } },
    { name: "menubar", component: Menubar, pattern: "menubar", props: { ariaLabel: "Application", teleport: false, items: [
      { value: "a", label: "Add" }, { value: "b", label: "Build" }, { value: "c", label: "Copy" },
    ] } },
    { name: "tabs", component: Tabs, pattern: "tabs", props: { ariaLabel: "Settings", items: [
      { value: "a", label: "Account" }, { value: "b", label: "Billing" }, { value: "c", label: "Contact" },
    ] } },
    { name: "radio group", component: RadioGroup, pattern: "radio-group", props: { ariaLabel: "Size", options: [
      { value: "a", label: "Average" }, { value: "b", label: "Big" }, { value: "c", label: "Compact" },
    ] } },
    { name: "toolbar", component: Toolbar, pattern: "toolbar", props: { ariaLabel: "Commands", items: [
      { value: "a", label: "Add" }, { value: "b", label: "Bold" }, { value: "c", label: "Copy" },
    ] } },
  ];

  it.each(cases)("validates $name with the SDK's public pattern checker", async ({ component, pattern, props }) => {
    const wrapper = mount(defineComponent({
      setup() {
        const value = ref("a");
        return () => h(component, { ...props, modelValue: value.value, "onUpdate:modelValue": (next: string) => { value.value = next; } });
      },
    }), { attachTo: document.body });
    mounted.push(wrapper);
    await nextTick();
    await checkPattern(wrapper.element, pattern);
    expect(wrapper.find("[data-slot]").exists()).toBe(false);
    const buttons = wrapper.findAll<HTMLButtonElement>("button");
    if (buttons.length) {
      buttons.at(-1)!.element.focus();
      await buttons.at(-1)!.trigger("keydown", { key: "Home" });
      expect(document.activeElement).toBe(buttons[0]!.element);
      await buttons[0]!.trigger("keydown", { key: "End" });
      expect(document.activeElement).toBe(buttons.at(-1)!.element);
      expect(wrapper.findAll('button[tabindex="0"]')).toHaveLength(1);
    } else {
      const listbox = wrapper.get<HTMLElement>('[role="listbox"]');
      const options = wrapper.findAll('[role="option"]');
      listbox.element.focus();
      await listbox.trigger("keydown", { key: "End" });
      expect(listbox.attributes("aria-activedescendant")).toBe(options.at(-1)!.attributes("id"));
      await listbox.trigger("keydown", { key: "Home" });
      expect(listbox.attributes("aria-activedescendant")).toBe(options[0]!.attributes("id"));
    }
  });
});
