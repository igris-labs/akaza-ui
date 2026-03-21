export { default as Popover } from "./Popover.vue";

export type PopoverDirection = "top" | "bottom" | "left" | "right";

export interface PopoverUi {
  content?: string;
}

export interface PopoverProps {
  direction?: PopoverDirection;
  teleport?: string | false;
  transition?: string | false;
  ui?: PopoverUi;
}
