import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { usePopupInteraction } from "@/utils/usePopupInteraction";

describe("popup interaction", () => {
  function fixture() {
    const outside = vi.fn();
    const wrapper = mount(defineComponent({
      setup() {
        const root = ref<HTMLElement | null>(null);
        const content = ref<HTMLElement | null>(null);
        const input = ref<HTMLInputElement | null>(null);
        const open = ref(true);
        return { root, content, input, open, ...usePopupInteraction({ root, content, open, focusTarget: input, onOutsidePointerDown: outside }) };
      },
      template: '<div><div ref="root"><input ref="input"></div><div ref="content">Teleported content</div><button>Outside</button></div>',
    }), { attachTo: document.body });
    return { wrapper, outside };
  }

  it("recognizes both the root and detached popup as internal", async () => {
    const { wrapper, outside } = fixture();
    try {
      expect(wrapper.vm.isInternalFocusMove(new FocusEvent("focusout", { relatedTarget: wrapper.vm.content }))).toBe(true);
      expect(wrapper.vm.isInternalFocusMove(new FocusEvent("focusout", { relatedTarget: wrapper.vm.input }))).toBe(true);
      await wrapper.vm.content!.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    } finally {
      wrapper.unmount();
    }
    expect(outside).not.toHaveBeenCalled();
  });

  it("clears a canceled pointer gesture without stealing outside focus", async () => {
    const { wrapper, outside } = fixture();
    try {
      wrapper.vm.content!.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      wrapper.get("button").element.focus();
      const focus = vi.spyOn(wrapper.vm.input!, "focus");
      document.dispatchEvent(new Event("pointercancel"));
      expect(focus).not.toHaveBeenCalled();
      expect(wrapper.vm.isInternalFocusMove(new FocusEvent("focusout"))).toBe(false);
      expect(outside).not.toHaveBeenCalled();
    } finally {
      wrapper.unmount();
    }
  });

  it("keeps scrollbar focus loss internal without preventing native pointer actions", async () => {
    const { wrapper, outside } = fixture();
    try {
      const content = wrapper.vm.content!;
      const event = new Event("pointerdown", { bubbles: true, cancelable: true });
      content.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
      expect(outside).not.toHaveBeenCalled();
      expect(wrapper.vm.isInternalFocusMove(new FocusEvent("focusout"))).toBe(true);
      expect(wrapper.vm.isInternalFocusMove(new FocusEvent("focusout", { relatedTarget: document.body }))).toBe(true);
      expect(wrapper.vm.isInternalFocusMove(new FocusEvent("focusout", { relatedTarget: wrapper.get("button").element }))).toBe(false);
      const focus = vi.spyOn(wrapper.vm.input!, "focus");
      document.dispatchEvent(new Event("pointerup"));
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
      expect(wrapper.vm.isInternalFocusMove(new FocusEvent("focusout"))).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  it("dismisses only open popups and removes document listeners on unmount", async () => {
    const { wrapper, outside } = fixture();
    await wrapper.get("button").trigger("pointerdown");
    expect(outside).toHaveBeenCalledTimes(1);
    wrapper.vm.open = false;
    await wrapper.get("button").trigger("pointerdown");
    expect(outside).toHaveBeenCalledTimes(1);
    wrapper.unmount();
    document.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(outside).toHaveBeenCalledTimes(1);
  });
});
