import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h, ref } from "vue";
import { AppLayout } from "@/components/app-layout";
import { Sidebar } from "@/components/sidebar";

describe("app layout", () => {
  it("renders only supplied regions and gives each instance a unique main target", () => {
    const parent = mount({ render: () => h("div", [h(AppLayout, {}, () => "Content"), h(AppLayout)]) });
    const [first, second] = parent.findAllComponents(AppLayout);
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first!.find("header").exists()).toBe(false);
    expect(first!.find("footer").exists()).toBe(false);
    expect(first!.find(".akaza-app-layout-left").exists()).toBe(false);
    expect(first!.get("main").attributes("id")).not.toBe(second!.get("main").attributes("id"));
    expect(first!.get("a").attributes("href")).toBe(`#${first!.get("main").attributes("id")}`);
    parent.unmount();
  });

  it("changes spanning and overlay geometry reactively without remounting content", async () => {
    const wrapper = mount(AppLayout, {
      slots: { header: "Header", left: "Left", right: "Right", footer: "Footer", default: "Main" },
    });
    const main = wrapper.get("main").element;
    expect(wrapper.attributes("style")).toContain('"header header header" "left main right" "footer footer footer"');
    await wrapper.setProps({ layout: { header: "content", footer: "content", left: "overlay" } });
    expect(wrapper.attributes("style")).toContain('". header right" ". main right" ". footer right"');
    expect(wrapper.get(".akaza-app-layout-left").attributes("data-akaza-mode")).toBe("overlay");
    expect(wrapper.get("main").element).toBe(main);
    wrapper.unmount();
  });

  it("updates grid areas when conditional region slots change", async () => {
    const visible = ref(true);
    const wrapper = mount({
      render: () => h(AppLayout, {}, {
        default: () => "Main",
        ...(visible.value ? { left: () => "Left", header: () => "Header" } : {}),
      }),
    });
    const main = wrapper.get("main").element;
    expect(wrapper.attributes("style")).toContain('"left main ."');
    visible.value = false;
    await wrapper.vm.$nextTick();
    expect(wrapper.attributes("style")).toContain('". main ."');
    expect(wrapper.find("header").exists()).toBe(false);
    expect(wrapper.get("main").element).toBe(main);
    wrapper.unmount();
  });

  it("focuses main from its skip link and supports disabling the generated link", async () => {
    const wrapper = mount(AppLayout, { attachTo: document.body, props: { mainId: "workspace" } });
    await wrapper.get("a").trigger("click");
    expect(document.activeElement).toBe(wrapper.get("main").element);
    await wrapper.setProps({ skipLink: false });
    expect(wrapper.find("a").exists()).toBe(false);
    wrapper.unmount();
  });

  it("activates sticky regions only in page scrolling mode", async () => {
    const wrapper = mount(AppLayout, {
      props: { stickyHeader: true, stickyFooter: true, stickySides: true },
      slots: { header: "Header", left: "Left", footer: "Footer" },
    });
    expect(wrapper.findAll("[data-akaza-sticky]")).toHaveLength(0);
    await wrapper.setProps({ scroll: "page" });
    expect(wrapper.findAll("[data-akaza-sticky]")).toHaveLength(3);
    await wrapper.setProps({ layout: { left: "overlay" } });
    expect(wrapper.get(".akaza-app-layout-left").attributes("data-akaza-sticky")).toBeUndefined();
    wrapper.unmount();
  });

  it("preserves root attributes, ui parts, and existing Sidebar collapse behavior", async () => {
    const wrapper = mount(AppLayout, {
      attrs: { class: "custom-shell", "data-test": "shell" },
      props: { ui: { root: "root-ui", left: "left-ui", main: "main-ui" } },
      slots: { left: () => h(Sidebar, { mobile: false, collapsible: "icon" }, { default: () => "Navigation" }) },
    });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(["custom-shell", "root-ui", "akaza-app-layout"]));
    expect(wrapper.get("main").classes()).toContain("main-ui");
    const sidebar = wrapper.getComponent(Sidebar);
    sidebar.vm.collapse();
    await wrapper.vm.$nextTick();
    expect(sidebar.attributes("data-akaza-state")).toBe("collapsed");
    wrapper.unmount();
  });
});
