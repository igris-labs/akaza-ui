export { default as Fieldset } from "./Fieldset.vue";

export interface FieldsetUi {
  root?: string;
  legend?: string;
  description?: string;
  content?: string;
}

export interface FieldsetProps {
  legend?: string;
  description?: string;
  disabled?: boolean;
  invalid?: boolean;
  ui?: FieldsetUi;
}
