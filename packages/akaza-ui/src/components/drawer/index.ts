import type { DrawerSide } from '../../composables/drawer'

export { default as Drawer } from './Drawer.vue'
export type { DrawerSide }

export interface DrawerUi {
  overlay?: string
  content?: string
  header?: string
  body?: string
  footer?: string
}

export interface DrawerProps {
  as?: string
  side?: DrawerSide
  inset?: number | string
  closeOnBackdropClick?: boolean
  teleport?: string | false
  ui?: DrawerUi
}
