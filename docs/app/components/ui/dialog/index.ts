import type { DialogProps as PrimitiveDialogProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const dialogVariants = tv({
  slots: {
    overlay: "fixed inset-0 bg-scrim motion-reduce:transition-none",
    content:
      "max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover text-popover-foreground shadow-xl outline-none data-akaza-fullscreen:h-dvh data-akaza-fullscreen:w-screen data-akaza-fullscreen:max-w-none data-akaza-fullscreen:overflow-auto data-akaza-fullscreen:rounded-none motion-reduce:transition-none",
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
export type DialogVariants = VariantProps<typeof dialogVariants>;
export type DialogConfig = Pick<DialogVariants, "width">;
export type DialogSlots = InstanceType<typeof Akaza.Dialog>["$slots"];
export interface DialogProps extends Omit<PrimitiveDialogProps, "ui" | "class" | "width"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.DialogUi;
  width?: DialogVariants["width"];
  modelValue?: boolean;
}
export function resolveDialogVariants(props: DialogVariants, config: UiConfig): DialogVariants {
  return resolveVariants(
    props,
    config.components?.dialog,
    config.defaults,
    dialogVariants.variants,
  );
}
export { default as Dialog } from "./Dialog.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    dialog?: DialogConfig;
  }
}
