import type { MeterProps as PrimitiveMeterProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const meterVariants = tv({
  slots: {
    root: "grid w-full gap-1.5",
    label: "text-xs font-medium text-foreground",
    value: "text-xs text-muted-foreground tabular-nums",
    track: "overflow-hidden rounded-full bg-muted",
    indicator:
      "h-full rounded-full bg-primary transition-[width,background-color] duration-200 ease-interaction data-[akaza-state=critical]:bg-destructive data-[akaza-state=suboptimal]:bg-warning motion-reduce:transition-none",
  },
  variants: {
    size: {
      xs: {
        track: "h-1",
      },
      sm: {
        track: "h-1.5",
      },
      md: {
        track: "h-2",
      },
      lg: {
        track: "h-2.5",
      },
      xl: {
        track: "h-3",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type MeterVariants = VariantProps<typeof meterVariants>;
export type MeterConfig = Pick<MeterVariants, "size">;
export type MeterSlots = InstanceType<typeof Akaza.Meter>["$slots"];
export interface MeterProps extends Omit<PrimitiveMeterProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.MeterUi;
  size?: MeterVariants["size"];
}
export function resolveMeterVariants(props: MeterVariants, config: UiConfig): MeterVariants {
  return resolveVariants(props, config.components?.meter, config.defaults, meterVariants.variants);
}
export { default as Meter } from "./Meter.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    meter?: MeterConfig;
  }
}
