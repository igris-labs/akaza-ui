import type { SeparatorProps as PrimitiveSeparatorProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const separatorVariants = tv({
  slots: {
    root: "shrink-0 bg-border data-[akaza-orientation=horizontal]:h-px data-[akaza-orientation=horizontal]:w-full data-[akaza-orientation=vertical]:h-full data-[akaza-orientation=vertical]:w-px",
  },
  variants: {
    variant: {
      default: {},
      muted: {
        root: "bg-border/50",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
export type SeparatorVariants = VariantProps<typeof separatorVariants>;
export type SeparatorConfig = Pick<SeparatorVariants, "variant">;
export type SeparatorSlots = InstanceType<typeof Akaza.Separator>["$slots"];
export interface SeparatorProps extends Omit<PrimitiveSeparatorProps, "ui" | "class" | "variant"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.SeparatorUi;
  variant?: SeparatorVariants["variant"];
}
export function resolveSeparatorVariants(
  props: SeparatorVariants,
  config: UiConfig,
): SeparatorVariants {
  return resolveVariants(
    props,
    config.components?.separator,
    config.defaults,
    separatorVariants.variants,
  );
}
export { default as Separator } from "./Separator.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    separator?: SeparatorConfig;
  }
}
