export { default as Progress } from "./Progress.vue";

export type ProgressOrientation = "horizontal" | "vertical";

export interface ProgressUi {
  root?: string;
  indicator?: string;
}

export interface ProgressProps {
  min?: number;
  max?: number;
  orientation?: ProgressOrientation;
  ariaLabel?: string;
  getValueLabel?: (value: number | null, max: number) => string | undefined;
  ui?: ProgressUi;
}
