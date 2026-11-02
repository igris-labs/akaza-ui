import type { DateRangeFieldProps as PrimitiveDateRangeFieldProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const dateRangeFieldVariants = tv({
  slots: {
    root: "flex flex-wrap items-center gap-2 max-sm:flex-col max-sm:items-stretch",
    start: "min-w-0",
    startField: "",
    separator: "text-muted-foreground max-sm:hidden",
    end: "min-w-0",
    endField: "",
    hiddenInput: "sr-only",
    popover: "inline-flex max-w-full",
    fields: "inline-flex max-w-full items-center gap-1.5",
    calendarTrigger: "",
    calendarContent:
      "z-50 max-w-[calc(100vw-2rem)] overflow-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg",
    calendar: "border-0 bg-transparent shadow-none",
  },
  variants: {
    rangeColor: { secondary: {}, accent: {} },
    variant: { outline: {}, soft: {}, bare: {} },
    size: {
      xs: {
        root: "gap-1 text-xs leading-4",
      },
      sm: {
        root: "gap-1 text-[13px] leading-4",
      },
      md: {
        root: "gap-1.5 text-sm leading-5",
      },
      lg: {
        root: "gap-2 text-sm leading-5",
      },
      xl: {
        root: "gap-2.5 text-base leading-6",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type DateRangeFieldVariants = VariantProps<typeof dateRangeFieldVariants>;
export type DateRangeFieldConfig = Pick<DateRangeFieldVariants, "size" | "variant" | "rangeColor">;
export type DateRangeFieldSlots = InstanceType<typeof Akaza.DateRangeField>["$slots"];
export interface DateRangeFieldProps extends Omit<
  PrimitiveDateRangeFieldProps,
  "ui" | "class" | "size"
> {
  calendarLabel?: string;
  showCalendar?: boolean;
  calendarOpen?: boolean;
  class?: HTMLAttributes["class"];
  ui?: Akaza.DateRangeFieldUi & {
    popover?: string;
    fields?: string;
    calendarTrigger?: string;
    calendarContent?: string;
    calendar?: Akaza.CalendarUi;
  };
  size?: DateRangeFieldVariants["size"];
  rangeColor?: DateRangeFieldVariants["rangeColor"];
  variant?: DateRangeFieldVariants["variant"];
  modelValue?: Akaza.CalendarDateRange;
}
export function resolveDateRangeFieldVariants(
  props: DateRangeFieldVariants,
  config: UiConfig,
): DateRangeFieldVariants {
  return resolveVariants(
    props,
    config.components?.dateRangeField,
    config.defaults,
    dateRangeFieldVariants.variants,
  );
}
export { default as DateRangeField } from "./DateRangeField.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    dateRangeField?: DateRangeFieldConfig;
  }
}
