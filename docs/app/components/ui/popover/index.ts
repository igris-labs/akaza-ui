import type { PopoverProps as PrimitivePopoverProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const popoverVariants = tv({
  slots: {
    root: "inline-flex",
    content:
      "z-50 w-max max-w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg motion-reduce:transition-none",
  },
  variants: {
    size: {
      xs: { content: "rounded-[calc(var(--radius)*0.5+4px)] text-xs leading-4" },
      sm: { content: "rounded-lg text-[13px] leading-5" },
      md: { content: "rounded-[calc(var(--radius)*0.8+4px)] text-sm leading-6" },
      lg: { content: "rounded-xl text-sm leading-6" },
      xl: { content: "rounded-[calc(var(--radius)*1.2+4px)] text-base leading-7" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
export type PopoverVariants = VariantProps<typeof popoverVariants>;
export type PopoverConfig = Pick<PopoverVariants, "size">;
export type PopoverSlots = InstanceType<typeof Akaza.Popover>["$slots"];
export interface PopoverProps extends Omit<PrimitivePopoverProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.PopoverUi;
  size?: PopoverVariants["size"];
  modelValue?: boolean;
}
export function resolvePopoverVariants(props: PopoverVariants, config: UiConfig): PopoverVariants {
  return resolveVariants(
    props,
    config.components?.popover,
    config.defaults,
    popoverVariants.variants,
  );
}
export { default as Popover } from "./Popover.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    popover?: PopoverConfig;
  }
}
