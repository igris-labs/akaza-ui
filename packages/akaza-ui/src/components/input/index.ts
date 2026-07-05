export { default as Input } from "./Input.vue";

export type InputType =
  | "text"
  | "email"
  | "password"
  | "search"
  | "tel"
  | "url"
  | "date"
  | "time"
  | "datetime-local"
  | "month"
  | "week";

export interface InputUi {
  root?: string;
}

export interface InputProps {
  id?: string;
  name?: string;
  type?: InputType;
  placeholder?: string;
  autocomplete?: string;
  inputmode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
  minlength?: number;
  maxlength?: number;
  pattern?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  ariaLabel?: string;
  ariaDescribedby?: string;
  ui?: InputUi;
}
