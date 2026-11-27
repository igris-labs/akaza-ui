import { vi } from "vitest";
import { nextTick } from "vue";

class TestPointerEvent extends MouseEvent {
  readonly pointerId: number;
  readonly pointerType: string;
  readonly isPrimary: boolean;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, {
      bubbles: true,
      cancelable: true,
      buttons: ["pointerup", "pointercancel", "lostpointercapture"].includes(type) ? 0 : 1,
      ...init,
    });
    this.pointerId = init.pointerId ?? 7;
    this.pointerType = init.pointerType ?? "mouse";
    this.isPrimary = init.isPrimary ?? true;
  }
}

export function pointerFrames() {
  let id = 0;
  const frames = new Map<number, FrameRequestCallback>();
  vi.stubGlobal("PointerEvent", TestPointerEvent);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  return async () => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback(performance.now()));
    await nextTick();
  };
}

export function pointer(element: EventTarget, type: string, init: PointerEventInit = {}) {
  const event = new PointerEvent(type, init);
  element.dispatchEvent(event);
  return event;
}

export function geometry(element: Element) {
  element.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100, toJSON: () => ({}),
  });
  const captured = new Set<number>();
  const target = element as HTMLElement;
  target.setPointerCapture = vi.fn(id => captured.add(id));
  target.hasPointerCapture = id => captured.has(id);
  target.releasePointerCapture = vi.fn((id) => {
    if (!captured.delete(id)) return;
    // Native lostpointercapture follows release, not a second pointerup.
    queueMicrotask(() => pointer(target, "lostpointercapture", { pointerId: id }));
  });
  return target;
}
