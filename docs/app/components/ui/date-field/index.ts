import type { DateFieldProps as PrimitiveDateFieldProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const dateFieldVariants = tv({
  slots: {
    root: "inline-flex items-center gap-1 border border-input bg-background text-foreground shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
    segments: "inline-flex items-center gap-0.5",
    segment:
      "rounded-[3px] bg-transparent px-1 py-0.5 text-center tabular-nums transition-colors duration-150 ease-interaction outline-none selection:bg-secondary selection:text-secondary-foreground focus:bg-secondary focus:text-secondary-foreground focus:ring-1 focus:ring-secondary-foreground/20 placeholder:text-muted-foreground data-akaza-placeholder:text-muted-foreground focus:placeholder:text-secondary-foreground data-akaza-placeholder:focus:text-secondary-foreground motion-reduce:transition-none",
    literal: "px-0.5 text-dimmed select-none",
    calendarTrigger:
      "ml-auto inline-flex size-5 shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    calendarContent:
      "z-50 max-w-[calc(100vw-2rem)] min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg motion-reduce:transition-none",
    calendar: "border-0 bg-transparent shadow-none",
    hiddenInput: "sr-only",
  },
  variants: {
    size: {
      xs: {
        root: "h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
        calendarTrigger: "size-3 [&_svg]:size-3",
      },
      sm: {
        root: "h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
        calendarTrigger: "size-3.5 [&_svg]:size-3.5",
      },
      md: {
        root: "h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
        calendarTrigger: "size-4 [&_svg]:size-4",
      },
      lg: {
        root: "h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
        calendarTrigger: "size-4.5 [&_svg]:size-4.5",
      },
      xl: {
        root: "h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
        calendarTrigger: "size-5 [&_svg]:size-5",
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
export type DateFieldVariants = VariantProps<typeof dateFieldVariants>;
export type DateFieldConfig = Pick<DateFieldVariants, "size" | "variant">;
export type DateFieldSlots = InstanceType<typeof Akaza.DateField>["$slots"];
export interface DateFieldProps extends Omit<
  PrimitiveDateFieldProps,
  "ui" | "class" | "size" | "variant"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.DateFieldUi;
  size?: DateFieldVariants["size"];
  variant?: DateFieldVariants["variant"];
  modelValue?: Akaza.CalendarDateValue;
  calendarOpen?: boolean;
}
export function resolveDateFieldVariants(
  props: DateFieldVariants,
  config: UiConfig,
): DateFieldVariants {
  return resolveVariants(
    props,
    config.components?.dateField,
    config.defaults,
    dateFieldVariants.variants,
  );
}
export { default as DateField } from "./DateField.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    dateField?: DateFieldConfig;
  }
}
