import type { Ref } from "vue";
import { ref } from "vue";

export interface UseDisclosureReturn {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/** Boolean state only; consumers own dismissal, focus, and change events. */
export function useDisclosure(model: Ref<boolean> = ref(false)): UseDisclosureReturn {
  return {
    isOpen: model,
    open: () => { model.value = true; },
    close: () => { model.value = false; },
    toggle: () => { model.value = !model.value; },
  };
}
