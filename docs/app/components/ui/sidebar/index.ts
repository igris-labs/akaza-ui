import type { SidebarProps as PrimitiveSidebarProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

const navigationShell = {
  panel: "border-r border-border/50 bg-background",
  header: "hidden items-center justify-between px-4 py-3 in-data-akaza-mobile:flex",
  body: "px-4 py-8",
  footer: "mx-4 border-t border-border/50 px-2 py-5 text-xs text-muted-foreground",
};

export const sidebarVariants = tv({
  slots: {
    root: "bg-background text-foreground",
    panel: "border-r border-border bg-background",
    header: "flex min-h-12 items-center gap-2 border-b border-border px-3",
    body: "p-3",
    footer: "border-t border-border px-3 py-3 text-xs text-muted-foreground",
    resizeHandle: "w-1 cursor-col-resize hover:bg-info/20 focus-visible:bg-info/20",
    mobileOverlay: "bg-scrim",
    mobileContent: "border-r border-border bg-background text-foreground shadow-xl",
    mobileWrapper: "",
  },
  variants: {
    variant: {
      default: {},
      soft: navigationShell,
      subtle: navigationShell,
      muted: {
        panel: "bg-muted/40",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
const navigationControl =
  "flex w-full items-center justify-start border-0 text-left text-muted-foreground outline-none transition-colors duration-150 hover:bg-transparent hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring data-akaza-active:bg-foreground/10 data-akaza-active:font-medium data-akaza-active:text-highlighted motion-reduce:transition-none";

function navigationSize(
  control: string,
  icon: string,
  label: string,
  indent: string,
  groupGap: string,
) {
  return {
    list: groupGap,
    link: control,
    trigger: control,
    inlineLink: control,
    inlineTrigger: control,
    itemLeading: icon,
    childIndicator: icon,
    groupLabel: label,
    inlineList: indent,
  };
}
const lineControl =
  "hover:bg-transparent data-akaza-active:bg-transparent data-akaza-active:inset-ring-0";
const subtleActive = "data-akaza-active:inset-ring data-akaza-active:inset-ring-foreground/15";

export const sidebarNavigationVariants = tv({
  slots: {
    root: "",
    track: "",
    list: "flex w-full flex-col items-stretch gap-0 before:bg-foreground/6 data-[ipex-highlight-active=true]:before:opacity-0 [&>li:not([data-nav-track])~li:has(>.akaza-navigation-menu-group-label)]:mt-(--sidebar-group-gap)",
    item: "w-full [&:has(>.akaza-navigation-menu-link,>.akaza-navigation-menu-trigger)]:py-0.5",
    link: navigationControl,
    trigger: navigationControl,
    inlineList: "gap-0 border-0",
    inlineItem: "py-0.5",
    inlineLink: `${navigationControl} hover:bg-foreground/6`,
    inlineTrigger: navigationControl,
    groupLabel: "py-0 font-medium text-highlighted",
    itemLeading:
      "flex shrink-0 items-center justify-center text-muted-foreground [&:empty:not(.iconify)]:hidden [&>.iconify]:size-full [&>svg]:size-full",
  },
  variants: {
    design: {
      standard: {},
      rail: {
        list: "before:left-0 before:h-[calc(var(--nav-height)-0.75rem)] before:w-[1.5px] before:translate-x-0 before:translate-y-[calc(var(--nav-y)+0.375rem)] before:rounded-full before:bg-foreground after:pointer-events-none after:absolute after:top-0 after:left-0 after:z-0 after:h-[calc(var(--nav-hover-height,0px)-0.75rem)] after:w-[1.5px] after:translate-y-[calc(var(--nav-hover-y,0px)+0.375rem)] after:rounded-full after:bg-foreground/20 after:opacity-[var(--nav-hover-opacity,0)] after:transition-[translate,height,opacity] after:duration-180 after:ease-interaction data-[ipex-highlight-active=true]:before:opacity-[var(--nav-opacity,0)] data-[ipex-hover-active=true]:after:opacity-0 motion-reduce:after:transition-none",
      },
      line: {
        list: "before:h-[calc(var(--nav-height)-0.75rem)] before:w-[1.5px] before:translate-y-[calc(var(--nav-y)+0.375rem)] before:rounded-full before:bg-foreground data-[ipex-highlight-active=true]:before:opacity-[var(--nav-opacity,0)]",
      },
    },
    mode: {
      ungrouped: {},
      grouped: {
        list: "[&>li:not([data-nav-track])~li:has(>button_[data-sidebar-group])]:mt-(--sidebar-group-gap)",
        trigger:
          "[&:has([data-sidebar-group])]:bg-transparent [&:has([data-sidebar-group])]:hover:bg-foreground/6 [&:has([data-sidebar-group])]:focus-visible:bg-foreground/6 [&:has([data-sidebar-group])]:data-akaza-active:bg-transparent [&:has([data-sidebar-group])]:data-akaza-active:inset-ring-0 [&:has([data-sidebar-group])]:data-akaza-active:hover:bg-foreground/6",
        inlineTrigger:
          "[&:has([data-sidebar-group])]:bg-transparent [&:has([data-sidebar-group])]:hover:bg-foreground/6 [&:has([data-sidebar-group])]:focus-visible:bg-foreground/6 [&:has([data-sidebar-group])]:data-akaza-active:bg-transparent [&:has([data-sidebar-group])]:data-akaza-active:inset-ring-0 [&:has([data-sidebar-group])]:data-akaza-active:hover:bg-foreground/6",
      },
    },
    itemSize: {
      xs: navigationSize(
        "min-h-6.5 gap-1.5 rounded-[calc(var(--radius)*0.5)] px-2 py-0.5 text-xs leading-4",
        "size-3",
        "px-2 pb-1 text-[11px] leading-4",
        "pl-2",
        "[--sidebar-group-gap:8px]",
      ),
      sm: navigationSize(
        "min-h-7.5 gap-2.5 rounded-md px-2.5 py-0.5 text-[13px] leading-5",
        "size-3.5",
        "px-2.5 pb-1.5 text-xs leading-4",
        "pl-3",
        "[--sidebar-group-gap:12px]",
      ),
      md: navigationSize(
        "min-h-8.5 gap-3 rounded-lg px-3 py-1 text-sm leading-5",
        "size-4",
        "px-3 pb-1.5 text-xs leading-4",
        "pl-3",
        "[--sidebar-group-gap:16px]",
      ),
      lg: navigationSize(
        "min-h-9.5 gap-3 rounded-[calc(var(--radius)*1.2)] px-3.5 py-1 text-sm leading-5",
        "size-4.5",
        "px-3.5 pb-2 text-[13px] leading-5",
        "pl-4",
        "[--sidebar-group-gap:20px]",
      ),
      xl: navigationSize(
        "min-h-10.5 gap-3.5 rounded-[calc(var(--radius)*1.4)] px-4 py-1.5 text-base leading-6",
        "size-5",
        "px-4 pb-2 text-sm leading-5",
        "pl-4",
        "[--sidebar-group-gap:24px]",
      ),
    },
    variant: {
      soft: {},
      subtle: {
        link: subtleActive,
        trigger: subtleActive,
        inlineLink: subtleActive,
        inlineTrigger: subtleActive,
      },
    },
  },
  compoundVariants: [
    {
      design: ["line", "rail"],
      class: {
        link: lineControl,
        trigger: lineControl,
        inlineLink: lineControl,
        inlineTrigger: lineControl,
      },
    },
  ],
  defaultVariants: { mode: "ungrouped", design: "standard", itemSize: "sm", variant: "soft" },
});
export type SidebarItem = Akaza.NavigationMenuItem;
export function groupSidebarItems(items: SidebarItem[]): SidebarItem[] {
  const result: SidebarItem[] = [];
  let group: SidebarItem | undefined;
  for (const item of items) {
    if (item.type === "label") {
      group = {
        ...item,
        type: "item",
        value: item.value ?? `sidebar-group:${item.label}`,
        children: [...(item.children ?? [])],
        defaultExpanded: item.defaultExpanded ?? true,
        sidebarGroup: true,
      };
      result.push(group);
    } else if (group) group.children!.push(item);
    else result.push(item);
  }
  return result.map((item) =>
    item.sidebarGroup && !item.children?.length ? { ...item, type: "label" } : item,
  );
}
export type SidebarUi = Akaza.SidebarUi & {
  navigation?: Akaza.NavigationMenuUi & { track?: string };
};
export type SidebarVariants = VariantProps<typeof sidebarVariants> &
  Pick<VariantProps<typeof sidebarNavigationVariants>, "itemSize" | "design" | "mode">;
export type SidebarConfig = Pick<SidebarVariants, "variant" | "itemSize" | "design" | "mode">;
export type SidebarSlots = Akaza.SidebarSlots &
  Pick<Akaza.NavigationMenuSlots, "item-leading" | "item-label" | "item-trailing">;
export interface SidebarProps extends Omit<PrimitiveSidebarProps, "ui" | "class" | "variant"> {
  class?: HTMLAttributes["class"];
  ui?: SidebarUi;
  items?: SidebarItem[];
  modelValue?: string | null;
  navigationLabel?: string;
  variant?: SidebarVariants["variant"];
  itemSize?: SidebarVariants["itemSize"];
  design?: SidebarVariants["design"];
  mode?: SidebarVariants["mode"];
  open?: boolean | undefined;
  collapsed?: boolean | undefined;
  size?: number;
}
export function resolveSidebarVariants(props: SidebarVariants, config: UiConfig): SidebarVariants {
  return resolveVariants(
    props,
    config.components?.sidebar,
    { ...config.defaults, itemSize: config.defaults?.size },
    {
      ...sidebarVariants.variants,
      itemSize: sidebarNavigationVariants.variants.itemSize,
      design: sidebarNavigationVariants.variants.design,
      mode: sidebarNavigationVariants.variants.mode,
    },
  );
}
export { default as Sidebar } from "./Sidebar.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    sidebar?: SidebarConfig;
  }
}
