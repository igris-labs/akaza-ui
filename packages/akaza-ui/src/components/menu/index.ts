import type { Component } from "vue";

export { default as Menu } from "./Menu.vue";
export { default as MenuItem } from "./MenuItem.vue";
export { default as MenuSeparator } from "./MenuSeparator.vue";

export interface MenuUi {
  content?: string;
}

export interface MenuProps {
  as?: string;
  ui?: MenuUi;
}

export interface MenuItemProps {
  as?: string | Component;
  disabled?: boolean;
}

export interface MenuSeparatorProps {
  as?: string;
}
