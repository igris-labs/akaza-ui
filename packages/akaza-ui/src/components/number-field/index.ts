export { default as NumberField } from "./NumberField.vue";

export interface NumberFieldUi {
  root?: string;
  decrement?: string;
  input?: string;
  increment?: string;
}

export interface NumberFieldProps {
  id?: string;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  stepSnapping?: boolean;
  ariaLabel?: string;
  ariaDescribedby?: string;
  ui?: NumberFieldUi;
}
