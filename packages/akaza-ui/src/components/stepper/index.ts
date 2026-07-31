export { default as Stepper } from "./Stepper.vue";

export type StepperValue = string | number;
export type StepperOrientation = "horizontal" | "vertical";
export type StepperActivationMode = "automatic" | "manual";
export type StepperItemState = "active" | "completed" | "inactive";

export interface StepperItem {
  value?: StepperValue;
  title?: string;
  description?: string;
  content?: string;
  disabled?: boolean;
  completed?: boolean;
  optional?: boolean;
  slot?: string;
  [key: string]: unknown;
}

export interface StepperUi {
  root?: string;
  list?: string;
  item?: string;
  trigger?: string;
  indicator?: string;
  text?: string;
  title?: string;
  description?: string;
  optional?: string;
  separator?: string;
  panels?: string;
  panel?: string;
  controls?: string;
  previous?: string;
  next?: string;
}

export interface StepperProps {
  items: StepperItem[];
  valueKey?: string;
  titleKey?: string;
  descriptionKey?: string;
  disabledKey?: string;
  completedKey?: string;
  linear?: boolean;
  disabled?: boolean;
  loop?: boolean;
  orientation?: StepperOrientation;
  activationMode?: StepperActivationMode;
  showControls?: boolean;
  unmountOnHide?: boolean;
  dir?: "ltr" | "rtl";
  ariaLabel?: string;
  ui?: StepperUi;
}
