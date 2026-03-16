import { ref } from 'vue'
import type { Ref } from 'vue'

export type DrawerSide = 'top' | 'right' | 'bottom' | 'left'

export interface UseDrawerReturn {
  isOpen: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}

export function useDrawer(modelRef?: Ref<boolean>): UseDrawerReturn {
  const isOpen = modelRef ?? ref(false)
  function open() { isOpen.value = true }
  function close() { isOpen.value = false }
  function toggle() { isOpen.value = !isOpen.value }
  return { isOpen, open, close, toggle }
}
