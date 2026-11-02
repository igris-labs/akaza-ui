import type { NumberFieldProps as PrimitiveNumberFieldProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const numberFieldVariants = tv({
  slots: {
    root: "inline-flex items-center overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring [@media(pointer:coarse)]:min-h-11",
    scrubArea:
      "inline-flex h-full shrink-0 touch-none cursor-ew-resize items-center border-e border-border text-xs font-medium text-muted-foreground select-none data-akaza-scrubbing:text-highlighted",
    decrement:
      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    input:
      "min-w-0 flex-1 [appearance:textfield] border-0 bg-transparent text-center tabular-nums outline-none placeholder:text-muted-foreground [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
    increment:
      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
  },
  variants: {
    size: {
      xs: {
        scrubArea: "px-2",
        root: "h-6 rounded-[calc(var(--radius)*0.5)] text-xs leading-4",
        input: "h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
        decrement: "h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
        increment: "h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
      },
      sm: {
        scrubArea: "px-2.5",
        root: "h-7 rounded-sm text-[13px] leading-4",
        input: "h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
        decrement: "h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
        increment: "h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
      },
      md: {
        scrubArea: "px-3",
        root: "h-8 rounded-md text-sm leading-5",
        input: "h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
        decrement: "h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
        increment: "h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
      },
      lg: {
        scrubArea: "px-3.5",
        root: "h-9 rounded-lg text-sm leading-5",
        input: "h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
        decrement: "h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
        increment: "h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
      },
      xl: {
        scrubArea: "px-4",
        root: "h-10 rounded-[calc(var(--radius)*1.2)] text-base leading-6",
        input: "h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
        decrement: "h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
        increment: "h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
      },
    },
    variant: {
      outline: {
        root: "border-input bg-background",
        input: "border-input bg-background",
      },
      soft: {
        root: "border-transparent bg-muted",
        input: "border-transparent bg-muted",
        decrement: "hover:bg-foreground/8",
        increment: "hover:bg-foreground/8",
      },
      bare: {
        root: "border-transparent bg-transparent focus-visible:ring-0 data-akaza-focused:ring-0",
        input: "border-transparent bg-transparent focus-visible:ring-0 data-akaza-focused:ring-0",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "outline",
  },
});
export type NumberFieldVariants = VariantProps<typeof numberFieldVariants>;
export type NumberFieldConfig = Pick<NumberFieldVariants, "size" | "variant">;
export type NumberFieldSlots = InstanceType<typeof Akaza.NumberField>["$slots"];
export interface NumberFieldProps extends Omit<
  PrimitiveNumberFieldProps,
  "ui" | "class" | "size" | "variant"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.NumberFieldUi;
  size?: NumberFieldVariants["size"];
  variant?: NumberFieldVariants["variant"];
  modelValue?: number | null;
}
export function resolveNumberFieldVariants(
  props: NumberFieldVariants,
  config: UiConfig,
): NumberFieldVariants {
  return resolveVariants(
    props,
    config.components?.numberField,
    config.defaults,
    numberFieldVariants.variants,
  );
}
export { default as NumberField } from "./NumberField.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    numberField?: NumberFieldConfig;
  }
}
