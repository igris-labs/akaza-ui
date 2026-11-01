import type { ColorControlProps, ColorSpace } from "../../composables/color/types";
import type { ColorAreaUi } from "../color-area";
import type { ColorFieldUi } from "../color-field";
import type { ColorSliderUi } from "../color-slider";
import type { ColorSwatchUi } from "../color-swatch";
import type { ColorSwatchOption, ColorSwatchPickerUi } from "../color-swatch-picker";
export { default as ColorPicker } from "./ColorPicker.vue";
export interface ColorPickerUi {
  root?: string;
  controls?: string;
  fields?: string;
  input?: string;
  area?: ColorAreaUi;
  hue?: ColorSliderUi;
  alpha?: ColorSliderUi;
  field?: ColorFieldUi;
  preview?: ColorSwatchUi;
  swatches?: ColorSwatchPickerUi;
}
export interface ColorPickerProps extends ColorControlProps {
  colorSpace?: Extract<ColorSpace, "hsb" | "hsl" | "lch" | "oklch">;
  showAlpha?: boolean;
  showField?: boolean;
  showPreview?: boolean;
  items?: Array<string | ColorSwatchOption>;
  dir?: "ltr" | "rtl";
  ui?: ColorPickerUi;
}
