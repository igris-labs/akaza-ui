export { default as RadioGroup } from "./RadioGroup.vue";

export interface RadioGroupUi {
  item?: string;
}

export interface RadioGroupProps {
  options: any[];
  /** Property to use as value when options are objects. Falls back to option.value → option.id → String(option). */
  valueKey?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  as?: string;
  ui?: RadioGroupUi;
}
