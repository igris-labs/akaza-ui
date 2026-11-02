import type { DateRangePickerProps as PrimitiveDateRangePickerProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const dateRangePickerVariants = tv({
  slots: {
    root: "inline-flex flex-wrap items-center gap-2 max-sm:flex-nowrap",
    field: "",
    trigger:
      "inline-flex size-7 shrink-0 items-center justify-center gap-1.5 rounded-md border border-input text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    content:
      "z-50 max-w-[calc(100vw-2rem)] min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg motion-reduce:transition-none",
    calendar: "border-0 bg-transparent shadow-none",
    close:
      "inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-md border-t border-border py-2 text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
  },
  variants: {
    rangeColor: { secondary: {}, accent: {} },
    variant: { outline: {}, soft: {}, bare: {} },
    size: {
      xs: {
        trigger: "size-6 rounded-[calc(var(--radius)*0.5)] [&_svg]:size-3",
        root: "gap-1 rounded-[calc(var(--radius)*0.5+4px)]",
      },
      sm: {
        trigger: "size-7 rounded-sm [&_svg]:size-3.5",
        root: "gap-1 rounded-lg",
      },
      md: {
        trigger: "size-8 rounded-md [&_svg]:size-4",
        root: "gap-1.5 rounded-[calc(var(--radius)*0.8+4px)]",
      },
      lg: {
        trigger: "size-9 rounded-lg [&_svg]:size-4.5",
        root: "gap-2 rounded-xl",
      },
      xl: {
        trigger: "size-10 rounded-[calc(var(--radius)*1.2)] [&_svg]:size-5",
        root: "gap-2.5 rounded-[calc(var(--radius)*1.2+4px)]",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type DateRangePickerVariants = VariantProps<typeof dateRangePickerVariants>;
export type DateRangePickerConfig = Pick<
  DateRangePickerVariants,
  "size" | "variant" | "rangeColor"
>;
export type DateRangePickerSlots = InstanceType<typeof Akaza.DateRangePicker>["$slots"];
export interface DateRangePickerProps extends Omit<
  PrimitiveDateRangePickerProps,
  "ui" | "class" | "size"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.DateRangePickerUi;
  size?: DateRangePickerVariants["size"];
  rangeColor?: DateRangePickerVariants["rangeColor"];
  variant?: DateRangePickerVariants["variant"];
  modelValue?: Akaza.CalendarDateRange;
  open?: boolean;
  placeholder?: Akaza.CalendarDateValue;
}
export function resolveDateRangePickerVariants(
  props: DateRangePickerVariants,
  config: UiConfig,
): DateRangePickerVariants {
  return resolveVariants(
    props,
    config.components?.dateRangePicker,
    config.defaults,
    dateRangePickerVariants.variants,
  );
}
export { default as DateRangePicker } from "./DateRangePicker.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    dateRangePicker?: DateRangePickerConfig;
  }
}
