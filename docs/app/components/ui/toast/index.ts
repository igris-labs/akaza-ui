import type { ToastProps as PrimitiveToastProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const toastVariants = tv({
  slots: {
    viewport:
      "fixed z-[var(--akaza-z-toast,calc(var(--akaza-z-layer-base,1200)+100))] grid w-[min(24rem,calc(100vw-2rem))] [--akaza-toast-content-duration:250ms] [--akaza-toast-duration:500ms] [--akaza-toast-height-duration:150ms] data-[akaza-align=left]:left-4 data-[akaza-align=right]:right-4 data-[akaza-side=bottom]:bottom-[max(1rem,env(safe-area-inset-bottom))] data-[akaza-side=top]:top-[max(1rem,env(safe-area-inset-top))]",
    toast:
      "relative h-[var(--ipex-toast-height,auto)]! overflow-visible border border-border bg-popover text-popover-foreground shadow-lg in-data-[akaza-expanded=false]:data-akaza-behind:h-(--akaza-toast-frontmost-height)! data-[akaza-type=error]:border-destructive/25 motion-reduce:transition-none [&>*]:motion-reduce:transition-none",
    layout:
      "grid max-h-[calc(100dvh-6rem)] grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-y-2 overflow-y-auto",
    icon: "mt-0.5 shrink-0 text-muted-foreground data-[type=alert]:text-destructive data-[type=error]:text-destructive data-[type=info]:text-info data-[type=success]:text-success data-[type=warning]:text-warning",
    content: "flex min-w-0 flex-col gap-1",
    title: "font-medium wrap-anywhere text-highlighted",
    description: "wrap-anywhere text-muted-foreground",
    close:
      "inline-flex shrink-0 cursor-pointer items-center justify-center self-start rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-foreground/5 hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none pointer-coarse:min-h-11 pointer-coarse:min-w-11",
    action:
      "col-start-2 inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 justify-self-start border border-border bg-background font-medium text-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none pointer-coarse:min-h-11 pointer-coarse:min-w-11",
  },
  variants: {
    size: {
      xs: {
        toast: "rounded-[calc(var(--radius)*0.5+4px)] p-2 text-xs leading-4",
        layout: "gap-x-2",
        icon: "size-3",
        close: "size-5 rounded-[calc(var(--radius)*0.5)] [&_svg]:size-3",
        action:
          "min-h-6 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4 [&_svg]:size-3",
      },
      sm: {
        toast: "rounded-lg p-2.5 text-[13px] leading-5",
        layout: "gap-x-2",
        icon: "size-3.5",
        close: "size-6 rounded-sm [&_svg]:size-3.5",
        action: "min-h-7 rounded-sm px-2.5 py-1 text-[13px] leading-4 [&_svg]:size-3.5",
      },
      md: {
        toast: "rounded-[calc(var(--radius)*0.8+4px)] p-3 text-sm leading-5",
        layout: "gap-x-2.5",
        icon: "size-4",
        close: "size-7 rounded-md [&_svg]:size-4",
        action: "min-h-8 rounded-md px-3 py-1 text-sm leading-5 [&_svg]:size-4",
      },
      lg: {
        toast: "rounded-xl p-3.5 text-sm leading-6",
        layout: "gap-x-3",
        icon: "size-4.5",
        close: "size-8 rounded-lg [&_svg]:size-4.5",
        action: "min-h-9 rounded-lg px-3.5 py-1 text-sm leading-5 [&_svg]:size-4.5",
      },
      xl: {
        toast: "rounded-[calc(var(--radius)*1.2+4px)] p-4 text-base leading-6",
        layout: "gap-x-3",
        icon: "size-5",
        close: "size-9 rounded-[calc(var(--radius)*1.2)] [&_svg]:size-5",
        action:
          "min-h-10 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6 [&_svg]:size-5",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type ToastVariants = VariantProps<typeof toastVariants>;
export type ToastConfig = Pick<ToastVariants, "size">;
export type ToastSlots = InstanceType<typeof Akaza.Toast>["$slots"];
export interface ToastProps extends Omit<PrimitiveToastProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.ToastUi & Partial<Record<"layout" | "icon" | "content", string>>;
  size?: ToastVariants["size"];
}
export function resolveToastVariants(props: ToastVariants, config: UiConfig): ToastVariants {
  return resolveVariants(props, config.components?.toast, config.defaults, toastVariants.variants);
}
export { default as Toast } from "./Toast.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    toast?: ToastConfig;
  }
}
