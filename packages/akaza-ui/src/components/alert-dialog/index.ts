export { default as AlertDialog } from "./AlertDialog.vue";

export interface AlertDialogUi {
  overlay?: string;
  content?: string;
  header?: string;
  title?: string;
  description?: string;
  body?: string;
  footer?: string;
}

export interface AlertDialogProps {
  as?: string;
  teleport?: string | false;
  transition?: string | false;
  duration?: number;
  /** Convenience prop for the dialog title. Slot #title takes priority when provided. */
  title?: string;
  /** Convenience prop for the dialog description. Slot #description takes priority when provided. */
  description?: string;
  ui?: AlertDialogUi;
}
