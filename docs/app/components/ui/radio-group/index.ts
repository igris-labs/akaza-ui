import type { RadioGroupProps as PrimitiveRadioGroupProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const radioGroupVariants = tv({
  slots: {
    root: "flex flex-col gap-2 data-[akaza-orientation=horizontal]:flex-row data-[akaza-orientation=horizontal]:flex-wrap",
    item: "group/radio inline-flex w-fit cursor-pointer items-start gap-2 rounded-md text-left outline-none select-none focus-visible:ring-1 focus-visible:ring-ring data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 [@media(pointer:coarse)]:min-h-11",
    indicator:
      "mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors duration-150 ease-interaction group-hover/radio:border-ring group-data-[akaza-state=checked]/radio:border-primary after:block after:scale-50 after:rounded-full after:bg-primary after:opacity-0 after:transition-[scale,opacity] after:duration-180 after:ease-interaction group-data-[akaza-state=checked]/radio:after:scale-100 group-data-[akaza-state=checked]/radio:after:opacity-100 motion-reduce:transition-none motion-reduce:after:transition-none",
    input: "sr-only",
    text: "flex flex-col gap-0.5",
    label: "text-sm font-medium text-foreground",
    description: "text-xs text-muted-foreground",
    legend: "mb-2 text-sm font-medium text-highlighted",
  },
  variants: {
    size: {
      xs: {
        item: "gap-2",
        indicator: "size-3 after:size-1.5",
        label: "text-xs leading-4",
        root: "gap-2",
      },
      sm: {
        item: "gap-2",
        indicator: "size-3.5 after:size-2",
        label: "text-[13px] leading-4",
        root: "gap-2.5",
      },
      md: {
        item: "gap-2",
        indicator: "size-4 after:size-2.5",
        label: "text-sm leading-5",
        root: "gap-3",
      },
      lg: {
        item: "gap-2",
        indicator: "size-4.5 after:size-3",
        label: "text-sm leading-5",
        root: "gap-3.5",
      },
      xl: {
        item: "gap-2",
        indicator: "size-5 after:size-3.5",
        label: "text-base leading-6",
        root: "gap-4",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type RadioGroupVariants = VariantProps<typeof radioGroupVariants>;
export type RadioGroupConfig = Pick<RadioGroupVariants, "size">;
export type RadioGroupSlots = InstanceType<typeof Akaza.RadioGroup>["$slots"];
export interface RadioGroupProps extends Omit<PrimitiveRadioGroupProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.RadioGroupUi;
  size?: RadioGroupVariants["size"];
  modelValue?: string;
}
export function resolveRadioGroupVariants(
  props: RadioGroupVariants,
  config: UiConfig,
): RadioGroupVariants {
  return resolveVariants(
    props,
    config.components?.radioGroup,
    config.defaults,
    radioGroupVariants.variants,
  );
}
export { default as RadioGroup } from "./RadioGroup.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    radioGroup?: RadioGroupConfig;
  }
}
