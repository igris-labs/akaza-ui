export { default as Progress } from "./Progress.vue";

export interface ProgressUi {
  root?: string;
  indicator?: string;
}

export interface ProgressProps {
  max?: number;
  ui?: ProgressUi;
}
