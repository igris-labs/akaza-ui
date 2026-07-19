import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { Toolbar } from ".";

describe("toolbar", () => {
  it("keeps one generated command in the tab order", async () => {
    const wrapper = mount(Toolbar, {
      attachTo: document.body,
      props: {
        items: [
          { value: "bold", label: "Bold" },
          { value: "italic", label: "Italic" },
          { type: "link", value: "docs", label: "Docs", href: "#docs" },
        ],
      },
    });
    const commands = wrapper.findAll("[data-akaza-toolbar-item]");

    expect(commands.map((item) => item.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
    await commands[0]!.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(commands[1]!.element);
    expect(commands[1]!.attributes("tabindex")).toBe("0");

    wrapper.unmount();
  });

  it("does not steal input arrow keys and emits input changes", async () => {
    const update = vi.fn();
    const wrapper = mount(Toolbar, {
      attachTo: document.body,
      props: {
        items: [
          { value: "bold", label: "Bold" },
          { type: "input", value: "search", label: "Search", inputValue: "a", onUpdateValue: update },
          { value: "italic", label: "Italic" },
        ],
      },
    });
    const input = wrapper.find(".akaza-toolbar-input");
    (input.element as HTMLInputElement).focus();
    await input.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(input.element);

    await input.setValue("akaza");
    expect(update).toHaveBeenCalledWith("akaza");
    expect(wrapper.emitted("input-change")).toHaveLength(1);

    wrapper.unmount();
  });

  it("blocks disabled links", async () => {
    const onSelect = vi.fn();
    const wrapper = mount(Toolbar, {
      props: { items: [{ type: "link", label: "Docs", href: "#docs", disabled: true, onSelect }] },
    });

    await wrapper.find(".akaza-toolbar-link").trigger("click");
    expect(onSelect).not.toHaveBeenCalled();
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("restores a valid roving tab stop when active items change", async () => {
    const wrapper = mount(Toolbar, {
      props: {
        items: [
          { value: "bold", label: "Bold" },
          { value: "italic", label: "Italic" },
        ],
      },
    });
    await wrapper.findAll("[data-akaza-toolbar-item]")[1]!.trigger("focus");
    await wrapper.setProps({ items: [{ value: "bold", label: "Bold" }] });

    expect(wrapper.find("[data-akaza-toolbar-item]").attributes("tabindex")).toBe("0");
  });
});
