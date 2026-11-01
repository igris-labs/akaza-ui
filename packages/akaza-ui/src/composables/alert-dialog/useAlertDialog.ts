import type { Ref } from "vue";
import { useDisclosure } from "../disclosure";

export interface UseAlertDialogReturn {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useAlertDialog(modelRef?: Ref<boolean>): UseAlertDialogReturn {
  return useDisclosure(modelRef);
}
