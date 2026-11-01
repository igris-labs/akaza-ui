import type { MaybeRefOrGetter } from "vue";
import type { AkazaChangeEventDetails } from "../../types";

export const COLOR_FORMATS = [
  "hex",
  "hexa",
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "display-p3",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020",
  "xyz-d50",
  "xyz-d65",
] as const;
export type ColorFormat = (typeof COLOR_FORMATS)[number];
export type ColorSpace = "rgb" | "hsl" | "hsb" | "hwb" | "lab" | "lch" | "oklab" | "oklch";
export type ColorChannel =
  | "red"
  | "green"
  | "blue"
  | "hue"
  | "saturation"
  | "brightness"
  | "lightness"
  | "whiteness"
  | "blackness"
  | "chroma"
  | "a"
  | "b"
  | "alpha";
export interface ColorChannelInfo {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
}
export interface UseColorOptions {
  format?: MaybeRefOrGetter<ColorFormat>;
  onChange?: (value: string, details: AkazaChangeEventDetails) => void;
  onCommit?: (value: string, details: AkazaChangeEventDetails) => void;
}
export interface ColorControlProps {
  id?: string;
  name?: string;
  format?: ColorFormat;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}
