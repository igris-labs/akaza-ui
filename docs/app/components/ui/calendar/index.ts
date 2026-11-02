import type { CalendarProps as PrimitiveCalendarProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const calendarVariants = tv({
  slots: {
    root: "inline-flex flex-col gap-3 rounded-lg border border-border bg-background p-3 text-foreground [@media(pointer:coarse)]:p-2",
    header: "flex items-center justify-between gap-2",
    previous:
      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    heading: "text-sm font-semibold text-highlighted",
    next: "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    grids: "flex flex-wrap gap-4",
    grid: "border-collapse",
    gridHead: "",
    gridBody: "",
    gridRow: "",
    headCell: "py-2 text-center text-xs font-medium text-muted-foreground",
    cell: "p-0.5 text-center [@media(pointer:coarse)]:p-0",
    cellTrigger:
      "inline-flex items-center justify-center text-sm transition-colors duration-150 ease-interaction outline-none hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-highlighted:bg-(--range-fill) data-akaza-highlighted:text-(--range-foreground) data-akaza-outside-view:text-dimmed data-akaza-selected:bg-secondary data-akaza-selected:text-secondary-foreground data-akaza-in-range:data-akaza-selected:bg-(--range-fill) data-akaza-in-range:data-akaza-selected:text-(--range-foreground) data-akaza-range-end:data-akaza-in-range:data-akaza-selected:bg-primary data-akaza-range-end:data-akaza-in-range:data-akaza-selected:text-primary-foreground data-akaza-range-start:data-akaza-in-range:data-akaza-selected:bg-primary data-akaza-range-start:data-akaza-in-range:data-akaza-selected:text-primary-foreground data-akaza-today:font-semibold data-akaza-today:underline data-akaza-unavailable:line-through motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
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
        cellTrigger: "size-6 rounded-[calc(var(--radius)*0.5)] text-xs leading-4",
        previous: "size-6 [&_svg]:size-3",
        next: "size-6 [&_svg]:size-3",
        root: "gap-1 rounded-[calc(var(--radius)*0.5+4px)] p-2",
      },
      sm: {
        cellTrigger: "size-7 rounded-sm text-[13px] leading-4",
        previous: "size-7 [&_svg]:size-3.5",
        next: "size-7 [&_svg]:size-3.5",
        root: "gap-1 rounded-lg p-2.5",
      },
      md: {
        cellTrigger: "size-8 rounded-md text-sm leading-5",
        previous: "size-8 [&_svg]:size-4",
        next: "size-8 [&_svg]:size-4",
        root: "gap-1.5 rounded-[calc(var(--radius)*0.8+4px)] p-3",
      },
      lg: {
        cellTrigger: "size-9 rounded-lg text-sm leading-5",
        previous: "size-9 [&_svg]:size-4.5",
        next: "size-9 [&_svg]:size-4.5",
        root: "gap-2 rounded-xl p-3.5",
      },
      xl: {
        cellTrigger: "size-10 rounded-[calc(var(--radius)*1.2)] text-base leading-6",
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
export type CalendarVariants = VariantProps<typeof calendarVariants>;
export type CalendarConfig = Pick<CalendarVariants, "size" | "rangeColor">;
export type CalendarSlots = InstanceType<typeof Akaza.Calendar>["$slots"];
export interface CalendarProps extends Omit<PrimitiveCalendarProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.CalendarUi;
  size?: CalendarVariants["size"];
  rangeColor?: CalendarVariants["rangeColor"];
  modelValue?: Akaza.CalendarModelValue;
  placeholder?: Akaza.CalendarDateValue;
}
export function resolveCalendarVariants(
  props: CalendarVariants,
  config: UiConfig,
): CalendarVariants {
  return resolveVariants(
    props,
    config.components?.calendar,
    config.defaults,
    calendarVariants.variants,
  );
}
export { default as Calendar } from "./Calendar.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    calendar?: CalendarConfig;
  }
}
