export { default as Switch } from "./Switch.vue";

export interface SwitchUi {
  root?: string;
  thumb?: string;
}

export interface SwitchProps {
  disabled?: boolean;
  ui?: SwitchUi;
}
