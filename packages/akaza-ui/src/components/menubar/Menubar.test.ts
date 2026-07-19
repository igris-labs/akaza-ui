import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { Menubar } from ".";

describe("menubar", () => {
  it("activates a top-level action with Enter", async () => {
    const onSelect = vi.fn();
    const wrapper = mount(Menubar, {
      props: {
        items: [
          { value: "save", label: "Save", onSelect },
          { value: "edit", label: "Edit", children: [{ label: "Undo" }] },
        ],
      },
    });

    await wrapper.findAll(".akaza-menubar-trigger")[0]!.trigger("keydown", { key: "Enter" });

    expect(onSelect).toHaveBeenCalledOnce();
    expect(wrapper.emitted("select")).toHaveLength(1);
  });

  it("uses roving tabindex across enabled top-level items", async () => {
    const wrapper = mount(Menubar, {
      attachTo: document.body,
      props: {
        items: [
          { value: "file", label: "File", children: [{ label: "Open" }] },
          { value: "disabled", label: "Disabled", disabled: true },
          { value: "help", label: "Help", children: [{ label: "Docs" }] },
        ],
      },
    });
    const triggers = wrapper.findAll(".akaza-menubar-trigger");

    expect(triggers.map((trigger) => trigger.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
    await triggers[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(triggers[2]!.element);
    expect(triggers[2]!.attributes("tabindex")).toBe("0");

    wrapper.unmount();
  });

  it("moves from an open menu to a top-level command", async () => {
    const wrapper = mount(Menubar, {
      attachTo: document.body,
      props: {
        items: [
          { value: "file", label: "File", children: [{ label: "Open" }] },
          { value: "save", label: "Save" },
        ],
      },
    });
    const triggers = wrapper.findAll(".akaza-menubar-trigger");
    await triggers[0]!.trigger("click");
    await wrapper.find(".akaza-menubar-content").trigger("keydown", { key: "ArrowRight" });

    expect(wrapper.find(".akaza-menubar-content").exists()).toBe(false);
    expect(document.activeElement).toBe(triggers[1]!.element);
    wrapper.unmount();
  });
});
