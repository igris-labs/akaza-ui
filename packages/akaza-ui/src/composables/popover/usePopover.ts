import type { Ref } from "vue";
import { useDisclosure } from "../disclosure";

export interface UsePopoverReturn {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function usePopover(modelRef?: Ref<boolean>): UsePopoverReturn {
  return useDisclosure(modelRef);
}
