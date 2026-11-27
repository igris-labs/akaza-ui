import type { Ref } from "vue";
import { ref } from "vue";

export interface UseDisclosureReturn {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Open, close, or toggle a boolean ref. Pass your own ref to share the state.
 * It does not render content, handle dismissal, move focus, or emit events.
 *
 * @example
 * ```ts
 * import { useDisclosure } from "akaza-ui";
 *
 * const { isOpen, toggle } = useDisclosure();
 * toggle(); // isOpen.value is true.
 * ```
 */
export function useDisclosure(model: Ref<boolean> = ref(false)): UseDisclosureReturn {
  return {
    isOpen: model,
    open: () => { model.value = true; },
    close: () => { model.value = false; },
    toggle: () => { model.value = !model.value; },
  };
}
