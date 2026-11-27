import type { ChangeDetails, ReorderDraft, ReorderOrientation, ReorderReason } from "@ui-sdk/core";
import { bindDrag, createChange, createReorder, definePrimitive } from "@ui-sdk/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface Options {
  orientation?: ReorderOrientation;
  value?: string[];
  onValueChange?: (value: string[], details: ChangeDetails<ReorderReason>) => void;
}

const sortable = definePrimitive({
  name: "akaza-batch16-reorder-proof",
  options: { value: "list", onValueChange: "callback", orientation: "string" },
  controlled: ["value"],
  state: (options: Options) => ({ value: options.value ?? ["a", "b", "c"], moving: null as ReorderDraft | null }),
  sync: options => options.value === undefined ? {} : { value: options.value },
  api: (context) => {
    const change = createChange(context);
    return createReorder(context, {
      slot: "item",
      key: "value",
      draft: "moving",
      orientation: () => context.options().orientation ?? "vertical",
      set: (value, details) => change("value", value, details),
      message: () => "",
      createAutoScroll: false,
    });
  },
  slots: slot => ({ item: slot<{ value: string }>({ props: { value: "string" } }) }),
});

class PointerEvent extends MouseEvent {
  pointerId = 16;
  pointerType = "mouse";
  isPrimary = true;
}

function pointer(type: string, x: number, y = 0) {
  return new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, buttons: type === "pointerup" ? 0 : 1, clientX: x, clientY: y }) as globalThis.PointerEvent;
}

const cleanups: Array<() => void> = [];

beforeEach(() => vi.stubGlobal("PointerEvent", PointerEvent));

function instance(options: Options = {}) {
  const value = sortable({ id: "batch16", ...options });
  const items = ["a", "b", "c"].map((key, index) => {
    const element = document.createElement("button");
    element.textContent = key;
    element.getBoundingClientRect = () => options.orientation === "horizontal"
      ? new DOMRect(index * 40, 0, 40, 100)
      : new DOMRect(0, index * 40, 100, 40);
    document.body.append(element);
    const unbind = value.api.bind(element, { key, props: { value: key } });
    cleanups.push(() => { unbind(); element.remove(); });
    return element;
  });
  cleanups.unshift(() => value.destroy());
  return { value, items };
}

