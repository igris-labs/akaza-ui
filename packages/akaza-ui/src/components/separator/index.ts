export { default as Separator } from "./Separator.vue";

export interface SeparatorProps {
  as?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  ui?: SeparatorUi;
}

export interface SeparatorUi {
  root?: string;
}
