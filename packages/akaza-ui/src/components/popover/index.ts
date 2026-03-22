export { default as Popover } from "./Popover.vue";

export type PopoverSide = "top" | "bottom" | "left" | "right";
export type PopoverAlign = "start" | "center" | "end";

export interface PopoverUi {
  content?: string;
}

export interface PopoverProps {
  side?: PopoverSide;
  align?: PopoverAlign;
  sideOffset?: number;
  teleport?: string | false;
  transition?: string | false;
  ui?: PopoverUi;
}
