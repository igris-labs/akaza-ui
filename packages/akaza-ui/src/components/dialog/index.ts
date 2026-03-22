export { default as Dialog } from "./Dialog.vue";

export interface DialogUi {
  overlay?: string;
  content?: string;
  header?: string;
  title?: string;
  body?: string;
  description?: string;
  footer?: string;
}

export interface DialogProps {
  as?: string;
  title?: string;
  description?: string;
  closeOnBackdropClick?: boolean;
  fullscreen?: boolean;
  teleport?: string | false;
  transition?: string | false;
  duration?: number;
  ui?: DialogUi;
}
