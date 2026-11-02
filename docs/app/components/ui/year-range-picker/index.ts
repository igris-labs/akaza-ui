import type { YearRangePickerProps as PrimitiveYearRangePickerProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const yearRangePickerVariants = tv({
  slots: {
    root: "inline-flex flex-col gap-3 rounded-lg border border-border bg-background p-3 text-foreground [@media(pointer:coarse)]:p-2",
    header: "flex items-center justify-between gap-2",
    previous:
      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    heading: "text-sm font-semibold text-highlighted",
    next: "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    grid: "grid gap-1",
    gridRow: "grid grid-cols-[repeat(var(--akaza-period-picker-columns),minmax(0,1fr))] gap-1",
    cell: "p-0.5 text-center [@media(pointer:coarse)]:p-0",
    cellTrigger:
      "inline-flex items-center justify-center text-sm transition-colors duration-150 ease-interaction outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-highlighted:bg-(--range-fill) data-akaza-highlighted:text-(--range-foreground) data-akaza-outside-view:text-dimmed data-akaza-selected:bg-primary data-akaza-selected:text-primary-foreground data-akaza-in-range:data-akaza-selected:bg-(--range-fill) data-akaza-in-range:data-akaza-selected:text-(--range-foreground) data-akaza-range-end:data-akaza-in-range:data-akaza-selected:bg-primary data-akaza-range-end:data-akaza-in-range:data-akaza-selected:text-primary-foreground data-akaza-range-start:data-akaza-in-range:data-akaza-selected:bg-primary data-akaza-range-start:data-akaza-in-range:data-akaza-selected:text-primary-foreground data-akaza-today:font-semibold data-akaza-today:underline data-akaza-unavailable:line-through motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    footer: "pt-2 text-xs text-muted-foreground",
  },
  variants: {
    rangeColor: {
      secondary: {
        root: "[--range-fill:var(--secondary)] [--range-foreground:var(--secondary-foreground)]",
      },
      accent: {
        root: "[--range-fill:color-mix(in_oklab,var(--accent)_15%,transparent)] [--range-foreground:light-dark(oklch(from_var(--accent)_min(l,0.48)_c_h),var(--accent))]",
      },
    },
    size: {
      xs: {
        cellTrigger: "h-6 min-w-14 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
        previous: "size-6 [&_svg]:size-3",
        next: "size-6 [&_svg]:size-3",
        root: "gap-1 rounded-[calc(var(--radius)*0.5+4px)] p-2",
      },
      sm: {
        cellTrigger: "h-7 min-w-14 rounded-sm px-2.5 text-[13px] leading-4",
        previous: "size-7 [&_svg]:size-3.5",
        next: "size-7 [&_svg]:size-3.5",
        root: "gap-1 rounded-lg p-2.5",
      },
      md: {
        cellTrigger: "h-8 min-w-14 rounded-md px-3 text-sm leading-5",
        previous: "size-8 [&_svg]:size-4",
        next: "size-8 [&_svg]:size-4",
        root: "gap-1.5 rounded-[calc(var(--radius)*0.8+4px)] p-3",
      },
      lg: {
        cellTrigger: "h-9 min-w-14 rounded-lg px-3.5 text-sm leading-5",
        previous: "size-9 [&_svg]:size-4.5",
        next: "size-9 [&_svg]:size-4.5",
        root: "gap-2 rounded-xl p-3.5",
      },
      xl: {
        cellTrigger: "h-10 min-w-14 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
        previous: "size-10 [&_svg]:size-5",
        next: "size-10 [&_svg]:size-5",
        root: "gap-2.5 rounded-[calc(var(--radius)*1.2+4px)] p-4",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    rangeColor: "secondary",
  },
});
export type YearRangePickerVariants = VariantProps<typeof yearRangePickerVariants>;
export type YearRangePickerConfig = Pick<YearRangePickerVariants, "size" | "rangeColor">;
export type YearRangePickerSlots = InstanceType<typeof Akaza.YearRangePicker>["$slots"];
export interface YearRangePickerProps extends Omit<
  PrimitiveYearRangePickerProps,
  "ui" | "class" | "size"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.YearRangePickerUi;
  size?: YearRangePickerVariants["size"];
  rangeColor?: YearRangePickerVariants["rangeColor"];
  modelValue?: Akaza.CalendarDateRange;
  placeholder?: Akaza.CalendarDateValue;
}
export function resolveYearRangePickerVariants(
  props: YearRangePickerVariants,
  config: UiConfig,
): YearRangePickerVariants {
  return resolveVariants(
    props,
    config.components?.yearRangePicker,
    config.defaults,
    yearRangePickerVariants.variants,
  );
}
export { default as YearRangePicker } from "./YearRangePicker.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    yearRangePicker?: YearRangePickerConfig;
  }
}
