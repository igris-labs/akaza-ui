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
});
