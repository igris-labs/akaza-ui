import type { CheckboxUi } from "../checkbox";

export { default as CheckboxGroup } from "./CheckboxGroup.vue";

export type CheckboxGroupValue = string | number;

export interface CheckboxGroupOption {
  label?: string;
  value?: CheckboxGroupValue;
  description?: string;
  disabled?: boolean;
  slot?: string;
  [key: string]: unknown;
}

export interface CheckboxGroupUi {
  root?: string;
  legend?: string;
  parentItem?: string;
  item?: string;
  checkbox?: CheckboxUi;
}

export interface CheckboxGroupProps {
  options: CheckboxGroupOption[];
  valueKey?: string;
  labelKey?: string;
  descriptionKey?: string;
  disabledKey?: string;
  allValues?: CheckboxGroupValue[];
  parent?: boolean;
  parentLabel?: string;
  parentDescription?: string;
  disabled?: boolean;
  required?: boolean;
  orientation?: "horizontal" | "vertical";
  legend?: string;
  name?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ui?: CheckboxGroupUi;
}
