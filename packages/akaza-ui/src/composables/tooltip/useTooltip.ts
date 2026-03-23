import type { Ref } from "vue";
import { ref } from "vue";

export interface UseTooltipOptions {
  delayDuration?: number;
  closeDelay?: number;
}
export interface UseTooltipReturn {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useTooltip(
  modelRef?: Ref<boolean>,
  options: UseTooltipOptions = {},
): UseTooltipReturn {
  const isOpen = modelRef ?? ref(false);
  const { delayDuration = 300, closeDelay = 0 } = options;
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  function open() {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    openTimer = setTimeout(() => { isOpen.value = true; }, delayDuration);
  }
  function close() {
    if (openTimer) { clearTimeout(openTimer); openTimer = null; }
    closeTimer = setTimeout(() => { isOpen.value = false; }, closeDelay);
  }
  function toggle() {
    isOpen.value ? close() : open();
  }
  return { isOpen, open, close, toggle };
}
