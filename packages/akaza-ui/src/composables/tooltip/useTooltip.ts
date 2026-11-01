import type { Ref } from "vue";
import { ref } from "vue";
import { useDelayedAction } from "../../utils/useDelayedAction";

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
  const delayed = useDelayedAction();

  function open() {
    delayed.schedule(() => {
      isOpen.value = true;
    }, options.delayDuration ?? 300);
  }
  function close() {
    delayed.schedule(() => {
      isOpen.value = false;
    }, options.closeDelay ?? 0);
  }
  function toggle() {
    isOpen.value ? close() : open();
  }

  return { isOpen, open, close, toggle };
}
