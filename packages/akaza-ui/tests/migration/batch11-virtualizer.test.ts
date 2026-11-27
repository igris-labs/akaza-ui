import { createVirtualizer } from "@ui-sdk/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, shallowRef } from "vue";
import { useCollectionVirtualizer } from "@/composables/internal/sdk/useCollectionVirtualizer";

const disposals: (() => void)[] = [];
afterEach(() => {
  disposals.splice(0).reverse().forEach(dispose => dispose());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function scroller(height = 80) {
  const element = document.createElement("div");
  Object.defineProperty(element, "clientHeight", { value: height, configurable: true });
  const scrollTo = vi.fn((options: ScrollToOptions) => {
    element.scrollTop = options.top ?? 0;
    element.dispatchEvent(new Event("scroll"));
  });
  element.scrollTo = scrollTo;
  return { element, scrollTo };
}

function candidate(count = 100, overscan = 2) {
  const scope = effectScope();
  disposals.push(() => scope.stop());
  const rows = ref(Array.from({ length: count }, (_, id) => ({ id: String(id), disabled: false })));
  const height = shallowRef(20);
  const scan = shallowRef(overscan);
  const enabled = shallowRef(true);
  const viewport = shallowRef<HTMLElement | null>(null);
  const sdk = scope.run(() => useCollectionVirtualizer({
    rows: () => rows.value, key: row => row.id, itemHeight: () => height.value,
    overscan: () => scan.value, enabled: () => enabled.value, viewport,
  }))!;
  return { scope, rows, height, scan, enabled, viewport, sdk };
}

describe("sdk collection virtualizer", () => {
  it("renders bounded SDK windows before and after connecting without implicit scrolling", async () => {
    const { sdk, viewport } = candidate();
    expect(sdk.rows.value.length).toBeGreaterThan(0);
    expect(sdk.rows.value.length).toBeLessThanOrEqual(5);
    expect(sdk.rows.value[0]!.index).toBe(0);
    const sdkScroller = scroller();
    viewport.value = sdkScroller.element;
    await nextTick();
    expect(sdk.rows.value.length).toBeGreaterThanOrEqual(4);
    expect(sdk.rows.value.length).toBeLessThanOrEqual(8);
    expect(sdk.rows.value.some(row => row.index === 3)).toBe(true);
    expect(sdk.size.value).toBe(2000);
    expect(sdkScroller.scrollTo).not.toHaveBeenCalled();
  });

  it.each([0, 2, 5])("bounds fixed-height rows and overscan=%i after a manual scroll", async (overscan) => {
    const { sdk, viewport } = candidate(10_000, overscan);
    const { element, scrollTo } = scroller();
    viewport.value = element;
    await nextTick();
    element.scrollTop = 400;
    element.dispatchEvent(new Event("wheel"));
    element.dispatchEvent(new Event("scroll"));
    await nextTick();
    expect(sdk.rows.value.length).toBeLessThanOrEqual(5 + 2 * overscan);
    expect([20, 21, 22, 23].every(index => sdk.rows.value.some(row => row.index === index))).toBe(true);
    expect(sdk.rows.value.every(row => row.start === row.index * 20 && row.size === 20)).toBe(true);
    expect(sdk.size.value).toBe(200_000);
    expect(element.scrollTop).toBe(400);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("updates overscan and toggles its connection without changing the manual offset", async () => {
    const { sdk, viewport, scan, enabled } = candidate();
    const { element, scrollTo } = scroller();
    const remove = vi.spyOn(element, "removeEventListener");
    viewport.value = element;
    await nextTick();
    element.scrollTop = 400;
    element.dispatchEvent(new Event("scroll"));
    await nextTick();
    const narrow = sdk.rows.value.length;
    scan.value = 5;
    await nextTick();
    expect(sdk.rows.value.length).toBeGreaterThan(narrow);
    expect(sdk.rows.value.length).toBeLessThanOrEqual(15);
    expect(sdk.wrapperStyle.value).toEqual({
      height: `${2000 - sdk.rows.value[0]!.start}px`, marginTop: `${sdk.rows.value[0]!.start}px`,
    });
    enabled.value = false;
    await nextTick();
    expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(true);
    const disconnected = sdk.rows.value;
    element.scrollTop = 800;
    element.dispatchEvent(new Event("scroll"));
    await nextTick();
    expect(sdk.rows.value).toBe(disconnected);
    enabled.value = true;
    await nextTick();
    expect(sdk.rows.value.some(row => row.index === 40)).toBe(true);
    expect(element.scrollTop).toBe(800);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("uses explicit start alignment; SDK default auto is a different scroll contract", async () => {
    const { sdk, viewport } = candidate();
    const { element } = scroller();
    viewport.value = element;
    await nextTick();
    sdk.scrollTo(20);
    await nextTick();
    expect(element.scrollTop).toBe(400);
    expect(sdk.rows.value.some(row => row.index === 20)).toBe(true);
    const autoScroller = scroller();
    const virtual = createVirtualizer({ count: () => 100, estimate: () => 20, overscan: 2 });
    const disconnect = virtual.connect(autoScroller.element);
    disposals.push(disconnect);
    virtual.scrollToIndex(20);
    expect(autoScroller.element.scrollTop).toBe(340);
  });

  it("updates keys after filtering, reorder, in-place lazy growth and height changes without scrolling", async () => {
    const { sdk, rows, height, viewport } = candidate(6);
    const { element, scrollTo } = scroller();
    viewport.value = element;
    await nextTick();
    rows.value = rows.value.filter(row => Number(row.id) % 2 === 0).reverse();
    await nextTick();
    expect(sdk.rows.value.map(row => row.key)).toEqual(["4", "2", "0"]);
    rows.value.push({ id: "lazy-child", disabled: true });
    await nextTick();
    expect(sdk.rows.value.map(row => row.key)).toEqual(["4", "2", "0", "lazy-child"]);
    expect(sdk.rows.value.at(-1)!.data.disabled).toBe(true);
    height.value = 36;
    await nextTick();
    expect(sdk.size.value).toBe(144);
    expect(sdk.rows.value.every(row => row.start === row.index * 36)).toBe(true);
    rows.value = [];
    await nextTick();
    expect(sdk.rows.value).toEqual([]);
    expect(sdk.size.value).toBe(0);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("never returns removed data after shrinking at a distant scroll position", async () => {
    const { sdk, rows, viewport } = candidate();
    const { element, scrollTo } = scroller();
    viewport.value = element;
    await nextTick();
    element.scrollTop = 1400;
    element.dispatchEvent(new Event("scroll"));
    await nextTick();
    rows.value = rows.value.slice(0, 3);
    await nextTick();
    expect(sdk.rows.value.map(row => row.key)).toEqual(["0", "1", "2"]);
    expect(sdk.rows.value.every(row => row.index < 3 && row.data !== undefined)).toBe(true);
    expect(sdk.size.value).toBe(60);
    expect(scrollTo).not.toHaveBeenCalled();
    element.scrollTop = 0;
    element.dispatchEvent(new Event("scroll"));
    await nextTick();
    expect(sdk.rows.value.map(row => row.key)).toEqual(["0", "1", "2"]);
  });

  it("updates total size when offscreen rows change without changing the rendered window", async () => {
    const { sdk, rows, viewport } = candidate();
    const { element, scrollTo } = scroller();
    viewport.value = element;
    await nextTick();
    const indexes = sdk.rows.value.map(row => row.index);
    expect(sdk.size.value).toBe(2000);
    expect(sdk.wrapperStyle.value.height).toBe("2000px");
    rows.value.push({ id: "offscreen", disabled: false });
    await nextTick();
    expect(sdk.rows.value.map(row => row.index)).toEqual(indexes);
    expect(sdk.size.value).toBe(2020);
    expect(sdk.wrapperStyle.value.height).toBe("2020px");
    rows.value.splice(90);
    await nextTick();
    expect(sdk.rows.value.map(row => row.index)).toEqual(indexes);
    expect(sdk.size.value).toBe(1800);
    expect(sdk.wrapperStyle.value.height).toBe("1800px");
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("updates the window on SDK viewport resize without aligning its offset", async () => {
    const callbacks: (() => void)[] = [];
    vi.stubGlobal("ResizeObserver", class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(callback: () => void) { callbacks.push(callback); }
    });
    const { sdk, viewport } = candidate(10_000);
    const { element, scrollTo } = scroller();
    viewport.value = element;
    await nextTick();
    element.scrollTop = 400;
    element.dispatchEvent(new Event("scroll"));
    await nextTick();
    const before = sdk.rows.value.length;
    Object.defineProperty(element, "clientHeight", { value: 240 });
    expect(callbacks).toHaveLength(1);
    callbacks[0]!();
    await nextTick();
    expect(sdk.rows.value.length).toBeGreaterThan(before);
    expect(sdk.rows.value.length).toBeLessThanOrEqual(12 + 2 * 2 + 1);
    expect(Array.from({ length: 12 }, (_, index) => index + 20).every(index => sdk.rows.value.some(row => row.index === index))).toBe(true);
    expect(element.scrollTop).toBe(400);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("refreshes data without any DOM connection or scroll effects", async () => {
    const { sdk, rows } = candidate(100);
    const initial = sdk.rows.value;
    expect(initial.length).toBeGreaterThan(0);
    expect(initial.length).toBeLessThanOrEqual(5);
    sdk.scrollTo(90);
    expect(sdk.rows.value).toBe(initial);
    rows.value = [];
    await nextTick();
    expect(sdk.rows.value).toEqual([]);
    expect(sdk.size.value).toBe(0);
  });

  it("disconnects old refs, observers and subscriptions on scope disposal", async () => {
    const observers: { callback: () => void; disconnect: ReturnType<typeof vi.fn> }[] = [];
    vi.stubGlobal("ResizeObserver", class {
      disconnect = vi.fn();
      observe = vi.fn();
      constructor(callback: () => void) { observers.push({ callback, disconnect: this.disconnect }); }
    });
    const { sdk, viewport, scope } = candidate();
    const first = scroller();
    const second = scroller();
    const removeFirst = vi.spyOn(first.element, "removeEventListener");
    const removeSecond = vi.spyOn(second.element, "removeEventListener");
    viewport.value = first.element;
    await nextTick();
    viewport.value = second.element;
    await nextTick();
    expect(removeFirst.mock.calls.some(([type]) => type === "scroll")).toBe(true);
    const before = sdk.rows.value;
    first.element.scrollTop = 600;
    first.element.dispatchEvent(new Event("scroll"));
    await nextTick();
    expect(sdk.rows.value).toBe(before);
    expect(observers.length).toBe(2);
    scope.stop();
    expect(removeSecond.mock.calls.some(([type]) => type === "scroll")).toBe(true);
    expect(observers.every(observer => observer.disconnect.mock.calls.length === 1)).toBe(true);
    second.element.scrollTop = 600;
    second.element.dispatchEvent(new Event("scroll"));
    observers.forEach(observer => observer.callback());
    await nextTick();
    expect(sdk.rows.value).toBe(before);
  });
});
