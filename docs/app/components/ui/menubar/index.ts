import type { MenubarProps as PrimitiveMenubarProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const menubarVariants = tv({
  slots: {
    root: "inline-flex items-center gap-1 rounded-lg border border-border bg-background p-1",
    // Keep fixed submenus in viewport coordinates while the parent fades in.
    content:
      "z-50 max-w-[calc(100vw-2rem)] min-w-40 translate-none! scale-none! transform-none! overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg data-[akaza-side=bottom]:mt-[3px] data-[akaza-side=top]:-mt-[3px] motion-reduce:transition-none",
    panel: "min-w-40",
    submenuIndicator: "ms-auto size-4 shrink-0 text-muted-foreground rtl:rotate-180",
    item: "relative isolate flex cursor-pointer items-center gap-2 rounded-md text-left text-foreground transition-colors duration-150 ease-interaction outline-none select-none before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-px before:-z-10 before:rounded-[inherit] before:transition-colors before:duration-150 before:ease-interaction hover:before:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-highlighted:before:bg-muted data-[akaza-state=checked]:text-foreground data-[akaza-state=checked]:before:bg-muted motion-reduce:transition-none motion-reduce:before:transition-none [@media(pointer:coarse)]:min-h-11",
    checkboxItem:
      "relative isolate flex cursor-pointer items-center gap-2 rounded-md text-left text-foreground transition-colors duration-150 ease-interaction outline-none select-none before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-px before:-z-10 before:rounded-[inherit] before:transition-colors before:duration-150 before:ease-interaction hover:before:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-highlighted:before:bg-muted data-[akaza-state=checked]:text-foreground data-[akaza-state=checked]:before:bg-muted motion-reduce:transition-none motion-reduce:before:transition-none [@media(pointer:coarse)]:min-h-11",
    radioItem:
      "relative isolate flex cursor-pointer items-center gap-2 rounded-md text-left text-foreground transition-colors duration-150 ease-interaction outline-none select-none before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-px before:-z-10 before:rounded-[inherit] before:transition-colors before:duration-150 before:ease-interaction hover:before:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-highlighted:before:bg-muted data-[akaza-state=checked]:text-foreground data-[akaza-state=checked]:before:bg-muted motion-reduce:transition-none motion-reduce:before:transition-none [@media(pointer:coarse)]:min-h-11",
    indicator: "ms-auto size-4 shrink-0 text-primary",
    itemLabel: "min-w-0 flex-1 truncate",
    separator: "my-1 h-px bg-border",
    label: "px-2 py-1.5 text-xs font-semibold text-highlighted",
    group: "py-1",
    submenu: "",
    submenuTrigger:
      "relative isolate flex cursor-pointer items-center gap-2 rounded-md text-left text-foreground transition-colors duration-150 ease-interaction outline-none select-none before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-px before:-z-10 before:rounded-[inherit] before:transition-colors before:duration-150 before:ease-interaction hover:before:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-highlighted:before:bg-muted data-[akaza-state=checked]:text-foreground data-[akaza-state=checked]:before:bg-muted motion-reduce:transition-none motion-reduce:before:transition-none [@media(pointer:coarse)]:min-h-11",
    // Akaza anchors to the row, inset 5px from the panel edge; add a 2px surface gap.
    submenuContent:
      "z-50 max-w-[calc(100vw-2rem)] min-w-40 translate-none! scale-none! transform-none! overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg data-[akaza-side=left]:-ml-[7px] data-[akaza-side=right]:ml-[7px] motion-reduce:transition-none",
    trigger:
      "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none select-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
  },
  variants: {
    size: {
      xs: {
        trigger:
          "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4 [&_svg]:size-3",
        item: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4 [&_svg]:size-3",
        checkboxItem:
          "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4 [&_svg]:size-3",
        radioItem:
          "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4 [&_svg]:size-3",
        submenuTrigger:
          "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4 [&_svg]:size-3",
      },
      sm: {
        trigger: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4 [&_svg]:size-3.5",
        item: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4 [&_svg]:size-3.5",
        checkboxItem: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4 [&_svg]:size-3.5",
        radioItem: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4 [&_svg]:size-3.5",
        submenuTrigger:
          "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4 [&_svg]:size-3.5",
      },
      md: {
        trigger: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5 [&_svg]:size-4",
        item: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5 [&_svg]:size-4",
        checkboxItem: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5 [&_svg]:size-4",
        radioItem: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5 [&_svg]:size-4",
        submenuTrigger: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5 [&_svg]:size-4",
      },
      lg: {
        trigger: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5 [&_svg]:size-4.5",
        item: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5 [&_svg]:size-4.5",
        checkboxItem: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5 [&_svg]:size-4.5",
        radioItem: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5 [&_svg]:size-4.5",
        submenuTrigger: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5 [&_svg]:size-4.5",
      },
      xl: {
        trigger:
          "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6 [&_svg]:size-5",
        item: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6 [&_svg]:size-5",
        checkboxItem:
          "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6 [&_svg]:size-5",
        radioItem:
          "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6 [&_svg]:size-5",
        submenuTrigger:
          "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6 [&_svg]:size-5",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type MenubarVariants = VariantProps<typeof menubarVariants>;
export type MenubarConfig = Pick<MenubarVariants, "size">;
export type MenubarSlots = InstanceType<typeof Akaza.Menubar>["$slots"];
export interface MenubarProps extends Omit<PrimitiveMenubarProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.MenubarUi & { indicator?: string; itemLabel?: string; submenuIndicator?: string };
  size?: MenubarVariants["size"];
  modelValue?: string | null;
  "onUpdate:modelValue"?: (value: string | null) => void;
  onSelect?: (item: Akaza.MenuItem, details: Akaza.AkazaChangeEventDetails) => void;
  "onOpen-change"?: (value: string | null, details: Akaza.AkazaChangeEventDetails) => void;
  "onCheck-change"?: (
    item: Akaza.MenuItem,
    checked: boolean,
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onRadio-change"?: (group: string, value: string, details: Akaza.AkazaChangeEventDetails) => void;
  "onUpdate:radioValues"?: (values: Record<string, string>) => void;
}
export function resolveMenubarVariants(props: MenubarVariants, config: UiConfig): MenubarVariants {
  return resolveVariants(
    props,
    config.components?.menubar,
    config.defaults,
    menubarVariants.variants,
  );
}
export { default as Menubar } from "./Menubar.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    menubar?: MenubarConfig;
  }
}
