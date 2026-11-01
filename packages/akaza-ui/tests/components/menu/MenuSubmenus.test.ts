import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContextMenu } from "@/components/context-menu";
import { Menu } from "@/components/menu";
import { Menubar } from "@/components/menubar";
import { Popover } from "@/components/popover";

enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const children = [{ value: "share", label: "Share", children: [{ label: "Email" }, { label: "Link" }] }];

describe("menu submenu collisions", () => {
  it("preserves slotted trigger DOM through opening and keyboard dismissal", async () => {
    const wrapper = mount(Menu, {
      props: { modelValue: true, items: children }, attachTo: document.body,
      slots: { item: '<span class="stable-item">Share</span>' },
    });
    await flushPromises();
    const row = wrapper.get(".akaza-menu-submenu");
    const label = row.get(".stable-item").element;
    await row.trigger("mouseenter");
    expect(row.get(".stable-item").element).toBe(label);
    await wrapper.get(".akaza-menu-submenu-content").trigger("keydown", { key: "ArrowLeft" });
    expect(wrapper.find(".akaza-menu-submenu-content").exists()).toBe(false);
    expect(row.get(".stable-item").element).toBe(label);
    await wrapper.get(".akaza-menu-submenu-trigger").trigger("click");
    expect(wrapper.find(".akaza-menu-submenu-content").exists()).toBe(true);
  });

  for (const component of ["Menu", "ContextMenu", "Menubar"] as const) {
    it.each(["ltr", "rtl"] as const)(`${component} keeps keyboard focus through pending hover dismissal in %s`, async (dir) => {
      vi.useFakeTimers();
      const wrapper = component === "Menu"
        ? mount(Menu, { attachTo: document.body, props: { modelValue: true, items: children, dir } })
        : component === "ContextMenu"
          ? mount(ContextMenu, { attachTo: document.body, props: { modelValue: true, items: children, teleport: false, dir } })
          : mount(Menubar, { attachTo: document.body, props: { modelValue: "file", items: [{ value: "file", label: "File", children }], dir, teleport: false } });
      await wrapper.vm.$nextTick();
      const row = wrapper.get(".akaza-menu-submenu");
      const trigger = wrapper.get(".akaza-menu-submenu-trigger");
      await row.trigger("mouseenter");
      await row.trigger("mouseleave");
      (trigger.element as HTMLElement).focus();
      await trigger.trigger("keydown", { key: dir === "ltr" ? "ArrowRight" : "ArrowLeft" });
      await vi.advanceTimersByTimeAsync(200);
      const submenu = wrapper.get(".akaza-menu-submenu-content");
      const first = submenu.get('[role="menuitem"]');
      expect(document.activeElement).toBe(first.element);
      expect(trigger.attributes("aria-expanded")).toBe("true");

      await row.trigger("mouseleave");
      await vi.advanceTimersByTimeAsync(200);
      expect(document.activeElement).toBe(first.element);
      expect(trigger.attributes("aria-expanded")).toBe("true");

      (trigger.element as HTMLElement).focus();
      await row.trigger("mouseleave");
      await vi.advanceTimersByTimeAsync(200);
      expect(wrapper.find(".akaza-menu-submenu-content").exists()).toBe(false);
      expect(document.activeElement).toBe(trigger.element);
    });

    it.each(["ltr", "rtl"] as const)(`${component} flips in %s without reversing logical keyboard navigation`, async (dir) => {
      let x = dir === "ltr" ? window.innerWidth - 40 : 8;
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("akaza-menu-submenu-trigger")) return DOMRect.fromRect({ x, y: 30, width: 32, height: 24 });
        if (this.classList.contains("akaza-menu-submenu-content")) return DOMRect.fromRect({ width: 180, height: 80 });
        return DOMRect.fromRect({ width: 0, height: 0 });
      });
      const wrapper = component === "Menu"
        ? mount(Menu, { attachTo: document.body, props: { modelValue: true, items: children, dir } })
        : component === "ContextMenu"
          ? mount(ContextMenu, { attachTo: document.body, props: { modelValue: true, items: children, teleport: false, dir } })
          : mount(Menubar, { attachTo: document.body, props: { modelValue: "file", items: [{ value: "file", label: "File", children }], dir, teleport: false } });
      await flushPromises();
      const trigger = wrapper.get(".akaza-menu-submenu-trigger");
      (trigger.element as HTMLElement).focus();
      await trigger.trigger("keydown", { key: dir === "ltr" ? "ArrowRight" : "ArrowLeft" });
      await flushPromises();
      const submenu = wrapper.get(".akaza-menu-submenu-content");
      expect(submenu.attributes("data-akaza-side")).toBe(dir === "ltr" ? "left" : "right");
      expect(trigger.attributes("aria-expanded")).toBe("true");
      expect(document.activeElement?.textContent).toBe("Email");
      if (component === "Menubar") expect(wrapper.get(".akaza-menubar-trigger").attributes("aria-expanded")).toBe("true");

      x = window.innerWidth / 2;
      window.dispatchEvent(new Event("resize"));
      await flushPromises();
      expect(submenu.attributes("data-akaza-side")).toBe(dir === "ltr" ? "right" : "left");
      await submenu.trigger("keydown", { key: dir === "ltr" ? "ArrowLeft" : "ArrowRight" });
      expect(wrapper.find(".akaza-menu-submenu-content").exists()).toBe(false);
      expect(document.activeElement).toBe(trigger.element);
      expect(trigger.attributes("aria-expanded")).toBe("false");
    });
  }
});

describe("shared menu layer order", () => {
  it("registers context menus and menubars after an existing popover", async () => {
    const popover = mount(Popover, { props: { modelValue: true, teleport: false }, slots: { default: "Popover" } });
    await flushPromises();
    const context = mount(ContextMenu, { props: { modelValue: true, items: children, teleport: false } });
    await flushPromises();
    const menubar = mount(Menubar, { props: { modelValue: "file", items: [{ value: "file", children }], teleport: false } });
    await flushPromises();
    const order = (element: Element) => Number((element as HTMLElement).style.getPropertyValue("--akaza-layer-order"));
    const popoverOrder = order(popover.get(".akaza-popover-content").element);
    const contextOrder = order(context.get(".akaza-context-menu-content").element);
    const menubarOrder = order(menubar.get(".akaza-menubar-content").element);
    expect(popoverOrder).toBeGreaterThan(0);
    expect(contextOrder).toBeGreaterThan(popoverOrder);
    expect(menubarOrder).toBeGreaterThan(contextOrder);
    await context.setProps({ modelValue: false });
    await flushPromises();
    await context.setProps({ modelValue: true });
    await flushPromises();
    expect(order(context.get(".akaza-context-menu-content").element)).toBeGreaterThan(menubarOrder);
  });
});
