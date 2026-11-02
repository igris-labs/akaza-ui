import type { AlertDialogProps as PrimitiveAlertDialogProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const alertDialogVariants = tv({
  slots: {
    overlay: "fixed inset-0 bg-scrim",
    content:
      "max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover text-popover-foreground shadow-xl outline-none",
    header: "flex flex-col gap-1.5 border-b border-border px-4 py-3",
    title: "text-base font-semibold text-highlighted",
    description: "text-sm leading-6 text-muted-foreground",
    body: "p-4 text-sm leading-6",
    footer: "flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3",
  },
  variants: {
    width: {
      xs: {
        content: "w-[min(20rem,calc(100vw-2rem))] max-w-none",
      },
      sm: {
        content: "w-[min(24rem,calc(100vw-2rem))] max-w-none",
      },
      md: {
        content: "w-[min(32rem,calc(100vw-2rem))] max-w-none",
      },
      lg: {
        content: "w-[min(40rem,calc(100vw-2rem))] max-w-none",
      },
      xl: {
        content: "w-[min(48rem,calc(100vw-2rem))] max-w-none",
      },
    },
  },
  defaultVariants: {
    width: "md",
  },
});
export type AlertDialogVariants = VariantProps<typeof alertDialogVariants>;
export type AlertDialogConfig = Pick<AlertDialogVariants, "width">;
export type AlertDialogSlots = InstanceType<typeof Akaza.AlertDialog>["$slots"];
export interface AlertDialogProps extends Omit<
  PrimitiveAlertDialogProps,
  "ui" | "class" | "width"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.AlertDialogUi;
  width?: AlertDialogVariants["width"];
  modelValue?: boolean;
}
export function resolveAlertDialogVariants(
  props: AlertDialogVariants,
  config: UiConfig,
): AlertDialogVariants {
  return resolveVariants(
    props,
    config.components?.alertDialog,
    config.defaults,
    alertDialogVariants.variants,
  );
}
export { default as AlertDialog } from "./AlertDialog.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    alertDialog?: AlertDialogConfig;
  }
}
