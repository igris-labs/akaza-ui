export { default as Tabs } from "./Tabs.vue";

export interface TabsItem {
  value: string;
  label?: string;
  disabled?: boolean;
  [key: string]: any;
}

export interface TabsUi {
  root?: string;
  list?: string;
  tab?: string;
  indicator?: string;
  panels?: string;
  panel?: string;
}

export interface TabsProps {
  items: TabsItem[];
  orientation?: "horizontal" | "vertical";
  /** "automatic": arrow keys move focus and activate. "manual": arrow keys move focus only, Space/Enter activates. Default: "automatic". */
  activationMode?: "automatic" | "manual";
  /** When true, inactive panels are removed from the DOM (v-if). Default: false (v-show). */
  unmountOnHide?: boolean;
  /** aria-label for the tab list. */
  ariaLabel?: string;
  /** Property to use as label when items are objects. Default: "label". */
  labelKey?: string;
  ui?: TabsUi;
}
