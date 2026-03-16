import { ref } from 'vue'
import type { Ref } from 'vue'

export interface UsePopoverReturn {
  isOpen: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}

export function usePopover(modelRef?: Ref<boolean>): UsePopoverReturn {
  const isOpen = modelRef ?? ref(false)
  function open() { isOpen.value = true }
  function close() { isOpen.value = false }
  function toggle() { isOpen.value = !isOpen.value }
  return { isOpen, open, close, toggle }
}
