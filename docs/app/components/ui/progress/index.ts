import type { ProgressProps as PrimitiveProgressProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const progressVariants = tv({
  slots: {
    root: "w-full overflow-hidden rounded-full bg-muted data-[akaza-orientation=vertical]:flex data-[akaza-orientation=vertical]:h-40 data-[akaza-orientation=vertical]:w-(--progress-thickness) data-[akaza-orientation=vertical]:flex-col data-[akaza-orientation=vertical]:[&>.akaza-progress-indicator]:mt-auto data-[akaza-orientation=vertical]:[&>.akaza-progress-indicator]:h-[var(--akaza-progress-percentage,100%)] data-[akaza-orientation=vertical]:[&>.akaza-progress-indicator]:w-full",
    indicator:
      "h-full w-(--akaza-progress-percentage) rounded-full bg-primary transition-[width,height] duration-200 ease-interaction data-[akaza-state=indeterminate]:h-full data-[akaza-state=indeterminate]:w-full motion-safe:data-[akaza-state=indeterminate]:animate-pulse motion-reduce:transition-none",
  },
  variants: {
    size: {
      xs: {
        root: "h-1 [--progress-thickness:0.25rem]",
      },
      sm: {
        root: "h-1.5 [--progress-thickness:0.375rem]",
      },
      md: {
        root: "h-2 [--progress-thickness:0.5rem]",
      },
      lg: {
        root: "h-2.5 [--progress-thickness:0.625rem]",
      },
      xl: {
        root: "h-3 [--progress-thickness:0.75rem]",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type ProgressVariants = VariantProps<typeof progressVariants>;
export type ProgressConfig = Pick<ProgressVariants, "size">;
export type ProgressSlots = InstanceType<typeof Akaza.Progress>["$slots"];
export interface ProgressProps extends Omit<PrimitiveProgressProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.ProgressUi;
  size?: ProgressVariants["size"];
  modelValue?: number | null;
}
export function resolveProgressVariants(
  props: ProgressVariants,
  config: UiConfig,
): ProgressVariants {
  return resolveVariants(
    props,
    config.components?.progress,
    config.defaults,
    progressVariants.variants,
  );
}
export { default as Progress } from "./Progress.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    progress?: ProgressConfig;
  }
}
