import type { HoverPreviewCardProps as PrimitiveHoverPreviewCardProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const hoverPreviewCardVariants = tv({
  slots: {
    root: "inline-flex",
    trigger:
      "rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    content:
      "z-50 w-max max-w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-popover p-3 text-sm leading-6 text-popover-foreground shadow-lg motion-reduce:transition-none",
    arrow: "fill-popover stroke-border",
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
export type HoverPreviewCardVariants = VariantProps<typeof hoverPreviewCardVariants>;
export type HoverPreviewCardConfig = Pick<HoverPreviewCardVariants, "size">;
export type HoverPreviewCardSlots = InstanceType<typeof Akaza.HoverPreviewCard>["$slots"];
export interface HoverPreviewCardProps extends Omit<
  PrimitiveHoverPreviewCardProps,
  "ui" | "class" | "size"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.HoverPreviewCardUi;
  size?: HoverPreviewCardVariants["size"];
  modelValue?: boolean;
}
export function resolveHoverPreviewCardVariants(
  props: HoverPreviewCardVariants,
  config: UiConfig,
): HoverPreviewCardVariants {
  return resolveVariants(
    props,
    config.components?.hoverPreviewCard,
    config.defaults,
    hoverPreviewCardVariants.variants,
  );
}
export { default as HoverPreviewCard } from "./HoverPreviewCard.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    hoverPreviewCard?: HoverPreviewCardConfig;
  }
}
