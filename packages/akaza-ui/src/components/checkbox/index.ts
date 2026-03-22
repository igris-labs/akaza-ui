export { default as Checkbox } from "./Checkbox.vue";

export type CheckboxValue = boolean | "indeterminate";

export interface CheckboxUi {
  /** Outer wrapper element. */
  wrapper?: string;
  /** The button element (the interactive checkbox). */
  root?: string;
  indicator?: string;
  label?: string;
  description?: string;
}

export interface CheckboxProps {
  disabled?: boolean;
  /** HTML id for the button element. Auto-generated when not provided. */
  id?: string;
  /** HTML name for form submission. Also renders a hidden native input. */
  name?: string;
  /** Marks the field as required for form validation. */
  required?: boolean;
  /** Value stored in the model when checked. Defaults to true. */
  trueValue?: unknown;
  /** Value stored in the model when unchecked. Defaults to false. */
  falseValue?: unknown;
  /** Convenience label text. Slot #label takes priority. */
  label?: string;
  /** Convenience description below the label. Slot #description takes priority. */
  description?: string;
  ui?: CheckboxUi;
}
