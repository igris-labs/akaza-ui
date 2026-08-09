import type { TimeFieldGranularity, TimeFieldStep, TimeFieldUi, TimeValue } from "../time-field";

export { default as TimeRangeField } from "./TimeRangeField.vue";

export type TimeRangeFieldEndpoint = "start" | "end";

export interface TimeRange {
  start?: TimeValue;
  end?: TimeValue;
}

export interface TimeRangeFieldUi {
  root?: string;
  start?: string;
  startField?: TimeFieldUi;
  separator?: string;
  end?: string;
  endField?: TimeFieldUi;
  hiddenInput?: string;
}

export interface TimeRangeFieldProps {
  id?: string;
  name?: string;
  startName?: string;
  endName?: string;
  locale?: string;
  dir?: "ltr" | "rtl";
  placeholder?: TimeValue;
  minValue?: TimeValue;
  maxValue?: TimeValue;
  isTimeUnavailable?: (time: TimeValue) => boolean;
  granularity?: TimeFieldGranularity;
  hourCycle?: 12 | 24;
  hideTimeZone?: boolean;
  step?: TimeFieldStep;
  stepSnapping?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  selectOnFocus?: boolean;
  autoAdvance?: boolean;
  startLabel?: string;
  endLabel?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ui?: TimeRangeFieldUi;
}
