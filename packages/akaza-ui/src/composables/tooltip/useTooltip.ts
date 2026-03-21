import type { Ref } from "vue";
import { ref } from "vue";

export interface UseTooltipOptions {
  delayDuration?: number;
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
  const { delayDuration = 300 } = options;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function open() {
    timer = setTimeout(() => {
      isOpen.value = true;
    }, delayDuration);
  }
  function close() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    isOpen.value = false;
  }
  function toggle() {
    isOpen.value ? close() : open();
  }
  return { isOpen, open, close, toggle };
}
