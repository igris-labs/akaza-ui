import type { ToggleProps as PrimitiveToggleProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const toggleVariants = tv({
  slots: {
    root: "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-[akaza-state=on]:border-primary data-[akaza-state=on]:bg-linear-to-b data-[akaza-state=on]:from-primary/85 data-[akaza-state=on]:to-primary data-[akaza-state=on]:text-primary-foreground data-[akaza-state=on]:shadow-[0_1px_2px_oklch(0_0_0/0.14),inset_0_1px_0_oklch(1_0_0/0.14)] motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
  },
  variants: {
    size: {
      xs: {
        root: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
      },
      sm: {
        root: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
      },
      md: {
        root: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
      },
      lg: {
        root: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
      },
      xl: {
        root: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
      },
    },
    variant: {
      soft: {
        root: "bg-primary/7.5 text-primary hover:bg-primary/11.25",
      },
      outline: {
        root: "border border-input",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "soft",
  },
});
export type ToggleVariants = VariantProps<typeof toggleVariants>;
export type ToggleConfig = Pick<ToggleVariants, "size" | "variant">;
export type ToggleSlots = InstanceType<typeof Akaza.Toggle>["$slots"];
export interface ToggleProps extends Omit<
  PrimitiveToggleProps,
  "ui" | "class" | "size" | "variant"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.ToggleUi;
  size?: ToggleVariants["size"];
  variant?: ToggleVariants["variant"];
  modelValue?: boolean;
}
export function resolveToggleVariants(props: ToggleVariants, config: UiConfig): ToggleVariants {
  return resolveVariants(
    props,
    config.components?.toggle,
    config.defaults,
    toggleVariants.variants,
  );
}
export { default as Toggle } from "./Toggle.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    toggle?: ToggleConfig;
  }
}
