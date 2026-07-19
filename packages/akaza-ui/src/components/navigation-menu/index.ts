import type { Component } from "vue";

export { default as NavigationMenu } from "./NavigationMenu.vue";

export interface NavigationMenuItem {
  value?: string;
  label: string;
  href?: string;
  to?: unknown;
  as?: string | Component;
  description?: string;
  disabled?: boolean;
  active?: boolean;
  ariaCurrent?: "page" | "step" | "location" | "date" | "time" | true | false;
  children?: NavigationMenuItem[];
  slot?: string;
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
  contentList?: string;
  contentItem?: string;
  contentLink?: string;
  label?: string;
  description?: string;
}

export interface NavigationMenuProps {
  items: NavigationMenuItem[];
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  openDelay?: number;
  closeDelay?: number;
  ariaLabel?: string;
  ui?: NavigationMenuUi;
}
