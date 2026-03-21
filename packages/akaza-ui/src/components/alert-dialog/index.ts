export { default as AlertDialog } from './AlertDialog.vue'

export interface AlertDialogUi {
  overlay?: string
  content?: string
  header?: string
  body?: string
  footer?: string
}

export interface AlertDialogProps {
  as?: string
  teleport?: string | false
  transition?: string | false
  duration?: number
  ui?: AlertDialogUi
}
