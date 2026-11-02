import type { TimeRangeFieldProps as PrimitiveTimeRangeFieldProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const timeRangeFieldVariants = tv({
  slots: {
    root: "flex flex-wrap items-center gap-2",
    start: "",
    startField: "",
    separator: "text-muted-foreground",
    end: "",
    endField: "",
    hiddenInput: "sr-only",
  },
  variants: {
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
export type TimeRangeFieldVariants = VariantProps<typeof timeRangeFieldVariants>;
export type TimeRangeFieldConfig = Pick<TimeRangeFieldVariants, "size">;
export type TimeRangeFieldSlots = InstanceType<typeof Akaza.TimeRangeField>["$slots"];
export interface TimeRangeFieldProps extends Omit<
  PrimitiveTimeRangeFieldProps,
  "ui" | "class" | "size"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.TimeRangeFieldUi;
  size?: TimeRangeFieldVariants["size"];
  modelValue?: Akaza.TimeRange;
  placeholder?: Akaza.TimeValue | undefined;
}
export function resolveTimeRangeFieldVariants(
  props: TimeRangeFieldVariants,
  config: UiConfig,
): TimeRangeFieldVariants {
  return resolveVariants(
    props,
    config.components?.timeRangeField,
    config.defaults,
    timeRangeFieldVariants.variants,
  );
}
export { default as TimeRangeField } from "./TimeRangeField.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    timeRangeField?: TimeRangeFieldConfig;
  }
}
