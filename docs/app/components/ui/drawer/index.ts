import type { DrawerProps as PrimitiveDrawerProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const drawerVariants = tv({
  slots: {
    overlay: "fixed inset-0 bg-scrim",
    content:
      "max-w-[calc(100vw-2rem)] border border-border bg-popover text-popover-foreground shadow-xl outline-none",
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
export type DrawerVariants = VariantProps<typeof drawerVariants>;
export type DrawerConfig = Pick<DrawerVariants, "width">;
export type DrawerSlots = InstanceType<typeof Akaza.Drawer>["$slots"];
export interface DrawerProps extends Omit<PrimitiveDrawerProps, "ui" | "class" | "width"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.DrawerUi;
  width?: DrawerVariants["width"];
  modelValue?: boolean;
}
export function resolveDrawerVariants(props: DrawerVariants, config: UiConfig): DrawerVariants {
  return resolveVariants(
    props,
    config.components?.drawer,
    config.defaults,
    drawerVariants.variants,
  );
}
export { default as Drawer } from "./Drawer.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    drawer?: DrawerConfig;
  }
}
