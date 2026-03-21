import type { Component } from "vue";

export { default as Button } from "./Button.vue";

export interface ButtonProps {
  as?: string | Component;
  disabled?: boolean;
  focusableWhenDisabled?: boolean;
  loading?: boolean;
  /**
   * Automatically show a loading indicator while the click handler's Promise
   * is pending. Requires `onClick` to be provided.
   */
  loadingAuto?: boolean;
  /**
   * Async-aware click handler. When `loadingAuto` is true and this returns a
   * Promise, the button enters loading state until the Promise settles.
   */
  onClick?: (event: MouseEvent) => void | Promise<void>;
}
