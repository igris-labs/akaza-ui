export { default as ToggleGroup } from "./ToggleGroup.vue";

export type ToggleGroupValue = string;
export type ToggleGroupModel = ToggleGroupValue | ToggleGroupValue[];
export type ToggleGroupType = "single" | "multiple";
export type ToggleGroupOrientation = "horizontal" | "vertical";

export interface ToggleGroupOption {
  value?: ToggleGroupValue | number;
  label?: string;
  description?: string;
  disabled?: boolean;
  slot?: string;
  [key: string]: unknown;
}

export interface ToggleGroupUi {
  root?: string;
  input?: string;
  item?: string;
  label?: string;
  description?: string;
}

export interface ToggleGroupProps {
  options: ToggleGroupOption[];
  type?: ToggleGroupType;
  valueKey?: string;
  labelKey?: string;
  descriptionKey?: string;
  disabledKey?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  orientation?: ToggleGroupOrientation;
  loop?: boolean;
  rovingFocus?: boolean;
  allowEmpty?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ui?: ToggleGroupUi;
}
