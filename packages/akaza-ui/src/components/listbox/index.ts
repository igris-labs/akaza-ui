export { default as Listbox } from "./Listbox.vue";

export type ListboxValue = string | number | Record<string, unknown>;
export type ListboxModelValue = ListboxValue | ListboxValue[];
export type ListboxOptionType = "item" | "label" | "separator";
export type ListboxOrientation = "horizontal" | "vertical";
export type ListboxSelectionBehavior = "replace" | "toggle";

export interface ListboxOption {
  type?: ListboxOptionType;
  value?: ListboxValue;
  label?: string;
  description?: string;
  disabled?: boolean;
  slot?: string;
  [key: string]: unknown;
}

export interface ListboxUi {
  root?: string;
  hiddenInput?: string;
  filter?: string;
  content?: string;
  virtualWrapper?: string;
  empty?: string;
  groupLabel?: string;
  separator?: string;
  option?: string;
  indicator?: string;
  optionText?: string;
  optionLabel?: string;
  optionDescription?: string;
}

export interface ListboxProps {
  options: ListboxOption[];
  valueKey?: string;
  labelKey?: string;
  descriptionKey?: string;
  disabledKey?: string;
  multiple?: boolean;
  nullableValue?: string;
  by?: string | ((a: ListboxValue, b: ListboxValue) => boolean);
  serializeValue?: (value: ListboxValue) => string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  loop?: boolean;
  orientation?: ListboxOrientation;
  dir?: "ltr" | "rtl";
  selectionBehavior?: ListboxSelectionBehavior;
  filterable?: boolean;
  filter?: (option: ListboxOption, search: string) => boolean;
  filterPlaceholder?: string;
  emptyLabel?: string;
  highlightOnHover?: boolean;
  virtualize?: boolean;
  virtualItemHeight?: number;
  virtualHeight?: number;
  overscan?: number;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ui?: ListboxUi;
}
