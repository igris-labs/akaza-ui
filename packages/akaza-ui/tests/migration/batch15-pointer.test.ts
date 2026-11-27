import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { usePointerDrag } from "./batch15-pointer-fixture";

class TestPointerEvent extends MouseEvent {
  pointerId: number;
  pointerType: string;
  isPrimary: boolean;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, {
      bubbles: true,
      cancelable: true,
      buttons: type === "pointerup" || type === "pointercancel" ? 0 : 1,
      ...init,
    });
    this.pointerId = init.pointerId ?? 7;
    this.pointerType = init.pointerType ?? "mouse";
    this.isPrimary = init.isPrimary ?? true;
  }
}

const dispose: Array<() => void> = [];
let frames = new Map<number, FrameRequestCallback>();
let frameId = 0;

beforeEach(() => {
  frames = new Map();
  frameId = 0;
  vi.stubGlobal("PointerEvent", TestPointerEvent);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
});

afterEach(() => {
  dispose.splice(0).reverse().forEach(stop => stop());
  vi.unstubAllGlobals();
});

function frame() {
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach(callback => callback(16));
}

function fixture(threshold = 0, onStart?: () => boolean) {
  const blocked = ref(false);
  const scope = effectScope();
  const drag = scope.run(() => usePointerDrag(() => blocked.value))!;
  const element = document.createElement("div");
  document.body.append(element);
  const capture = new Set<number>();
  element.setPointerCapture = vi.fn(id => capture.add(id));
  element.releasePointerCapture = vi.fn(id => capture.delete(id));
  element.hasPointerCapture = id => capture.has(id);
  const calls: Array<string | number> = [];
  const onMove = vi.fn(sample => calls.push(sample.x));
  const onEnd = vi.fn((_event, canceled) => calls.push(canceled ? "cancel" : "end"));
  const start = (init: PointerEventInit = {}) => drag.start(element, new PointerEvent("pointerdown", init), {
    threshold, onStart, onMove, onEnd,
  });
  const send = (type: string, init: PointerEventInit = {}) => {
    const event = new PointerEvent(type, init);
    element.dispatchEvent(event);
    return event;
  };
  dispose.push(() => { scope.stop(); element.remove(); });
  return { blocked, scope, drag, element, calls, onMove, onEnd, start, send };
}

describe("batch15 public pointer capability probe", () => {
  it("coalesces moves and flushes the last move before release", () => {
    const f = fixture();
    expect(f.start()).toBe(true);
    f.send("pointermove", { clientX: 10 });
    f.send("pointermove", { clientX: 20 });
    expect(f.onMove).not.toHaveBeenCalled();
    frame();
    expect(f.calls).toEqual([20]);
    f.send("pointermove", { clientX: 30 });
    f.send("pointerup", { clientX: 30 });
    expect(f.calls).toEqual([20, 30, "end"]);
    expect(f.onEnd).toHaveBeenCalledOnce();
    expect(f.drag.dragging.value).toBe(false);
    frame();
    expect(f.calls).toEqual([20, 30, "end"]);
  });

  it("ends a below-threshold or unmoved press without inventing a move", () => {
    const f = fixture(8);
    f.start();
    f.send("pointermove", { clientX: 2 });
    frame();
    f.send("pointerup", { clientX: 2 });
    expect(f.calls).toEqual(["end"]);
    f.start();
    f.send("pointerup");
    expect(f.calls).toEqual(["end", "end"]);
  });

  it("keeps one pointer owner and reports pointercancel once for touch", () => {
    const f = fixture();
    f.start({ pointerType: "touch" });
    expect(f.start({ pointerId: 8 })).toBe(false);
    f.send("pointermove", { pointerId: 8, clientX: 99 });
    f.send("pointerup", { pointerId: 8 });
    expect(f.drag.dragging.value).toBe(true);
    expect(f.calls).toEqual([]);
    f.send("pointercancel", { pointerType: "touch" });
    f.send("pointerup");
    expect(f.calls).toEqual(["cancel"]);
  });

  it.each(["cancel", "blocked", "dispose"])("silently tears down queued work on %s", (action) => {
    const f = fixture();
    f.start();
    f.send("pointermove", { clientX: 10 });
    if (action === "cancel") f.drag.cancel();
    else if (action === "blocked") f.blocked.value = true;
    else f.scope.stop();
    frame();
    f.send("pointerup", { clientX: 10 });
    expect(f.calls).toEqual([]);
    expect(f.drag.dragging.value).toBe(false);
  });

  it("rejects blocked, secondary and non-primary presses", () => {
    const f = fixture();
    expect(f.start({ button: 2 })).toBe(false);
    expect(f.start({ isPrimary: false })).toBe(false);
    f.blocked.value = true;
    expect(f.start()).toBe(false);
    expect(f.drag.dragging.value).toBe(false);
    expect(f.element.setPointerCapture).not.toHaveBeenCalled();
  });

  it("rejects threshold start without leaving the adapter active", () => {
    const f = fixture(3, () => false);
    f.start();
    f.send("pointermove", { clientX: 10 });
    frame();
    f.send("pointerup", { clientX: 10 });
    expect(f.calls).toEqual([]);
    expect(f.drag.dragging.value).toBe(false);
  });
});
