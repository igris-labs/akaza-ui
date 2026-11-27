import { createFocusRecovery, createGridFocus, createRovingFocus, definePrimitive } from "@ui-sdk/core";
import { afterEach, describe, expect, it, vi } from "vitest";

const cleanups: Array<() => void> = [];
afterEach(() => {
  cleanups.splice(0).reverse().forEach(cleanup => cleanup());
  vi.restoreAllMocks();
});

function button() {
  const element = document.createElement("button");
  document.body.append(element);
  cleanups.push(() => element.remove());
  return element;
}

const rovingProbe = definePrimitive({
  name: "date-roving-probe",
  options: { preferred: "string", move: "value" },
  state: (_options: { preferred: string; move?: (event: KeyboardEvent) => string | undefined }) => ({ focused: null as string | null }),
  api: context => ({
    roving: createRovingFocus(context, {
      slot: "day", key: "focused", remember: false,
      preferred: item => item.key === context.options().preferred,
      claims: (_state, item) => item.key === context.options().preferred,
      move: event => context.options().move?.(event),
    }),
  }),
  slots: () => ({}),
});

describe("batch 24B public beta.17 date focus probes", () => {
  it("can focus a bound date, but exposes no preventScroll option and leaves preferred state separate", async () => {
    const instance = rovingProbe({ preferred: "august" });
    cleanups.push(() => instance.destroy());
    const august = button();
    const september = button();
    cleanups.push(instance.api.roving.bind(august, { key: "august", props: {} }));
    cleanups.push(instance.api.roving.bind(september, { key: "september", props: {} }));
    await new Promise(resolve => setTimeout(resolve, 0));
    const focus = vi.spyOn(september, "focus");
    instance.api.roving.focus("september");
    expect(document.activeElement).toBe(september);
    expect(instance.api.roving.tabIndex(instance.get(), { key: "august", props: {} })).toBe("0");
    expect(instance.api.roving.tabIndex(instance.get(), { key: "september", props: {} })).toBe("-1");
    expect(focus.mock.calls).toEqual([[]]);
  });

  it("custom move eagerly remembers an unrendered target before a parent accepts the page", async () => {
    const instance = rovingProbe({ preferred: "august", move: () => "september" });
    cleanups.push(() => instance.destroy());
    const august = button();
    cleanups.push(instance.api.roving.bind(august, { key: "august", props: {} }));
    await new Promise(resolve => setTimeout(resolve, 0));
    august.focus();
    const event = new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true });
    expect(instance.api.roving.keydown(event, august)).toMatchObject({ key: "september", from: "august" });
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(august);
    const september = button();
    cleanups.push(instance.api.roving.bind(september, { key: "september", props: {} }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(september);
  });

  it("grid coordinates clamp at page edges and PageDown moves rows, not calendar months", async () => {
    const probe = definePrimitive({
      name: "date-grid-probe",
      state: () => ({ active: null as { row: number; col: number } | null }),
      api: context => ({ grid: createGridFocus(context, { key: "active", rows: () => 4, cols: () => 3, pageSize: () => 2 }) }),
      slots: () => ({}),
    });
    const instance = probe({});
    cleanups.push(() => instance.destroy());
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) cleanups.push(instance.api.grid.bind(button(), { row, col }));
    }
    await new Promise(resolve => setTimeout(resolve, 0));
    instance.api.grid.focus({ row: 0, col: 2 });
    instance.api.grid.keydown(new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true }));
    expect(instance.api.grid.active()).toEqual({ row: 0, col: 2 });
    instance.api.grid.keydown(new KeyboardEvent("keydown", { key: "PageDown", cancelable: true }));
    expect(instance.api.grid.active()).toEqual({ row: 2, col: 2 });
  });

  it("recovers removed focus after rendering, but never steals a newer external focus", async () => {
    const fallback = button();
    const outside = button();
    const recovery = createFocusRecovery({ fallback: () => fallback });
    for (const moveOutside of [false, true]) {
      const lost = button();
      const unbind = recovery.bind(lost, { key: "second", props: {} });
      lost.focus();
      unbind();
      lost.remove();
      if (moveOutside) outside.focus();
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(document.activeElement).toBe(moveOutside ? outside : fallback);
    }
  });
});
