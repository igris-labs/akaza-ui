import type { DrawerSide } from "../../composables/drawer";

export { default as Drawer } from "./Drawer.vue";
export type { DrawerSide };

export interface DrawerUi {
  overlay?: string;
  content?: string;
  header?: string;
  title?: string;
  body?: string;
  description?: string;
  footer?: string;
}

export interface DrawerProps {
  as?: string;
  title?: string;
  description?: string;
  side?: DrawerSide;
  inset?: number | string;
  closeOnBackdropClick?: boolean;
  swipeToClose?: boolean;
  teleport?: string | false;
  ui?: DrawerUi;
}
