import { decimalsOf, roundTo } from "@ui-sdk/core/number";

export function clampNumber(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}

export function snapToStep(value: number, step: number, base = 0): number {
  if (step <= 0) return value;
  const snapped = Math.round((value - base) / step) * step + base;
  return roundTo(snapped, Math.min(100, Math.max(decimalsOf(step), decimalsOf(base))));
}
