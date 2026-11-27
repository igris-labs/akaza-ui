import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useTypeaheadSearch } from "../../src/composables/internal/sdk/useTypeaheadSearch";
import { useTypeahead } from "../../src/composables/typeahead";

afterEach(() => vi.useRealTimers());

function fixture(labels = ["Éditer", "Export", "Example"]) {
  const scope = effectScope();
  const items = ref(labels.map((label, index) => ({ label, disabled: index === 1 })));
  const search = scope.run(() => useTypeaheadSearch({
    items: () => items.value,
    label: item => item.label,
    disabled: item => item.disabled,
  }))!;
  const press = (key: string, current = -1, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", { key, cancelable: true, ...init });
    return { index: search.search(event, current), event };
  };
  return { scope, items, search, press };
}

describe("sdk typeahead adapter", () => {
  it("folds accents and cycles repeated letters past disabled entries", () => {
    const { press, scope } = fixture();
    try {
      expect(press("e").index).toBe(0);
      expect(press("e", 0).index).toBe(2);
      expect(press("e", 2).index).toBe(0);
    } finally {
      scope.stop();
    }
  });

  it("keeps multi-character prefixes on the current match", () => {
    const { press, scope } = fixture(["Éditer", "Excluded", "Example"]);
    try {
      expect(press("e").index).toBe(0);
      expect(press("x", 0).index).toBe(2);
      expect(press("a", 2).index).toBe(2);
    } finally {
      scope.stop();
    }
  });

  it("treats Space as activation until a query starts, then as part of the label", () => {
    const { press, scope } = fixture(["New file", "Excluded", "New folder"]);
    try {
      expect(press(" ").event.defaultPrevented).toBe(false);
      expect(press("n").index).toBe(0);
      expect(press("e", 0).index).toBe(0);
      expect(press("w", 0).index).toBe(0);
      expect(press(" ", 0).event.defaultPrevented).toBe(true);
      expect(press("f", 0).index).toBe(0);
      expect(press("o", 0).index).toBe(2);
    } finally {
      scope.stop();
    }
  });

  it.each([
    { altKey: true }, { ctrlKey: true }, { metaKey: true }, { isComposing: true }, { keyCode: 229 },
  ])("leaves shortcuts and composition untouched: %j", (init) => {
    const { press, search, scope } = fixture();
    try {
      const result = press("e", -1, init);
      expect(result.index).toBe(-1);
      expect(result.event.defaultPrevented).toBe(false);
      expect(search.active()).toBe(false);
    } finally {
      scope.stop();
    }
  });

  it("honors preventDefault and ignores non-character keys", () => {
    const { search, press, scope } = fixture();
    try {
      const event = new KeyboardEvent("keydown", { key: "e", cancelable: true });
      event.preventDefault();
      expect(search.search(event, -1)).toBe(-1);
      expect(press("ArrowDown").event.defaultPrevented).toBe(false);
      expect(search.active()).toBe(false);
    } finally {
      scope.stop();
    }
  });

  it("reads replaced options and disabled state without another query buffer", () => {
    const { press, items, search, scope } = fixture();
    try {
      expect(press("e").index).toBe(0);
      items.value = [{ label: "Echo", disabled: true }, { label: "Elsewhere", disabled: false }];
      search.reset();
      expect(press("e").index).toBe(1);
      items.value = [];
      expect(press("x").index).toBe(-1);
    } finally {
      scope.stop();
    }
  });

  it("expires after 500ms and clears timers on disposal", () => {
    vi.useFakeTimers();
    const { press, search, scope } = fixture();
    press("e");
    expect(search.active()).toBe(true);
    vi.advanceTimersByTime(500);
    expect(search.active()).toBe(false);
    press("e");
    expect(vi.getTimerCount()).toBe(1);
    scope.stop();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("isolates queries between components", () => {
    const first = fixture();
    const second = fixture();
    try {
      first.press("e");
      expect(first.search.active()).toBe(true);
      expect(second.search.active()).toBe(false);
    } finally {
      first.scope.stop();
      second.scope.stop();
    }
  });

  it("preserves public buffered query/push/reset behavior", () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const buffer = scope.run(() => useTypeahead())!;
    expect(buffer.push("e")).toBe("e");
    expect(buffer.push("e")).toBe("ee");
    expect(buffer.query.value).toBe("ee");
    buffer.reset();
    expect(buffer.query.value).toBe("");
    scope.stop();
    expect(vi.getTimerCount()).toBe(0);
  });
});
