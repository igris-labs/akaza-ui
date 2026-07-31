export { default as PinInput } from "./PinInput.vue";

export type PinInputType = "number" | "text";

export interface PinInputUi {
  root?: string;
  hiddenInput?: string;
  input?: string;
}

export interface PinInputProps {
  length?: number;
  type?: PinInputType;
  mask?: boolean;
  otp?: boolean;
  placeholder?: string;
  allowedChars?: RegExp | ((character: string) => boolean);
  selectOnFocus?: boolean;
  autoFocus?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  dir?: "ltr" | "rtl";
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ui?: PinInputUi;
}
