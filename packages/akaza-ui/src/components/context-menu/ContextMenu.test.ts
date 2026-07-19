import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ContextMenu } from ".";

describe("context menu", () => {
  it("repositions when invoked again while already open", async () => {
    const wrapper = mount(ContextMenu, {
      attachTo: document.body,
      props: { items: [{ value: "copy", label: "Copy" }], teleport: false },
      slots: { default: '<button class="surface">Surface</button>' },
    });
    const surface = wrapper.find(".surface");

    await surface.trigger("contextmenu", { clientX: 10, clientY: 20 });
    expect(wrapper.find(".akaza-context-menu-content").attributes("style")).toContain("left: 14px");

    await surface.trigger("contextmenu", { clientX: 100, clientY: 120 });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".akaza-context-menu-content").attributes("style")).toContain("left: 104px");

    wrapper.unmount();
  });

  it("opens from the keyboard context-menu shortcut", async () => {
    const wrapper = mount(ContextMenu, {
      props: { items: [{ value: "copy", label: "Copy" }], teleport: false },
      slots: { default: '<button class="surface">Surface</button>' },
    });

    await wrapper.find(".surface").trigger("keydown", { key: "F10", shiftKey: true });
    expect(wrapper.find(".akaza-context-menu-content").exists()).toBe(true);
    expect(wrapper.emitted("open-change")?.[0]?.[1]).toMatchObject({ reason: "keyboard" });
  });
});
