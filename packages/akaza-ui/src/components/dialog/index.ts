export { default as Dialog } from './Dialog.vue'

export interface DialogUi {
  overlay?: string;
  content?: string;
  header?: string;
  body?: string;
  footer?: string;
}

export interface DialogProps {
  as?: string;
  closeOnBackdropClick?: boolean;
  teleport?: string | false;
  transition?: string | false;
  duration?: number;
  ui?: DialogUi;
}