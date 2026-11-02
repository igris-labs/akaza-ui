import type { FormProps as PrimitiveFormProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const formVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
  },
  variants: {},
  defaultVariants: {},
});
export type FormVariants = VariantProps<typeof formVariants>;
export type FormConfig = Record<string, never>;
export type FormSlots = InstanceType<typeof Akaza.Form>["$slots"];
export interface FormProps extends Omit<PrimitiveFormProps, "ui" | "class"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.FormUi;
}
export function resolveFormVariants(props: FormVariants, config: UiConfig): FormVariants {
  return resolveVariants(props, config.components?.form, config.defaults, formVariants.variants);
}
export { default as Form } from "./Form.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    form?: FormConfig;
  }
}
