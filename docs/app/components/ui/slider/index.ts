import type { SliderProps as PrimitiveSliderProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const sliderVariants = tv({
  slots: {
    root: "relative flex touch-none items-center select-none data-[akaza-orientation=vertical]:min-h-32 data-[akaza-orientation=vertical]:flex-col [@media(pointer:coarse)]:min-h-11",
    input: "sr-only",
    track: "relative w-full rounded-full bg-muted",
    range: "absolute rounded-full bg-primary",
    thumb:
      "rounded-full border border-border bg-background shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50",
  },
  variants: {
    size: {
      xs: {
        root: "min-h-6",
        track: "h-0.5",
        thumb: "size-3",
        range: "h-full",
      },
      sm: {
        root: "min-h-7",
        track: "h-1",
        thumb: "size-3.5",
        range: "h-full",
      },
      md: {
        root: "min-h-8",
        track: "h-1.5",
        thumb: "size-4",
        range: "h-full",
      },
      lg: {
        root: "min-h-9",
        track: "h-2",
        thumb: "size-4.5",
        range: "h-full",
      },
      xl: {
        root: "min-h-10",
        track: "h-2.5",
        thumb: "size-5",
        range: "h-full",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type SliderVariants = VariantProps<typeof sliderVariants>;
export type SliderConfig = Pick<SliderVariants, "size">;
export type SliderSlots = InstanceType<typeof Akaza.Slider>["$slots"];
export interface SliderProps extends Omit<PrimitiveSliderProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.SliderUi;
  size?: SliderVariants["size"];
  modelValue?: Akaza.SliderValue;
}
export function resolveSliderVariants(props: SliderVariants, config: UiConfig): SliderVariants {
  return resolveVariants(
    props,
    config.components?.slider,
    config.defaults,
    sliderVariants.variants,
  );
}
export { default as Slider } from "./Slider.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    slider?: SliderConfig;
  }
}
