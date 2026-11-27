import { matchesShortcut } from "@ui-sdk/core";
import { scrubTo, stepValue } from "@ui-sdk/core/number";
import { describe, expect, it } from "vitest";
import { clamp, round } from "@/composables/color/engine";
import { clampNumber, snapToStep } from "@/utils/number";

function originalSnap(value: number, step: number, base = 0) {
  if (step <= 0) return value;
  const decimals = (value: number) => {
    const [coefficient = "", exponent = "0"] = String(value).toLowerCase().split("e");
    return Math.min(100, Math.max(0, (coefficient.split(".")[1]?.length ?? 0) - Number(exponent)));
  };
  const snapped = Math.round((value - base) / step) * step + base;
  return Number(snapped.toFixed(Math.max(decimals(step), decimals(base))));
}

describe("batch15 numeric parity", () => {
  it("preserves exponent precision, tie rounding, negative/zero steps and nonfinite values", () => {
    const values = [-Infinity, -12.675, -1.005, -0, 0, 0.31, 1.005, 2.675, 3.1e-7, 1e-101, Infinity, Number.NaN];
    const steps = [-1, 0, 1, 0.1, 0.01, 1e-7, 1e-101, Infinity, Number.NaN];
    const bases = [0, -0.3, 2, 1e-8, 1e-101];
    for (const value of values) {
      for (const step of steps) {
        for (const base of bases) expect(snapToStep(value, step, base)).toBe(originalSnap(value, step, base));
      }
    }
    for (let index = -200; index <= 200; index++) {
      const value = index / 137;
      expect(snapToStep(value, 0.001, -0.25)).toBe(originalSnap(value, 0.001, -0.25));
    }
  });

  it("retains optional/contradictory bounds and snap-then-clamp policy", () => {
    expect(clampNumber(8)).toBe(8);
    expect(clampNumber(-3, 0)).toBe(0);
    expect(clampNumber(8, undefined, 5)).toBe(5);
    expect(clampNumber(1, 10, 0)).toBe(10);
    expect(clampNumber(1, Number.NaN, 2)).toBe(1);
    expect(clampNumber(snapToStep(9, 4), 0, 7)).toBe(7);
    expect(scrubTo(9, { min: 0, max: 7, step: 4 }).value).toBe(4);
    expect(stepValue(1.5, 1, { min: 0, max: 10, step: 1 })).toBe(2);
    expect(snapToStep(1.5 + 1, 1)).toBe(3);
  });

  it("keeps exact six-decimal color output and default bounds", () => {
    for (const value of [-Infinity, -1.005, -0, 0, 0.188014734, 0.7, 1, 360, Infinity, Number.NaN]) {
      expect(round(value)).toBe(Number(value.toFixed(6)));
      expect(clamp(value)).toBe(Math.min(1, Math.max(0, value)));
      expect(clamp(value, -0.4, 0.4)).toBe(Math.min(0.4, Math.max(-0.4, value)));
    }
    expect(clamp(360, 0, 360)).toBe(360);
    expect(round(0.188014734)).toBe(0.188015);
  });

  it("documents why Sidebar cannot replace either-Control-or-Command with SDK mod matching", () => {
    const control = new KeyboardEvent("keydown", { key: "b", ctrlKey: true });
    const command = new KeyboardEvent("keydown", { key: "b", metaKey: true });
    expect(matchesShortcut(control, "mod+b", true)).toBe(false);
    expect(matchesShortcut(command, "mod+b", false)).toBe(false);
    expect(matchesShortcut(new KeyboardEvent("keydown", { key: "b", ctrlKey: true, shiftKey: true }), "ctrl+b", false)).toBe(false);
  });
});