afterEach(() => {
  cleanups.splice(0).reverse().forEach(cleanup => cleanup());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("batch 16 public SDK compatibility evidence", () => {
  it("keeps changes draft-only until drop and passes its event to the sole commit", () => {
    const changed = vi.fn();
    const { value } = instance({ onValueChange: changed });
    expect(value.api.grab("a")).toBe(true);
    value.api.moveTo(2);
    expect(changed).not.toHaveBeenCalled();
    expect(value.get().value).toEqual(["a", "b", "c"]);
    expect(value.api.order(value.get())).toEqual(["b", "c", "a"]);
    const release = new KeyboardEvent("keydown", { key: "Enter", cancelable: true });
    value.api.drop(release);
    expect(changed).toHaveBeenCalledExactlyOnceWith(["b", "c", "a"], expect.objectContaining({ event: release }));
    expect(value.get().value).toEqual(["b", "c", "a"]);
  });

  it("retains an optimistic rendered draft after a controlled parent refuses the drop", () => {
    const changed = vi.fn();
    const { value } = instance({ value: ["a", "b", "c"], onValueChange: changed });
    value.api.grab("a");
    value.api.moveTo(2);
    value.api.drop(new KeyboardEvent("keydown", { key: "Enter", cancelable: true }));
    expect(changed).toHaveBeenCalledOnce();
    expect(value.get().value).toEqual(["a", "b", "c"]);
    expect(value.api.order(value.get())).toEqual(["b", "c", "a"]);
    expect(value.get().moving).not.toBeNull();
  });

  it("honors synchronous cancellation without changing the committed or rendered order", () => {
    const changed = vi.fn((_value, details: ChangeDetails<ReorderReason>) => details.cancel());
    const { value } = instance({ value: ["a", "b", "c"], onValueChange: changed });
    value.api.grab("a");
    value.api.moveTo(2);
    value.api.drop();
    expect(changed).toHaveBeenCalledOnce();
    expect(value.get().moving).toBeNull();
    expect(value.api.order(value.get())).toEqual(["a", "b", "c"]);
  });

  it("requires keyboard pickup before arrows, unlike DataTable's immediate arrow moves", () => {
    const { value } = instance();
    expect(value.api.keydown(new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true }), "a")).toBe(false);
    expect(value.get().moving).toBeNull();
    expect(value.api.keydown(new KeyboardEvent("keydown", { key: " ", cancelable: true }), "a")).toBe(true);
    value.api.keydown(new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true }), "a");
    expect(value.get().value).toEqual(["a", "b", "c"]);
    expect(value.api.order(value.get())).toEqual(["b", "a", "c"]);
    value.api.keydown(new KeyboardEvent("keydown", { key: "Escape", cancelable: true }), "a");
    expect(value.api.order(value.get())).toEqual(["a", "b", "c"]);
  });

  it("does not pick up a one-pixel pointer move, unlike DataTable's element hit testing", () => {
    const changed = vi.fn();
    const { value, items } = instance({ onValueChange: changed });
    value.api.pointerdown(pointer("pointerdown", 0, 39), "a");
    items[0]!.dispatchEvent(pointer("pointermove", 0, 40));
    expect(value.get().moving).toBeNull();
    items[0]!.dispatchEvent(pointer("pointerup", 0, 40));
    expect(changed).not.toHaveBeenCalled();
  });

  it("pointer tracking commits once on release, never during a move", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const changed = vi.fn();
    const { value, items } = instance({ onValueChange: changed });
    value.api.pointerdown(pointer("pointerdown", 0, 20), "a");
    items[0]!.dispatchEvent(pointer("pointermove", 0, 110));
    frames.splice(0).forEach(callback => callback(16));
    expect(changed).not.toHaveBeenCalled();
    expect(value.get().value).toEqual(["a", "b", "c"]);
    expect(value.get().moving?.pointer).toBe(true);
    const release = pointer("pointerup", 0, 110);
    items[0]!.dispatchEvent(release);
    expect(changed).toHaveBeenCalledExactlyOnceWith(["b", "c", "a"], expect.objectContaining({ reason: "drag", event: release }));
    items[0]!.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });

  it.each([
    { orientation: "vertical" as const, sampled: false },
    { orientation: "vertical" as const, sampled: true },
    { orientation: "horizontal" as const, sampled: false },
    { orientation: "horizontal" as const, sampled: true },
  ])("native $orientation pointerdown retains the last-move destination instead of pointerup, frame sampled=$sampled", ({ orientation, sampled }) => {
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    const changed = vi.fn();
    const { value, items } = instance({ orientation, onValueChange: changed });
    const at = (type: string, position: number) => orientation === "horizontal"
      ? pointer(type, position, 0)
      : pointer(type, 0, position);
    value.api.pointerdown(at("pointerdown", 20), "a");
    items[0]!.dispatchEvent(at("pointermove", 65));
    if (sampled) {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback(16));
    }
    expect(changed).not.toHaveBeenCalled();
    const release = at("pointerup", 110);
    items[0]!.dispatchEvent(release);
    // Release position 110 crosses c's midpoint; DataTable requires [b, c, a], not the SDK's stale destination.
    expect(changed).toHaveBeenCalledExactlyOnceWith(["b", "a", "c"], expect.objectContaining({ reason: "drag", event: release }));
    expect(value.get().value).toEqual(["b", "a", "c"]);
    expect(value.get().value).not.toEqual(["b", "c", "a"]);
    items[0]!.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });

  it("bindDrag batches two synchronous moves into the latest release-flushed callback", () => {
    const element = document.createElement("span");
    document.body.append(element);
    const moves = vi.fn();
    const end = vi.fn();
    const frames = new Map<number, FrameRequestCallback>();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(frames.size + 1, callback); return frames.size; });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    const stop = bindDrag(element, pointer("pointerdown", 0), {
      threshold: 0,
      onMove: sample => moves(sample.x, sample.event),
      onEnd: end,
    });
    cleanups.push(() => { stop(); element.remove(); });
    element.dispatchEvent(pointer("pointermove", 10));
    const latest = pointer("pointermove", 20);
    element.dispatchEvent(latest);
    expect(moves).not.toHaveBeenCalled();
    const release = pointer("pointerup", 20);
    element.dispatchEvent(release);
    expect(moves).toHaveBeenCalledExactlyOnceWith(20, latest);
    expect(end).toHaveBeenCalledExactlyOnceWith(release, false);
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    const clicked = vi.fn();
    element.addEventListener("click", clicked);
    element.dispatchEvent(click);
    expect(clicked).not.toHaveBeenCalled();
    expect(click.defaultPrevented).toBe(true);
  });
});
