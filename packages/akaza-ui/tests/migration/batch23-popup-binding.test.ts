import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { usePopup } from "@/composables/internal/sdk/usePopup";
import { installPopupTestEnvironment, settlePopup } from "../components/popover/popupTestEnvironment";

installPopupTestEnvironment();

function fixture(contentId: string) {
  const request = vi.fn();
  const wrapper = mount(defineComponent({
    setup() {
      const open = ref(false);
      const disabled = ref(false);
      const trigger = ref<HTMLElement | null>(null);
      const content = ref<HTMLElement | null>(null);
      const popup = usePopup({
        kind: "popover", open, content, contentId, trigger: () => trigger.value,
        disabled: () => disabled.value, initialFocus: "none",
        request(next, reason, event) {
          request(next, reason, event);
          open.value = next;
        },
      });
      return { open, disabled, trigger, content, ...popup };
    },
    template: `<div>
      <button ref="trigger" v-bind="triggerAttrs" @click="setOpen(!open, 'slot-action', $event)">Options</button>
      <div v-if="present" ref="content" v-bind="contentAttrs">Popup</div>
    </div>`,
  }), { attachTo: document.body });
  return { wrapper, request };
}

describe("batch 23 Vue popup public Core binding", () => {
  it("binds declared slot metadata and explicit content IDs without crossing instances", async () => {
    const first = fixture("first-panel");
    const second = fixture("second-panel");
    try {
      await settlePopup();
      await first.wrapper.get("button").trigger("click");
      await settlePopup();
      expect(first.wrapper.vm.content!.id).toBe("first-panel");
      expect(first.wrapper.vm.content!.dataset.slot).toBe("akaza-popover-popup-content");
      expect(first.wrapper.vm.trigger!.dataset.slot).toBe("akaza-popover-popup-trigger");
      expect(first.wrapper.vm.trigger!.getAttribute("aria-controls")).toBe("first-panel");
      expect(first.wrapper.vm.trigger!.getAttribute("aria-expanded")).toBe("true");
      expect(second.wrapper.vm.trigger!.getAttribute("aria-expanded")).toBe("false");
      expect(second.wrapper.vm.content).toBeNull();
      expect(second.request).not.toHaveBeenCalled();
    } finally {
      second.wrapper.unmount();
      first.wrapper.unmount();
    }
  });

  it("reports a slot action once and does not leak its reason or event into SDK dismissal", async () => {
    const { wrapper, request } = fixture("action-panel");
    try {
      await settlePopup();
      const click = new MouseEvent("click", { bubbles: true, cancelable: true });
      wrapper.vm.trigger!.dispatchEvent(click);
      await settlePopup();
      expect(request).toHaveBeenCalledExactlyOnceWith(true, "slot-action", click);
      const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
      wrapper.vm.content!.dispatchEvent(escape);
      await settlePopup();
      expect(request).toHaveBeenCalledTimes(2);
      expect(request).toHaveBeenLastCalledWith(false, "escape-key", escape);
      expect(wrapper.vm.present).toBe(false);
    } finally { wrapper.unmount(); }
  });

  it("reads reactive disabled options before accepting a later slot action", async () => {
    const { wrapper, request } = fixture("disabled-panel");
    try {
      wrapper.vm.disabled = true;
      await settlePopup();
      await wrapper.get("button").trigger("click");
      await settlePopup();
      expect(request).not.toHaveBeenCalled();
      expect(wrapper.vm.present).toBe(false);
      wrapper.vm.disabled = false;
      await settlePopup();
      await wrapper.get("button").trigger("click");
      await settlePopup();
      expect(request).toHaveBeenCalledOnce();
      expect(wrapper.vm.present).toBe(true);
    } finally { wrapper.unmount(); }
  });

  it("respects prevented DOM events before invoking bound SDK handlers", async () => {
    const { wrapper, request } = fixture("prevented-panel");
    try {
      wrapper.vm.open = true;
      await settlePopup();
      const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
      escape.preventDefault();
      wrapper.vm.content!.dispatchEvent(escape);
      await settlePopup();
      expect(request).not.toHaveBeenCalled();
      expect(wrapper.vm.open).toBe(true);
      const content = wrapper.vm.content!;
      wrapper.unmount();
      content.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      expect(request).not.toHaveBeenCalled();
    } finally { if (wrapper.exists()) wrapper.unmount(); }
  });
});
