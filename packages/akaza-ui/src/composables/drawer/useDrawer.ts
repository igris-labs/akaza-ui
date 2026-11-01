import type { Ref } from "vue";
import { useDisclosure } from "../disclosure";

export type DrawerSide = "top" | "right" | "bottom" | "left";

export interface UseDrawerReturn {
  isOpen: Ref<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDrawer(modelRef?: Ref<boolean>): UseDrawerReturn {
  return useDisclosure(modelRef);
}
