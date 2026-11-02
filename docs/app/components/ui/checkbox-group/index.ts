import type { CheckboxGroupProps as PrimitiveCheckboxGroupProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const checkboxGroupVariants = tv({
  slots: {
    root: "flex flex-col gap-2",
    input: "sr-only",
    legend: "mb-1 text-sm font-medium text-highlighted",
    parentItem: "mb-1 border-b border-border pb-2",
    item: "py-0",
    checkbox: "",
  },
  variants: {
    size: {
      xs: {
        root: "gap-1",
      },
      sm: {
        root: "gap-1.5",
      },
      md: {
        root: "gap-2",
      },
      lg: {
        root: "gap-2.5",
      },
      xl: {
        root: "gap-3",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type CheckboxGroupVariants = VariantProps<typeof checkboxGroupVariants>;
export type CheckboxGroupConfig = Pick<CheckboxGroupVariants, "size">;
export type CheckboxGroupSlots = InstanceType<typeof Akaza.CheckboxGroup>["$slots"];
export interface CheckboxGroupProps extends Omit<PrimitiveCheckboxGroupProps, "ui" | "class"> {
  size?: CheckboxGroupVariants["size"];
  class?: HTMLAttributes["class"];
  ui?: Akaza.CheckboxGroupUi;
  modelValue?: Akaza.CheckboxGroupValue[];
}
export function resolveCheckboxGroupVariants(
  props: CheckboxGroupVariants,
  config: UiConfig,
): CheckboxGroupVariants {
  return resolveVariants(
    props,
    config.components?.checkboxGroup,
    config.defaults,
    checkboxGroupVariants.variants,
  );
}
export { default as CheckboxGroup } from "./CheckboxGroup.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    checkboxGroup?: CheckboxGroupConfig;
  }
}
