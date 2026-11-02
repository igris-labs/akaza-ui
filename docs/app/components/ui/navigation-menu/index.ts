import type { NavigationMenuProps as PrimitiveNavigationMenuProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const navigationMenuVariants = tv({
  slots: {
    track: "pointer-events-none absolute left-0 z-0 w-px bg-border/60",
    root: "",
    list: "relative isolate flex gap-1 before:pointer-events-none before:absolute before:top-0 before:left-0 before:z-0 before:h-(--nav-height) before:w-(--nav-width) before:translate-x-(--nav-x) before:translate-y-(--nav-y) before:rounded-(--nav-radius) before:bg-muted before:opacity-[var(--nav-opacity,0)] before:transition-[translate,width,height,opacity] before:duration-180 before:ease-interaction motion-reduce:before:transition-none",
    item: "relative z-10",
    trigger:
      "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none select-none hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    link: "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none select-none hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    indicator: "hidden",
    content:
      "z-50 max-w-[calc(100vw-2rem)] min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg motion-reduce:transition-none",
    viewport: "overflow-hidden",
    panel: "w-max max-w-[min(20rem,calc(100vw-2rem))] p-1",
    contentList: "grid gap-1",
    contentItem: "",
    contentLink:
      "relative isolate flex w-full cursor-pointer flex-col items-start gap-2 rounded-md text-left text-foreground transition-colors duration-150 ease-interaction outline-none select-none before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-px before:-z-10 before:rounded-[inherit] before:transition-colors before:duration-150 before:ease-interaction hover:before:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-highlighted:before:bg-muted data-[akaza-state=checked]:text-foreground data-[akaza-state=checked]:before:bg-muted motion-reduce:transition-none motion-reduce:before:transition-none",
    label: "font-medium whitespace-normal",
    description: "max-w-64 text-xs leading-5 whitespace-normal text-muted-foreground",
    itemLeading: "flex size-4 shrink-0 items-center justify-center",
    itemLabel: "min-w-0 flex-1 truncate",
    itemTrailing: "ml-auto text-xs text-muted-foreground",
    badge: "rounded bg-muted px-1.5 py-0.5 text-xs",
    childIndicator:
      "size-3.5 transition-transform duration-180 ease-interaction data-[akaza-state=open]:rotate-180 motion-reduce:transition-none",
    inlineList: "flex flex-col gap-0.5 border-l border-border pl-3",
    inlineItem: "",
    inlineTrigger:
      "inline-flex w-full shrink-0 cursor-pointer items-center justify-center justify-start gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none select-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    inlineLink:
      "inline-flex w-full shrink-0 cursor-pointer items-center justify-center justify-start gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none select-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    inlineContent: "overflow-hidden",
    inlineContentInner: "min-h-0",
    groupLabel: "px-2 py-2 text-xs font-medium text-muted-foreground",
    separator: "my-1 h-px bg-border",
    tooltip:
      "z-50 min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 px-2 py-1 text-xs text-popover-foreground shadow-lg motion-reduce:transition-none",
  },
  variants: {
    size: {
      xs: {
        trigger:
          "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4 [&_svg]:size-3",
        link: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4 [&_svg]:size-3",
        inlineTrigger:
          "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
        inlineLink: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
        contentLink:
          "min-h-6 gap-0.5 rounded-[calc(var(--radius)*0.5)] px-2 py-1.5 text-xs leading-4",
        childIndicator: "size-3",
        itemLeading: "size-3",
      },
      sm: {
        trigger: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4 [&_svg]:size-3.5",
        link: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4 [&_svg]:size-3.5",
        inlineTrigger: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
        inlineLink: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
        contentLink: "min-h-7 gap-1 rounded-sm px-2.5 py-2 text-[13px] leading-4",
        childIndicator: "size-3.5",
        itemLeading: "size-3.5",
      },
      md: {
        trigger: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5 [&_svg]:size-4",
        link: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5 [&_svg]:size-4",
        inlineTrigger: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
        inlineLink: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
        contentLink: "min-h-8 gap-1 rounded-md px-3 py-2.5 text-sm leading-5",
        childIndicator: "size-4",
        itemLeading: "size-4",
      },
      lg: {
        trigger: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5 [&_svg]:size-4.5",
        link: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5 [&_svg]:size-4.5",
        inlineTrigger: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
        inlineLink: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
        contentLink: "min-h-9 gap-1 rounded-lg px-3.5 py-3 text-sm leading-5",
        childIndicator: "size-4.5",
        itemLeading: "size-4.5",
      },
      xl: {
        trigger:
          "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6 [&_svg]:size-5",
        link: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6 [&_svg]:size-5",
        inlineTrigger:
          "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
        inlineLink:
          "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
        contentLink:
          "min-h-10 gap-1.5 rounded-[calc(var(--radius)*1.2)] px-4 py-3.5 text-base leading-6",
        childIndicator: "size-5",
        itemLeading: "size-5",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type NavigationMenuVariants = VariantProps<typeof navigationMenuVariants>;
export type NavigationMenuConfig = Pick<NavigationMenuVariants, "size">;
export type NavigationMenuSlots = Akaza.NavigationMenuSlots;
export interface NavigationMenuProps extends Omit<
  PrimitiveNavigationMenuProps,
  "ui" | "class" | "size"
> {
  highlightMode?: "hover" | "selection" | "selection-hover";
  class?: HTMLAttributes["class"];
  ui?: Akaza.NavigationMenuUi & { track?: string };
  size?: NavigationMenuVariants["size"];
  open?: string | null;
  expanded?: string[] | undefined;
  modelValue?: string | null | undefined;
}
export function resolveNavigationMenuVariants(
  props: NavigationMenuVariants,
  config: UiConfig,
): NavigationMenuVariants {
  return resolveVariants(
    props,
    config.components?.navigationMenu,
    config.defaults,
    navigationMenuVariants.variants,
  );
}
export { default as NavigationMenu } from "./NavigationMenu.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    navigationMenu?: NavigationMenuConfig;
  }
}
