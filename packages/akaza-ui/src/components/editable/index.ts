export { default as Editable } from "./Editable.vue";

export type EditableActivationMode = "click" | "dblclick" | "focus" | "none";
export type EditableSubmitMode = "blur" | "both" | "enter" | "none";
export type EditableState = "cancel" | "edit" | "submit";

export interface EditablePlaceholder {
  edit?: string;
  preview?: string;
}

export interface EditableUi {
  root?: string;
  hiddenInput?: string;
  area?: string;
  preview?: string;
  input?: string;
  actions?: string;
  edit?: string;
  submit?: string;
  cancel?: string;
}

export interface EditableProps {
  id?: string;
  name?: string;
  placeholder?: string | EditablePlaceholder;
  activationMode?: EditableActivationMode;
  submitMode?: EditableSubmitMode;
  startWithEditMode?: boolean;
  selectOnFocus?: boolean;
  autoResize?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  dir?: "ltr" | "rtl";
  ariaLabel?: string;
  ariaDescribedby?: string;
  ui?: EditableUi;
}
