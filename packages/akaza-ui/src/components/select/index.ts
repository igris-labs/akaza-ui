export { default as Select } from "./Select.vue";

export type SelectValue = string;
export type SelectModelValue = SelectValue | SelectValue[];
export type SelectOptionType = "item" | "label" | "separator";
export type SelectSide = "top" | "right" | "bottom" | "left";
export type SelectAlign = "start" | "center" | "end";

export interface SelectOption {
  type?: SelectOptionType;
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
  searchInput?: string;
  content?: string;
  viewport?: string;
  empty?: string;
  loading?: string;
  groupLabel?: string;
  separator?: string;
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
  multiple?: boolean;
  nullableValue?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  loop?: boolean;
  autocomplete?: boolean;
  filter?: (option: SelectOption, search: string) => boolean;
  loading?: boolean;
  emptyLabel?: string;
  searchPlaceholder?: string;
  resetSearchOnSelect?: boolean;
  highlightOnHover?: boolean;
  side?: SelectSide;
  align?: SelectAlign;
  sideOffset?: number;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ui?: SelectUi;
}
