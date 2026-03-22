import type { Component } from "vue";

export { default as Menu } from "./Menu.vue";

export interface MenuItem {
  /** Display label */
  label?: string;
  /** Unique value identifier. Falls back to label if omitted. */
  value?: string;
  /** Item type. Defaults to 'item'. */
  type?: "item" | "checkbox" | "radio" | "separator" | "label";
  /** Whether the item is disabled */
  disabled?: boolean;
  /** For checkbox items: current checked state */
  checked?: boolean;
  /** For checkbox items: called when the user toggles */
  onUpdateChecked?: (checked: boolean) => void;
  /** For radio items: group name (items sharing a group are mutually exclusive) */
  radioGroup?: string;
  /** Sub-menu items. Accepts flat array or grouped (array of arrays). */
  children?: MenuItem[] | MenuItem[][];
  /** Named slot key for per-item rendering override */
  slot?: string;
  /** Per-item select callback (action items only) */
  onSelect?: () => void;
  /** Allow extra properties */
  [key: string]: unknown;
}

export interface MenuUi {
  content?: string;
  item?: string;
  separator?: string;
  label?: string;
  group?: string;
  submenuContent?: string;
}

export interface MenuProps {
  /** Root element tag */
  as?: string | Component;
  /** Menu items — flat array or grouped (array of arrays with auto-separators) */
  items?: MenuItem[] | MenuItem[][];
  /** Which side of the trigger to open the menu. @default 'bottom' */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment along the trigger edge. @default 'start' */
  align?: "start" | "center" | "end";
  /** Gap between trigger and menu in px. @default 4 */
  sideOffset?: number;
  /** Close the menu when an action item is selected. @default true */
  closeOnSelect?: boolean;
  /** Radio group state — keyed by radioGroup name. */
  radioValues?: Record<string, string>;
  /** Teleport target. Set false to disable. @default false */
  teleport?: string | false;
  /** UI class overrides */
  ui?: MenuUi;
}
