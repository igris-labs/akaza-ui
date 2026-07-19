export { default as Toolbar } from "./Toolbar.vue";

export type ToolbarOrientation = "horizontal" | "vertical";

export interface ToolbarItem {
  type?: "button" | "link" | "separator" | "group" | "input";
  value?: string;
  label?: string;
  href?: string;
  inputValue?: string | number;
  inputType?: string;
  name?: string;
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  disabled?: boolean;
  pressed?: boolean;
  focusableWhenDisabled?: boolean;
  children?: ToolbarItem[];
  slot?: string;
  onSelect?: () => void;
  onUpdateValue?: (value: string) => void;
  [key: string]: unknown;
}

export interface ToolbarUi {
  root?: string;
  group?: string;
  button?: string;
  link?: string;
  input?: string;
  separator?: string;
  label?: string;
}

export interface ToolbarProps {
  items?: ToolbarItem[];
  orientation?: ToolbarOrientation;
  loop?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ui?: ToolbarUi;
}
