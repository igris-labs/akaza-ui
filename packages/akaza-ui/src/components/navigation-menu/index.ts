import type { Component, VNodeChild } from "vue";
import type { AkazaChangeEventDetails } from "../../types";

export { default as NavigationMenu } from "./NavigationMenu.vue";

export type NavigationMenuOrientation = "horizontal" | "vertical";
export type NavigationMenuContentMode = "auto" | "flyout" | "inline";
export type NavigationMenuItemType = "item" | "label" | "separator";

export interface NavigationMenuItem {
  value?: string;
  label: string;
  type?: NavigationMenuItemType;
  href?: string;
  to?: unknown;
  as?: string | Component;
  icon?: Component;
  badge?: string | number;
  description?: string;
  disabled?: boolean;
  active?: boolean;
  defaultExpanded?: boolean;
  ariaCurrent?: "page" | "step" | "location" | "date" | "time" | true | false;
  children?: NavigationMenuItem[];
  slot?: string;
  onClick?: (event: MouseEvent) => void;
  onSelect?: () => void;
  [key: string]: unknown;
}

export interface NavigationMenuUi {
  root?: string;
  list?: string;
  item?: string;
  trigger?: string;
  link?: string;
  indicator?: string;
  content?: string;
  viewport?: string;
  panel?: string;
  contentList?: string;
  contentItem?: string;
  contentLink?: string;
  label?: string;
  description?: string;
  itemLeading?: string;
  itemLabel?: string;
  itemTrailing?: string;
  badge?: string;
  childIndicator?: string;
  inlineList?: string;
  inlineItem?: string;
  inlineTrigger?: string;
  inlineLink?: string;
  inlineContent?: string;
  inlineContentInner?: string;
  groupLabel?: string;
  separator?: string;
  tooltip?: string;
}

export interface NavigationMenuProps {
  items: NavigationMenuItem[];
  defaultValue?: string | null;
  orientation?: NavigationMenuOrientation;
  contentMode?: NavigationMenuContentMode;
  collapsed?: boolean;
  tooltip?: boolean;
  defaultExpanded?: string[];
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  openDelay?: number;
  closeDelay?: number;
  sideOffset?: number;
  teleport?: string | false;
  ariaLabel?: string;
  ui?: NavigationMenuUi;
}

export interface NavigationMenuExpandedChangeEventDetails extends AkazaChangeEventDetails {
  item: NavigationMenuItem;
  expanded: boolean;
}

export interface NavigationMenuValueChangeEventDetails extends AkazaChangeEventDetails {
  item: NavigationMenuItem;
}

export type NavigationMenuAction = (reasonOrEvent?: string | Event, event?: Event) => void;

export interface NavigationMenuSlotProps {
  item: NavigationMenuItem;
  isOpen: boolean;
  isActive: boolean;
  depth: number;
  collapsed: boolean;
  toggle: NavigationMenuAction;
}

export interface NavigationMenuSlots {
  trigger?: (props: NavigationMenuSlotProps) => VNodeChild;
  link?: (props: NavigationMenuSlotProps) => VNodeChild;
  item?: (props: NavigationMenuSlotProps) => VNodeChild;
  "item-leading"?: (props: NavigationMenuSlotProps) => VNodeChild;
  "item-label"?: (props: NavigationMenuSlotProps) => VNodeChild;
  "item-trailing"?: (props: NavigationMenuSlotProps) => VNodeChild;
  "child-indicator"?: (props: NavigationMenuSlotProps) => VNodeChild;
  [name: string]: ((props: NavigationMenuSlotProps) => VNodeChild) | undefined;
}
