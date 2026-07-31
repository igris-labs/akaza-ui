export { default as Rating } from "./Rating.vue";

export type RatingOrientation = "horizontal" | "vertical";

export interface RatingUi {
  root?: string;
  hiddenInput?: string;
  item?: string;
  base?: string;
  fill?: string;
  fillIcon?: string;
  radio?: string;
}

export interface RatingProps {
  length?: number;
  step?: number;
  clearable?: boolean;
  hoverable?: boolean;
  loop?: boolean;
  orientation?: RatingOrientation;
  dir?: "ltr" | "rtl";
  autoFocus?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  getValueLabel?: (value: number, maximum: number) => string;
  ui?: RatingUi;
}
