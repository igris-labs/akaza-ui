import { checkPattern } from "@ui-sdk/core/testing";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h, nextTick, ref } from "vue";
import { Accordion } from "@/components/accordion";
import { Menu } from "@/components/menu";
import "./panel-motion";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
});
function track<T extends { unmount: () => void }>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}
const items = [{ value: "a", label: "Alpha", content: "First" }, { value: "skip", label: "Disabled", disabled: true }, { value: "b", label: "Beta", content: "Last" }];

describe("sdk Accordion trigger navigation", () => {
  it("passes the accordion pattern while retaining native trigger Tab stops", async () => {
    const wrapper = track(mount(Accordion, { props: { items, collapsible: true }, attachTo: document.body }));
    await nextTick();
    await checkPattern(wrapper.element, "accordion");
    expect(wrapper.findAll('[role="heading"][aria-level="3"]')).toHaveLength(3);
    await wrapper.setProps({ headingLevel: 2, ui: { header: "custom-heading" } });
    expect(wrapper.findAll('[role="heading"][aria-level="2"]')).toHaveLength(3);
    expect(wrapper.findAll(".akaza-accordion-header.custom-heading")).toHaveLength(3);
    const triggers = wrapper.findAll<HTMLButtonElement>(".akaza-accordion-trigger");
    expect(triggers.map(trigger => trigger.element.tabIndex)).toEqual([0, 0, 0]);
    expect(triggers[1]!.element.disabled).toBe(true);
    triggers[2]!.element.focus();
    await triggers[2]!.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(triggers[0]!.element);
    await triggers[0]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(triggers[2]!.element);
  });

  it("wraps enabled triggers in RTL horizontal layouts without opening a panel", async () => {
    const wrapper = track(mount(Accordion, { props: { items, orientation: "horizontal" }, attrs: { dir: "rtl" }, attachTo: document.body }));
    const triggers = wrapper.findAll<HTMLButtonElement>(".akaza-accordion-trigger");
    triggers.forEach(trigger => { trigger.element.style.direction = "rtl"; });
    triggers[0]!.element.focus();
    await triggers[0]!.trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(triggers[2]!.element);
    await triggers[2]!.trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(triggers[0]!.element);
    await triggers[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(triggers[2]!.element);
    expect(wrapper.emitted("value-change")).toBeUndefined();
  });

  it("keeps keyed focus during reorder and does not steal focus after removal", async () => {
    const wrapper = track(mount(Accordion, { props: { items }, attachTo: document.body }));
    const beta = wrapper.findAll<HTMLButtonElement>("button")[2]!;
    beta.element.focus();
    await wrapper.setProps({ items: [items[2]!, items[0]!] });
    expect(document.activeElement).toBe(beta.element);
    const outside = document.createElement("input");
    document.body.append(outside);
    outside.focus();
    await wrapper.setProps({ items: [items[0]!] });
    expect(document.activeElement).toBe(outside);
    await wrapper.setProps({ disabled: true });
    expect(wrapper.get<HTMLButtonElement>("button").element.disabled).toBe(true);
  });

  it("isolates nested triggers and leaves panel input keys alone", async () => {
    const wrapper = track(mount(defineComponent({
      render: () => h(Accordion, { items: [{ value: "outer", label: "Outer" }], modelValue: "outer" }, {
        content: () => [h("input"), h(Accordion, { items })],
      }),
    }), { attachTo: document.body }));
    const buttons = wrapper.findAll<HTMLButtonElement>("button");
    buttons[1]!.element.focus();
    await buttons[1]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(buttons[3]!.element);
    const input = wrapper.get<HTMLInputElement>("input");
    input.element.focus();
    await input.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(input.element);
  });

  it("ignores composition, prevented events, modifier chords, and canceled activation", async () => {
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(Accordion, { props: { items, onValueChange: cancel }, attachTo: document.body }));
    const trigger = wrapper.get<HTMLButtonElement>("button");
    trigger.element.focus();
    for (const key of ["Home", "End", "ArrowDown", "ArrowUp"]) {
      for (const guard of [{ isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
        await trigger.trigger("keydown", { key, ...guard });
      }
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      event.preventDefault();
      trigger.element.dispatchEvent(event);
    }
    expect(document.activeElement).toBe(trigger.element);
    await trigger.trigger("click");
    expect(cancel).toHaveBeenCalledOnce();
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });
});

describe("sdk recursive MenuPanel focus", () => {
  it("passes the menu pattern with grouped commands and explicit Home/End", async () => {
    const wrapper = track(mount(Menu, {
      props: { modelValue: true, closeOnSelect: false, items: [items] }, attachTo: document.body,
      slots: { trigger: '<template #default="{ toggle, triggerProps }"><button type="button" v-bind="triggerProps" @click="toggle">Commands</button></template>' },
    }));
    await flushPromises();
    await checkPattern(wrapper.get('[role="menu"]').element, "menu");
    await flushPromises();
    if (!wrapper.find('[role="menu"]').exists()) {
      await wrapper.get("button").trigger("click");
      await flushPromises();
    }
    const panel = wrapper.get('[role="menu"]');
    const commands = panel.findAll<HTMLElement>('[role="menuitem"]:not([aria-disabled])');
    commands[1]!.element.focus();
    await commands[1]!.trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(commands[0]!.element);
    await commands[0]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(commands[1]!.element);
    expect(panel.findAll('[tabindex="0"]')).toHaveLength(1);
    expect(commands[1]!.attributes()).toHaveProperty("data-akaza-highlighted");
    expect(commands[0]!.attributes("data-akaza-highlighted")).toBeUndefined();
  });

  it("separates repeated labels and keeps immutable checkbox rerenders focused", async () => {
    const checked = ref(false);
    const wrapper = track(mount(defineComponent({
      setup() {
        const data = computed(() => [[{ label: "Same" }], [
          { label: "Same" },
          { type: "checkbox" as const, label: "Wrap", checked: checked.value, onUpdateChecked: (value: boolean) => { checked.value = value; } },
        ]]);
        return () => h(Menu, { modelValue: true, closeOnSelect: false, items: data.value });
      },
    }), { attachTo: document.body }));
    await flushPromises();
    const first = wrapper.findAll<HTMLElement>('[role="menuitem"]');
    first[0]!.element.focus();
    await first[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(first[1]!.element);
    await first[1]!.trigger("keydown", { key: "ArrowDown" });
    const checkbox = wrapper.get<HTMLElement>('[role="menuitemcheckbox"]');
    expect(document.activeElement).toBe(checkbox.element);
    await checkbox.trigger("keydown", { key: " " });
    expect(checked.value).toBe(true);
    expect(wrapper.get('[role="menuitemcheckbox"]').element).toBe(checkbox.element);
    expect(document.activeElement).toBe(checkbox.element);
    expect(checkbox.attributes("tabindex")).toBe("0");
  });

  it("lets each nested panel own highlight and restores its trigger on close", async () => {
    const wrapper = track(mount(Menu, { props: { modelValue: true, items: [
      { value: "branch", label: "Branch", children: [{ value: "one", label: "One" }, { value: "two", label: "Two" }] },
      { value: "last", label: "Last" },
    ] }, attachTo: document.body }));
    await flushPromises();
    const branch = wrapper.get<HTMLElement>('[aria-haspopup="menu"]');
    branch.element.focus();
    await branch.trigger("keydown", { key: "ArrowRight" });
    await flushPromises();
    const child = wrapper.get(".akaza-menu-submenu-content");
    const commands = child.findAll<HTMLElement>('[role="menuitem"]');
    expect(document.activeElement).toBe(commands[0]!.element);
    await commands[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(commands[1]!.element);
    expect(branch.attributes("tabindex")).toBe("0");
    expect(child.findAll('[tabindex="0"]')).toHaveLength(1);
    expect(commands[1]!.attributes()).toHaveProperty("data-akaza-highlighted");
    await commands[1]!.trigger("keydown", { key: "ArrowLeft" });
    await flushPromises();
    expect(document.activeElement).toBe(branch.element);
    expect(wrapper.find(".akaza-menu-submenu-content").exists()).toBe(false);
    expect(branch.attributes()).toHaveProperty("data-akaza-highlighted");
  });

  it("retains keyed focus on reorder and repairs disabled tab stops", async () => {
    const wrapper = track(mount(Menu, { props: { modelValue: true, items }, attachTo: document.body }));
    await flushPromises();
    const beta = wrapper.findAll<HTMLElement>('[role="menuitem"]')[2]!;
    beta.element.focus();
    await wrapper.setProps({ items: [items[2]!, items[0]!] });
    expect(document.activeElement).toBe(beta.element);
    await wrapper.setProps({ items: [{ ...items[2]!, disabled: true }, items[0]!] });
    expect(wrapper.findAll('[role="menuitem"][tabindex="0"]')).toHaveLength(1);
    expect(wrapper.get('[role="menuitem"][tabindex="0"]').text()).toBe("Alpha");
  });

  it("ignores composition and modifier navigation/activation and canceled commands", async () => {
    const cancel = vi.fn((_item, details) => details.cancel());
    const wrapper = track(mount(Menu, { props: { modelValue: true, items, onSelect: cancel }, attachTo: document.body }));
    await flushPromises();
    const first = wrapper.get<HTMLElement>('[role="menuitem"]');
    first.element.focus();
    for (const key of ["ArrowDown", "ArrowRight", "Home", "End", "Enter", " "]) {
      for (const guard of [{ isComposing: true }, { keyCode: 229 }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
        await first.trigger("keydown", { key, ...guard });
      }
    }
    expect(document.activeElement).toBe(first.element);
    expect(cancel).not.toHaveBeenCalled();
    await first.trigger("keydown", { key: "Enter" });
    expect(cancel).toHaveBeenCalledOnce();
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
  });
});
