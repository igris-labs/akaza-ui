import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { usePointerDrag } from "@/composables/internal/sdk/usePointerDrag";
import { geometry, pointer, pointerFrames } from "./batch21b-pointer-fixture";

const cleanups: Array<() => void> = [];
let frame: () => Promise<void>;
beforeEach(() => { frame = pointerFrames(); });
afterEach(() => {
  cleanups.splice(0).reverse().forEach(cleanup => cleanup());
  vi.unstubAllGlobals();
});

function fixture() {
  const blocked = ref(false);
  const scope = effectScope();
  const drag = scope.run(() => usePointerDrag(() => blocked.value))!;
  const element = geometry(document.createElement("div"));
  document.body.append(element);
  const calls: Array<number | string> = [];
  const onMove = vi.fn((event: PointerEvent) => calls.push(event.clientX));
  const onEnd = vi.fn((_event: PointerEvent, canceled: boolean) => calls.push(canceled ? "cancel" : "end"));
  const start = (init: PointerEventInit = {}) => drag.start(element, new PointerEvent("pointerdown", init), { onMove, onEnd });
  cleanups.push(() => { scope.stop(); element.remove(); });
  return { blocked, scope, drag, element, calls, onMove, onEnd, start };
}

describe("batch21b SDK pointer ownership", () => {
  it("samples latest move per frame and includes newer pointerup coordinates once", async () => {
    const f = fixture();
    expect(f.start()).toBe(true);
    pointer(f.element, "pointermove", { clientX: 10 });
    pointer(f.element, "pointermove", { clientX: 20 });
    expect(f.calls).toEqual([]);
    await frame();
    expect(f.calls).toEqual([20]);
    pointer(document, "pointermove", { clientX: 30 });
    const up = pointer(document, "pointerup", { clientX: 40 });
    await nextTick();
    expect(f.calls).toEqual([20, 30, 40, "end"]);
    expect(f.onEnd).toHaveBeenCalledWith(up, false);
    expect(f.element.hasPointerCapture(7)).toBe(false);
    await frame();
    expect(f.calls).toEqual([20, 30, 40, "end"]);
  });

  it("ends an unmoved press without inventing a move and releases capture", async () => {
    const f = fixture();
    f.start();
    expect(f.element.hasPointerCapture(7)).toBe(true);
    pointer(f.element, "pointerup");
    await nextTick();
    expect(f.calls).toEqual(["end"]);
    expect(f.element.hasPointerCapture(7)).toBe(false);
    expect(f.drag.dragging.value).toBe(false);
  });

  it("rejects competing, secondary and non-primary presses and unrelated releases", async () => {
    const f = fixture();
    expect(f.start({ button: 2 })).toBe(false);
    expect(f.start({ isPrimary: false })).toBe(false);
    expect(f.element.setPointerCapture).not.toHaveBeenCalled();
    f.start({ pointerType: "touch" });
    expect(f.start({ pointerId: 8 })).toBe(false);
    pointer(document, "pointermove", { pointerId: 8, clientX: 99 });
    pointer(document, "pointerup", { pointerId: 8, clientX: 99 });
    await frame();
    expect(f.calls).toEqual([]);
    expect(f.drag.dragging.value).toBe(true);
    pointer(document, "pointerup", { pointerType: "touch" });
    await nextTick();
    expect(f.calls).toEqual(["end"]);
  });

  it.each(["pointercancel", "lostpointercapture"])("cancels once on %s without sampling its coordinates", async (type) => {
    const f = fixture();
    f.start({ pointerType: "touch" });
    pointer(f.element, "pointermove", { clientX: 20 });
    await frame();
    pointer(f.element, type, { clientX: 99 });
    pointer(document, "pointerup", { clientX: 99 });
    await nextTick();
    await frame();
    expect(f.calls).toEqual([20, "cancel"]);
    expect(f.onEnd).toHaveBeenCalledOnce();
    expect(f.element.hasPointerCapture(7)).toBe(false);
  });

  it.each(["cancel", "blocked", "dispose"])("drops queued moves, capture and deferred end on %s", async (action) => {
    const f = fixture();
    f.start();
    pointer(document, "pointermove", { clientX: 20 });
    if (action === "cancel") f.drag.cancel();
    else if (action === "blocked") f.blocked.value = true;
    else f.scope.stop();
    pointer(document, "pointerup", { clientX: 30 });
    await frame();
    expect(f.calls).toEqual([]);
    expect(f.element.hasPointerCapture(7)).toBe(false);
    expect(f.drag.dragging.value).toBe(false);
  });

  it("does not commit if blocked or disposed during the final model tick", async () => {
    const f = fixture();
    f.start();
    pointer(document, "pointerup", { clientX: 10 });
    f.blocked.value = true;
    await nextTick();
    expect(f.calls).toEqual([10]);
    f.blocked.value = false;
    f.start();
    pointer(document, "pointerup");
    f.scope.stop();
    await nextTick();
    expect(f.onEnd).not.toHaveBeenCalled();
  });
});
