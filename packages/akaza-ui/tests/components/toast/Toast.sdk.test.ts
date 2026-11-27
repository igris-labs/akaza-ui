import { createOverlays } from "@ui-sdk/core/overlays";
import { mount } from "@ui-sdk/core/testing";
import { createToaster, toastRegion } from "@ui-sdk/core/toast";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

function toaster() {
  const overlays = createOverlays();
  const release = overlays.attachHost();
  return { toast: createToaster({ overlays }), release };
}

describe("beta.17 public Toast ownership probes", () => {
  it("keeps newest-first snapshots, versions, stable ids and subscriptions", () => {
    const { toast, release } = toaster();
    const changed = vi.fn();
    const stop = toast.subscribe(changed);
    try {
      toast({ id: "a", title: "First", duration: 0 });
      toast({ id: "b", title: "Second" });
      const snapshot = toast.toasts();
      expect(toast.toasts()).toBe(snapshot);
      expect(snapshot.map(item => item.id)).toEqual(["b", "a"]);
      toast({ id: "a", title: "Updated" });
      expect(toast.toasts().map(item => item.id)).toEqual(["b", "a"]);
      expect(toast.toasts()[1]).toMatchObject({ version: snapshot[1]!.version + 1, duration: 0 });
      expect(toast.update("missing", "Ignored")).toBe(false);
      expect(changed).toHaveBeenCalledTimes(3);
      stop();
      toast.dismiss();
      expect(changed).toHaveBeenCalledTimes(3);
    } finally {
      stop();
      toast.dismiss();
      release();
    }
  });

  it("has no manager countdown, closing state, immediate remove, or arbitrary close reason", () => {
    vi.useFakeTimers();
    const { toast, release } = toaster();
    const dismissed = vi.fn();
    try {
      toast({ id: "a", duration: 50, onDismiss: dismissed });
      vi.advanceTimersByTime(5000);
      expect(toast.toasts()).toHaveLength(1);
      expect(toast).not.toHaveProperty("pause");
      expect(toast).not.toHaveProperty("remove");
      toast.dismiss("a");
      expect(dismissed.mock.calls[0]![0].reason).toBe("imperative");
      expect(toast.toasts()).toEqual([]);
      expect(toast.update("a", "Cannot reopen")).toBe(false);
    } finally {
      toast.dismiss();
      release();
    }
  });

  it("supports cancelable SDK dismissal but Akaza onClose has no such contract", () => {
    const { toast, release } = toaster();
    try {
      toast({ id: "a", onDismiss: details => details.cancel() });
      toast.dismiss("a");
      expect(toast.toasts()).toHaveLength(1);
      toast.update("a", { onDismiss: () => undefined });
    } finally {
      toast.dismiss();
      release();
    }
  });

  it("returns an id from promise and does not revive a dismissed loading toast", async () => {
    const { toast, release } = toaster();
    let resolve!: (value: string) => void;
    try {
      const result = toast.promise(new Promise<string>(done => { resolve = done; }), {
        loading: { id: "request", title: "Loading" }, success: value => value,
      });
      expect(result).toBe("request");
      expect(toast.toasts()[0]?.duration).toBe(Infinity);
      toast.dismiss(result);
      resolve("Done");
      await Promise.resolve();
      await Promise.resolve();
      expect(toast.toasts()).toEqual([]);
    } finally {
      toast.dismiss();
      release();
    }
  });

  it("owns visible-only timers and reason-specific holds inside the region", async () => {
    vi.useFakeTimers();
    const { toast, release } = toaster();
    const view = mount(toastRegion, { toaster: toast, maxVisible: 1, shortcut: null }, "<region aria-label='Notifications'><list></list></region>");
    try {
      toast({ id: "older", duration: 100 });
      toast({ id: "newer", duration: 100 });
      view.api.pause("one");
      view.api.pause("two");
      vi.advanceTimersByTime(500);
      view.api.resume("one");
      vi.advanceTimersByTime(500);
      expect(toast.toasts()).toHaveLength(2);
      view.api.resume("two");
      vi.advanceTimersByTime(100);
      expect(toast.toasts().map(item => item.id)).toEqual(["older"]);
      vi.advanceTimersByTime(100);
      expect(toast.toasts()).toEqual([]);
    } finally {
      view.unmount();
      toast.dismiss();
      release();
    }
  });

});
