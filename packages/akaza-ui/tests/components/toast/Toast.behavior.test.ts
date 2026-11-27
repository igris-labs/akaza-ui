import type { ToastCloseReason } from "@/composables/toast";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { Toast } from "@/components/toast";
import { createToastManager } from "@/composables/toast";

enableAutoUnmount(afterEach);
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function view(manager = createToastManager({ removeDelay: 0 })) {
  return mount(Toast, { attachTo: document.body, props: { manager, teleport: false } });
}

describe("toast manager behavior", () => {
  it("keeps oldest-first order, generic data, independent priority, and update defaults", () => {
    const manager = createToastManager({ duration: 1000 });
    const data = { request: 1 };
    manager.add({ id: "first", type: "error", priority: "low", duration: 0, data });
    manager.add({ id: "second" });
    manager.update({ id: "first", title: "Changed" });
    expect(manager.toasts.value.map(item => item.id)).toEqual(["first", "second"]);
    expect(manager.toasts.value[0]).toMatchObject({ type: "error", priority: "low", duration: 0, updateKey: 1, data });
    manager.update({ id: "first", type: "alert" });
    expect(manager.toasts.value[0]?.priority).toBe("high");
    manager.update({ id: "missing", title: "Ignored" });
    manager.remove("missing");
    manager.close("missing");
    expect(manager.toasts.value).toHaveLength(2);
    manager.clear();
  });

  it.each<ToastCloseReason>(["action", "close-button", "escape", "swipe", "timeout", "programmatic"])("keeps %s close and delayed removal distinct and idempotent", (reason) => {
    const manager = createToastManager({ removeDelay: 200 });
    const close = vi.fn();
    const remove = vi.fn();
    manager.add({ id: "a", duration: 1000, onClose: close, onRemove: remove });
    manager.close("a", reason);
    manager.close("a", "programmatic");
    expect(close).toHaveBeenCalledExactlyOnceWith(reason);
    expect(manager.toasts.value[0]?.state).toBe("closing");
    vi.advanceTimersByTime(199);
    expect(remove).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(remove).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(2000);
    expect(manager.toasts.value).toEqual([]);
    expect(close).toHaveBeenCalledOnce();
  });

  it("removes immediately without closing, even when onRemove throws", () => {
    const manager = createToastManager();
    const close = vi.fn();
    manager.add({ id: "a", onClose: close, onRemove: () => { throw new Error("remove failed"); } });
    expect(() => manager.remove("a")).toThrow("remove failed");
    expect(close).not.toHaveBeenCalled();
    expect(manager.toasts.value).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([0, 200])("does not remove a toast reopened inside onClose (delay %i)", (removeDelay) => {
    const manager = createToastManager({ removeDelay });
    manager.add({ id: "a", duration: 0, onClose: () => manager.update({ id: "a", title: "Reopened" }) });
    manager.close("a");
    vi.advanceTimersByTime(1000);
    expect(manager.toasts.value[0]).toMatchObject({ title: "Reopened", state: "open" });
    manager.remove("a");
  });

  it("does not remove a same-id replacement made inside onClose", () => {
    const manager = createToastManager();
    manager.add({ id: "a", duration: 0, onClose: () => {
      manager.remove("a");
      manager.add({ id: "a", title: "Replacement", duration: 0 });
    } });
    manager.close("a");
    vi.advanceTimersByTime(1000);
    expect(manager.toasts.value[0]?.title).toBe("Replacement");
    manager.remove("a");
  });

  it("reopens closing items and cancels their old removal and countdown", () => {
    const manager = createToastManager();
    manager.add({ id: "a", duration: 1000 });
    manager.close("a");
    vi.advanceTimersByTime(100);
    manager.add({ id: "a", title: "Reopened", duration: 500 });
    vi.advanceTimersByTime(499);
    expect(manager.toasts.value[0]?.state).toBe("open");
    vi.advanceTimersByTime(1);
    expect(manager.toasts.value[0]?.state).toBe("closing");
    manager.remove("a");
  });

  it("closes the whole clear snapshot even when a callback throws", () => {
    const manager = createToastManager({ removeDelay: 0 });
    const closed = vi.fn();
    manager.add({ id: "a", onClose: () => { throw new Error("close failed"); } });
    manager.add({ id: "b", onClose: closed });
    expect(() => manager.clear()).toThrow("close failed");
    expect(closed).toHaveBeenCalledWith("programmatic");
    expect(manager.toasts.value).toEqual([]);
  });

  it("handles persistent and infinite durations without a host timeout overflow", () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "zero", duration: 0 });
    manager.add({ id: "infinite", duration: Infinity });
    vi.advanceTimersByTime(10000);
    expect(manager.toasts.value.map(item => item.id)).toEqual(["zero", "infinite"]);
    manager.clear();
  });

  it("splits long durations at the host timeout limit", () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "long", duration: 2_147_483_647 + 100 });
    vi.advanceTimersByTime(2_147_483_647);
    expect(manager.toasts.value).toHaveLength(1);
    vi.advanceTimersByTime(99);
    expect(manager.toasts.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(manager.toasts.value).toEqual([]);
  });

  it("preserves time across repeated pause/resume and resets updates while paused", () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "a", duration: 1000 });
    vi.advanceTimersByTime(200);
    manager.pause();
    manager.pause();
    vi.advanceTimersByTime(500);
    manager.resume();
    manager.resume();
    vi.advanceTimersByTime(200);
    manager.pause();
    manager.update({ id: "a", duration: 700 });
    manager.add({ id: "b", duration: 700 });
    vi.advanceTimersByTime(5000);
    manager.resume();
    vi.advanceTimersByTime(699);
    expect(manager.toasts.value).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(manager.toasts.value).toEqual([]);
  });

  it("keeps limited toast countdowns running, even without a viewport", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "older", duration: 100 });
    manager.add({ id: "newer", duration: 0 });
    const wrapper = view(manager);
    await wrapper.setProps({ limit: 1 });
    expect(wrapper.get("[data-akaza-limited]").attributes("inert")).toBeDefined();
    vi.advanceTimersByTime(100);
    expect(manager.toasts.value.map(item => item.id)).toEqual(["newer"]);
    wrapper.unmount();
    manager.add({ id: "unmounted", duration: 100 });
    vi.advanceTimersByTime(100);
    expect(manager.toasts.value.map(item => item.id)).toEqual(["newer"]);
    manager.clear();
  });

  it.each(["close", "remove", "replace", "update"])("does not let promise settlement overwrite %s", async (change) => {
    const manager = createToastManager();
    const source = deferred<string>();
    const result = manager.promise(source.promise, {
      loading: { id: "request", title: "Loading", duration: 0 },
      success: { title: "Done" }, error: { title: "Failed" },
    });
    if (change === "close") manager.close("request");
    if (change === "remove" || change === "replace") manager.remove("request");
    if (change === "replace") manager.add({ id: "request", title: "Replacement", duration: 0 });
    if (change === "update") manager.update({ id: "request", title: "Manual update" });
    source.resolve("value");
    await expect(result).resolves.toBe("value");
    expect(manager.toasts.value[0]?.title).not.toBe("Done");
    manager.remove("request");
  });

  it("returns/rethrows source values and maps phases without changing id or inherited duration", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    await expect(manager.promise(Promise.resolve(42), {
      loading: { id: "a", duration: 0 },
      success: value => ({ id: "ignored", title: `${value}` }), error: { title: "Failed" },
    })).resolves.toBe(42);
    expect(manager.toasts.value[0]).toMatchObject({ id: "a", type: "success", title: "42", duration: 0 });
    const failure = new Error("network");
    await expect(manager.promise(Promise.reject(failure), {
      loading: { id: "b", duration: 0 }, success: { title: "Done" },
      error: error => ({ title: (error as Error).message, duration: 100 }),
    })).rejects.toBe(failure);
    expect(manager.toasts.value[1]).toMatchObject({ type: "error", priority: "high", title: "network" });
    manager.clear();
  });

  it("does not revive a closed toast on rejection, and still rejects with the source error", async () => {
    const manager = createToastManager();
    const source = deferred();
    const error = vi.fn(() => ({ title: "Failed" }));
    const result = manager.promise(source.promise, { loading: { id: "a", duration: 0 }, success: {}, error });
    manager.clear();
    const failure = new Error("request failed");
    source.reject(failure);
    await expect(result).rejects.toBe(failure);
    expect(error).not.toHaveBeenCalled();
    expect(manager.toasts.value[0]?.state).toBe("closing");
    manager.remove("a");
  });

  it("does not overwrite a formatter's own queue changes", async () => {
    const manager = createToastManager();
    await manager.promise(Promise.resolve(), {
      loading: { id: "a", duration: 0 },
      success: () => {
        manager.close("a");
        return { title: "Too late" };
      }, error: {},
    });
    expect(manager.toasts.value[0]?.state).toBe("closing");
    manager.remove("a");
  });
});

