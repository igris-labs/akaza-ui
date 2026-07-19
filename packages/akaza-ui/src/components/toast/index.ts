export { createToastManager, provideToastManager, useToast } from "../../composables/toast";
export type {
  ToastAction,
  ToastAddOptions,
  ToastCloseReason,
  ToastItem,
  ToastManager,
  ToastManagerOptions,
  ToastPriority,
  ToastPromiseOptions,
  ToastState,
  ToastType,
  ToastUpdateOptions,
} from "../../composables/toast";
export { default as Toast } from "./Toast.vue";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastSwipeDirection = "up" | "right" | "down" | "left";

export interface ToastUi {
  viewport?: string;
  toast?: string;
  title?: string;
  description?: string;
  close?: string;
  action?: string;
}

export interface ToastProps {
  position?: ToastPosition;
  /** Maximum interactive toasts. Older toasts remain mounted but inert. @default 3 */
  limit?: number;
  /** Collapse multiple toasts into a stack until the viewport is hovered or focused. @default true */
  stack?: boolean;
  /** Expanded distance between toasts in pixels. @default 12 */
  gap?: number;
  /** Visible edge between collapsed toasts in pixels. @default 12 */
  peek?: number;
  /** Scale reduction applied to each toast behind the frontmost toast. @default 0.1 */
  scaleStep?: number;
  /** Keyboard shortcut that focuses the notification viewport. @default ['F8'] */
  hotkey?: string[];
  hotkeyLabel?: string;
  closeLabel?: string;
  swipeDirection?: ToastSwipeDirection;
  swipeThreshold?: number;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  pauseOnWindowBlur?: boolean;
  teleport?: string | false;
  manager?: import("../../composables/toast").ToastManager;
  ui?: ToastUi;
}
