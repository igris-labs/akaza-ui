import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { Button } from "@/components/button";
import { Sidebar } from "@/components/sidebar";
import { Toggle } from "@/components/toggle";

enableAutoUnmount(afterEach);

describe("sDK keyboard activation through Vue controls", () => {
  for (const component of [Button, Toggle]) {
    it(`${component.__name}: custom roots activate on Space release and Enter press`, async () => {
      const click = vi.fn();
      const wrapper = mount(component, { attachTo: document.body, props: { as: "div" }, attrs: { onClick: click } });
      await wrapper.trigger("keydown", { key: " " });
      await wrapper.trigger("keydown", { key: " ", repeat: true });
      expect(click).not.toHaveBeenCalled();
      await wrapper.trigger("keyup", { key: " " });
      expect(click).toHaveBeenCalledOnce();
      await wrapper.trigger("keydown", { key: "Enter" });
      await wrapper.trigger("keyup", { key: "Enter" });
      expect(click).toHaveBeenCalledTimes(2);
      if (component === Toggle) expect(wrapper.emitted("update:modelValue")?.map(event => event[0])).toEqual([true, false]);
    });

    it(`${component.__name}: disabled, composing, nested and consumed keys do not activate`, async () => {
      const click = vi.fn();
      const wrapper = mount(component, {
        attachTo: document.body, props: { as: "div" }, attrs: { onClick: click },
        slots: { default: () => h("input", { "aria-label": "Nested" }) },
      });
      await wrapper.get("input").trigger("keydown", { key: "Enter" });
      await wrapper.get("input").trigger("keyup", { key: " " });
      await wrapper.trigger("keydown", { key: "Enter", isComposing: true });
      await wrapper.trigger("keydown", { key: "Enter", keyCode: 229 });
      const consumed = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      consumed.preventDefault();
      wrapper.element.dispatchEvent(consumed);
      await wrapper.setProps({ disabled: true });
      await wrapper.trigger("keydown", { key: "Enter" });
      await wrapper.trigger("keyup", { key: " " });
      expect(click).not.toHaveBeenCalled();
    });

    it(`${component.__name}: native buttons keep browser activation`, async () => {
      const click = vi.fn();
      const wrapper = mount(component, { attrs: { onClick: click } });
      await wrapper.trigger("keydown", { key: "Enter" });
      await wrapper.trigger("keyup", { key: " " });
      expect(click).not.toHaveBeenCalled();
      await wrapper.trigger("click");
      expect(click).toHaveBeenCalledOnce();
    });
  }

  it("preserves ARIA-button Space support on linked roots without duplicating native Enter", async () => {
    const click = vi.fn((event: MouseEvent) => event.preventDefault());
    const wrapper = mount(Button, { attachTo: document.body, props: { as: "a" }, attrs: { href: "#example", onClick: click } });
    expect(wrapper.attributes()).toMatchObject({ role: "button", href: "#example" });
    // Vue ignores same-millisecond synthetic clicks attached during the current patch.
    await new Promise(resolve => setTimeout(resolve, 1));
    await wrapper.trigger("keydown", { key: " " });
    expect(click).not.toHaveBeenCalled();
    await wrapper.trigger("keyup", { key: " " });
    expect(click).toHaveBeenCalledOnce();
    await wrapper.trigger("keydown", { key: "Enter" });
    expect(click).toHaveBeenCalledOnce();
  });

  it("button keeps one async click and blocks keyboard reentry until it settles", async () => {
    let resolve!: () => void;
    const click = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const wrapper = mount(Button, {
      attachTo: document.body, props: { as: "div", loadingAuto: true }, attrs: { onClick: click },
    });
    await wrapper.trigger("keydown", { key: " " });
    await wrapper.trigger("keyup", { key: " " });
    await nextTick();
    expect(wrapper.attributes("aria-busy")).toBe("true");
    await wrapper.trigger("keydown", { key: "Enter" });
    expect(click).toHaveBeenCalledOnce();
    resolve();
    await flushPromises();
    expect(wrapper.attributes("aria-busy")).toBeUndefined();
  });

  it("toggle routes keyboard clicks through cancelable controlled selection", async () => {
    const wrapper = mount(Toggle, {
      attachTo: document.body,
      props: { as: "div", modelValue: false, "onUpdate:modelValue": vi.fn(), onPressedChange: (_value, details) => details.cancel() },
    });
    await wrapper.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("pressed-change")?.[0]?.[1]).toMatchObject({ reason: "trigger", event: expect.any(MouseEvent) });
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.setProps({ onPressedChange: vi.fn() });
    await wrapper.trigger("keyup", { key: " " });
    expect(wrapper.attributes("aria-pressed")).toBe("false");
  });
});

describe("sidebar SDK shortcut matching", () => {
  it("matches physical keys but ignores IME, consumed events and nested editable targets", async () => {
    const wrapper = mount(Sidebar, { attachTo: document.body, props: { collapsible: "icon", keyboardShortcut: "b", mobile: false } });
    const event = (extra: KeyboardEventInit = {}) => new KeyboardEvent("keydown", { key: "b", code: "KeyB", ctrlKey: true, bubbles: true, cancelable: true, ...extra });
    document.dispatchEvent(event({ isComposing: true }));
    const consumed = event();
    consumed.preventDefault();
    document.dispatchEvent(consumed);
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    editable.setAttribute("contenteditable", "true");
    editable.innerHTML = "<span>Editing</span>";
    document.body.append(editable);
    try {
      editable.firstElementChild!.dispatchEvent(event());
      await nextTick();
      expect(wrapper.emitted("collapsed-change")).toBeUndefined();
      document.dispatchEvent(event({ key: "\u03B2" }));
      await nextTick();
      expect(wrapper.emitted("collapsed-change")).toHaveLength(1);
    } finally {
      editable.remove();
    }
  });
});
