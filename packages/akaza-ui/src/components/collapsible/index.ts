export { default as Collapsible } from "./Collapsible.vue";

export interface CollapsibleUi {
  root?: string;
  trigger?: string;
  content?: string;
}

export interface CollapsibleProps {
  as?: string;
  disabled?: boolean;
  /** When true, content is removed from the DOM when closed. Defaults to false (hidden via CSS). */
  unmountOnHide?: boolean;
  ui?: CollapsibleUi;
}
