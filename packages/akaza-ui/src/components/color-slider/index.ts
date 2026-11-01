import type { ColorChannel, ColorControlProps, ColorSpace } from "../../composables/color/types";
export { default as ColorSlider } from "./ColorSlider.vue";
export interface ColorSliderUi {
  root?: string;
  track?: string;
  thumb?: string;
  axis?: string;
  input?: string;
}
export interface ColorSliderProps extends ColorControlProps {
  channel?: ColorChannel;
  colorSpace?: ColorSpace;
  step?: number;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  inverted?: boolean;
  ui?: ColorSliderUi;
}
