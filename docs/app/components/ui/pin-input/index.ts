import type { PinInputProps as PrimitivePinInputProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const pinInputVariants = tv({
  slots: {
    root: "inline-flex items-center gap-2 [@media(pointer:coarse)]:gap-1",
    hiddenInput: "sr-only",
    input:
      "border border-input bg-background text-center text-foreground tabular-nums shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
  },
  variants: {
    size: {
      xs: {
        input: "h-6 w-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-0 text-xs leading-4",
      },
      sm: {
        input: "h-7 w-7 gap-1 rounded-sm px-0 text-[13px] leading-4",
      },
      md: {
        input: "h-8 w-8 gap-1.5 rounded-md px-0 text-sm leading-5",
      },
      lg: {
        input: "h-9 w-9 gap-2 rounded-lg px-0 text-sm leading-5",
      },
      xl: {
        input: "h-10 w-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-0 text-base leading-6",
      },
    },
    variant: {
      outline: {
        input: "border-input bg-background",
      },
      soft: {
        input: "border-transparent bg-muted",
      },
      bare: {
        input: "border-transparent bg-transparent focus-visible:ring-0 data-akaza-focused:ring-0",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "outline",
  },
});
export type PinInputVariants = VariantProps<typeof pinInputVariants>;
export type PinInputConfig = Pick<PinInputVariants, "size" | "variant">;
export type PinInputSlots = InstanceType<typeof Akaza.PinInput>["$slots"];
export interface PinInputProps extends Omit<
  PrimitivePinInputProps,
  "ui" | "class" | "size" | "variant"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.PinInputUi;
  size?: PinInputVariants["size"];
  variant?: PinInputVariants["variant"];
  modelValue?: string;
}
export function resolvePinInputVariants(
  props: PinInputVariants,
  config: UiConfig,
): PinInputVariants {
  return resolveVariants(
    props,
    config.components?.pinInput,
    config.defaults,
    pinInputVariants.variants,
  );
}
export { default as PinInput } from "./PinInput.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    pinInput?: PinInputConfig;
  }
}
