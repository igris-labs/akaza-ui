import { bindDrag } from "@ui-sdk/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, watch } from "vue";
import { usePointerDrag } from "@/composables/internal/sdk/usePointerDrag";
import { geometry, pointer, pointerFrames } from "./batch21b-pointer-fixture";

const cleanups: Array<() => void> = [];
let frame: () => Promise<void>;
beforeEach(() => { frame = pointerFrames(); });
afterEach(() => {
  cleanups.splice(0).reverse().forEach(cleanup => cleanup());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function fixture(threshold = 0) {
  const element = geometry(document.createElement("div"));
  document.body.append(element);
  const calls: Array<number | string> = [];
  const move = vi.fn((sample) => calls.push(sample.x));
  const end = vi.fn((_event: PointerEvent, canceled: boolean) => calls.push(canceled ? "cancel" : "end"));
  const stop = bindDrag(element, new PointerEvent("pointerdown", { clientX: 0, clientY: 0 }), {
    threshold,
    onMove: move,
    onEnd: end,
  });
  cleanups.push(() => { stop(); element.remove(); });
  return { element, calls, move, end, stop };
}

describe("batch22b public SDK pointer lifecycle", () => {
  it.each([false, true])("flushes the last move but leaves a newer release to the consumer, previous frame sampled=%s", async (sampled) => {
    const f = fixture();
    pointer(document, "pointermove", { clientX: 10 });
    pointer(document, "pointermove", { clientX: 20 });
    expect(f.calls).toEqual([]);
    if (sampled) await frame();
    const latest = pointer(document, "pointermove", { clientX: 30 });
    const release = pointer(document, "pointerup", { clientX: 40 });
    expect(f.calls).toEqual(sampled ? [20, 30, "end"] : [30, "end"]);
    expect(f.move.mock.calls.at(-1)![0].event).toBe(latest);
    expect(f.end).toHaveBeenCalledExactlyOnceWith(release, false);
    expect(f.element.hasPointerCapture(7)).toBe(false);
    const count = f.calls.length;
    await frame();
    expect(f.calls).toHaveLength(count);
  });

  it("reports a newer release without sampling it when there were no move events", async () => {
    const moved = fixture();
    const release = pointer(document, "pointerup", { clientX: 25 });
    expect(moved.calls).toEqual(["end"]);
    expect(moved.move).not.toHaveBeenCalled();
    expect(moved.end).toHaveBeenCalledExactlyOnceWith(release, false);
    const unmoved = fixture();
    pointer(document, "pointerup");
    expect(unmoved.calls).toEqual(["end"]);
    await frame();
    expect(unmoved.calls).toEqual(["end"]);
  });

  it("keeps a release below the configured threshold as a press", async () => {
    const f = fixture(8);
    pointer(document, "pointermove", { clientX: 2 });
    await frame();
    pointer(document, "pointerup", { clientX: 3 });
    expect(f.calls).toEqual(["end"]);
    expect(f.element.hasPointerCapture(7)).toBe(false);
  });

  it("ends pointercancel once without applying cancel coordinates", async () => {
    const f = fixture();
    expect(f.element.hasPointerCapture(7)).toBe(true);
    pointer(document, "pointermove", { clientX: 20 });
    await frame();
    const cancel = pointer(f.element, "pointercancel", { clientX: 99 });
    pointer(document, "pointerup", { clientX: 99 });
    await frame();
    expect(f.calls).toEqual([20, "cancel"]);
    expect(f.end).toHaveBeenCalledExactlyOnceWith(cancel, true);
    expect(f.element.hasPointerCapture(7)).toBe(false);
  });

  it("does not cancel on native capture loss, so the consumer must stop the drag", async () => {
    const f = fixture();
    pointer(document, "pointermove", { clientX: 20 });
    await frame();
    f.element.releasePointerCapture(7);
    await frame();
    expect(f.element.hasPointerCapture(7)).toBe(false);
    expect(f.end).not.toHaveBeenCalled();
    expect(f.calls).toEqual([20]);
    const release = pointer(document, "pointerup", { clientX: 99 });
    expect(f.calls).toEqual([20, "end"]);
    expect(f.end).toHaveBeenCalledExactlyOnceWith(release, false);
  });

  it("ignores another pointer's capture loss, move and release", async () => {
    const f = fixture();
    pointer(f.element, "lostpointercapture", { pointerId: 8 });
    pointer(document, "pointermove", { pointerId: 8, clientX: 99 });
    pointer(document, "pointerup", { pointerId: 8, clientX: 99 });
    await frame();
    expect(f.calls).toEqual([]);
    expect(f.element.hasPointerCapture(7)).toBe(true);
    pointer(document, "pointerup");
    expect(f.calls).toEqual(["end"]);
  });

  it("cleanup silently discards queued movement and releases capture", async () => {
    const f = fixture();
    pointer(document, "pointermove", { clientX: 20 });
    f.stop();
    f.stop();
    pointer(document, "pointerup", { clientX: 30 });
    await frame();
    expect(f.calls).toEqual([]);
    expect(f.element.hasPointerCapture(7)).toBe(false);
    expect(f.element.releasePointerCapture).toHaveBeenCalledOnce();
  });
});

function adapterFixture() {
  const blocked = ref(false);
  const proposed = ref(0);
  const accepted = ref(0);
  const scope = effectScope();
  const drag = scope.run(() => {
    watch(proposed, value => { accepted.value = value / 2; });
    return usePointerDrag(() => blocked.value);
  })!;
  const element = geometry(document.createElement("div"));
  document.body.append(element);
  const calls: Array<number | string> = [];
  const move = vi.fn((event: PointerEvent) => { calls.push(event.clientX); proposed.value = event.clientX; });
  const end = vi.fn((_event: PointerEvent, canceled: boolean) => calls.push(canceled ? "cancel" : "end"));
  const start = () => drag.start(element, new PointerEvent("pointerdown"), { onMove: move, onEnd: end });
  cleanups.push(() => { scope.stop(); element.remove(); });
  return { blocked, proposed, accepted, scope, drag, element, calls, move, end, start };
}

describe("batch22b required Vue pointer outcomes", () => {
  it.each([false, true])("preserves the newest release and commits once after model acceptance, previous frame sampled=%s", async (sampled) => {
    const f = adapterFixture();
    f.start();
    pointer(document, "pointermove", { clientX: 20 });
    if (sampled) await frame();
    pointer(document, "pointermove", { clientX: 30 });
    const release = pointer(document, "pointerup", { clientX: 40 });
    expect(f.calls).toEqual(sampled ? [20, 30, 40] : [30, 40]);
    expect(f.move.mock.calls.at(-1)![0]).toBe(release);
    expect(f.end).not.toHaveBeenCalled();
    await nextTick();
    expect(f.accepted.value).toBe(20);
    expect(f.end).toHaveBeenCalledExactlyOnceWith(release, false);
    expect(f.element.hasPointerCapture(7)).toBe(false);
    await frame();
    expect(f.end).toHaveBeenCalledOnce();
    expect(f.calls.filter(value => value === 40)).toHaveLength(1);
  });

  it("uses the release when no pointermove occurred and never samples an unmoved press", async () => {
    const f = adapterFixture();
    f.start();
    const release = pointer(document, "pointerup", { clientX: 25 });
    expect(f.calls).toEqual([25]);
    await nextTick();
    expect(f.calls).toEqual([25, "end"]);
    expect(f.end).toHaveBeenCalledExactlyOnceWith(release, false);
    const unmoved = adapterFixture();
    unmoved.start();
    pointer(document, "pointerup");
    await frame();
    expect(unmoved.calls).toEqual(["end"]);
  });

  it("does not resample matching release coordinates or double-end on native lost capture", async () => {
    const f = adapterFixture();
    f.start();
    pointer(document, "pointermove", { clientX: 20 });
    pointer(document, "pointerup", { clientX: 20 });
    await frame();
    expect(f.calls).toEqual([20, "end"]);
    expect(f.end).toHaveBeenCalledOnce();
    expect(f.element.releasePointerCapture).toHaveBeenCalledOnce();
  });

  it("cancels once on native capture loss and discards queued and subsequent moves", async () => {
    const f = adapterFixture();
    f.start();
    pointer(document, "pointermove", { clientX: 20 });
    f.element.releasePointerCapture(7);
    await nextTick();
    pointer(document, "pointermove", { clientX: 99 });
    pointer(document, "pointerup", { clientX: 99 });
    await frame();
    expect(f.calls).toEqual(["cancel"]);
    expect(f.end).toHaveBeenCalledOnce();
    expect(f.end.mock.calls[0]![0].type).toBe("lostpointercapture");
    expect(f.end.mock.calls[0]![1]).toBe(true);
    expect(f.drag.dragging.value).toBe(false);
  });

  it.each(["cancel", "blocked", "dispose"])("silently tears down the pending acceptance tick on %s", async (action) => {
    const f = adapterFixture();
    f.start();
    pointer(document, "pointerup", { clientX: 25 });
    if (action === "cancel") f.drag.cancel();
    else if (action === "blocked") f.blocked.value = true;
    else f.scope.stop();
    await frame();
    expect(f.calls).toEqual([25]);
    expect(f.end).not.toHaveBeenCalled();
    expect(f.element.hasPointerCapture(7)).toBe(false);
    expect(f.drag.dragging.value).toBe(false);
  });
});
