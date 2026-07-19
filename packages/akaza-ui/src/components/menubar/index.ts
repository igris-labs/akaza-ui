import type { MenuItem, MenuUi } from "../menu";

export { default as Menubar } from "./Menubar.vue";

export interface MenubarItem extends MenuItem {
  children?: MenuItem[] | MenuItem[][];
}

export interface MenubarUi extends MenuUi {
  root?: string;
  trigger?: string;
  content?: string;
}

export interface MenubarProps {
  items: MenubarItem[];
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  closeOnSelect?: boolean;
  radioValues?: Record<string, string>;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ui?: MenubarUi;
}
