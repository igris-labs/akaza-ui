import type { Ref } from "vue";
import { ref } from "vue";

export interface UseMenuReturn {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useMenu(modelRef?: Ref<boolean>): UseMenuReturn {
  const isOpen = modelRef ?? ref(false);
  function open() {
    isOpen.value = true;
  }
  function close() {
    isOpen.value = false;
  }
  function toggle() {
    isOpen.value = !isOpen.value;
  }
  return { isOpen, open, close, toggle };
}
