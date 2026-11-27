import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { Menubar } from "@/components/menubar";
import { NavigationMenu } from "@/components/navigation-menu";
import { RadioGroup } from "@/components/radio-group";

const mounted: Array<{ unmount: () => void }> = [];
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = "";
});
function track<T extends { unmount: () => void }>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}

describe("sdk navigation focus", () => {
  const items = [
    { value: "file", label: "File", children: [{ label: "Open" }, { label: "Recent", children: [{ label: "Project" }] }] },
    { value: "disabled", label: "Disabled", disabled: true },
    { value: "edit", label: "Edit", children: [{ label: "Undo" }] },
    { value: "save", label: "Save" },
  ];

  it("moves from a real open menu item across panels and returns focus on Escape", async () => {
    const wrapper = track(mount(Menubar, { props: { items, teleport: false }, attachTo: document.body }));
    const triggers = wrapper.findAll(".akaza-menubar-trigger");
    await triggers[0]!.trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    const open = wrapper.get<HTMLElement>('.akaza-menubar-content [role="menuitem"]');
    expect(document.activeElement).toBe(open.element);
    await open.trigger("keydown", { key: "ArrowRight" });
    await flushPromises();
    const undo = wrapper.get<HTMLElement>('.akaza-menubar-content [role="menuitem"]');
    expect(undo.text()).toBe("Undo");
    expect(document.activeElement).toBe(undo.element);
    await undo.trigger("keydown", { key: "Escape" });
    expect(wrapper.find(".akaza-menubar-content").exists()).toBe(false);
    expect(document.activeElement).toBe(triggers[2]!.element);
  });

  it("lets submenu keys run before top-level traversal", async () => {
    const wrapper = track(mount(Menubar, { props: { items, teleport: false }, attachTo: document.body }));
    await wrapper.findAll(".akaza-menubar-trigger")[0]!.trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    const recent = wrapper.get<HTMLElement>(".akaza-menu-submenu-trigger");
    recent.element.focus();
    await recent.trigger("keydown", { key: "ArrowRight" });
    await flushPromises();
    const project = wrapper.get<HTMLElement>(".akaza-menu-submenu-content [role='menuitem']");
    expect(document.activeElement).toBe(project.element);
    expect(wrapper.findAll(".akaza-menubar-trigger")[0]!.attributes("aria-expanded")).toBe("true");
    await project.trigger("keydown", { key: "ArrowLeft" });
    await flushPromises();
    expect(document.activeElement).toBe(recent.element);
    expect(wrapper.find(".akaza-menu-submenu-content").exists()).toBe(false);
  });

  it("restores focus after selecting a command without taking it from another task", async () => {
    const outside = document.createElement("input");
    document.body.append(outside);
    const wrapper = track(mount(Menubar, { props: { items, teleport: false }, attachTo: document.body }));
    const trigger = wrapper.get<HTMLButtonElement>(".akaza-menubar-trigger");
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    await wrapper.get(".akaza-menubar-content [role='menuitem']").trigger("keydown", { key: "Enter" });
    await flushPromises();
    expect(document.activeElement).toBe(trigger.element);
    await wrapper.setProps({ items: [{ label: "File", value: "file", children: [{ label: "Open task", onSelect: () => outside.focus() }] }] });
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    await wrapper.get(".akaza-menubar-content [role='menuitem']").trigger("keydown", { key: "Enter" });
    await flushPromises();
    expect(document.activeElement).toBe(outside);
  });

  it("does not restore focus after the menubar unmounts during command close", async () => {
    const outside = document.createElement("input");
    document.body.append(outside);
    const wrapper = mount(Menubar, { props: { items, teleport: false }, attachTo: document.body });
    await wrapper.get(".akaza-menubar-trigger").trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    const closing = wrapper.get(".akaza-menubar-content [role='menuitem']").trigger("keydown", { key: "Enter" });
    wrapper.unmount();
    outside.focus();
    await closing;
    await flushPromises();
    expect(document.activeElement).toBe(outside);
  });

  it("keeps canceled open/close state and avoids late focus after controlled close", async () => {
    const cancel = vi.fn((_value, details) => details.cancel());
    const wrapper = track(mount(Menubar, {
      props: { items, teleport: false, onOpenChange: cancel }, attachTo: document.body,
    }));
    const first = wrapper.get<HTMLButtonElement>(".akaza-menubar-trigger");
    first.element.focus();
    await first.trigger("keydown", { key: "ArrowDown" });
    expect(wrapper.find(".akaza-menubar-content").exists()).toBe(false);
    expect(document.activeElement).toBe(first.element);
    await wrapper.setProps({ modelValue: "file" });
    await flushPromises();
    const open = wrapper.get<HTMLElement>(".akaza-menubar-content [role='menuitem']");
    open.element.focus();
    await open.trigger("keydown", { key: "Escape" });
    expect(wrapper.find(".akaza-menubar-content").exists()).toBe(true);
    expect(document.activeElement).toBe(open.element);
  });

  it("remembers item identity across same-length reorders and disabled updates", async () => {
    const wrapper = track(mount(Menubar, { props: { items, teleport: false }, attachTo: document.body }));
    const save = wrapper.findAll<HTMLButtonElement>(".akaza-menubar-trigger")[3]!;
    save.element.focus();
    await wrapper.setProps({ items: [items[3]!, ...items.slice(0, 3)] });
    expect(document.activeElement).toBe(save.element);
    expect(save.attributes("tabindex")).toBe("0");
    await wrapper.setProps({ items: items.map(item => item.value === "save" ? { ...item, disabled: true } : item) });
    expect(wrapper.findAll('.akaza-menubar-trigger[tabindex="0"]')).toHaveLength(1);
    expect(wrapper.findAll('.akaza-menubar-trigger[tabindex="0"]')[0]!.text()).toBe("File");
  });

  it("unwraps RouterLink component refs and leaves routing separate from focus", async () => {
    const Link = defineComponent({
      props: { to: String },
      setup(props, { attrs, slots }) {
        return () => h("a", { ...attrs, href: props.to }, slots.default?.());
      },
    });
    const wrapper = track(mount(NavigationMenu, {
      props: { items: [{ label: "Home", value: "home", to: "/home" }, { label: "Docs", value: "docs", to: "/docs" }] },
      global: { components: { RouterLink: Link } },
      attachTo: document.body,
    }));
    const links = wrapper.findAll<HTMLAnchorElement>("a");
    links[0]!.element.focus();
    await links[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(links[1]!.element);
    expect(links[1]!.attributes("href")).toBe("/docs");
    expect(wrapper.emitted("value-change")).toBeUndefined();
    expect(wrapper.emitted("select")).toBeUndefined();
    await wrapper.setProps({ items: [{ label: "Docs", value: "docs", to: "/docs" }, { label: "Home", value: "home", to: "/home" }] });
    expect(document.activeElement).toBe(links[1]!.element);
    expect(wrapper.findAll('a[tabindex="0"]')).toHaveLength(1);
  });

  it("keeps flyout tab stops valid across mode switches and disabled labels", async () => {
    const wrapper = track(mount(NavigationMenu, {
      props: { items: [{ type: "label", label: "Workspace" }, { value: "a", label: "Alpha" }, { value: "b", label: "Beta" }], contentMode: "flyout" },
      attachTo: document.body,
    }));
    const buttons = wrapper.findAll<HTMLButtonElement>("button");
    buttons[0]!.element.focus();
    await buttons[0]!.trigger("keydown", { key: "End" });
    expect(document.activeElement).toBe(buttons[1]!.element);
    await wrapper.setProps({ disabled: true });
    expect(wrapper.findAll('button[tabindex="0"]')).toHaveLength(0);
    await wrapper.setProps({ disabled: false, contentMode: "inline", orientation: "vertical" });
    expect(wrapper.find(".akaza-navigation-menu-inline-list").exists()).toBe(true);
    await wrapper.setProps({ contentMode: "flyout" });
    await nextTick();
    expect(wrapper.findAll('button[tabindex="0"]')).toHaveLength(1);
  });

  it.each(["horizontal", "vertical"] as const)("supports both RadioGroup arrow pairs in %s orientation", async (orientation) => {
    const wrapper = track(mount(RadioGroup, { props: { options: ["a", "b", "c"], modelValue: "a", orientation }, attachTo: document.body }));
    const radios = wrapper.findAll<HTMLButtonElement>('[role="radio"]');
    radios[0]!.element.focus();
    await radios[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(radios[1]!.element);
    await radios[1]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(radios[2]!.element);
    await radios[2]!.trigger("keydown", { key: "ArrowLeft" });
    expect(document.activeElement).toBe(radios[1]!.element);
    await radios[1]!.trigger("keydown", { key: "ArrowUp" });
    expect(document.activeElement).toBe(radios[0]!.element);
  });
});
