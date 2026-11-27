import type { ChangeDetails } from "@ui-sdk/core";
import { createChange, createRovingFocus, createSelection, definePrimitive } from "@ui-sdk/core";
import { describe, expect, it, vi } from "vitest";

interface Options {
  value?: string[];
  onValueChange?: (value: string[], details: ChangeDetails<"press">) => void;
}

const collection = definePrimitive({
  name: "akaza-sdk-proof",
  options: { value: "list", onValueChange: "callback" },
  state: (options: Options) => ({ value: options.value ?? [], focused: null as string | null }),
  sync: options => options.value === undefined ? {} : { value: options.value },
  api: (context) => {
    const change = createChange(context);
    return {
      roving: createRovingFocus(context, { slot: "item", key: "focused", orientation: () => "horizontal" }),
      selection: createSelection(context, {
        key: "value",
        order: () => ["a", "b"],
        set: (value, details) => change("value", value, details),
      }),
    };
  },
  slots: slot => ({ item: slot<{ value: string }>({ props: { value: "string" } }) }),
});

describe("sdk public-only primitive proof", () => {
  it("supports per-instance state, subscriptions, controlled updates, and cancellation", () => {
    const canceled = vi.fn((_value, details: ChangeDetails<"press">) => details.cancel());
    const first = collection({ id: "first", value: ["a"], onValueChange: canceled });
    const second = collection({ id: "second" });
    const listener = vi.fn();
    const stop = second.subscribe(listener);
    try {
      first.api.selection.choose("b", { reason: "press" });
      expect(canceled).toHaveBeenCalledOnce();
      expect(first.get().value).toEqual(["a"]);
      second.api.selection.choose("b", { reason: "press" });
      expect(second.get().value).toEqual(["b"]);
      expect(listener).toHaveBeenCalled();
      expect(first.get().value).toEqual(["a"]);
      first.setOptions({ id: "first", value: ["b"], onValueChange: canceled });
      expect(first.get().value).toEqual(["b"]);
    } finally {
      stop();
      first.destroy();
      second.destroy();
    }
  });

  it("binds roving focus through public methods without a renderer import", async () => {
    const instance = collection({ id: "roving" });
    const first = document.createElement("button");
    const second = document.createElement("button");
    first.textContent = "A";
    second.textContent = "B";
    document.body.append(first, second);
    const cleanups = [
      instance.api.roving.bind(first, { key: "a", props: { value: "a" } }),
      instance.api.roving.bind(second, { key: "b", props: { value: "b" } }),
    ];
    try {
      await Promise.resolve();
      first.focus();
      const event = new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true });
      instance.api.roving.keydown(event, first);
      expect(document.activeElement).toBe(second);
      expect(event.defaultPrevented).toBe(true);
      expect(instance.get().focused).toBe("b");
    } finally {
      cleanups.forEach(cleanup => cleanup());
      instance.destroy();
      first.remove();
      second.remove();
    }
  });
});
