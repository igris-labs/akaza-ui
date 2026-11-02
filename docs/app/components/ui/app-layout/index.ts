import type { AppLayoutProps as PrimitiveAppLayoutProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const appLayoutVariants = tv({
  slots: {
    root: "bg-background text-foreground",
    skipLink:
      "rounded-md bg-primary px-3 py-2 text-primary-foreground focus:outline-1 focus:outline-ring",
    header: "z-20 flex h-12 items-center border-b border-border bg-background px-3",
    left: "bg-background",
    main: "min-w-0 outline-none",
    right: "border-l border-border",
    footer: "border-t border-border px-3 py-3 text-xs text-muted-foreground",
  },
  variants: {},
  defaultVariants: {},
});
export type AppLayoutVariants = VariantProps<typeof appLayoutVariants>;
export type AppLayoutConfig = Record<string, never>;
export type AppLayoutSlots = Akaza.AppLayoutSlots;
export interface AppLayoutProps extends Omit<PrimitiveAppLayoutProps, "ui" | "class"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.AppLayoutUi;
}
export function resolveAppLayoutVariants(
  props: AppLayoutVariants,
  config: UiConfig,
): AppLayoutVariants {
  return resolveVariants(
    props,
    config.components?.appLayout,
    config.defaults,
    appLayoutVariants.variants,
  );
}
export { default as AppLayout } from "./AppLayout.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    appLayout?: AppLayoutConfig;
  }
}
