export { default as Slider } from "./Slider.vue";

export type SliderOrientation = "horizontal" | "vertical";

export interface SliderUi {
  root?: string;
  input?: string;
  track?: string;
  range?: string;
  thumb?: string;
}

export interface SliderProps {
  id?: string;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  orientation?: SliderOrientation;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  getValueLabel?: (value: number, max: number) => string | undefined;
  ui?: SliderUi;
}
