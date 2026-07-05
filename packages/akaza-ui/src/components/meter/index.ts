export { default as Meter } from "./Meter.vue";

export interface MeterUi {
  root?: string;
  label?: string;
  value?: string;
  track?: string;
  indicator?: string;
}

export interface MeterProps {
  value: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
  label?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaValueText?: string;
  locale?: Intl.LocalesArgument;
  formatOptions?: Intl.NumberFormatOptions;
  getValueLabel?: (formattedValue: string, value: number) => string | undefined;
  ui?: MeterUi;
}
