export { default as Select } from "./Select.vue";

export type SelectValue = string;
export type SelectSide = "top" | "right" | "bottom" | "left";
export type SelectAlign = "start" | "center" | "end";

export interface SelectOption {
  value?: SelectValue | number;
  label?: string;
  description?: string;
  disabled?: boolean;
  slot?: string;
  [key: string]: unknown;
}

export interface SelectUi {
  root?: string;
  nativeSelect?: string;
  trigger?: string;
  value?: string;
  placeholder?: string;
  icon?: string;
  content?: string;
  option?: string;
  indicator?: string;
  optionText?: string;
  optionLabel?: string;
  optionDescription?: string;
}

export interface SelectProps {
  options: SelectOption[];
  valueKey?: string;
  labelKey?: string;
  descriptionKey?: string;
  disabledKey?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  loop?: boolean;
  side?: SelectSide;
  align?: SelectAlign;
  sideOffset?: number;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ui?: SelectUi;
}
