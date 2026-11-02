import type { FieldProps as PrimitiveFieldProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const fieldVariants = tv({
  slots: {
    root: "flex flex-col gap-1.5",
    label: "text-sm font-medium text-foreground",
    required: "ml-0.5 text-destructive",
    control: "min-w-0",
    description: "text-xs leading-5 text-muted-foreground",
    error: "text-xs leading-5 text-destructive",
  },
  variants: {},
  defaultVariants: {},
});
export type FieldVariants = VariantProps<typeof fieldVariants>;
export type FieldConfig = Record<string, never>;
export type FieldSlots = InstanceType<typeof Akaza.Field>["$slots"];
export interface FieldProps extends Omit<PrimitiveFieldProps, "ui" | "class"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.FieldUi;
}
export function resolveFieldVariants(props: FieldVariants, config: UiConfig): FieldVariants {
  return resolveVariants(props, config.components?.field, config.defaults, fieldVariants.variants);
}
export { default as Field } from "./Field.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    field?: FieldConfig;
  }
}
