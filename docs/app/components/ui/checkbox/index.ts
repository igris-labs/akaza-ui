import type { CheckboxProps as PrimitiveCheckboxProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const checkboxVariants = tv({
  slots: {
    wrapper: "inline-flex items-start gap-2 [@media(pointer:coarse)]:min-h-11",
    root: "relative mt-0.5 inline-flex shrink-0 items-center justify-center border border-input bg-background text-primary-foreground transition-colors duration-150 ease-interaction outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-[akaza-state=checked]:border-primary data-[akaza-state=checked]:bg-primary data-[akaza-state=indeterminate]:border-primary data-[akaza-state=indeterminate]:bg-primary motion-reduce:transition-none pointer-coarse:before:absolute pointer-coarse:before:top-1/2 pointer-coarse:before:left-1/2 pointer-coarse:before:size-11 pointer-coarse:before:-translate-1/2",
    indicator: "inline-flex items-center justify-center [&_svg]:size-full",
    input: "sr-only",
    text: "flex min-w-0 flex-col gap-1",
    label: "leading-5 font-medium text-foreground",
    description: "text-xs leading-5 text-muted-foreground",
  },
  variants: {
    size: {
      xs: {
        root: "size-3 rounded-[3.0px]",
        indicator: "size-2",
        label: "text-xs leading-4",
        wrapper: "gap-1",
      },
      sm: {
        root: "size-3.5 rounded-[3.5px]",
        indicator: "size-2.5",
        label: "text-[13px] leading-4",
        wrapper: "gap-1",
      },
      md: {
        root: "size-4 rounded-[4.0px]",
        indicator: "size-3",
        label: "text-sm leading-5",
        wrapper: "gap-1.5",
      },
      lg: {
        root: "size-4.5 rounded-[4.5px]",
        indicator: "size-3.5",
        label: "text-sm leading-5",
        wrapper: "gap-2",
      },
      xl: {
        root: "size-5 rounded-[5.0px]",
        indicator: "size-4",
        label: "text-base leading-6",
        wrapper: "gap-2.5",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type CheckboxVariants = VariantProps<typeof checkboxVariants>;
export type CheckboxConfig = Pick<CheckboxVariants, "size">;
export type CheckboxSlots = InstanceType<typeof Akaza.Checkbox>["$slots"];
export interface CheckboxProps extends Omit<PrimitiveCheckboxProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.CheckboxUi;
  size?: CheckboxVariants["size"];
  modelValue?: Akaza.CheckboxValue;
}
export function resolveCheckboxVariants(
  props: CheckboxVariants,
  config: UiConfig,
): CheckboxVariants {
  return resolveVariants(
    props,
    config.components?.checkbox,
    config.defaults,
    checkboxVariants.variants,
  );
}
export { default as Checkbox } from "./Checkbox.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    checkbox?: CheckboxConfig;
  }
}
