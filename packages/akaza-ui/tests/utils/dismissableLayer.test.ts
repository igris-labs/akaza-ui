import { bindLayer } from "@ui-sdk/core";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { usePopup } from "@/composables/internal/sdk/usePopup";
import { installPopupTestEnvironment, pointer, settlePopup } from "../components/popover/popupTestEnvironment";

installPopupTestEnvironment();

function fixture(request = vi.fn(), accept: boolean | (() => boolean) = false, parent: Element = document.body) {
  return mount(defineComponent({
    setup() {
      const open = ref(true);
      const trigger = ref<HTMLElement | null>(null);
      const content = ref<HTMLElement | null>(null);
      const revision = ref(0);
      const popup = usePopup({
        kind: "popover", open, content, trigger: () => trigger.value, initialFocus: "none",
        request(next, reason, event) {
          request(next, reason, event);
          if (typeof accept === "function" ? accept() : accept) open.value = next;
        },
      });
      return { open, trigger, content, revision, ...popup };
    },
    template: `<div>
      <button ref="trigger" v-bind="triggerAttrs">Open</button>
      <Teleport to="body"><div v-if="present" :key="revision" ref="content" v-bind="contentAttrs">Popup</div></Teleport>
      <button class="outside">Outside</button>
    </div>`,
  }), { attachTo: parent });
}

function escape() {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  document.dispatchEvent(event);
  return event;
}

describe("sdk popup dismissal ownership", () => {
  it("preserves consumer body click listeners across binding and cleanup", async () => {
    const consumer = vi.fn();
    const originalClick = document.body.onclick;
    document.body.onclick = consumer;
    const wrapper = fixture();
    try {
      await settlePopup();
      expect(document.body.onclick).toBe(consumer);
      document.body.click();
      expect(consumer).toHaveBeenCalledOnce();
      wrapper.vm.open = false;
      await settlePopup();
      expect(document.body.onclick).toBe(consumer);
      document.body.click();
      expect(consumer).toHaveBeenCalledTimes(2);
    } finally {
      wrapper.unmount();
      document.body.onclick = originalClick;
    }
  });

  it("ignores the trigger and teleported content, and reports each outside press once", async () => {
    const request = vi.fn();
    const wrapper = fixture(request);
    try {
      await settlePopup();
      wrapper.vm.content!.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);
      pointer(wrapper.vm.trigger!, "pointerdown");
      pointer(wrapper.vm.content!, "pointerdown");
      expect(request).not.toHaveBeenCalled();
      const event = pointer(wrapper.get(".outside").element, "pointerdown");
      expect(request).toHaveBeenCalledExactlyOnceWith(false, "outside-press", event);
      expect(event.defaultPrevented).toBe(false);
      wrapper.vm.open = false;
      await settlePopup();
      pointer(wrapper.get(".outside").element, "pointerdown");
      expect(request).toHaveBeenCalledOnce();
    } finally { wrapper.unmount(); }
  });

  it("keeps SSR renders out of an existing client stack with DOM globals", async () => {
    const clientDismiss = vi.fn();
    const serverDismiss = vi.fn();
    const client = fixture(clientDismiss);
    const Server = defineComponent({
      setup() {
        const popup = usePopup({ kind: "popover", open: ref(true), content: ref(null), request: serverDismiss });
        return () => h("div", popup.contentAttrs.value, "Server popup");
      },
    });
    try {
      await settlePopup();
      const first = await renderToString(createSSRApp(Server));
      expect(await renderToString(createSSRApp(Server))).toBe(first);
      const event = escape();
      expect(clientDismiss).toHaveBeenCalledExactlyOnceWith(false, "escape-key", event);
      expect(serverDismiss).not.toHaveBeenCalled();
    } finally { client.unmount(); }
  });

  it("dismisses the top client popup and restores the previous owner on unmount", async () => {
    const firstDismiss = vi.fn();
    const secondDismiss = vi.fn();
    const first = fixture(firstDismiss);
    const second = fixture(secondDismiss);
    try {
      await settlePopup();
      escape();
      expect(secondDismiss).toHaveBeenCalledOnce();
      expect(firstDismiss).not.toHaveBeenCalled();
      second.unmount();
      escape();
      expect(firstDismiss).toHaveBeenCalledOnce();
    } finally {
      if (second.exists()) second.unmount();
      first.unmount();
    }
  });

  it("shares Escape ordering with public SDK layers", async () => {
    const dismiss = vi.fn();
    const wrapper = fixture(dismiss);
    const sdkContent = document.createElement("div");
    document.body.append(sdkContent);
    await settlePopup();
    const sdkDismiss = vi.fn();
    const stop = bindLayer(sdkContent, { onDismiss: sdkDismiss });
    try {
      escape();
      expect(sdkDismiss).toHaveBeenCalledOnce();
      expect(dismiss).not.toHaveBeenCalled();
      stop();
      const event = escape();
      expect(dismiss).toHaveBeenCalledExactlyOnceWith(false, "escape-key", event);
      expect(event.defaultPrevented).toBe(true);
    } finally {
      stop();
      wrapper.unmount();
      sdkContent.remove();
    }
  });

  it("ignores prevented Escape and removes a closed popup's dismissal owner", async () => {
    const dismiss = vi.fn();
    const wrapper = fixture(dismiss);
    try {
      await settlePopup();
      const prevented = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
      prevented.preventDefault();
      document.dispatchEvent(prevented);
      expect(dismiss).not.toHaveBeenCalled();
      wrapper.vm.open = false;
      await settlePopup();
      escape();
      expect(dismiss).not.toHaveBeenCalled();
    } finally { wrapper.unmount(); }
  });

  it("rebinds replaced content once and leaves no owner after close or unmount", async () => {
    const dismiss = vi.fn();
    const wrapper = fixture(dismiss);
    try {
      await settlePopup();
      const previous = wrapper.vm.content!;
      wrapper.vm.revision++;
      await settlePopup();
      expect(wrapper.vm.content).not.toBe(previous);
      expect(previous.isConnected).toBe(false);
      escape();
      expect(dismiss).toHaveBeenCalledOnce();
      wrapper.vm.open = false;
      await settlePopup();
      escape();
      expect(dismiss).toHaveBeenCalledOnce();
      wrapper.unmount();
      const pending = fixture(dismiss);
      pending.unmount();
      await settlePopup();
      escape();
      expect(dismiss).toHaveBeenCalledOnce();
    } finally { if (wrapper.exists()) wrapper.unmount(); }
  });

  it("does not dismiss an underlying popup when the top refuses or accepts the same Escape", async () => {
    const underlyingDismiss = vi.fn();
    const topDismiss = vi.fn();
    const underlying = fixture(underlyingDismiss);
    await settlePopup();
    let acceptClose = false;
    const top = fixture(topDismiss, () => acceptClose, underlying.vm.content!);
    try {
      await settlePopup();
      const refused = escape();
      expect(topDismiss).toHaveBeenCalledExactlyOnceWith(false, "escape-key", refused);
      expect(top.vm.open).toBe(true);
      expect(underlyingDismiss).not.toHaveBeenCalled();
      acceptClose = true;
      const accepted = escape();
      expect(topDismiss).toHaveBeenCalledTimes(2);
      expect(topDismiss).toHaveBeenLastCalledWith(false, "escape-key", accepted);
      expect(underlyingDismiss).not.toHaveBeenCalled();
      await settlePopup();
      expect(underlyingDismiss).not.toHaveBeenCalled();
      escape();
      expect(underlyingDismiss).toHaveBeenCalledOnce();
    } finally {
      top.unmount();
      underlying.unmount();
    }
  });
});
