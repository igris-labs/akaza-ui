import type { TimeFieldProps as PrimitiveTimeFieldProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const timeFieldVariants = tv({
  slots: {
    root: "inline-flex items-center border border-input bg-background text-foreground shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
    segments: "inline-flex items-center gap-1",
    segment:
      "rounded px-0.5 tabular-nums transition-colors duration-150 ease-interaction outline-none selection:bg-secondary selection:text-secondary-foreground focus:bg-secondary focus:text-secondary-foreground focus:ring-1 focus:ring-secondary-foreground/20 motion-reduce:transition-none",
    literal: "text-muted-foreground",
    dayPeriod:
      "rounded px-1 font-medium transition-colors duration-150 ease-interaction outline-none focus:bg-secondary focus:text-secondary-foreground focus:ring-1 focus:ring-secondary-foreground/20 motion-reduce:transition-none",
    timeZone: "pl-1 text-xs text-muted-foreground",
    hiddenInput: "sr-only",
  },
  variants: {
    size: {
      xs: {
        root: "h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
      },
      sm: {
        root: "h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
      },
      md: {
        root: "h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
      },
      lg: {
        root: "h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
      },
      xl: {
        root: "h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
      },
    },
    variant: {
      outline: {
        root: "border-input bg-background",
      },
      soft: {
        root: "border-transparent bg-muted",
      },
      bare: {
        root: "border-transparent bg-transparent focus-visible:ring-0 data-akaza-focused:ring-0",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "outline",
  },
});
export type TimeFieldVariants = VariantProps<typeof timeFieldVariants>;
export type TimeFieldConfig = Pick<TimeFieldVariants, "size" | "variant">;
export type TimeFieldSlots = InstanceType<typeof Akaza.TimeField>["$slots"];
export interface TimeFieldProps extends Omit<
  PrimitiveTimeFieldProps,
  "ui" | "class" | "size" | "variant"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.TimeFieldUi;
  size?: TimeFieldVariants["size"];
  variant?: TimeFieldVariants["variant"];
  modelValue?: Akaza.TimeValue;
  placeholder?: Akaza.TimeValue | undefined;
}
export function resolveTimeFieldVariants(
  props: TimeFieldVariants,
  config: UiConfig,
): TimeFieldVariants {
  return resolveVariants(
    props,
    config.components?.timeField,
    config.defaults,
    timeFieldVariants.variants,
  );
}
export { default as TimeField } from "./TimeField.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    timeField?: TimeFieldConfig;
  }
}
