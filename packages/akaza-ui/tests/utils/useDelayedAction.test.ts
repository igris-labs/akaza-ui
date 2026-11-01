import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useDelayedAction } from "@/utils/useDelayedAction";

afterEach(() => vi.useRealTimers());

describe("delayed actions", () => {
  it("replaces pending actions and permits scheduling from the callback", () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const delayed = scope.run(useDelayedAction)!;
    const stale = vi.fn();
    const latest = vi.fn(() => delayed.schedule(stale, 10));
    delayed.schedule(stale, 10);
    delayed.schedule(latest, 20);
    vi.advanceTimersByTime(19);
    expect(stale).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(latest).toHaveBeenCalledOnce();
    scope.stop();
    vi.runAllTimers();
    expect(stale).not.toHaveBeenCalled();
  });

  it("cancels safely before scheduling and keeps zero delay asynchronous", () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const delayed = scope.run(useDelayedAction)!;
    const callback = vi.fn();
    delayed.cancel();
    delayed.schedule(callback, 0);
    expect(callback).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledOnce();
    delayed.schedule(callback, 1);
    delayed.cancel();
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledOnce();
    scope.stop();
  });
});
