export { default as HoverPreviewCard } from "./HoverPreviewCard.vue";

export type HoverPreviewCardSide = "top" | "right" | "bottom" | "left";
export type HoverPreviewCardAlign = "start" | "center" | "end";

export interface HoverPreviewCardUi {
  root?: string;
  trigger?: string;
  content?: string;
  arrow?: string;
}

export interface HoverPreviewCardProps {
  side?: HoverPreviewCardSide;
  align?: HoverPreviewCardAlign;
  sideOffset?: number;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
  /** Keep content mounted while closed. */
  forceMount?: boolean;
  /** Toggle on touch/click in addition to hover and focus. @default true */
  openOnClick?: boolean;
  arrow?: boolean;
  /** Adds dialog semantics when the preview contains interactive controls. */
  ariaLabel?: string;
  teleport?: string | false;
  ui?: HoverPreviewCardUi;
}
