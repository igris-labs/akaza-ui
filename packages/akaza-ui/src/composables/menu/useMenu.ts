import type { Ref } from "vue";
import { useDisclosure } from "../disclosure";

export interface UseMenuReturn {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useMenu(modelRef?: Ref<boolean>): UseMenuReturn {
  return useDisclosure(modelRef);
}
