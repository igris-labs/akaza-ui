export { default as Accordion } from "./Accordion.vue";

export interface AccordionItem {
  label?: string;
  value?: string;
  content?: string;
  disabled?: boolean;
  /** Named slot to use for this item's body content. Falls back to the shared `content` slot. */
  slot?: string;
  [key: string]: any;
}

export interface AccordionUi {
  item?: string;
  trigger?: string;
  icon?: string;
  content?: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Property to use as the unique value. Falls back to item.value → item.label → String(item). */
  valueKey?: string;
  /** Property to use as the trigger label. Falls back to item.label → valueKey. */
  labelKey?: string;
  /** Property to use as the body text. Falls back to item.content. */
  contentKey?: string;
  /** Property to read for per-item disabled state. Defaults to "disabled". */
  disabledKey?: string;
  type?: "single" | "multiple";
  /** Allow toggling open item closed again (single mode only). */
  collapsible?: boolean;
  /** Disable all items. */
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  /** When true, unmounts content from DOM when closed. Defaults to false (keeps mounted, hides via CSS). */
  unmountOnHide?: boolean;
  as?: string;
  ui?: AccordionUi;
}
