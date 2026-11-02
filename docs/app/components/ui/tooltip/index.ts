import type { TooltipProps as PrimitiveTooltipProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const tooltipVariants = tv({
  slots: {
    root: "inline-flex",
    trigger:
      "rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    content:
      "z-50 max-w-64 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-popover px-2 py-1 text-xs leading-5 text-popover-foreground shadow-md",
    arrow: "fill-popover stroke-border",
  },
  variants: {
    size: {
      xs: {
        content: "rounded-[calc(var(--radius)*0.5+4px)] px-2 py-0.5 text-xs leading-4",
      },
      sm: {
        content: "rounded-lg px-2.5 py-1 text-[13px] leading-4",
      },
      md: {
        content: "rounded-[calc(var(--radius)*0.8+4px)] px-3 py-1.5 text-sm leading-5",
      },
      lg: {
        content: "rounded-xl px-3.5 py-2 text-sm leading-5",
      },
      xl: {
        content: "rounded-[calc(var(--radius)*1.2+4px)] px-4 py-2.5 text-base leading-6",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type TooltipVariants = VariantProps<typeof tooltipVariants>;
export type TooltipConfig = Pick<TooltipVariants, "size">;
export type TooltipSlots = InstanceType<typeof Akaza.Tooltip>["$slots"];
export interface TooltipProps extends Omit<PrimitiveTooltipProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.TooltipUi;
  size?: TooltipVariants["size"];
  modelValue?: boolean;
}
export function resolveTooltipVariants(props: TooltipVariants, config: UiConfig): TooltipVariants {
  return resolveVariants(
    props,
    config.components?.tooltip,
    config.defaults,
    tooltipVariants.variants,
  );
}
export { default as Tooltip } from "./Tooltip.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    tooltip?: TooltipConfig;
  }
}
