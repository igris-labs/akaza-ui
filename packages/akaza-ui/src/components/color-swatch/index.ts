export { default as ColorSwatch } from "./ColorSwatch.vue";
export interface ColorSwatchUi {
  root?: string;
}
export interface ColorSwatchProps {
  color?: string;
  ariaLabel?: string;
  decorative?: boolean;
  ui?: ColorSwatchUi;
}
