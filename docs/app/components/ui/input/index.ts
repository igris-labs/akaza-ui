import type { InputProps as PrimitiveInputProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const inputVariants = tv({
  slots: {
    root: "w-full border border-input bg-background text-foreground shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
  },
  variants: {
    size: {
      xs: {
        root: "h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
      },
      sm: {
        root: "h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
      },
      md: {
        root: "h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
      },
      lg: {
        root: "h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
      },
      xl: {
        root: "h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
      },
    },
    variant: {
      outline: {
        root: "border-input bg-background",
      },
      soft: {
        root: "border-transparent bg-muted",
      },
      bare: {
        root: "border-transparent bg-transparent focus-visible:ring-0 data-akaza-focused:ring-0",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "outline",
  },
});
export type InputVariants = VariantProps<typeof inputVariants>;
export type InputConfig = Pick<InputVariants, "size" | "variant">;
export type InputSlots = InstanceType<typeof Akaza.Input>["$slots"];
export interface InputProps extends Omit<PrimitiveInputProps, "ui" | "class" | "size" | "variant"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.InputUi;
  size?: InputVariants["size"];
  variant?: InputVariants["variant"];
  modelValue?: string;
  "onValue-change"?: (value: string, details: Akaza.AkazaChangeEventDetails) => void;
  "onUpdate:modelValue"?: (value: string) => void;
}
export function resolveInputVariants(props: InputVariants, config: UiConfig): InputVariants {
  return resolveVariants(props, config.components?.input, config.defaults, inputVariants.variants);
}
export { default as Input } from "./Input.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    input?: InputConfig;
  }
}
