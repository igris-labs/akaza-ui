import type { Ref } from "vue";
import { useDisclosure } from "../disclosure";

export interface UseDialogReturn {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDialog(modelRef?: Ref<boolean>): UseDialogReturn {
  return useDisclosure(modelRef);
}
