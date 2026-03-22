export { default as RadioGroup } from "./RadioGroup.vue";

export interface RadioGroupUi {
  item?: string;
  legend?: string;
}

export interface RadioGroupProps {
  options: any[];
  /** Property to use as value when options are objects. Falls back to option.value → option.id → String(option). */
  valueKey?: string;
  /** Property to use as label when options are objects. Default: "label". */
  labelKey?: string;
  /** Property to use as description when options are objects. Default: "description". */
  descriptionKey?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  as?: string;
  /** Legend text rendered above the group. Also used as aria-label fallback. */
  legend?: string;
  /** Whether arrow key navigation wraps from last to first item and vice versa. Default: true. */
  loop?: boolean;
  /** Name submitted with the owning form. */
  name?: string;
  /** Marks the field as required for form submission. */
  required?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  /** Return true to disable a specific option. Falls back to option.disabled. */
  getItemDisabled?: (option: any) => boolean;
  ui?: RadioGroupUi;
}
