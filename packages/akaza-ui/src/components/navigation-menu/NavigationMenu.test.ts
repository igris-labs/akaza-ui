import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { NavigationMenu } from ".";

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
});
