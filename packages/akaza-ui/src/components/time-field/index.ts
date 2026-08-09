import type { CalendarDateTime, Time, ZonedDateTime } from "@internationalized/date";

export { default as TimeField } from "./TimeField.vue";

export type TimeValue = Time | CalendarDateTime | ZonedDateTime;
export type TimeFieldGranularity = "hour" | "minute" | "second";
export type TimeFieldSegment = "hour" | "minute" | "second";

export interface TimeFieldStep {
  hour?: number;
  minute?: number;
  second?: number;
}

export interface TimeFieldUi {
  root?: string;
  segments?: string;
  segment?: string;
  literal?: string;
  dayPeriod?: string;
  timeZone?: string;
  hiddenInput?: string;
}

export interface TimeFieldProps {
  id?: string;
  name?: string;
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
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ui?: TimeFieldUi;
}
