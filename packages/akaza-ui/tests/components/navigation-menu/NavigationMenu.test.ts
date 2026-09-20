import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { NavigationMenu } from "@/components/navigation-menu";

describe("navigation menu", () => {
  it("prevents disabled links from selecting", async () => {
    const onSelect = vi.fn();
    const wrapper = mount(NavigationMenu, {
      props: {
        items: [{ label: "Disabled", href: "#disabled", disabled: true, onSelect }],
      },
    });

    await wrapper.find(".akaza-navigation-menu-link").trigger("click");
    expect(onSelect).not.toHaveBeenCalled();
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("makes the selected leaf active and clears the fallback active item", async () => {
    const wrapper = mount(NavigationMenu, {
      props: {
        orientation: "vertical",
        items: [
          { label: "Overview", value: "overview", active: true },
          { label: "Orders", value: "orders" },
        ],
      },
    });

    const links = wrapper.findAll(".akaza-navigation-menu-inline-link");
    expect(links[0]!.attributes("data-akaza-state")).toBe("active");

    await links[1]!.trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["orders"]);
    expect(wrapper.emitted("value-change")?.[0]?.[0]).toBe("orders");
    expect(wrapper.findAll(".akaza-navigation-menu-inline-link")[0]!.attributes("data-akaza-state")).toBe("inactive");
    expect(wrapper.findAll(".akaza-navigation-menu-inline-link")[1]!.attributes("data-akaza-state")).toBe("active");
    expect(wrapper.findAll(".akaza-navigation-menu-inline-link")[1]!.attributes("aria-current")).toBe("page");
  });

  it("marks ancestor groups active for a selected descendant", () => {
    const wrapper = mount(NavigationMenu, {
      props: {
        modelValue: "members",
        orientation: "vertical",
        defaultExpanded: ["workspace"],
        items: [
          {
            label: "Workspace",
            value: "workspace",
            children: [{ label: "Members", value: "members" }],
          },
        ],
      },
    });

    expect(wrapper.find(".akaza-navigation-menu-inline-trigger").attributes("data-akaza-active")).toBe("true");
    expect(wrapper.find(".akaza-navigation-menu-inline-link").attributes("data-akaza-state")).toBe("active");
  });

  it("allows selected-value changes to be canceled", async () => {
    const wrapper = mount(NavigationMenu, {
      props: {
        orientation: "vertical",
        items: [{ label: "Orders", value: "orders" }],
        onValueChange: (_value, details) => details.cancel(),
      },
    });

    await wrapper.find(".akaza-navigation-menu-inline-link").trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.find(".akaza-navigation-menu-inline-link").attributes("data-akaza-state")).toBe("inactive");
  });

  it("uses item-specific slots and distinct link classes", () => {
    const wrapper = mount(NavigationMenu, {
      props: {
        items: [{ label: "Guide", href: "/guide", slot: "guide" }],
      },
      slots: { guide: '<span class="custom-link">Custom guide</span>' },
    });

    expect(wrapper.find(".akaza-navigation-menu-link").exists()).toBe(true);
    expect(wrapper.find(".akaza-navigation-menu-trigger").exists()).toBe(false);
    expect(wrapper.find(".custom-link").text()).toBe("Custom guide");
  });

  it("uses RouterLink for to and runs onClick before selecting", async () => {
    const calls: string[] = [];
    const wrapper = mount(NavigationMenu, {
      props: {
        items: [{
          label: "Input",
          to: "/components/input",
          onClick: () => calls.push("click"),
        }],
        onSelect: () => calls.push("select"),
      },
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    const link = wrapper.find("router-link-stub");
    expect(link.attributes("to")).toBe("/components/input");

    await link.trigger("click");

    expect(calls).toEqual(["click", "select"]);
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["/components/input"]);
  });

  it("exposes activation direction when controlled content changes", async () => {
    const wrapper = mount(NavigationMenu, {
      props: {
        open: "products",
        items: [
          {
            label: "Products",
            value: "products",
            children: [{ label: "Overview", href: "/overview" }],
          },
          { label: "Docs", value: "docs", children: [{ label: "Guide", href: "/guide" }] },
        ],
      },
    });

    await wrapper.setProps({ open: "docs" });
    const forwardPanels = wrapper.findAll(".akaza-navigation-menu-panel");
    expect(forwardPanels).toHaveLength(2);
    expect(forwardPanels[0]!.attributes("data-akaza-motion")).toBe("to-start");
    expect(forwardPanels[1]!.attributes("data-akaza-motion")).toBe("from-end");

    await wrapper.setProps({ open: "products" });
    const backwardPanels = wrapper.findAll(".akaza-navigation-menu-panel");
    expect(backwardPanels[0]!.attributes("data-akaza-motion")).toBe("from-start");
    expect(backwardPanels[1]!.attributes("data-akaza-motion")).toBe("to-end");
  });

  it("renders vertical children inline and supports recursive expansion", async () => {
    const wrapper = mount(NavigationMenu, {
      props: {
        orientation: "vertical",
        items: [
          {
            label: "Platform",
            value: "platform",
            children: [
              {
                label: "Settings",
                value: "settings",
                children: [{ label: "Members", href: "/members" }],
              },
            ],
          },
        ],
      },
    });

    expect(wrapper.attributes("data-akaza-content-mode")).toBe("inline");
    const triggers = wrapper.findAll(".akaza-navigation-menu-inline-trigger");
    expect(triggers).toHaveLength(2);
    expect(triggers[0]!.attributes("aria-expanded")).toBe("false");

    await triggers[0]!.trigger("click");
    expect(wrapper.findAll(".akaza-navigation-menu-inline-trigger")[0]!.attributes("aria-expanded")).toBe("true");
    expect(wrapper.emitted("update:expanded")?.[0]).toEqual([["platform"]]);

    await wrapper.findAll(".akaza-navigation-menu-inline-trigger")[1]!.trigger("click");
    expect(wrapper.emitted("update:expanded")?.[1]).toEqual([["platform", "settings"]]);
    expect(wrapper.find("a[href='/members']").exists()).toBe(true);
  });

  it("allows inline expansion changes to be canceled", async () => {
    const onExpandedChange = vi.fn((_value, details) => details.cancel());
    const wrapper = mount(NavigationMenu, {
      props: {
        orientation: "vertical",
        items: [{ label: "Platform", value: "platform", children: [{ label: "Home", href: "/" }] }],
        onExpandedChange,
      },
    });

    await wrapper.find(".akaza-navigation-menu-inline-trigger").trigger("click");
    expect(onExpandedChange).toHaveBeenCalledOnce();
    expect(wrapper.find(".akaza-navigation-menu-inline-trigger").attributes("aria-expanded")).toBe("false");
    expect(wrapper.emitted("update:expanded")).toBeUndefined();
  });

  it("uses a side flyout for collapsed vertical navigation", async () => {
    const wrapper = mount(NavigationMenu, {
      props: {
        orientation: "vertical",
        collapsed: true,
        teleport: false,
        items: [{ label: "Platform", value: "platform", children: [{ label: "Home", href: "/" }] }],
      },
    });

    expect(wrapper.attributes("data-akaza-content-mode")).toBe("flyout");
    expect(wrapper.find(".akaza-navigation-menu-inline-list").exists()).toBe(false);
    await wrapper.find(".akaza-navigation-menu-trigger").trigger("click");
    expect(wrapper.find(".akaza-navigation-menu-content").attributes("data-akaza-side")).toBe("right");
  });

  it("labels collapsed direct items with keyboard-accessible tooltips", async () => {
    const wrapper = mount(NavigationMenu, {
      props: {
        orientation: "vertical",
        collapsed: true,
        tooltip: true,
        teleport: false,
        items: [{ label: "Overview", value: "overview" }],
      },
    });

    const link = wrapper.find(".akaza-navigation-menu-link");
    await link.trigger("focus");
    expect(link.attributes("aria-describedby")).toBeTruthy();
    expect(wrapper.find("[role='tooltip']").text()).toBe("Overview");
  });

  it("supports labels, separators, badges, and vertical arrow navigation", async () => {
    const wrapper = mount(NavigationMenu, {
      attachTo: document.body,
      props: {
        orientation: "vertical",
        items: [
          { label: "Workspace", type: "label" },
          { label: "Overview", href: "/overview", badge: 3 },
          { label: "Divider", type: "separator" },
          { label: "Settings", href: "/settings" },
        ],
      },
    });

    expect(wrapper.find(".akaza-navigation-menu-group-label").text()).toBe("Workspace");
    expect(wrapper.find(".akaza-navigation-menu-separator").attributes("role")).toBe("separator");
    expect(wrapper.find(".akaza-navigation-menu-badge").text()).toBe("3");

    const links = wrapper.findAll(".akaza-navigation-menu-inline-link");
    links[0]!.element.focus();
    await links[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(links[1]!.element);
    wrapper.unmount();
  });
});
