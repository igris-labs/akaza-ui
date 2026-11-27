import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContextMenu } from "@/components/context-menu";
import { installPopupTestEnvironment } from "../popover/popupTestEnvironment";

installPopupTestEnvironment();

beforeEach(() => {
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(window.innerWidth);
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(window.innerHeight);
});
afterEach(() => vi.restoreAllMocks());

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
    await vi.waitFor(() => expect(wrapper.find(".akaza-context-menu-content").attributes("style")).toContain("left: 104px"));

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
    wrapper.unmount();
  });

  it("keeps a stored pointer anchor inside a smaller viewport", async () => {
    let width = 800;
    vi.spyOn(document.documentElement, "clientWidth", "get").mockImplementation(() => width);
    const wrapper = mount(ContextMenu, {
      attachTo: document.body,
      props: { items: [{ value: "copy", label: "Copy" }], teleport: false },
      slots: { default: '<button class="surface">Surface</button>' },
    });
    try {
      await wrapper.find(".surface").trigger("contextmenu", { clientX: 790, clientY: 20 });
      width = 640;
      window.dispatchEvent(new Event("resize"));
      await vi.waitFor(() => {
        const content = wrapper.get(".akaza-context-menu-content").element as HTMLElement;
        expect(Number.parseFloat(content.style.left)).toBeLessThanOrEqual(640);
      });
    } finally { wrapper.unmount(); }
  });
});
