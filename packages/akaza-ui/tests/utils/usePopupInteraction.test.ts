import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { usePopup } from "@/composables/internal/sdk/usePopup";
import { usePopupInteraction } from "@/utils/usePopupInteraction";
import { installPopupTestEnvironment, pointer, settlePopup } from "../components/popover/popupTestEnvironment";

installPopupTestEnvironment();

describe("popup interaction", () => {
  async function fixture() {
    const outside = vi.fn();
    const wrapper = mount(defineComponent({
      setup() {
        const root = ref<HTMLElement | null>(null);
        const content = ref<HTMLElement | null>(null);
        const input = ref<HTMLInputElement | null>(null);
        const open = ref(true);
        const popup = usePopup({
          kind: "combobox", open, content, trigger: () => input.value, initialFocus: "none",
          request: (next, reason, event) => { if (reason === "outside-press") outside(next, reason, event); },
        });
        return { root, content, input, open, ...popup, ...usePopupInteraction({ root, content, open, focusTarget: input }) };
      },
      template: '<div><div ref="root"><input ref="input" v-bind="triggerAttrs" aria-label="Search"></div><Teleport to="body"><div v-if="present" ref="content" v-bind="contentAttrs">Teleported content</div></Teleport><button>Outside</button></div>',
    }), { attachTo: document.body });
    await settlePopup();
    wrapper.vm.content!.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);
    return { wrapper, outside };
  }

  it("recognizes both the root and detached popup as internal", async () => {
    const { wrapper, outside } = await fixture();
    try {
      expect(wrapper.vm.isInternalFocusMove(new FocusEvent("focusout", { relatedTarget: wrapper.vm.content }))).toBe(true);
      expect(wrapper.vm.isInternalFocusMove(new FocusEvent("focusout", { relatedTarget: wrapper.vm.input }))).toBe(true);
      pointer(wrapper.vm.content!, "pointerdown");
    } finally {
      wrapper.unmount();
    }
    expect(outside).not.toHaveBeenCalled();
  });

  it("clears a canceled pointer gesture without stealing outside focus", async () => {
    const { wrapper, outside } = await fixture();
    try {
      pointer(wrapper.vm.content!, "pointerdown");
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
    const { wrapper, outside } = await fixture();
    try {
      const content = wrapper.vm.content!;
      const event = pointer(content, "pointerdown");
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
    const { wrapper, outside } = await fixture();
    pointer(wrapper.get("button").element, "pointerdown");
    expect(outside).toHaveBeenCalledTimes(1);
    wrapper.vm.open = false;
    await settlePopup();
    pointer(wrapper.get("button").element, "pointerdown");
    expect(outside).toHaveBeenCalledTimes(1);
    wrapper.unmount();
    document.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(outside).toHaveBeenCalledTimes(1);
  });

  it.each(["left", "right"])("returns native %s-scrollbar focus from the SDK surface to the editor", async (side) => {
    const { wrapper } = await fixture();
    try {
      const content = wrapper.vm.content!;
      Object.defineProperties(content, {
        clientLeft: { configurable: true, value: side === "left" ? 20 : 0 },
        clientWidth: { configurable: true, value: 80 },
        clientHeight: { configurable: true, value: 100 },
        scrollHeight: { configurable: true, value: 300 },
      });
      wrapper.vm.input!.focus();
      const press = new PointerEvent("pointerdown", { bubbles: true, cancelable: true, clientX: side === "left" ? 5 : 95, clientY: 20 });
      content.dispatchEvent(press);
      content.focus();
      expect(document.activeElement).toBe(content);
      document.dispatchEvent(new Event("pointerup"));
      expect(document.activeElement).toBe(wrapper.vm.input);
      expect(press.defaultPrevented).toBe(false);
    } finally {
      wrapper.unmount();
    }
  });

  it("does not steal focus from an interactive popup child", async () => {
    const { wrapper } = await fixture();
    try {
      const button = document.createElement("button");
      button.textContent = "Popup action";
      wrapper.vm.content!.append(button);
      pointer(button, "pointerdown");
      button.focus();
      document.dispatchEvent(new Event("pointerup"));
      expect(document.activeElement).toBe(button);
    } finally {
      wrapper.unmount();
    }
  });
});
