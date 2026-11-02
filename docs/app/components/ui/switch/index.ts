import type { SwitchProps as PrimitiveSwitchProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const switchVariants = tv({
  slots: {
    wrapper: "inline-flex items-start gap-2 [@media(pointer:coarse)]:min-h-11",
    root: "relative mt-0.5 inline-flex shrink-0 items-center rounded-full border border-input bg-muted p-px transition-colors duration-150 ease-interaction outline-none [--switch-x:0px] focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-[akaza-state=checked]:border-primary data-[akaza-state=checked]:bg-primary motion-reduce:transition-none pointer-coarse:before:absolute pointer-coarse:before:top-1/2 pointer-coarse:before:left-1/2 pointer-coarse:before:size-11 pointer-coarse:before:-translate-1/2",
    thumb:
      "block shrink-0 translate-x-(--switch-x) rounded-full bg-background shadow-sm transition-transform duration-150 ease-interaction motion-reduce:transition-none rtl:-translate-x-(--switch-x)",
    input: "sr-only",
    text: "flex flex-col gap-1",
    label: "leading-5 font-medium text-foreground",
    description: "text-xs leading-5 text-muted-foreground",
  },
  variants: {
    size: {
      xs: {
        root: "h-[14px] w-[24px] data-[akaza-state=checked]:[--switch-x:10px]",
        thumb: "size-[10px]",
        label: "text-xs leading-4",
        wrapper: "gap-2",
      },
      sm: {
        root: "h-[16px] w-[28px] data-[akaza-state=checked]:[--switch-x:12px]",
        thumb: "size-[12px]",
        label: "text-[13px] leading-4",
        wrapper: "gap-2",
      },
      md: {
        root: "h-[18px] w-[32px] data-[akaza-state=checked]:[--switch-x:14px]",
        thumb: "size-[14px]",
        label: "text-sm leading-5",
        wrapper: "gap-2.5",
      },
      lg: {
        root: "h-[20px] w-[36px] data-[akaza-state=checked]:[--switch-x:16px]",
        thumb: "size-[16px]",
        label: "text-sm leading-5",
        wrapper: "gap-3",
      },
      xl: {
        root: "h-[22px] w-[40px] data-[akaza-state=checked]:[--switch-x:18px]",
        thumb: "size-[18px]",
        label: "text-base leading-6",
        wrapper: "gap-3.5",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type SwitchVariants = VariantProps<typeof switchVariants>;
export type SwitchConfig = Pick<SwitchVariants, "size">;
export type SwitchSlots = InstanceType<typeof Akaza.Switch>["$slots"];
export interface SwitchProps extends Omit<PrimitiveSwitchProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.SwitchUi;
  size?: SwitchVariants["size"];
  modelValue?: Akaza.SwitchValue;
}
export function resolveSwitchVariants(props: SwitchVariants, config: UiConfig): SwitchVariants {
  return resolveVariants(
    props,
    config.components?.switch,
    config.defaults,
    switchVariants.variants,
  );
}
export { default as Switch } from "./Switch.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    switch?: SwitchConfig;
  }
}
