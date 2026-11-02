import type { AccordionProps as PrimitiveAccordionProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const accordionVariants = tv({
  slots: {
    root: "w-full overflow-hidden rounded-lg border border-border bg-background shadow-none data-[akaza-orientation=horizontal]:grid data-[akaza-orientation=horizontal]:auto-cols-fr data-[akaza-orientation=horizontal]:grid-flow-col data-[akaza-orientation=horizontal]:[&>.akaza-accordion-item]:border-e data-[akaza-orientation=horizontal]:[&>.akaza-accordion-item]:border-b-0 data-[akaza-orientation=horizontal]:[&>.akaza-accordion-item:last-child]:border-e-0",
    item: "group min-w-0 border-b border-border last:border-b-0",
    trigger:
      "flex w-full items-center justify-between rounded-none text-left font-medium text-highlighted transition-colors duration-150 ease-interaction outline-none hover:bg-foreground/5 focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-[akaza-state=open]:bg-foreground/3 motion-reduce:transition-none pointer-coarse:min-h-11",
    icon: "shrink-0 rotate-0 transform-none text-muted-foreground transition-transform duration-180 ease-interaction data-[akaza-state=open]:rotate-180 motion-reduce:transition-none",
    contentWrapper:
      "grid grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-180 ease-interaction data-[akaza-state=open]:grid-rows-[1fr] motion-reduce:transition-none",
    contentInner: "min-h-0 overflow-hidden",
    content: "text-muted-foreground",
  },
  variants: {
    size: {
      xs: {
        root: "rounded-[calc(var(--radius)*0.5+4px)]",
        trigger: "min-h-10 gap-1 px-3 py-2 text-xs leading-4",
        icon: "size-3",
        content: "px-3 pt-1 pb-3 text-xs leading-5",
      },
      sm: {
        root: "rounded-lg",
        trigger: "min-h-11 gap-1 px-4 py-2.5 text-[13px] leading-4",
        icon: "size-3.5",
        content: "px-4 pt-2 pb-4 text-[13px] leading-5",
      },
      md: {
        root: "rounded-[calc(var(--radius)*0.8+4px)]",
        trigger: "min-h-12 gap-1.5 px-5 py-3 text-sm leading-5",
        icon: "size-4",
        content: "px-5 pt-2 pb-5 text-sm leading-6",
      },
      lg: {
        root: "rounded-xl",
        trigger: "min-h-13 gap-2 px-6 py-3.5 text-sm leading-5",
        icon: "size-4.5",
        content: "px-6 pt-3 pb-6 text-sm leading-6",
      },
      xl: {
        root: "rounded-[calc(var(--radius)*1.2+4px)]",
        trigger: "min-h-14 gap-2.5 px-7 py-4 text-base leading-6",
        icon: "size-5",
        content: "px-7 pt-3 pb-7 text-base leading-7",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type AccordionVariants = VariantProps<typeof accordionVariants>;
export type AccordionConfig = Pick<AccordionVariants, "size">;
export type AccordionSlots = InstanceType<typeof Akaza.Accordion>["$slots"];
export interface AccordionProps extends Omit<PrimitiveAccordionProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.AccordionUi;
  size?: AccordionVariants["size"];
  modelValue?: string | string[];
}
export function resolveAccordionVariants(
  props: AccordionVariants,
  config: UiConfig,
): AccordionVariants {
  return resolveVariants(
    props,
    config.components?.accordion,
    config.defaults,
    accordionVariants.variants,
  );
}
export { default as Accordion } from "./Accordion.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    accordion?: AccordionConfig;
  }
}
