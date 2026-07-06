import type { Component } from "vue";

export { default as Button } from "./Button.vue";

export interface ButtonProps {
  as?: string | Component;
  /** Native button type. Only applied when as="button". Defaults to "button". */
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  focusableWhenDisabled?: boolean;
  loading?: boolean;
  /**
   * Automatically show a loading indicator while the click handler's Promise
   * returned from `@click` is pending.
   */
  loadingAuto?: boolean;
  ui?: ButtonUi;
}

export interface ButtonUi {
  root?: string;
  spinner?: string;
  loadingText?: string;
}
