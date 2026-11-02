import type { StepperProps as PrimitiveStepperProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const stepperVariants = tv({
  slots: {
    root: "group/stepper flex w-full min-w-0 flex-col gap-5 [--step-size:1.75rem]",
    list: "flex w-full items-center gap-3 data-[akaza-orientation=vertical]:items-stretch",
    item: "group/step flex min-w-0 flex-1 items-center gap-3 group-data-[akaza-orientation=vertical]/stepper:flex-col group-data-[akaza-orientation=vertical]/stepper:items-stretch last:flex-none",
    trigger:
      "flex shrink-0 cursor-pointer items-center gap-2 rounded-md text-left outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50",
    indicator:
      "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-muted font-medium text-muted-foreground transition-colors duration-180 ease-interaction group-data-[akaza-state=active]/step:border-primary group-data-[akaza-state=active]/step:bg-primary group-data-[akaza-state=active]/step:text-primary-foreground group-data-[akaza-state=completed]/step:border-primary/30 group-data-[akaza-state=completed]/step:bg-primary/10 group-data-[akaza-state=completed]/step:text-primary motion-reduce:transition-none",
    text: "flex min-w-0 flex-col gap-0.5",
    title: "text-sm font-medium text-foreground",
    description: "text-xs leading-5 text-muted-foreground",
    optional: "text-xs text-dimmed",
    separator:
      "h-px min-w-6 flex-1 rounded-full bg-border transition-colors duration-180 ease-interaction group-data-[akaza-orientation=vertical]/stepper:ms-[calc(var(--step-size)/2)] group-data-[akaza-orientation=vertical]/stepper:h-5 group-data-[akaza-orientation=vertical]/stepper:w-px group-data-[akaza-orientation=vertical]/stepper:min-w-0 group-data-[akaza-orientation=vertical]/stepper:flex-none data-[akaza-state=completed]:bg-primary/40 motion-reduce:transition-none",
    panels: "grid min-w-0",
    panel:
      "invisible col-start-1 row-start-1 block! min-w-0 py-2 text-sm leading-6 opacity-0 transition-opacity duration-180 ease-interaction data-[akaza-state=active]:visible data-[akaza-state=active]:opacity-100 motion-reduce:transition-none",
    controls: "flex items-center justify-between gap-2",
    previous:
      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    next: "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
  },
  variants: {
    size: {
      xs: {
        root: "[--step-size:1.5rem]",
        previous: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
        next: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
        trigger: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-0 py-0 text-xs leading-4",
        indicator: "size-6 text-xs leading-4",
        title: "text-xs leading-4",
        list: "gap-3",
        item: "gap-3",
      },
      sm: {
        root: "[--step-size:1.75rem]",
        previous: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
        next: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
        trigger: "min-h-7 gap-2 rounded-sm px-0 py-0 text-[13px] leading-4",
        indicator: "size-7 text-[13px] leading-4",
        title: "text-[13px] leading-4",
        list: "gap-3",
        item: "gap-3",
      },
      md: {
        root: "[--step-size:2rem]",
        previous: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
        next: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
        trigger: "min-h-8 gap-2.5 rounded-md px-0 py-0 text-sm leading-5",
        indicator: "size-8 text-sm leading-5",
        title: "text-sm leading-5",
        list: "gap-3",
        item: "gap-3",
      },
      lg: {
        root: "[--step-size:2.25rem]",
        previous: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
        next: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
        trigger: "min-h-9 gap-3 rounded-lg px-0 py-0 text-sm leading-5",
        indicator: "size-9 text-sm leading-5",
        title: "text-sm leading-5",
        list: "gap-3",
        item: "gap-3",
      },
      xl: {
        root: "[--step-size:2.5rem]",
        previous:
          "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
        next: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
        trigger: "min-h-10 gap-3.5 rounded-[calc(var(--radius)*1.2)] px-0 py-0 text-base leading-6",
        indicator: "size-10 text-base leading-6",
        title: "text-base leading-6",
        list: "gap-3",
        item: "gap-3",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type StepperVariants = VariantProps<typeof stepperVariants>;
export type StepperConfig = Pick<StepperVariants, "size">;
export type StepperSlots = InstanceType<typeof Akaza.Stepper>["$slots"];
export interface StepperProps extends Omit<PrimitiveStepperProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.StepperUi;
  size?: StepperVariants["size"];
  modelValue?: Akaza.StepperValue;
}
export function resolveStepperVariants(props: StepperVariants, config: UiConfig): StepperVariants {
  return resolveVariants(
    props,
    config.components?.stepper,
    config.defaults,
    stepperVariants.variants,
  );
}
export { default as Stepper } from "./Stepper.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    stepper?: StepperConfig;
  }
}
