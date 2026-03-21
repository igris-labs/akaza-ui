export { default as Tooltip } from "./Tooltip.vue";

export type TooltipDirection = "top" | "bottom" | "left" | "right";

export interface TooltipUi {
  content?: string;
}

export interface TooltipProps {
  direction?: TooltipDirection;
  delayDuration?: number;
  teleport?: string | false;
  transition?: string | false;
  ui?: TooltipUi;
}
