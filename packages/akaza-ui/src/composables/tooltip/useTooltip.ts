import type { Ref } from "vue";
import { onScopeDispose, ref } from "vue";

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
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  function open() {
    if (openTimer) clearTimeout(openTimer);
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    openTimer = setTimeout(() => {
      isOpen.value = true;
      openTimer = null;
    }, options.delayDuration ?? 300);
  }
  function close() {
    if (openTimer) { clearTimeout(openTimer); openTimer = null; }
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      isOpen.value = false;
      closeTimer = null;
    }, options.closeDelay ?? 0);
  }
  function toggle() {
    isOpen.value ? close() : open();
  }

  onScopeDispose(() => {
    if (openTimer) clearTimeout(openTimer);
    if (closeTimer) clearTimeout(closeTimer);
  });

  return { isOpen, open, close, toggle };
}
