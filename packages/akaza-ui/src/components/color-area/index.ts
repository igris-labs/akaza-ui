import type { ColorChannel, ColorControlProps, ColorSpace } from "../../composables/color/types";
export { default as ColorArea } from "./ColorArea.vue";
export interface ColorAreaUi {
  root?: string;
  area?: string;
  thumb?: string;
  xInput?: string;
  yInput?: string;
  input?: string;
}
export interface ColorAreaProps extends ColorControlProps {
  colorSpace?: ColorSpace;
  xChannel?: ColorChannel;
  yChannel?: ColorChannel;
  xLabel?: string;
  yLabel?: string;
  xName?: string;
  yName?: string;
  step?: number;
  dir?: "ltr" | "rtl";
  ui?: ColorAreaUi;
}
