export { default as TagsInput } from "./TagsInput.vue";

export type TagsInputValue = string | number | Record<string, unknown>;

export interface TagsInputUi {
  root?: string;
  hiddenInput?: string;
  item?: string;
  itemText?: string;
  delete?: string;
  input?: string;
  clear?: string;
}

export interface TagsInputProps {
  displayValue?: (value: TagsInputValue) => string;
  convertValue?: (value: string) => TagsInputValue;
  serializeValue?: (value: TagsInputValue) => string;
  isEqual?: (a: TagsInputValue, b: TagsInputValue) => boolean;
  validate?: (value: TagsInputValue) => boolean;
  delimiter?: string | RegExp;
  addOnBlur?: boolean;
  addOnPaste?: boolean;
  addOnTab?: boolean;
  duplicate?: boolean;
  max?: number;
  trim?: boolean;
  clearable?: boolean;
  placeholder?: string;
  maxLength?: number;
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
  ui?: TagsInputUi;
}
