export { default as Combobox } from "./Combobox.vue";

export type ComboboxValue = string | number | Record<string, unknown>;
export type ComboboxModelValue = ComboboxValue | ComboboxValue[];
export type ComboboxOptionType = "item" | "label" | "separator";

export interface ComboboxOption {
  type?: ComboboxOptionType;
  value?: ComboboxValue;
  label?: string;
  description?: string;
  disabled?: boolean;
  slot?: string;
  [key: string]: unknown;
}

export interface ComboboxUi {
  root?: string;
  input?: string;
  tags?: string;
  tag?: string;
  tagLabel?: string;
  remove?: string;
  clear?: string;
  hiddenInput?: string;
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
  create?: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
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
  readOnly?: boolean;
  invalid?: boolean;
  loop?: boolean;
  filterable?: boolean;
  filter?: (option: ComboboxOption, search: string) => boolean;
  isEqual?: (a: ComboboxValue, b: ComboboxValue) => boolean;
  serializeValue?: (value: ComboboxValue) => string;
  loading?: boolean;
  emptyLabel?: string;
  resetSearchOnBlur?: boolean;
  resetSearchOnSelect?: boolean;
  openOnFocus?: boolean;
  openOnClick?: boolean;
  openOnInput?: boolean;
  clearable?: boolean;
  creatable?: boolean;
  createLabel?: (search: string) => string;
  highlightOnHover?: boolean;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ui?: ComboboxUi;
}
