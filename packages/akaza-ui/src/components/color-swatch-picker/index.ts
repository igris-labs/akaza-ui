import type { ColorFormat } from "../../composables/color";
export { default as ColorSwatchPicker } from "./ColorSwatchPicker.vue";
export interface ColorSwatchOption {
  value: string;
  label?: string;
  disabled?: boolean;
}
export interface ColorSwatchPickerUi {
  root?: string;
  viewport?: string;
  content?: string;
  item?: string;
  swatch?: string;
  label?: string;
  indicator?: string;
  input?: string;
  empty?: string;
}
export interface ColorSwatchPickerProps {
  items: Array<string | ColorSwatchOption>;
  format?: ColorFormat;
  multiple?: boolean;
  selectionBehavior?: "replace" | "toggle";
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  loop?: boolean;
  highlightOnHover?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ui?: ColorSwatchPickerUi;
}
