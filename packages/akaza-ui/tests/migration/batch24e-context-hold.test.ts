import type { AkazaChangeEventDetails } from "@/types";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { ContextMenu } from "@/components/context-menu";
import { installPopupTestEnvironment } from "../components/popover/popupTestEnvironment";

enableAutoUnmount(afterEach);
installPopupTestEnvironment();
beforeEach(() => {
  vi.stubGlobal("PointerEvent", class extends MouseEvent {
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "touch";
      this.isPrimary = init.isPrimary ?? true;
    }
  });
});
afterEach(() => { vi.useRealTimers(); });

async function fixture(props = {}) {
  const wrapper = mount(ContextMenu, {
    attachTo: document.body,
    props: { items: [{ value: "copy", label: "Copy" }], teleport: false, longPressDelay: 100, ...props },
    slots: { default: '<button class="surface">File actions</button>' },
  });
  await nextTick();
  vi.useFakeTimers();
  const target = wrapper.get(".surface").element;
  const pointer = (type: string, init: PointerEventInit = {}, element: EventTarget = target) => {
    const event = new PointerEvent(type, {
      bubbles: true, cancelable: true, buttons: 1, button: 0, pointerType: "touch",
      clientX: 40, clientY: 50, pointerId: 1, isPrimary: true, ...init,
    });
    element.dispatchEvent(event);
    return event;
  };
  return { wrapper, target, pointer };
}

describe("contextMenu SDK hold ownership", () => {
  it.each(["touch", "pen"])("opens once after a %s hold with the original pointer event", async (pointerType) => {
    const { wrapper, pointer } = await fixture();
    const event = pointer("pointerdown", { pointerType });
    await vi.advanceTimersByTimeAsync(99);
    expect(wrapper.emitted("open-change")).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(wrapper.emitted("open-change")).toHaveLength(1);
    expect(wrapper.emitted("open-change")![0]).toEqual([true, expect.objectContaining({ reason: "long-press", event })]);
    expect(wrapper.get(".akaza-context-menu-root").attributes("data-akaza-state")).toBe("open");
    pointer("pointerup", { buttons: 0, pointerType });
    await vi.advanceTimersByTimeAsync(500);
    expect(wrapper.emitted("open-change")).toHaveLength(1);
  });

  it.each(["pointerup", "pointercancel", "move", "blur", "escape"])("cancels a pending hold on %s", async (reason) => {
    const { wrapper, pointer } = await fixture();
    pointer("pointerdown");
    if (reason === "move") pointer("pointermove", { clientX: 52 }, document);
    else if (reason === "blur") window.dispatchEvent(new Event("blur"));
    else if (reason === "escape") document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    else pointer(reason, { buttons: 0 }, document);
    await vi.advanceTimersByTimeAsync(200);
    expect(wrapper.emitted("open-change")).toBeUndefined();
    expect(wrapper.get(".akaza-context-menu-root").attributes("data-akaza-state")).toBe("closed");
  });

  it("does not turn a mouse hold or Space into a long press", async () => {
    const { wrapper, pointer, target } = await fixture();
    pointer("pointerdown", { pointerType: "mouse" });
    target.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
    await vi.advanceTimersByTimeAsync(200);
    expect(wrapper.emitted("open-change")).toBeUndefined();
  });

  it.each(["canceled", "refused"])("keeps a %s hold closed without a second open proposal", async (policy) => {
    const { wrapper, pointer } = await fixture({
      modelValue: false,
      "onUpdate:modelValue": vi.fn(),
      ...(policy === "canceled" ? { onOpenChange: (_open: boolean, details: AkazaChangeEventDetails) => details.cancel() } : {}),
    });
    pointer("pointerdown");
    await vi.advanceTimersByTimeAsync(100);
    pointer("pointerup", { buttons: 0 });
    await flushPromises();
    expect(wrapper.emitted("open-change")).toHaveLength(1);
    expect(wrapper.get(".akaza-context-menu-root").attributes("data-akaza-state")).toBe("closed");
  });

  it("rebinds a changed delay and stops pending work on disable or unmount", async () => {
    const { wrapper, pointer } = await fixture();
    pointer("pointerdown");
    await wrapper.setProps({ longPressDelay: 200 });
    await vi.advanceTimersByTimeAsync(100);
    expect(wrapper.emitted("open-change")).toBeUndefined();
    pointer("pointerdown");
    await wrapper.setProps({ disabled: true });
    await vi.advanceTimersByTimeAsync(200);
    expect(wrapper.emitted("open-change")).toBeUndefined();
    await wrapper.setProps({ disabled: false });
    pointer("pointerdown");
    wrapper.unmount();
    await vi.advanceTimersByTimeAsync(200);
    expect(wrapper.emitted("open-change")).toBeUndefined();
  });
});
