import { cn } from "cn";

export { cn };
export { tv, type VariantProps } from "tailwind-variants/lite";

export function resolveVariants<T extends object>(
  props: T,
  component: object | undefined,
  defaults: object | undefined,
  axes: Record<string, object>,
): T {
  const resolved: Record<string, unknown> = {};
  for (const [axis, values] of Object.entries(axes)) {
    for (const source of [props, component, defaults]) {
      const value = (source as Record<string, unknown> | undefined)?.[axis];
      if (typeof value === "string" && Object.hasOwn(values, value)) {
        resolved[axis] = value;
        break;
      }
    }
  }
  return resolved as T;
}

export function mergeRecipeSlots(
  slots: Record<string, () => string>,
  overrides?: object,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(slots).map(([part, style]) => [
      part,
      cn(style(), (overrides as Record<string, string> | undefined)?.[part]),
    ]),
  );
}
