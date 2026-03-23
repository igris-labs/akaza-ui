export { default as Toggle } from "./Toggle.vue";

export interface ToggleUi {
  root?: string;
}

export interface ToggleProps {
  as?: string;
  disabled?: boolean;
  value?: string;
  ariaLabel?: string;
  ui?: ToggleUi;
}
