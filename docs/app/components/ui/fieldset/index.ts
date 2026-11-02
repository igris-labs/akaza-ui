import type { FieldsetProps as PrimitiveFieldsetProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const fieldsetVariants = tv({
  slots: {
    root: "min-w-0 space-y-4",
    legend: "mb-1 text-sm font-semibold text-highlighted",
    description: "mb-4 text-xs leading-5 text-muted-foreground",
    content: "space-y-4",
  },
  variants: {},
  defaultVariants: {},
});
export type FieldsetVariants = VariantProps<typeof fieldsetVariants>;
export type FieldsetConfig = Record<string, never>;
export type FieldsetSlots = InstanceType<typeof Akaza.Fieldset>["$slots"];
export interface FieldsetProps extends Omit<PrimitiveFieldsetProps, "ui" | "class"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.FieldsetUi;
}
export function resolveFieldsetVariants(
  props: FieldsetVariants,
  config: UiConfig,
): FieldsetVariants {
  return resolveVariants(
    props,
    config.components?.fieldset,
    config.defaults,
    fieldsetVariants.variants,
  );
}
export { default as Fieldset } from "./Fieldset.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    fieldset?: FieldsetConfig;
  }
}
