import { bindPanel } from "@ui-sdk/core";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

it("requires size writes but does not own non-findable visibility or content removal", async () => {
  vi.useFakeTimers();
  const panel = document.createElement("div");
  panel.style.display = "grid";
  panel.innerHTML = '<input name="draft" value="kept">';
  panel.getAnimations = () => [];
  document.body.append(panel);
  const listeners = new Set<() => void>();
  let open = false;
  const size = vi.fn();
  const settled = vi.fn();
  const exited = vi.fn();
  const cleanup = bindPanel(panel, {
    size,
    isOpen: () => open,
    isExiting: () => false,
    isFindable: () => false,
    opening: () => "mount",
    reveal: () => {},
    trigger: () => undefined,
    subscribe: listener => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    settled,
    exited,
  });
  try {
    expect(panel.hasAttribute("hidden")).toBe(false);
    expect(panel.hasAttribute("inert")).toBe(false);
    expect(panel.hasAttribute("aria-hidden")).toBe(false);
    expect(size).toHaveBeenLastCalledWith(panel, "0px", "0px");
    open = true;
    listeners.forEach(listener => listener());
    await vi.runAllTimersAsync();
    expect(size).toHaveBeenLastCalledWith(panel, "auto", "auto");
    expect(settled).not.toHaveBeenCalled();
    open = false;
    listeners.forEach(listener => listener());
    await vi.runAllTimersAsync();
    expect(size).toHaveBeenLastCalledWith(panel, "0px", "0px");
    expect(settled).toHaveBeenCalledExactlyOnceWith(false);
    expect(exited).not.toHaveBeenCalled();
    expect(panel.querySelector("input")?.value).toBe("kept");
    expect(panel.hasAttribute("hidden")).toBe(false);
    expect(panel.hasAttribute("inert")).toBe(false);
    expect(panel.style.cssText).toBe("display: grid;");
    expect(panel.isConnected).toBe(true);
    expect(listeners.size).toBe(1);
  } finally {
    cleanup();
  }
  expect(listeners.size).toBe(0);
});

it("needs caller-owned exiting state for exit completion and returns focus on close", async () => {
  vi.useFakeTimers();
  const trigger = document.createElement("button");
  const panel = document.createElement("div");
  const input = document.createElement("input");
  panel.append(input);
  panel.getAnimations = () => [];
  document.body.append(trigger, panel);
  let open = true;
  let exiting = false;
  const listeners = new Set<() => void>();
  const exited = vi.fn(() => { exiting = false; });
  const cleanup = bindPanel(panel, {
    size: () => {},
    isOpen: () => open,
    isExiting: () => exiting,
    isFindable: () => false,
    opening: () => "mount",
    reveal: () => {},
    trigger: () => trigger,
    subscribe: listener => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    settled: () => {},
    exited,
  });
  try {
    await vi.runAllTimersAsync();
    input.focus();
    open = false;
    exiting = true;
    listeners.forEach(listener => listener());
    await vi.runAllTimersAsync();
    expect(document.activeElement).toBe(trigger);
    expect(exited).toHaveBeenCalledOnce();
    expect(exiting).toBe(false);
    expect(panel.contains(input)).toBe(true);
  } finally {
    cleanup();
  }
  expect(listeners.size).toBe(0);
});
