import type { RatingProps as PrimitiveRatingProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const ratingVariants = tv({
  slots: {
    root: "inline-flex cursor-pointer gap-1 select-none [--rating-target-size:var(--rating-icon-size)] data-akaza-disabled:cursor-default data-akaza-readonly:cursor-default pointer-coarse:[--rating-target-size:2.75rem]",
    hiddenInput: "sr-only",
    item: "relative inline-flex size-(--rating-target-size) shrink-0 text-dimmed",
    base: "pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground/40",
    fill: "pointer-events-none absolute inset-y-0 overflow-hidden text-warning",
    fillIcon: "flex h-full w-(--rating-target-size) shrink-0 items-center justify-center",
    radio:
      "cursor-inherit absolute inset-y-0 m-0 h-full rounded-sm border-0 bg-transparent p-0 outline-none select-none focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-50",
  },
  variants: {
    size: {
      xs: {
        root: "gap-1 [--rating-icon-size:0.75rem]",
      },
      sm: {
        root: "gap-1 [--rating-icon-size:0.875rem]",
      },
      md: {
        root: "gap-1.5 [--rating-icon-size:1rem]",
      },
      lg: {
        root: "gap-2 [--rating-icon-size:1.125rem]",
      },
      xl: {
        root: "gap-2.5 [--rating-icon-size:1.25rem]",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type RatingVariants = VariantProps<typeof ratingVariants>;
export type RatingConfig = Pick<RatingVariants, "size">;
export type RatingSlots = InstanceType<typeof Akaza.Rating>["$slots"];
export interface RatingProps extends Omit<PrimitiveRatingProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.RatingUi;
  size?: RatingVariants["size"];
  modelValue?: number;
}
export function resolveRatingVariants(props: RatingVariants, config: UiConfig): RatingVariants {
  return resolveVariants(
    props,
    config.components?.rating,
    config.defaults,
    ratingVariants.variants,
  );
}
export { default as Rating } from "./Rating.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    rating?: RatingConfig;
  }
}
