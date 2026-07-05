export { default as NumberField } from "./NumberField.vue";

export interface NumberFieldUi {
  root?: string;
  scrubArea?: string;
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
  disableWheelChange?: boolean;
  invertWheelChange?: boolean;
  focusOnChange?: boolean;
  scrubLabel?: string;
  scrubStep?: number;
  disableScrub?: boolean;
  getValueLabel?: (value: number | null) => string | undefined;
  ariaLabel?: string;
  ariaDescribedby?: string;
  ui?: NumberFieldUi;
}
