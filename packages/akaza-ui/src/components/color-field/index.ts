import type { ColorChannel, ColorControlProps, ColorSpace } from "../../composables/color/types";
export { default as ColorField } from "./ColorField.vue";
export interface ColorFieldUi {
  root?: string;
  input?: string;
  hiddenInput?: string;
}
export interface ColorFieldProps extends ColorControlProps {
  channel?: ColorChannel;
  colorSpace?: ColorSpace;
  placeholder?: string;
  step?: number;
  locale?: string;
  disableWheelChange?: boolean;
  ui?: ColorFieldUi;
}
