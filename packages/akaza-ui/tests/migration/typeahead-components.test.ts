import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { ContextMenu, Listbox, Menu, Menubar, NavigationMenu, Select, Tree } from "../../src";

enableAutoUnmount(afterEach);

const items = [
  { value: "start", label: "Start" },
  { value: "edit", label: "Éditer" },
  { value: "export", label: "Export", disabled: true },
  { value: "example", label: "Example" },
];

describe("sdk typeahead component contracts", () => {
  for (const component of [Menu, ContextMenu]) {
    it(`${component.__name} cycles menu items without activating or closing`, async () => {
      const wrapper = mount(component, {
        attachTo: document.body,
        props: { modelValue: true, teleport: false, items },
      });
      await flushPromises();
      const entries = wrapper.findAll('[role="menuitem"]');
      (entries[0]!.element as HTMLElement).focus();
      await entries[0]!.trigger("keydown", { key: "e" });
      expect(document.activeElement).toBe(entries[1]!.element);
      await entries[1]!.trigger("keydown", { key: "e" });
      expect(document.activeElement).toBe(entries[3]!.element);
      expect(wrapper.emitted("select")).toBeUndefined();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.find('[role="menu"]').exists()).toBe(true);
    });
  }

  for (const component of [Menubar, NavigationMenu]) {
    it(`${component.__name} ignores typeahead when the whole control is disabled`, async () => {
      const wrapper = mount(component, { attachTo: document.body, props: { items, disabled: true } });
      const triggers = wrapper.findAll(component === Menubar ? ".akaza-menubar-trigger" : ".akaza-navigation-menu-link");
      const focused = document.activeElement;
      await triggers[0]!.trigger("keydown", { key: "e" });
      expect(document.activeElement).toBe(focused);
      expect(wrapper.emitted("open-change")).toBeUndefined();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it(`${component.__name} moves trigger focus without changing selection/open state`, async () => {
      const wrapper = mount(component, { attachTo: document.body, props: { items } });
      const triggers = wrapper.findAll(component === Menubar ? ".akaza-menubar-trigger" : ".akaza-navigation-menu-link");
      (triggers[0]!.element as HTMLElement).focus();
      await triggers[0]!.trigger("keydown", { key: "e" });
      expect(document.activeElement).toBe(triggers[1]!.element);
      await triggers[1]!.trigger("keydown", { key: "e" });
      expect(document.activeElement).toBe(triggers[3]!.element);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.emitted("open-change")).toBeUndefined();
    });
  }

  for (const component of [Select, Listbox]) {
    it(`${component.__name} changes highlight, not the model`, async () => {
      const wrapper = mount(component, {
        attachTo: document.body,
        props: { options: items, modelValue: "start", ariaLabel: "Commands" },
      });
      const control = wrapper.get(component === Select ? '[role="combobox"]' : '[role="listbox"]');
      await control.trigger("focusin");
      await control.trigger("keydown", { key: "e" });
      await flushPromises();
      expect(control.attributes("aria-activedescendant")).toContain("option-1");
      await control.trigger("keydown", { key: "e" });
      expect(control.attributes("aria-activedescendant")).toContain("option-3");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.get('[aria-selected="true"]').text()).toContain("Start");
    });
  }

  it("honors a canceled Select open without highlighting hidden options", async () => {
    const wrapper = mount(Select, {
      props: { options: items, onOpenChange: (_open, details) => details.cancel() },
    });
    await wrapper.get('[role="combobox"]').trigger("keydown", { key: "e" });
    expect(wrapper.get('[role="combobox"]').attributes("aria-expanded")).toBe("false");
    expect(wrapper.get('[role="combobox"]').attributes("aria-activedescendant")).toBeUndefined();
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it("uses Tree textValue and keeps numeric keys and selection unchanged", async () => {
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: {
        items: items.map((item, index) => ({ ...item, id: index })),
        itemKey: "id",
        textValue: item => String(item.label),
        modelValue: 0,
      },
    });
    const entries = wrapper.findAll('[role="treeitem"]');
    (entries[0]!.element as HTMLElement).focus();
    await entries[0]!.trigger("keydown", { key: "e" });
    expect(document.activeElement).toBe(entries[1]!.element);
    await entries[1]!.trigger("keydown", { key: "e" });
    expect(document.activeElement).toBe(entries[3]!.element);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(entries[0]!.attributes("aria-selected")).toBe("true");
  });

  it("lets Space continue a menu label without activating it", async () => {
    const wrapper = mount(Menu, {
      attachTo: document.body,
      props: { modelValue: true, items: [{ label: "New file" }, { label: "New folder" }] },
    });
    await flushPromises();
    const entries = wrapper.findAll('[role="menuitem"]');
    (entries[0]!.element as HTMLElement).focus();
    for (const key of ["n", "e", "w", " ", "f", "o"]) {
      (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key, cancelable: true, bubbles: true }));
      await flushPromises();
      expect(wrapper.emitted("select"), `typing ${JSON.stringify(key)} must not select`).toBeUndefined();
    }
    await flushPromises();
    expect(document.activeElement).toBe(entries[1]!.element);
    expect(wrapper.emitted("select")).toBeUndefined();
    await entries[1]!.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("select")).toHaveLength(1);
  });

  it("does not activate a menu item during IME composition", async () => {
    const wrapper = mount(Menu, { props: { modelValue: true, items } });
    await flushPromises();
    await wrapper.findAll('[role="menuitem"]')[0]!.trigger("keydown", { key: "Enter", isComposing: true });
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("returns Menu keyboard focus to its trigger without stealing focus from a command", async () => {
    const outside = document.createElement("button");
    document.body.append(outside);
    const wrapper = mount(Menu, {
      attachTo: document.body,
      props: { items },
      slots: { trigger: '<button v-bind="params.triggerProps" @click="params.toggle">Commands</button>' },
    });
    try {
      const trigger = wrapper.get("button");
      await trigger.trigger("click");
      await flushPromises();
      await wrapper.findAll('[role="menuitem"]')[0]!.trigger("keydown", { key: "Enter" });
      await flushPromises();
      expect(document.activeElement).toBe(trigger.element);
      await wrapper.setProps({ items: [{ label: "Move focus", onSelect: () => outside.focus() }] });
      await trigger.trigger("click");
      await flushPromises();
      await wrapper.get('[role="menuitem"]').trigger("keydown", { key: "Enter" });
      await flushPromises();
      expect(document.activeElement).toBe(outside);
    } finally {
      outside.remove();
    }
  });
});
