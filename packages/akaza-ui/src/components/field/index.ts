import type { FieldErrorMatch } from "./context";

export { default as Field } from "./Field.vue";
export type { FieldErrorMatch };

export interface FieldUi {
  root?: string;
  label?: string;
  control?: string;
  description?: string;
  error?: string;
}

export interface FieldProps {
  as?: string;
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  error?: string;
  errorMatch?: FieldErrorMatch;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  dirty?: boolean;
  touched?: boolean;
  filled?: boolean;
  focused?: boolean;
  ui?: FieldUi;
}
