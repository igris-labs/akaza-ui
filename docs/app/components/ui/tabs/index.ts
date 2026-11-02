import type { TabsProps as PrimitiveTabsProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const tabsVariants = tv({
  slots: {
    root: "flex w-full min-w-0 flex-col gap-4 data-[akaza-orientation=vertical]:flex-row data-[akaza-orientation=vertical]:items-start",
    list: "relative isolate flex w-fit max-w-full items-center gap-1 overflow-x-auto bg-muted p-1 shadow-none aria-[orientation=vertical]:flex-col aria-[orientation=vertical]:items-stretch",
    tab: "relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 font-medium text-muted-foreground transition-colors duration-150 ease-interaction outline-none select-none hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-[akaza-state=active]:text-highlighted motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    indicator:
      "absolute bg-background shadow-none transition-[left,width,top,height] duration-180 ease-interaction in-aria-[orientation=horizontal]:inset-y-1 in-aria-[orientation=vertical]:inset-x-1 motion-reduce:transition-none",
    panels: "grid min-w-0 flex-1",
    panel:
      "invisible col-start-1 row-start-1 block! min-w-0 outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-[akaza-state=active]:visible",
  },
  variants: {
    size: {
      xs: {
        list: "rounded-[calc(var(--radius)*0.5+4px)]",
        indicator: "rounded-[calc(var(--radius)*0.5)]",
        tab: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
      },
      sm: {
        list: "rounded-lg",
        indicator: "rounded-sm",
        tab: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
      },
      md: {
        list: "rounded-[calc(var(--radius)*0.8+4px)]",
        indicator: "rounded-md",
        tab: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
      },
      lg: {
        list: "rounded-xl",
        indicator: "rounded-lg",
        tab: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
      },
      xl: {
        list: "rounded-[calc(var(--radius)*1.2+4px)]",
        indicator: "rounded-[calc(var(--radius)*1.2)]",
        tab: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
      },
    },
    variant: {
      line: {
        list: "rounded-none bg-transparent p-0",
        tab: "rounded-none",
        indicator:
          "rounded-none bg-foreground shadow-none ring-0 in-aria-[orientation=horizontal]:top-auto in-aria-[orientation=horizontal]:bottom-0 in-aria-[orientation=horizontal]:h-0.5 in-aria-[orientation=vertical]:right-auto in-aria-[orientation=vertical]:left-0 in-aria-[orientation=vertical]:w-0.5 dark:bg-foreground",
      },
      soft: {},
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "soft",
  },
});
export type TabsVariants = VariantProps<typeof tabsVariants>;
export type TabsConfig = Pick<TabsVariants, "size" | "variant">;
export type TabsSlots = InstanceType<typeof Akaza.Tabs>["$slots"];
export interface TabsProps extends Omit<PrimitiveTabsProps, "ui" | "class" | "size" | "variant"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.TabsUi;
  size?: TabsVariants["size"];
  variant?: TabsVariants["variant"];
  modelValue?: string;
}
export function resolveTabsVariants(props: TabsVariants, config: UiConfig): TabsVariants {
  return resolveVariants(props, config.components?.tabs, config.defaults, tabsVariants.variants);
}
export { default as Tabs } from "./Tabs.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    tabs?: TabsConfig;
  }
}
