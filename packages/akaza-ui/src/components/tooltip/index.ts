export { default as Tooltip } from "./Tooltip.vue";

export type TooltipDirection = "top" | "bottom" | "left" | "right";

export interface TooltipUi {
  root?: string;
  trigger?: string;
  content?: string;
}

export interface TooltipProps {
  direction?: TooltipDirection;
  delayDuration?: number;
  closeDelay?: number;
  disabled?: boolean;
  arrow?: boolean;
  teleport?: string | false;
  transition?: string | false;
  ui?: TooltipUi;
}
