function decimalPlaces(value: number): number {
  const [coefficient = "", exponent = "0"] = String(value).toLowerCase().split("e");
  return Math.min(100, Math.max(0, (coefficient.split(".")[1]?.length ?? 0) - Number(exponent)));
}

export function clampNumber(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}

export function snapToStep(value: number, step: number, base = 0): number {
  if (step <= 0) return value;
  const snapped = Math.round((value - base) / step) * step + base;
  return Number(snapped.toFixed(Math.max(decimalPlaces(step), decimalPlaces(base))));
}
