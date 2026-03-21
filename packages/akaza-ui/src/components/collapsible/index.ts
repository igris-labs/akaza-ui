export { default as Collapsible } from "./Collapsible.vue";

export interface CollapsibleUi {
  trigger?: string;
  content?: string;
}

export interface CollapsibleProps {
  as?: string;
  disabled?: boolean;
  ui?: CollapsibleUi;
}