describe("toast viewport behavior", () => {
  it("does not let a viewport release an application-owned pause", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "a", duration: 1000 });
    manager.pause();
    const wrapper = view(manager);
    await wrapper.get(".akaza-toast-viewport").trigger("mouseenter");
    await wrapper.get(".akaza-toast-viewport").trigger("mouseleave");
    wrapper.unmount();
    vi.advanceTimersByTime(2000);
    expect(manager.toasts.value).toHaveLength(1);
    manager.resume();
    vi.advanceTimersByTime(1000);
    expect(manager.toasts.value).toEqual([]);
  });

  it("keeps two viewport holds independent and releases only the unmounted viewport", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "a", duration: 1000 });
    const first = view(manager);
    const second = view(manager);
    await first.get(".akaza-toast-viewport").trigger("mouseenter");
    await second.get(".akaza-toast-viewport").trigger("mouseenter");
    first.unmount();
    vi.advanceTimersByTime(2000);
    expect(manager.toasts.value).toHaveLength(1);
    await second.get(".akaza-toast-viewport").trigger("mouseleave");
    vi.advanceTimersByTime(1000);
    expect(manager.toasts.value).toEqual([]);
  });

  it("keeps hover/focus expansion and blur/page-hide holds independent", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "a", duration: 1000 });
    const wrapper = view(manager);
    const region = wrapper.get(".akaza-toast-viewport");
    await region.trigger("mouseenter");
    await region.trigger("focusin");
    await region.trigger("mouseleave");
    expect(region.attributes("data-akaza-expanded")).toBe("true");
    window.dispatchEvent(new Event("blur"));
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
    await region.trigger("focusout");
    vi.advanceTimersByTime(2000);
    expect(manager.toasts.value).toHaveLength(1);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    document.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(1000);
    expect(manager.toasts.value).toEqual([]);
  });

  it("reacts to pause option changes without stranding or losing a hold", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "a", duration: 1000 });
    const wrapper = view(manager);
    const region = wrapper.get(".akaza-toast-viewport");
    await region.trigger("mouseenter");
    await wrapper.setProps({ pauseOnHover: false });
    vi.advanceTimersByTime(1000);
    expect(manager.toasts.value).toEqual([]);
    manager.add({ id: "b", duration: 1000 });
    await wrapper.setProps({ pauseOnWindowBlur: false });
    await wrapper.setProps({ pauseOnWindowBlur: true });
    window.dispatchEvent(new Event("blur"));
    vi.advanceTimersByTime(2000);
    expect(manager.toasts.value).toHaveLength(1);
    await wrapper.setProps({ pauseOnWindowBlur: false });
    vi.advanceTimersByTime(1000);
    expect(manager.toasts.value).toEqual([]);
  });

  it.each([false, true])("guards pending actions and stale completion in %s custom slot mode", async (custom) => {
    const source = deferred();
    const select = vi.fn(() => source.promise);
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "a", duration: 0, action: { label: "Retry", onSelect: select } });
    const wrapper = mount(Toast, {
      attachTo: document.body, props: { manager, teleport: false },
      ...(custom && { slots: { toast: ({ performAction }: { performAction: () => void }) => h("button", { onClick: performAction }, "Retry") } }),
    });
    const button = wrapper.get("button");
    await button.trigger("click");
    await button.trigger("click");
    expect(select).toHaveBeenCalledOnce();
    if (!custom) expect(button.attributes()).toMatchObject({ "aria-busy": "true", "aria-disabled": "true" });
    manager.update({ id: "a", title: "New revision", action: { label: "Next", onSelect: () => undefined } });
    source.resolve();
    await Promise.resolve();
    await nextTick();
    expect(manager.toasts.value[0]?.state).toBe("open");
    manager.clear();
  });

  it("holds timers during async actions and resumes remaining time after rejection", async () => {
    const source = deferred();
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "a", duration: 1000, action: { label: "Retry", onSelect: () => source.promise } });
    const wrapper = view(manager);
    vi.advanceTimersByTime(400);
    await wrapper.get(".akaza-toast-action").trigger("click");
    vi.advanceTimersByTime(2000);
    expect(manager.toasts.value).toHaveLength(1);
    const failure = new Error("retry");
    source.reject(failure);
    await Promise.resolve();
    await nextTick();
    expect(wrapper.emitted("action-error")?.[0]?.[0]).toBe(failure);
    vi.advanceTimersByTime(599);
    expect(manager.toasts.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(manager.toasts.value).toEqual([]);
  });

  it("holds only the pending item and releases it on unmount without stale errors or closes", async () => {
    const source = deferred();
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "a", duration: 1000, action: { label: "Retry", onSelect: () => source.promise } });
    manager.add({ id: "b", duration: 1000 });
    const wrapper = view(manager);
    await wrapper.get(".akaza-toast-action").trigger("click");
    vi.advanceTimersByTime(1000);
    expect(manager.toasts.value.map(item => item.id)).toEqual(["a"]);
    wrapper.unmount();
    source.reject(new Error("stale"));
    await Promise.resolve();
    expect(wrapper.emitted("action-error")).toBeUndefined();
    vi.advanceTimersByTime(1000);
    expect(manager.toasts.value).toEqual([]);
  });

  it("allows retry after synchronous failure and honors closeOnSelect false", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    const failure = new Error("failed");
    const select = vi.fn().mockImplementationOnce(() => { throw failure; }).mockResolvedValue(undefined);
    manager.add({ id: "a", duration: 1000, action: { label: "Retry", closeOnSelect: false, onSelect: select } });
    const wrapper = view(manager);
    await wrapper.get(".akaza-toast-action").trigger("click");
    expect(wrapper.emitted("action-error")?.[0]?.[0]).toBe(failure);
    expect(wrapper.get(".akaza-toast-action").attributes("aria-busy")).toBeUndefined();
    await wrapper.get(".akaza-toast-action").trigger("click");
    expect(select).toHaveBeenCalledTimes(2);
    expect(manager.toasts.value[0]?.state).toBe("open");
    manager.clear();
  });

  it("respects prevented hotkeys/Escape and closes the latest toast with the existing reason", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    const close = vi.fn();
    manager.add({ id: "a", duration: 0, onClose: close });
    const wrapper = view(manager);
    const event = new KeyboardEvent("keydown", { key: "F8", cancelable: true, bubbles: true });
    event.preventDefault();
    document.dispatchEvent(event);
    expect(document.activeElement).not.toBe(wrapper.get(".akaza-toast-viewport").element);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "F8", bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(wrapper.get(".akaza-toast-viewport").element);
    const escape = new KeyboardEvent("keydown", { key: "Escape", cancelable: true, bubbles: true });
    escape.preventDefault();
    document.dispatchEvent(escape);
    expect(manager.toasts.value).toHaveLength(1);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(close).toHaveBeenCalledWith("escape");
  });

  it("recovers focus from a removed toast without stealing outside focus", async () => {
    const manager = createToastManager({ removeDelay: 0 });
    manager.add({ id: "a", duration: 0 });
    manager.add({ id: "b", duration: 0 });
    const wrapper = view(manager);
    (wrapper.findAll(".akaza-toast-close")[1]!.element as HTMLElement).focus();
    manager.close("b");
    await nextTick();
    await Promise.resolve();
    expect(wrapper.get(".akaza-toast").element.contains(document.activeElement)).toBe(true);
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    manager.close("a");
    await nextTick();
    await Promise.resolve();
    expect(document.activeElement).toBe(outside);
  });
});
