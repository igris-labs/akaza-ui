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
  /** Fallback accessible name when no title prop or title slot is rendered. */
  ariaLabel?: string;
  side?: DrawerSide;
  inset?: number | string;
  /** Trap focus, block background interaction, and lock body scrolling. @default true */
  modal?: boolean;
  closeOnBackdropClick?: boolean;
  swipeToClose?: boolean;
  teleport?: string | false;
  ui?: DrawerUi;
}
